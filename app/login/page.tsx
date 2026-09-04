import { LoginForm } from '@/components/auth/login-form'

export const metadata = { title: 'כניסה — המטבח של קרן' }

export default function LoginPage() {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1>כניסה</h1>
        <p>ברוכה הבאה למטבח שלך</p>
        <LoginForm />
      </div>
    </div>
  )
}
