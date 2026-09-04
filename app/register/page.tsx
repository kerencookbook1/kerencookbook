import { RegisterForm } from '@/components/auth/register-form'

export const metadata = { title: 'הרשמה — המטבח של קרן' }

export default function RegisterPage() {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1>הרשמה</h1>
        <p>צרי את המטבח שלך</p>
        <RegisterForm />
      </div>
    </div>
  )
}
