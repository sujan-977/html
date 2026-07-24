# Booking, Admin, and SMTP Setup

1. Install server dependencies:

```bash
npm install
```

2. Create your real environment file:

```bash
cp .env.example .env
```

3. Edit `.env` with your Supabase server key, a strong `ADMIN_KEY`, and valid SMTP credentials. `SMTP_PASS` must be a real app password (not `your-app-password`).

   `SUPABASE_SERVICE_ROLE_KEY` is required for booking storage and the admin panel. Keep it private: never place it in a `NEXT_PUBLIC_` environment variable.

For Gmail, turn on 2-step verification and create an app password. Use that app password as `SMTP_PASS`.

When an administrator accepts or rejects a pending booking in `/admin`, the customer receives an email at the address on their booking. If email delivery fails, the admin panel clearly reports it; correct the SMTP settings before making further decisions.

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
http://localhost:3000/admin
```

Enter the same `ADMIN_KEY` from `.env`, then click `Load Bookings`. The panel reads bookings directly from Supabase; no browser storage is used.
