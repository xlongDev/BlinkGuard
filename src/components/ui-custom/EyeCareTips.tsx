import { t } from '@/i18n';
import { Lightbulb, Monitor, Droplets, Sun, Coffee } from 'lucide-react';

export function EyeCareTips() {
  const tips = [
    {
      id: 'rule202020',
      icon: Monitor,
      title: t('tips.rule202020.title'),
      description: t('tips.rule202020.desc'),
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'hydration',
      icon: Droplets,
      title: t('tips.hydration.title'),
      description: t('tips.hydration.desc'),
      color: 'from-cyan-500 to-teal-500',
    },
    {
      id: 'lighting',
      icon: Sun,
      title: t('tips.lighting.title'),
      description: t('tips.lighting.desc'),
      color: 'from-amber-500 to-orange-500',
    },
    {
      id: 'rest',
      icon: Coffee,
      title: t('tips.rest.title'),
      description: t('tips.rest.desc'),
      color: 'from-rose-500 to-pink-500',
    },
  ];

  return (
    <div
      className="glass-card"
      style={{
        animation: 'slideUp 0.5s cubic-bezier(0.23, 1, 0.32, 1) 0.4s both',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border/50">
        <Lightbulb className="h-5 w-5 text-primary" />
        <h2 className="font-semibold">{t('tips.title')}</h2>
      </div>

      {/* Tips Grid */}
      <div className="p-4 grid grid-cols-1 xl:grid-cols-2 gap-4">
        {tips.map((tip, index) => (
          <div
            key={tip.id}
            className="group relative p-4 rounded-2xl bg-secondary/30 hover:bg-secondary/50 border border-border/40 hover:border-primary/30 transition-all duration-300 overflow-hidden"
            style={{
              animation: `fadeIn 0.5s ease-out ${0.1 + index * 0.1}s both`,
            }}
          >
            {/* Background Decor */}
            <div className={`absolute -right-4 -top-4 h-16 w-16 rounded-full bg-gradient-to-br ${tip.color} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500`} />
            
            <div className="flex items-center gap-4">
              <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${tip.color} flex items-center justify-center shadow-lg shadow-primary/5 flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                <tip.icon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <h3 className="font-bold text-sm tracking-tight group-hover:text-primary transition-colors">{tip.title}</h3>
                <p className="text-[11px] leading-relaxed text-muted-foreground/90 whitespace-pre-wrap">
                  {tip.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
