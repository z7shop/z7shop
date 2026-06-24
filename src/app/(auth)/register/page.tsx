'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLocale } from '@/hooks/useLocale';
import toast from 'react-hot-toast';
import { HiOutlineUser, HiOutlineMail, HiOutlineLockClosed, HiOutlinePhone, HiOutlineShieldCheck } from 'react-icons/hi';
import PasswordStrength from '@/components/ui/PasswordStrength';

export default function RegisterPage() {
  const { locale, dict } = useLocale();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [captchaA, setCaptchaA] = useState(() => Math.floor(Math.random() * 9) + 1);
  const [captchaB, setCaptchaB] = useState(() => Math.floor(Math.random() * 9) + 1);
  const [captchaAnswer, setCaptchaAnswer] = useState('');

  const refreshCaptcha = () => {
    setCaptchaA(Math.floor(Math.random() * 9) + 1);
    setCaptchaB(Math.floor(Math.random() * 9) + 1);
    setCaptchaAnswer('');
  };

  const startCountdown = () => {
    setCountdown(60);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name || form.name.trim().length < 2) {
      errs.name = locale === 'fa' ? 'نام باید حداقل ۲ کاراکتر باشد' : 'Name must be at least 2 characters';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email || !emailRegex.test(form.email)) {
      errs.email = locale === 'fa' ? 'ایمیل معتبر وارد کنید' : 'Enter a valid email';
    }
    if (form.phone && !/^09\d{9}$/.test(form.phone)) {
      errs.phone = locale === 'fa' ? 'شماره باید ۱۱ رقمی و با ۰۹ شروع شود' : 'Phone must be 11 digits starting with 09';
    }
    if (!form.password || form.password.length < 4) {
      errs.password = locale === 'fa' ? 'رمز عبور حداقل ۴ کاراکتر' : 'Password must be at least 4 characters';
    }
    if (form.password !== form.confirmPassword) {
      errs.confirmPassword = locale === 'fa' ? 'رمز عبور مطابقت ندارد' : 'Passwords do not match';
    }
    if (!acceptTerms) {
      errs.terms = locale === 'fa' ? 'پذیرش شرایط الزامی است' : 'You must accept the terms';
    }
    if (parseInt(captchaAnswer) !== captchaA + captchaB) {
      errs.captcha = locale === 'fa' ? 'پاسخ امنیتی اشتباه است' : 'Wrong security answer';
      refreshCaptcha();
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const errorMessages: Record<string, string> = {
    EMAIL_EXISTS: dict.auth.emailExists,
    INVALID_NAME: locale === 'fa' ? 'نام نامعتبر است' : 'Invalid name',
    INVALID_EMAIL: locale === 'fa' ? 'ایمیل نامعتبر است' : 'Invalid email',
    INVALID_PASSWORD: locale === 'fa' ? 'رمز عبور نامعتبر است' : 'Invalid password',
    INVALID_PHONE: locale === 'fa' ? 'شماره تلفن نامعتبر است' : 'Invalid phone',
    EMAIL_SEND_FAILED: locale === 'fa' ? 'خطا در ارسال ایمیل. لطفاً بعداً تلاش کنید' : 'Failed to send email. Try again later',
    INVALID_CODE: locale === 'fa' ? 'کد نادرست یا منقضی شده' : 'Invalid or expired code',
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send',
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: form.phone,
      }),
    });

    if (res.ok) {
      setStep('verify');
      startCountdown();
      toast.success(locale === 'fa' ? 'کد تأیید به ایمیل شما ارسال شد' : 'Verification code sent to your email');
    } else {
      const data = await res.json();
      toast.error(errorMessages[data.error] || dict.common.error);
      refreshCaptcha();
    }
    setLoading(false);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error(locale === 'fa' ? 'کد ۶ رقمی وارد کنید' : 'Enter 6-digit code');
      return;
    }

    setLoading(true);
    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'verify', email: form.email.trim().toLowerCase(), code }),
    });

    if (res.ok) {
      await signIn('credentials', { email: form.email.trim().toLowerCase(), password: form.password, redirect: false });
      toast.success(locale === 'fa' ? 'ثبت‌نام موفق! خوش آمدید' : 'Registration successful! Welcome');
      router.push('/');
      router.refresh();
    } else {
      const data = await res.json();
      toast.error(errorMessages[data.error] || dict.common.error);
    }
    setLoading(false);
  };

  const resendCode = async () => {
    if (countdown > 0) return;
    setLoading(true);
    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send',
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: form.phone,
      }),
    });
    if (res.ok) {
      startCountdown();
      toast.success(locale === 'fa' ? 'کد جدید ارسال شد' : 'New code sent');
    } else {
      toast.error(locale === 'fa' ? 'خطا در ارسال' : 'Send failed');
    }
    setLoading(false);
  };

  const fields = [
    { key: 'name', label: dict.auth.name, type: 'text', icon: HiOutlineUser, dir: undefined },
    { key: 'email', label: dict.auth.email, type: 'email', icon: HiOutlineMail, dir: 'ltr' as const },
    { key: 'phone', label: dict.auth.phone, type: 'tel', icon: HiOutlinePhone, dir: 'ltr' as const },
    { key: 'password', label: dict.auth.password, type: 'password', icon: HiOutlineLockClosed, dir: 'ltr' as const },
    { key: 'confirmPassword', label: dict.auth.confirmPassword, type: 'password', icon: HiOutlineLockClosed, dir: 'ltr' as const },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c0c0f] px-4 py-8 relative overflow-hidden">
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(201, 168, 76, 0.08), transparent)' }} />
      <div className="w-full max-w-md relative z-10 animate-slide-up">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-black text-gradient">{dict.common.brand}</Link>
          <h1 className="text-xl font-bold mt-4">{dict.auth.registerTitle}</h1>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleSendCode} className="card p-6 space-y-4">
            {fields.map(f => (
              <div key={f.key}>
                <label htmlFor={`register-${f.key}`} className="text-sm font-medium mb-1 block">{f.label}</label>
                <div className="relative">
                  <f.icon className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id={`register-${f.key}`}
                    type={f.type}
                    value={form[f.key as keyof typeof form]}
                    onChange={(e) => { setForm({ ...form, [f.key]: e.target.value }); setErrors(prev => ({ ...prev, [f.key]: '' })); }}
                    className={`input-field ps-10 ${errors[f.key] ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                    dir={f.dir}
                    required={f.key !== 'phone'}
                    placeholder={f.key === 'phone' ? '09xxxxxxxxx' : ''}
                    autoComplete={f.key === 'email' ? 'email' : f.key === 'password' ? 'new-password' : f.key === 'confirmPassword' ? 'new-password' : f.key === 'phone' ? 'tel' : 'name'}
                  />
                </div>
                {errors[f.key] && <p className="text-red-400 text-xs mt-1">{errors[f.key]}</p>}
                {f.key === 'password' && <PasswordStrength password={form.password} />}
              </div>
            ))}

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-400 flex items-start gap-2 select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => { setAcceptTerms(e.target.checked); setErrors(prev => ({ ...prev, terms: '' })); }}
                  className="mt-1 accent-gold w-4 h-4 rounded"
                />
                <span>
                  {locale === 'fa' ? (
                    <><Link href="/terms" className="text-gold hover:underline" target="_blank">شرایط و قوانین</Link> سایت را می‌پذیرم</>
                  ) : (
                    <>I accept the <Link href="/terms" className="text-gold hover:underline" target="_blank">Terms & Conditions</Link></>
                  )}
                </span>
              </label>
            </div>
            {errors.terms && <p className="text-red-400 text-xs">{errors.terms}</p>}

            <div>
              <label className="text-sm font-medium mb-1 block">{locale === 'fa' ? 'سوال امنیتی' : 'Security Question'}</label>
              <div className="flex items-center gap-3">
                <span className="text-gold font-bold font-mono text-lg" dir="ltr">{captchaA} + {captchaB} = ?</span>
                <input
                  type="text"
                  value={captchaAnswer}
                  onChange={(e) => { setCaptchaAnswer(e.target.value.replace(/\D/g, '')); setErrors(prev => ({ ...prev, captcha: '' })); }}
                  className={`input-field w-20 text-center font-mono ${errors.captcha ? 'border-red-500' : ''}`}
                  dir="ltr"
                  maxLength={2}
                />
              </div>
              {errors.captcha && <p className="text-red-400 text-xs mt-1">{errors.captcha}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-gold w-full py-3 disabled:opacity-50">
              {loading ? dict.common.loading : (locale === 'fa' ? 'ارسال کد تأیید' : 'Send Verification Code')}
            </button>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-700" />
              <span className="text-gray-500 text-sm">{(dict.googleLogin as Record<string, string>)?.orContinueWith}</span>
              <div className="flex-1 h-px bg-gray-700" />
            </div>

            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl: '/' })}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-gray-700 hover:border-gold/50 hover:bg-gray-800/50 transition-all text-gray-300"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {(dict.googleLogin as Record<string, string>)?.signUpWithGoogle}
            </button>

            <div className="text-center text-sm text-gray-500 mt-4">
              <p>{dict.auth.hasAccount} <Link href="/login" className="text-gold hover:underline">{dict.common.login}</Link></p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="card p-6 space-y-5">
            <div className="text-center">
              <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <HiOutlineShieldCheck className="w-8 h-8 text-gold" />
              </div>
              <h2 className="font-bold text-lg mb-1">{locale === 'fa' ? 'تأیید ایمیل' : 'Verify Email'}</h2>
              <p className="text-sm text-gray-400">
                {locale === 'fa' ? 'کد ۶ رقمی ارسال شده به' : 'Enter the 6-digit code sent to'}
              </p>
              <p className="text-gold text-sm font-mono mt-1">{form.email}</p>
              <p className="text-yellow-500/80 text-[11px] mt-3 bg-yellow-500/5 border border-yellow-500/10 rounded-lg px-3 py-2">
                {locale === 'fa' ? 'اگر ایمیل را دریافت نکردید، پوشه اسپم (Spam/Junk) را بررسی کنید.' : "If you didn't receive the email, please check your Spam/Junk folder."}
              </p>
            </div>

            <div>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="input-field text-center text-2xl tracking-[16px] font-mono font-bold py-4"
                dir="ltr"
                placeholder="------"
                maxLength={6}
                autoFocus
              />
            </div>

            <button type="submit" disabled={loading || code.length !== 6} className="btn-gold w-full py-3 disabled:opacity-50">
              {loading ? dict.common.loading : (locale === 'fa' ? 'تأیید و ثبت‌نام' : 'Verify & Register')}
            </button>

            <div className="flex items-center justify-between text-sm">
              <button type="button" onClick={() => setStep('form')} className="text-gray-500 hover:text-white transition-colors">
                {locale === 'fa' ? 'ویرایش اطلاعات' : 'Edit info'}
              </button>
              <button
                type="button"
                onClick={resendCode}
                disabled={countdown > 0 || loading}
                className="text-gold hover:underline disabled:text-gray-600 disabled:no-underline transition-colors"
              >
                {countdown > 0
                  ? (locale === 'fa' ? `ارسال مجدد (${countdown})` : `Resend (${countdown}s)`)
                  : (locale === 'fa' ? 'ارسال مجدد کد' : 'Resend code')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
