import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../api/client'
import toast from 'react-hot-toast'
import { UserPlus, Eye, EyeOff, Mail, ArrowRight, CheckCircle, Shield } from 'lucide-react'

export default function Signup() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [step, setStep] = useState(1) // 1 = form, 2 = OTP verify
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'warehouse_staff',
  })
  const [otp, setOtp] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const sendOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authApi.signupSendOtp(form)
      toast.success('OTP sent to your email!')
      setStep(2)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await authApi.signupVerify({ email: form.email, otp })
      localStorage.setItem('ci_token', data.access_token)
      localStorage.setItem('ci_user', JSON.stringify(data.user))
      toast.success('Account created! Welcome aboard!')
      // small delay so toast is visible
      setTimeout(() => window.location.href = '/dashboard', 300)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const resendOtp = async () => {
    setLoading(true)
    try {
      await authApi.signupSendOtp(form)
      toast.success('New OTP sent!')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-bg-glow" />
      <div className="login-card" style={{ maxWidth: step === 2 ? 420 : 440 }}>
        <div className="login-logo">
          <h1>CoreInventory</h1>
          <p>{step === 1 ? 'Create your account' : 'Verify your email'}</p>
        </div>

        {step === 1 ? (
          <form onSubmit={sendOtp}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-control" type="text" name="name"
                placeholder="John Doe" value={form.name}
                onChange={handle} required minLength={2}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-control" type="email" name="email"
                placeholder="you@company.com" value={form.email}
                onChange={handle} required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-control"
                  type={showPwd ? 'text' : 'password'}
                  name="password"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={handle}
                  style={{ paddingRight: 40 }}
                  required minLength={6}
                />
                <button
                  type="button" onClick={() => setShowPwd(!showPwd)}
                  style={{
                    position: 'absolute', right: 12, top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                  }}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Role</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { value: 'inventory_manager', label: 'Manager', icon: Shield, desc: 'Full access' },
                  { value: 'warehouse_staff',   label: 'Staff',   icon: UserPlus, desc: 'Operations' },
                ].map(({ value, label, icon: Icon, desc }) => (
                  <label
                    key={value}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '12px 14px', borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${form.role === value ? 'var(--accent-blue)' : 'var(--border)'}`,
                      background: form.role === value ? 'rgba(79,142,247,0.08)' : 'var(--surface-1)',
                      cursor: 'pointer', transition: 'all 0.15s ease',
                    }}
                  >
                    <input
                      type="radio" name="role" value={value}
                      checked={form.role === value} onChange={handle}
                      style={{ display: 'none' }}
                    />
                    <Icon size={18} color={form.role === value ? 'var(--accent-blue)' : 'var(--text-muted)'} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: form.role === value ? 'var(--accent-blue)' : 'var(--text-primary)' }}>
                        {label}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              style={{ justifyContent: 'center', padding: '12px', marginTop: 8 }}
              disabled={loading}
            >
              {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <><Mail size={16} /> Send Verification OTP</>}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOtp}>
            <div style={{
              textAlign: 'center', padding: '16px 0 24px',
              color: 'var(--text-secondary)', fontSize: 13.5, lineHeight: 1.6,
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'rgba(79,142,247,0.12)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <Mail size={24} color="var(--accent-blue)" />
              </div>
              We sent a 6-digit code to<br />
              <strong style={{ color: 'var(--accent-blue)' }}>{form.email}</strong>
            </div>

            <div className="form-group">
              <label className="form-label">Enter OTP</label>
              <input
                className="form-control"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                required
                style={{
                  textAlign: 'center', fontSize: 28, fontWeight: 800,
                  letterSpacing: 12, padding: '14px', fontFamily: 'monospace',
                }}
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              style={{ justifyContent: 'center', padding: '12px', marginTop: 4 }}
              disabled={loading || otp.length < 6}
            >
              {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <><CheckCircle size={16} /> Verify & Create Account</>}
            </button>

            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button
                type="button" onClick={resendOtp} disabled={loading}
                style={{
                  background: 'none', border: 'none', color: 'var(--accent-blue)',
                  cursor: 'pointer', fontSize: 13, fontWeight: 600,
                }}
              >
                Resend OTP
              </button>
              <span style={{ margin: '0 10px', color: 'var(--text-muted)' }}>·</span>
              <button
                type="button" onClick={() => setStep(1)}
                style={{
                  background: 'none', border: 'none', color: 'var(--text-muted)',
                  cursor: 'pointer', fontSize: 13,
                }}
              >
                Go Back
              </button>
            </div>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>Sign In</Link>
        </p>
      </div>
    </div>
  )
}
