# Booking, Admin, and SMTP Setup

1. Install server dependencies:

```bash
npm install
```

2. Create your real environment file:

```bash
cp .env.example .env
```

3. Edit `.env` with your SMTP account and a strong `ADMIN_KEY`.

For Gmail, turn on 2-step verification and create an app password. Use that app password as `SMTP_PASS`.

4. Start the booking server:

```bash
npm start
```

5. Open the site:

```text
http://localhost:3000
```

6. Open the admin panel:

```text
http://localhost:3000/admin.html
```

Enter the same `ADMIN_KEY` from `.env`, then click `Connect Live`.
