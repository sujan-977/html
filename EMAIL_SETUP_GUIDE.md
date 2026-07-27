# Email Verification Setup Guide

## Issues Fixed

I've fixed the email verification system in your booking app. Here's what was broken and how it's now corrected:

### Problems Resolved:

1. **Invalid Sender Email** ❌ → ✅
   - **Was:** `booking@yourdomain.com` (not verified with Resend)
   - **Now:** `onboarding@resend.dev` (Resend's verified sandbox domain)

2. **Missing Admin Authorization** ❌ → ✅
   - Added admin key verification to the `/api/bookings/accept` endpoint
   - Only admins can confirm bookings and send confirmation emails

3. **No Error Handling** ❌ → ✅
   - Added try-catch blocks to both email functions
   - Emails that fail are logged but don't block bookings
   - Users receive detailed error messages

4. **Incomplete Booking Data** ❌ → ✅
   - Confirmation email now includes all booking details from database
   - Added guest count and other missing fields
   - Better formatted HTML table in confirmation email

5. **Missing Field Validation** ❌ → ✅
   - Validates required fields (bookingId, email, name)
   - Returns 400 error if fields are missing

## How to Use

### 1. **For Users Booking a Room:**
- Fill the booking form and submit
- Immediately receives "Booking Request Received" email
- Status: `Pending`

### 2. **For Admin Confirming Bookings:**
Call the API with proper authorization:

```bash
curl -X POST http://localhost:3000/api/bookings/accept \
  -H "Content-Type: application/json" \
  -H "x-admin-key: YOUR_ADMIN_KEY" \
  -d '{
    "bookingId": "booking_id_here",
    "email": "user@example.com",
    "name": "John Doe",
    "checkin": "2025-08-01",
    "checkout": "2025-08-03",
    "room": "Double Room",
    "guests": "2"
  }'
```

### 3. **Required Environment Variables:**

Add these to your `.env.local`:

```env
# Resend Email Service (get from https://resend.com)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx

# Admin authorization key (create a strong random key)
ADMIN_KEY=your_super_secret_admin_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Email Flow

```
User Books Room
    ↓
POST /api/bookings
    ↓
✅ "Booking Request Received" email sent to user
✅ Booking saved with status: "Pending"
    ↓
Admin Reviews & Accepts
    ↓
POST /api/bookings/accept (with admin key)
    ↓
✅ Booking status changed to "Confirmed"
✅ "Booking Confirmed" email sent to user
```

## Testing the Emails

### Test Booking Reception:
1. Go to the booking form on your website
2. Sign in or create account
3. Submit booking form
4. Check email for "Booking Request Received" message

### Test Confirmation Email:
Use the API endpoint with the correct admin key:

```javascript
const response = await fetch('/api/bookings/accept', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-admin-key': process.env.ADMIN_KEY
  },
  body: JSON.stringify({
    bookingId: 'abc123',
    email: 'user@example.com',
    name: 'User Name',
    checkin: '2025-08-01',
    checkout: '2025-08-03',
    room: 'Double Room',
    guests: '2'
  })
});
```

## Troubleshooting

### Emails not sending?

**Check 1:** Verify `RESEND_API_KEY` is set in `.env.local`
```bash
echo $RESEND_API_KEY
```

**Check 2:** Verify `ADMIN_KEY` for confirmation emails
```bash
echo $ADMIN_KEY
```

**Check 3:** Look at console logs for errors:
```bash
# In your Next.js server terminal, look for:
# "Booking email error:"
# "Email sending error:"
# "Database update error:"
```

**Check 4:** Confirm Resend API key is valid at https://resend.com/api-keys

### Admin key not working?

Make sure you're sending the exact same key in the header:
```javascript
headers: {
  'x-admin-key': 'YOUR_EXACT_ADMIN_KEY_HERE'
}
```

### Booking saved but email not sent?

The system is designed to:
- ✅ Always save the booking (even if email fails)
- ⚠️ Log email errors in console
- ✅ Notify you about email issues

Check your browser console and server logs for the specific error message.

## Files Modified

- ✅ `/app/api/bookings/accept/route.js` - Added auth, error handling, improved email
- ✅ `/lib/sendbookingreceivedemail.js` - Added error handling
- ✅ `/app/api/bookings/route.js` - Uses updated email function

## Next Steps

1. **Get Resend API Key:** https://resend.com (free plan available)
2. **Set environment variables** in `.env.local`
3. **Test the booking flow**
4. **Monitor console logs** for any email issues

---

If emails still aren't working after setup, check the exact error message in your server console and verify all environment variables are correctly set.
