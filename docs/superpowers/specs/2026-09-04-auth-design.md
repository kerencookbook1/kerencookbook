# Auth Design — Email + Password with Supabase SSR

**Date:** 2026-09-04
**Scope:** AUTH-001 — Email/password auth, remember me, forgot password, reset password

---

## Goal

Add full authentication to the app: registration, login (with remember me), forgot password, and password reset — all using Supabase Auth with Next.js App Router SSR patterns.

---

## 1. Architecture

### Middleware (`middleware.ts`)

Runs on every request. Reads the session cookie via `@supabase/ssr`, refreshes it if expired, and enforces protection:

- Public routes (always accessible): `/login`, `/register`, `/forgot-password`, `/reset-password`
- All other routes: redirect to `/login` if no valid session

### Session persistence ("Remember me")

The "remember me" checkbox controls cookie persistence via the SSR cookie adapter in middleware and server client:

- **Unchecked:** Cookie stored without `max-age` — session cookie, deleted when browser closes
- **Checked:** Cookie stored with `max-age: 60 * 60 * 24 * 30` (30 days)

The `rememberMe` value is passed from the login Server Action and used when writing the auth cookies in the response.

### Server Client

`lib/supabase/server.ts` (already exists) is used in Server Components and Server Actions to read the session. No changes needed to this file.

### Profile creation on registration

After `supabase.auth.signUp()` succeeds, a Server Action inserts a row into `profiles` using the returned `user.id` and the display name from the form. This is done in the same server action as signup, not via a DB trigger, to keep the logic explicit and testable.

---

## 2. Pages and Routes

| Route | Description | Protected |
|---|---|---|
| `/login` | Email + password form, remember me, links to register + forgot | No |
| `/register` | Name + email + password form | No |
| `/forgot-password` | Email form, triggers reset email | No |
| `/reset-password` | New password form, uses token from URL | No |

### Data flow

**Register:**
```
POST /register (Server Action)
  → supabase.auth.signUp({ email, password })
  → INSERT INTO profiles (id, display_name) VALUES (user.id, name)
  → redirect('/')
```

**Login:**
```
POST /login (Server Action)
  → supabase.auth.signInWithPassword({ email, password, options: { expiresIn? } })
  → redirect('/')
  → on error: return { error: 'אימייל או סיסמה שגויים' }
```

**Forgot password:**
```
POST /forgot-password (Server Action)
  → supabase.auth.resetPasswordForEmail(email, { redirectTo: NEXT_PUBLIC_APP_URL + '/reset-password' })
  → show success message (always — don't reveal if email exists)
```

**Reset password:**
```
POST /reset-password (Server Action)
  → supabase.auth.updateUser({ password: newPassword })
  → redirect('/login')
```

**Logout:**
```
Server Action (called from any page)
  → supabase.auth.signOut()
  → redirect('/login')
```

---

## 3. Components

### `app/login/page.tsx`
Server Component. Renders `<LoginForm />`.

### `components/auth/login-form.tsx`
Client Component. React Hook Form + Zod validation.

Fields:
- `email` — required, valid email format
- `password` — required, min 6 chars
- `rememberMe` — boolean checkbox

Shows inline error on failed login. Loading state on submit.

### `app/register/page.tsx`
Server Component. Renders `<RegisterForm />`.

### `components/auth/register-form.tsx`
Client Component.

Fields:
- `displayName` — required, min 2 chars
- `email` — required, valid email
- `password` — required, min 6 chars
- `confirmPassword` — must match password

### `app/forgot-password/page.tsx`
Server Component. Renders `<ForgotPasswordForm />`.

### `components/auth/forgot-password-form.tsx`
Client Component.

Fields:
- `email` — required, valid email

After submit: shows success message regardless of whether email exists (prevents enumeration).

### `app/reset-password/page.tsx`
Server Component. Renders `<ResetPasswordForm />`.

Note: Supabase sends the reset token in the URL fragment (`#access_token=...`), which is not readable server-side. The Client Component calls `supabase.auth.exchangeCodeForSession()` on mount to exchange the token before the form is enabled.

### `components/auth/reset-password-form.tsx`
Client Component.

Fields:
- `password` — required, min 6 chars
- `confirmPassword` — must match

### `lib/actions/auth.ts`
Server Actions: `login`, `register`, `logout`, `forgotPassword`, `resetPassword`.

---

## 4. Middleware

**File:** `middleware.ts` (project root)

```ts
// Pseudocode
export async function middleware(request) {
  const { supabase, response } = createMiddlewareClient(request)
  const { data: { session } } = await supabase.auth.getSession()
  
  const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password']
  const isPublic = publicPaths.some(p => request.nextUrl.pathname.startsWith(p))
  
  if (!session && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
}
```

---

## 5. Validation (Zod schemas)

**File:** `lib/validations/auth.ts`

- `loginSchema` — email + password + rememberMe
- `registerSchema` — displayName + email + password + confirmPassword (superRefine for password match)
- `forgotPasswordSchema` — email
- `resetPasswordSchema` — password + confirmPassword (superRefine for match)

---

## 6. Error handling

- Login failure: show "אימייל או סיסמה שגויים" (don't distinguish between wrong email vs wrong password)
- Register duplicate email: show "כתובת האימייל כבר רשומה במערכת"
- Reset password expired/invalid token: show "הקישור פג תוקף, בקש קישור חדש" + link to `/forgot-password`
- Network errors: show generic "אירעה שגיאה, נסה שוב"

---

## 7. What this phase does NOT include

- Google/Social OAuth
- Email verification flow (Supabase sends verification email by default — we rely on Supabase default behavior)
- Admin user management
- Rate limiting (Supabase handles this internally)

---

## 8. Success criteria

- User can register with name + email + password → lands on `/`
- User can login → lands on `/`
- "Remember me" checked → session persists 30 days
- Forgot password → receives email with reset link
- Reset password → can login with new password
- Accessing protected route without session → redirected to `/login`
- Logout → redirected to `/login`, session cleared
- All forms validated in Hebrew with clear error messages
- `npm run typecheck` + `npm run build` pass
