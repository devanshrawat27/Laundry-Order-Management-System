import { Loader2 } from 'lucide-react';

export default function Loader({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 size={32} className="animate-spin text-brand-600" />
      <p className="text-sm text-gray-400">{text}</p>
    </div>
  );
}
