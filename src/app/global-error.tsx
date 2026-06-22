'use client';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="fa" dir="rtl">
      <body style={{ margin: 0, background: '#0c0c0f', color: '#fff', fontFamily: 'system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>خطایی رخ داد</h1>
          <p style={{ color: '#9ca3af', marginBottom: '2rem', fontSize: '0.875rem' }}>مشکلی در بارگذاری صفحه پیش آمده است.</p>
          <button
            onClick={reset}
            style={{ background: '#C9A84C', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', cursor: 'pointer', fontSize: '0.875rem' }}
          >
            تلاش مجدد
          </button>
        </div>
      </body>
    </html>
  );
}
