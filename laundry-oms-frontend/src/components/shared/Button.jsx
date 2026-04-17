import { Loader2 } from 'lucide-react';

export default function Button({ children, variant = 'primary', loading = false, className = '', ...props }) {
  const base = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'bg-red-50 text-red-600 px-6 py-3 rounded-xl font-semibold text-sm border border-red-200 transition-all duration-200 hover:bg-red-100 active:scale-[0.98] flex items-center justify-center gap-2',
  };

  return (
    <button
      className={`${base[variant] || base.primary} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}
