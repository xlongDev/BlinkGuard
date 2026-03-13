import { t } from '@/i18n';
import { TrendingUp, Activity } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { BlinkStats } from '@/hooks/useBlinkStats';

interface TrendChartProps {
  stats: BlinkStats;
}

export function TrendChart({ stats }: TrendChartProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const data = stats.blinkHistory.map((item) => ({
    time: formatTime(item.time),
    count: item.count,
  }));

  const hasData = data.length > 0;

  return (
    <div
      className="glass-card"
      style={{
        animation: 'slideUp 0.5s cubic-bezier(0.23, 1, 0.32, 1) 0.3s both',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-5 w-5 text-primary" />
          <div>
            <h2 className="font-semibold">{t('stats.trend')}</h2>
            <p className="text-xs text-muted-foreground">{t('stats.trendSubtitle')}</p>
          </div>
        </div>
        {hasData && (
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-500" />
            <span className="text-sm text-muted-foreground">
              {stats.sessionBlinks} {t('stats.sessionBlinks').toLowerCase()}
            </span>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="p-4">
        {hasData ? (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="blinkGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99, 102, 241, 0.1)" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10, fill: 'currentColor' }}
                  stroke="rgba(99, 102, 241, 0.3)"
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'currentColor' }}
                  stroke="rgba(99, 102, 241, 0.3)"
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  }}
                  labelStyle={{ color: '#6366f1', fontSize: 12 }}
                  itemStyle={{ color: '#1e293b', fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#blinkGradient)"
                  animationDuration={1000}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex flex-col items-center justify-center gap-3">
            <div
              className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center"
              style={{ animation: 'fadeIn 0.5s ease-out' }}
            >
              <TrendingUp className="h-6 w-6 text-primary/50" />
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">{t('stats.noData')}</p>
              <p className="text-xs text-muted-foreground/70">{t('stats.startToSee')}</p>
            </div>
          </div>
        )}
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
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
