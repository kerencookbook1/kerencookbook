import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export const metadata = { title: 'איפוס סיסמה — המטבח של קרן' }

export default function ResetPasswordPage() {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1>סיסמה חדשה</h1>
        <p>בחרי סיסמה חדשה לחשבונך</p>
        <ResetPasswordForm />
      </div>
    </div>
  )
}
