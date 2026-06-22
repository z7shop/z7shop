'use client';
import { useLocale } from '@/hooks/useLocale';

interface Props {
  password: string;
}

export default function PasswordStrength({ password }: Props) {
  const { locale } = useLocale();

  if (!password) return null;

  let score = 0;
  if (password.length >= 4) score++;
  if (password.length >= 6) score++;
  if (/[a-zA-Z]/.test(password) && /\d/.test(password)) score++;

  const levels = [
    { label: locale === 'fa' ? 'ضعیف' : 'Weak', color: 'bg-red-500', w: 'w-1/3' },
    { label: locale === 'fa' ? 'متوسط' : 'Medium', color: 'bg-yellow-500', w: 'w-2/3' },
    { label: locale === 'fa' ? 'قوی' : 'Strong', color: 'bg-green-500', w: 'w-full' },
  ];

  const level = levels[Math.min(score, levels.length) - 1] || levels[0];

  return (
    <div className="mt-2 space-y-1">
      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full ${level.color} ${level.w} rounded-full transition-all duration-500`} />
      </div>
      <p className={`text-xs ${score <= 2 ? 'text-red-400' : score <= 3 ? 'text-yellow-400' : 'text-green-400'}`}>
        {level.label}
      </p>
    </div>
  );
}
