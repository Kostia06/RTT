# Seed a dev admin (Better Auth + local D1)

Passwords must be hashed by Better Auth, so seed the admin by calling the running
sign-up endpoint, then flip `emailVerified` + `role` directly in local D1 (no email
needed in dev).

## Steps

1. Start the app: `npm run dev`

2. Create the user via the auth API (this hashes the password):

   ```bash
   curl -s http://localhost:3000/api/auth/sign-up/email \
     -H 'content-type: application/json' \
     -d '{"email":"admin@rtt.local","password":"admin12345","name":"Admin"}'
   ```

   (Or use any REST client. The default flow sends a verification email and does NOT
   auto-verify — the next step makes the account usable in dev.)

3. Mark the account verified + admin in local D1:

   ```bash
   npx wrangler d1 execute rtt-db --local --command \
     "UPDATE user SET emailVerified=1, role='admin' WHERE email='admin@rtt.local';"
   ```

4. Sign in at `http://localhost:3000/login` with `admin@rtt.local` / `admin12345`.

## Notes
- `requireEmailVerification` is on, so unverified accounts cannot log in — step 3
  bypasses that for local dev only.
- For staging/production, configure `RESEND_API_KEY` so verification + password-reset
  emails actually send, and create admins through the real verified flow (or a guarded
  one-off script using `wrangler d1 execute --remote`).
- Roles: `customer` (default), `employee`, `manager`, `admin`.
