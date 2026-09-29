import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLoginMutation, usePinLoginMutation } from '@/api/authApi'
import { useAppDispatch } from '@/app/hooks'
import { setCredentials } from './authSlice'
import { Eye, EyeOff, UtensilsCrossed, Lock, Mail, KeyRound, Sparkles, Delete, Shield } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [login, { isLoading: isEmailLoading }] = useLoginMutation()
  const [pinLogin, { isLoading: isPinLoading }] = usePinLoginMutation()

  const [mode, setMode] = useState<'email' | 'pin'>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pin, setPin] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const isLoading = isEmailLoading || isPinLoading

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const result = await login({ email, password }).unwrap()
      dispatch(setCredentials({
        access: result.access,
        refresh: result.refresh,
        user: result.user,
      }))
      navigate('/')
    } catch (err: any) {
      setError(err?.data?.message || 'Invalid email or password')
    }
  }

  const handlePinLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const result = await pinLogin({ pin_code: pin }).unwrap()
      dispatch(setCredentials({
        access: result.data.access,
        refresh: result.data.refresh,
        user: result.data.user as any,
      }))
      navigate('/')
    } catch (err: any) {
      setError(err?.data?.message || 'Invalid PIN code. Please try again.')
    }
  }

  const handlePinDigit = (digit: string) => {
    if (pin.length < 6) {
      const nextPin = pin + digit
      setPin(nextPin)
    }
  }

  const handlePinBackspace = () => {
    setPin(pin.slice(0, -1))
  }

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[#F8FAFC] p-4 select-none">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-[420px] relative z-10 animate-entrance">
        {/* Brand Lockup */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#4338CA] to-[#6366F1] text-white shadow-lg shadow-indigo-500/25 mb-3">
            <UtensilsCrossed className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            RestaurantOS
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Enterprise Restaurant Operating Platform
          </p>
        </div>

        {/* Card Container */}
        <div className="rounded-3xl bg-white border border-[#E2E8F0] shadow-xl shadow-slate-900/5 p-6 sm:p-8">
          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-6 border border-slate-200/70">
            <button
              type="button"
              onClick={() => { setMode('email'); setError('') }}
              className={`
                flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5
                ${mode === 'email'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
                }
              `}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Access</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('pin'); setError('') }}
              className={`
                flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5
                ${mode === 'pin'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
                }
              `}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Tablet PIN</span>
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold mb-4 animate-entrance">
              {error}
            </div>
          )}

          {/* Email Authentication Form */}
          {mode === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Account Email
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@restaurantos.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter account password"
                    required
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-extrabold tracking-wide uppercase shadow-md shadow-indigo-500/25 transition-all cursor-pointer disabled:opacity-60 mt-2"
              >
                {isLoading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* POS PIN Authentication Form */}
          {mode === 'pin' && (
            <form onSubmit={handlePinLogin} className="space-y-4">
              <div className="text-center">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Enter 4-Digit Staff PIN
                </label>

                {/* PIN Dots Display */}
                <div className="flex justify-center gap-3 py-3">
                  {[0, 1, 2, 3].map((index) => {
                    const isFilled = pin.length > index
                    return (
                      <div
                        key={index}
                        className={`
                          w-4 h-4 rounded-full border transition-all duration-150
                          ${isFilled
                            ? 'bg-indigo-600 border-indigo-600 scale-110 shadow-sm shadow-indigo-500/30'
                            : 'bg-slate-100 border-slate-300'
                          }
                        `}
                      />
                    )
                  })}
                </div>
              </div>

              {/* Touchscreen PIN Pad */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handlePinDigit(digit)}
                    className="h-12 rounded-xl bg-slate-50 border border-slate-200 text-base font-extrabold text-slate-800 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 active:scale-95 transition-all cursor-pointer"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPin('')}
                  className="h-12 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-400 hover:bg-rose-50 hover:text-rose-600 active:scale-95 transition-all cursor-pointer"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => handlePinDigit('0')}
                  className="h-12 rounded-xl bg-slate-50 border border-slate-200 text-base font-extrabold text-slate-800 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 active:scale-95 transition-all cursor-pointer"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handlePinBackspace}
                  className="h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-200 active:scale-95 transition-all cursor-pointer"
                >
                  <Delete className="w-5 h-5" />
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading || pin.length < 4}
                className="w-full py-3 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-extrabold tracking-wide uppercase shadow-md shadow-indigo-500/25 transition-all cursor-pointer disabled:opacity-50 mt-2"
              >
                {isLoading ? 'Verifying PIN...' : 'Authorize POS'}
              </button>
            </form>
          )}
        </div>

        {/* System Credentials Helper */}
        <div className="mt-4 p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100/80 text-center">
          <p className="text-[11px] font-bold text-indigo-900 flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-indigo-600" />
            Default Demo Owner:
          </p>
          <p className="text-[11px] font-mono text-indigo-700 mt-0.5">
            owner@restaurantos.com &bull; owner123456
          </p>
        </div>
      </div>
    </div>
  )
}
