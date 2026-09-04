import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

export const metadata = { title: 'שחזור סיסמה — המטבח של קרן' }

export default function ForgotPasswordPage() {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1>שכחת סיסמה?</h1>
        <p>הכניסי את האימייל שלך ונשלח קישור לאיפוס</p>
        <ForgotPasswordForm />
      </div>
    </div>
  )
}
