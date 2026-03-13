import { t } from '@/i18n';
import { Eye, Activity, Clock, Heart, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { BlinkStats } from '@/hooks/useBlinkStats';

interface StatsCardsProps {
  stats: BlinkStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getEyeStatus = () => {
    if (stats.blinkRate === 0) return { label: t('stats.unknown'), color: 'text-muted-foreground', icon: Minus };
    if (stats.blinkRate < 10) return { label: t('stats.low'), color: 'text-rose-500', icon: TrendingDown };
    if (stats.blinkRate > 25) return { label: t('stats.high'), color: 'text-amber-500', icon: TrendingUp };
    return { label: t('stats.normal'), color: 'text-emerald-500', icon: TrendingUp };
  };

  const eyeStatus = getEyeStatus();

  const cards = [
    {
      title: t('stats.totalBlinks'),
      value: stats.totalBlinks.toString(),
      subtitle: t('stats.sessionBlinks'),
      icon: Eye,
      color: 'from-blue-500 to-cyan-500',
      delay: 0,
    },
    {
      title: t('stats.blinkRate'),
      value: stats.blinkRate.toFixed(1),
      subtitle: t('stats.rateUnit'),
      icon: Activity,
      color: 'from-violet-500 to-purple-500',
      delay: 0.1,
    },
    {
      title: t('stats.monitorTime'),
      value: formatTime(stats.monitorTime),
      subtitle: t('stats.activeTime'),
      icon: Clock,
      color: 'from-amber-500 to-orange-500',
      delay: 0.2,
    },
    {
      title: t('stats.eyeStatus'),
      value: eyeStatus.label,
      subtitle: t('stats.basedOnRate'),
      icon: Heart,
      color: 'from-rose-500 to-pink-500',
      customValueClass: eyeStatus.color,
      delay: 0.3,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="glass-card p-4 hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300"
          style={{
            animation: `slideUp 0.5s cubic-bezier(0.23, 1, 0.32, 1) ${card.delay}s both`,
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <span className="text-sm text-muted-foreground">{card.title}</span>
            <div className={`h-8 w-8 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`}>
              <card.icon className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <span className={`text-2xl font-bold block ${card.customValueClass || 'text-gradient'}`}>
              {card.value}
            </span>
            <span className="text-xs text-muted-foreground">{card.subtitle}</span>
          </div>
        </div>
      ))}

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
      `}</style>
    </div>
  );
}
