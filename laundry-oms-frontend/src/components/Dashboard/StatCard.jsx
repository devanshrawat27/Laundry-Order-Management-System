export default function StatCard({ title, value, icon, color = 'brand' }) {
  const colorMap = {
    brand:   'border-l-brand-600   text-brand-600  bg-brand-50',
    green:   'border-l-emerald-500 text-emerald-600 bg-emerald-50',
    blue:    'border-l-blue-500    text-blue-600   bg-blue-50',
    amber:   'border-l-amber-500   text-amber-600  bg-amber-50',
  };

  const iconBgMap = {
    brand: 'bg-brand-50 text-brand-600',
    green: 'bg-emerald-50 text-emerald-600',
    blue:  'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className={`card border-l-4 ${colorMap[color]?.split(' ')[0]} flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBgMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
}
