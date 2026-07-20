const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");
const express = require("express");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || "change-this-admin-key";
const DATA_DIR = path.join(__dirname, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const BOOKINGS_FILE = path.join(DATA_DIR, "bookings.json");
const sessions = new Map();
const clients = new Set();

app.use(express.json({limit: "1mb"}));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Admin-Key");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});
app.use(express.static(__dirname));

async function ensureData() {
  await fs.mkdir(DATA_DIR, {recursive: true});
  await Promise.all([ensureFile(USERS_FILE), ensureFile(BOOKINGS_FILE)]);
}

async function ensureFile(file) {
  try {
    await fs.access(file);
  } catch {
    await fs.writeFile(file, "[]\n");
  }
}

async function readJson(file) {
  await ensureData();
  return JSON.parse(await fs.readFile(file, "utf8"));
}

async function writeJson(file, data) {
  await ensureData();
  await fs.writeFile(file, JSON.stringify(data, null, 2) + "\n");
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, expected] = stored.split(":");
  const actual = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(Buffer.from(expected, "hex"), actual);
}

function createSession(email) {
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, email);
  return token;
}

function requireUser(req, res, next) {
  const auth = req.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const email = sessions.get(token);
  if (!email) return res.status(401).json({error: "Please sign in before booking."});
  req.userEmail = email;
  next();
}

function requireAdmin(req, res, next) {
  const key = req.get("x-admin-key") || req.query.adminKey;
  if (key !== ADMIN_KEY) return res.status(401).json({error: "Invalid admin key."});
  next();
}

function mailer() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || "true") === "true",
    auth: {user, pass}
  });
}

function bookingText(booking) {
  return [
    `Booking ID: ${booking.id}`,
    `Name: ${booking.name}`,
    `Email: ${booking.email}`,
    `Phone: ${booking.phone}`,
    `Branch: ${booking.branch}`,
    `Check-in: ${booking.checkin}`,
    `Check-out: ${booking.checkout}`,
    `Guests: ${booking.guests}`,
    `Room: ${booking.room}`,
    `Food: ${booking.food || "None"}`,
    `Payment: ${booking.payment || "TBD"}`,
    `Status: ${booking.status}`
  ].join("\n");
}

async function sendBookingEmails(booking) {
  const transport = mailer();
  if (!transport) return {sent: false, reason: "SMTP is not configured."};
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const text = `Namaste ${booking.name},\n\nYour booking request has been received by Atithi Restro & Lodge.\n\n${bookingText(booking)}\n\nWe will contact you shortly to confirm availability.\n\nAtithi Restro & Lodge`;
  await transport.sendMail({
    from,
    to: booking.email,
    subject: `Booking received - ${booking.id}`,
    text
  });
  if (process.env.ADMIN_EMAIL) {
    await transport.sendMail({
      from,
      to: process.env.ADMIN_EMAIL,
      subject: `New booking - ${booking.id}`,
      text: bookingText(booking)
    });
  }
  return {sent: true};
}

function broadcast(booking) {
  const payload = `data: ${JSON.stringify(booking)}\n\n`;
  for (const client of clients) client.write(payload);
}

app.post("/api/signup", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  if (!email || !password) return res.status(400).json({error: "Email and password are required."});
  if (password.length < 6) return res.status(400).json({error: "Password must be at least 6 characters."});
  const users = await readJson(USERS_FILE);
  if (users.some(user => user.email === email)) return res.status(409).json({error: "This email is already signed up. Please sign in."});
  users.push({email, passwordHash: hashPassword(password), created: new Date().toISOString()});
  await writeJson(USERS_FILE, users);
  res.json({email, token: createSession(email)});
});

app.post("/api/login", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const users = await readJson(USERS_FILE);
  const user = users.find(item => item.email === email);
  if (!user || !verifyPassword(password, user.passwordHash)) return res.status(401).json({error: "Invalid email or password."});
  res.json({email, token: createSession(email)});
});

app.post("/api/bookings", requireUser, async (req, res) => {
  const booking = {
    id: req.body.id || "BK" + Date.now(),
    name: String(req.body.name || "").trim(),
    phone: String(req.body.phone || "").trim(),
    email: req.userEmail,
    branch: String(req.body.branch || "").trim(),
    checkin: String(req.body.checkin || "").trim(),
    checkout: String(req.body.checkout || "").trim(),
    room: String(req.body.room || "").trim(),
    guests: String(req.body.guests || "").trim(),
    food: String(req.body.food || "").trim(),
    payment: String(req.body.payment || "TBD").trim(),
    status: "Pending",
    created: new Date().toISOString()
  };
  if (!booking.name || !booking.phone || !booking.branch || !booking.checkin || !booking.checkout || !booking.room) {
    return res.status(400).json({error: "Missing required booking details."});
  }
  const bookings = await readJson(BOOKINGS_FILE);
  bookings.unshift(booking);
  await writeJson(BOOKINGS_FILE, bookings);
  const email = await sendBookingEmails(booking);
  broadcast(booking);
  res.json({booking, email});
});

app.get("/api/bookings", requireAdmin, async (req, res) => {
  res.json({bookings: await readJson(BOOKINGS_FILE)});
});

app.get("/api/bookings/stream", requireAdmin, async (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive"
  });
  res.write("event: ready\ndata: {}\n\n");
  clients.add(res);
  req.on("close", () => clients.delete(res));
});

ensureData().then(() => {
  app.listen(PORT, () => {
    console.log(`Atithi booking server running at http://localhost:${PORT}`);
  });
});
