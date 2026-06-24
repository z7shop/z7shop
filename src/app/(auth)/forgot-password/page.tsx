'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/hooks/useLocale';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineArrowRight, HiOutlineArrowLeft, HiOutlineShieldCheck, HiOutlineLockClosed, HiOutlineCheck } from 'react-icons/hi';
import PasswordStrength from '@/components/ui/PasswordStrength';

export default function ForgotPasswordPage() {
  const { locale, dict } = useLocale();
  const router = useRouter();
  const fa = locale === 'fa';
  const BackArrow = fa ? HiOutlineArrowRight : HiOutlineArrowLeft;

  const [step, setStep] = useState<'email' | 'code' | 'newpass' | 'done'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const startCountdown = () => {
    setCountdown(60);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const sendCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) return;
    setLoading(true);
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'send', email: email.trim().toLowerCase() }),
    });
    if (res.ok) {
      setStep('code');
      startCountdown();
      toast.success(fa ? 'کد بازیابی به ایمیل شما ارسال شد' : 'Reset code sent to your email');
    } else {
      const data = await res.json();
      if (data.error === 'EMAIL_NOT_FOUND') {
        toast.error(fa ? 'حسابی با این ایمیل وجود ندارد' : 'No account found with this email');
      } else if (data.error === 'EMAIL_SEND_FAILED') {
        toast.error(fa ? 'خطا در ارسال ایمیل. لطفاً چند دقیقه بعد دوباره تلاش کنید' : 'Failed to send email. Please try again in a few minutes');
      } else {
        toast.error(fa ? 'خطا در ارسال' : 'Error sending code');
      }
    }
    setLoading(false);
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;
    setLoading(true);
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'verify', email: email.trim().toLowerCase(), code }),
    });
    if (res.ok) {
      setStep('newpass');
    } else {
      toast.error(fa ? 'کد نادرست یا منقضی شده' : 'Invalid or expired code');
    }
    setLoading(false);
  };

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 4) {
      toast.error(fa ? 'رمز عبور حداقل ۴ کاراکتر' : 'Password must be at least 4 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error(fa ? 'رمز عبور مطابقت ندارد' : 'Passwords do not match');
      return;
    }
    setLoading(true);
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset', email: email.trim().toLowerCase(), code, password }),
    });
    if (res.ok) {
      setStep('done');
      toast.success(fa ? 'رمز عبور با موفقیت تغییر کرد' : 'Password changed successfully');
    } else {
      toast.error(fa ? 'خطا در تغییر رمز' : 'Error changing password');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c0c0f] px-4 relative overflow-hidden">
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(201, 168, 76, 0.08), transparent)' }} />
      <div className="w-full max-w-md relative z-10 animate-slide-up">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-black text-gradient">{dict.common.brand}</Link>
          <h1 className="text-xl font-bold mt-4">{fa ? 'بازیابی رمز عبور' : 'Reset Password'}</h1>
        </div>

        {/* Step 1: Email */}
        {step === 'email' && (
          <form onSubmit={sendCode} className="card p-6 space-y-4">
            <p className="text-sm text-gray-500 text-center">
              {fa ? 'ایمیل خود را وارد کنید تا کد بازیابی برایتان ارسال شود.' : 'Enter your email to receive a reset code.'}
            </p>
            <div>
              <label className="text-sm font-medium mb-1 block">{dict.auth.email}</label>
              <div className="relative">
                <HiOutlineMail className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field ps-10" dir="ltr" placeholder="example@email.com" required />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-gold w-full py-3 disabled:opacity-50">
              {loading ? (fa ? 'در حال ارسال...' : 'Sending...') : (fa ? 'ارسال کد بازیابی' : 'Send Reset Code')}
            </button>
            <div className="text-center text-sm">
              <Link href="/login" className="text-gold hover:underline inline-flex items-center gap-1">
                <BackArrow className="w-3.5 h-3.5" />
                {fa ? 'بازگشت به ورود' : 'Back to Login'}
              </Link>
            </div>
          </form>
        )}

        {/* Step 2: Code */}
        {step === 'code' && (
          <form onSubmit={verifyCode} className="card p-6 space-y-5">
            <div className="text-center">
              <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <HiOutlineShieldCheck className="w-8 h-8 text-gold" />
              </div>
              <h2 className="font-bold text-lg mb-1">{fa ? 'کد بازیابی' : 'Reset Code'}</h2>
              <p className="text-sm text-gray-400">
                {fa ? 'کد ۶ رقمی ارسال شده به' : '6-digit code sent to'}
              </p>
              <p className="text-gold text-sm font-mono mt-1">{email}</p>
              <p className="text-yellow-500/80 text-[11px] mt-3 bg-yellow-500/5 border border-yellow-500/10 rounded-lg px-3 py-2">
                {fa ? 'اگر ایمیل را دریافت نکردید، پوشه اسپم (Spam/Junk) را بررسی کنید.' : "Didn't receive it? Check your Spam/Junk folder."}
              </p>
            </div>
            <input
              type="text" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="input-field text-center text-2xl tracking-[16px] font-mono font-bold py-4" dir="ltr" placeholder="------" maxLength={6} autoFocus
            />
            <button type="submit" disabled={loading || code.length !== 6} className="btn-gold w-full py-3 disabled:opacity-50">
              {loading ? (fa ? 'بررسی...' : 'Verifying...') : (fa ? 'تأیید کد' : 'Verify Code')}
            </button>
            <div className="flex items-center justify-between text-sm">
              <button type="button" onClick={() => setStep('email')} className="text-gray-500 hover:text-white transition-colors">
                {fa ? 'تغییر ایمیل' : 'Change email'}
              </button>
              <button type="button" onClick={() => sendCode()} disabled={countdown > 0 || loading} className="text-gold hover:underline disabled:text-gray-600 transition-colors">
                {countdown > 0 ? (fa ? `ارسال مجدد (${countdown})` : `Resend (${countdown}s)`) : (fa ? 'ارسال مجدد' : 'Resend')}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 'newpass' && (
          <form onSubmit={resetPassword} className="card p-6 space-y-4">
            <div className="text-center mb-2">
              <h2 className="font-bold text-lg">{fa ? 'رمز عبور جدید' : 'New Password'}</h2>
              <p className="text-sm text-gray-500 mt-1">{fa ? 'رمز عبور جدید خود را وارد کنید' : 'Enter your new password'}</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{dict.auth.password}</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field ps-10" dir="ltr" required />
              </div>
              <PasswordStrength password={password} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{dict.auth.confirmPassword}</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="input-field ps-10" dir="ltr" required />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-gold w-full py-3 disabled:opacity-50">
              {loading ? (fa ? 'در حال تغییر...' : 'Changing...') : (fa ? 'تغییر رمز عبور' : 'Change Password')}
            </button>
          </form>
        )}

        {/* Step 4: Done */}
        {step === 'done' && (
          <div className="card p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
              <HiOutlineCheck className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="font-bold text-lg">{fa ? 'رمز عبور تغییر کرد!' : 'Password Changed!'}</h2>
            <p className="text-sm text-gray-500">
              {fa ? 'رمز عبور شما با موفقیت تغییر کرد. اکنون می‌توانید وارد شوید.' : 'Your password has been changed. You can now login.'}
            </p>
            <Link href="/login" className="btn-gold w-full py-3 mt-2">
              {fa ? 'ورود به حساب' : 'Login'}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
