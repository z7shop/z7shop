'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLocale } from '@/hooks/useLocale';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineLockClosed } from 'react-icons/hi';

export default function LoginPage() {
  const { locale, dict } = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      toast.error(dict.auth.invalidCredentials);
    } else {
      toast.success(locale === 'fa' ? 'خوش آمدید!' : 'Welcome!');
      const sessionRes = await fetch('/api/auth/session');
      const sessionData = await sessionRes.json();
      if (sessionData?.user?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
      router.refresh();
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c0c0f] px-4 relative overflow-hidden">
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(201, 168, 76, 0.08), transparent)' }} />
      <div className="w-full max-w-md relative z-10 animate-slide-up">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-black text-gradient">{dict.common.brand}</Link>
          <h1 className="text-xl font-bold mt-4">{dict.auth.loginTitle}</h1>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label htmlFor="login-email" className="text-sm font-medium mb-1 block">{dict.auth.email}</label>
            <div className="relative">
              <HiOutlineMail className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field ps-10" dir="ltr" required autoComplete="email" />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="text-sm font-medium mb-1 block">{dict.auth.password}</label>
            <div className="relative">
              <HiOutlineLockClosed className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field ps-10" dir="ltr" required autoComplete="current-password" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-gold w-full py-3 disabled:opacity-50">
            {loading ? dict.common.loading : dict.auth.loginButton}
          </button>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-700" />
            <span className="text-gray-500 text-sm">{(dict as any).googleLogin.orContinueWith}</span>
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
            {(dict as any).googleLogin.signInWithGoogle}
          </button>

          <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
            <Link href="/forgot-password" className="text-gray-500 hover:text-gold transition-colors">{dict.auth.forgotPassword}</Link>
            <p>{dict.auth.noAccount} <Link href="/register" className="text-gold hover:underline">{dict.common.register}</Link></p>
          </div>

        </form>
      </div>
    </div>
  );
}
