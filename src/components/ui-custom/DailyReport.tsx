import { useEffect, useState, useRef, useMemo } from 'react';
import { t } from '@/i18n';
import { X, TrendingUp, Clock, Eye, Calendar, Award, FileDown, BarChart3, Activity } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import type { BlinkStats } from '@/hooks/useBlinkStats';

interface DailyReportProps {
  stats: BlinkStats;
  onClose: () => void;
  autoExport?: boolean;
}

interface DailyData {
  date: string;
  totalBlinks: number;
  monitorTime: number;
  averageRate: number;
}

export function DailyReport({ stats, onClose, autoExport = false }: DailyReportProps) {
  const [history, setHistory] = useState<DailyData[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoExport) {
      const timer = setTimeout(() => {
        handleExportPDF();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [autoExport]);

  useEffect(() => {
    const saved = localStorage.getItem('blinkguard-daily-history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse history:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (stats.sessionBlinks > 0) {
      const today = new Date().toISOString().split('T')[0];
      const newEntry: DailyData = {
        date: today,
        totalBlinks: stats.totalBlinks,
        monitorTime: stats.monitorTime,
        averageRate: stats.blinkRate,
      };

      setHistory((prev) => {
        const filtered = prev.filter((h) => h.date !== today);
        const updated = [...filtered, newEntry].slice(-7);
        localStorage.setItem('blinkguard-daily-history', JSON.stringify(updated));
        return updated;
      });
    }
  }, [stats]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const getHealthStatus = (rate: number, totalBlinks: number = 0) => {
    if (totalBlinks === 0 && rate === 0) return { label: t('report.status.noData'), color: 'text-muted-foreground', icon: Clock, bg: 'bg-slate-500/10' };
    if (rate >= 15 && rate <= 20) return { label: t('report.status.excellent'), color: 'text-emerald-500', icon: Award, bg: 'bg-emerald-500/10' };
    if (rate >= 10 && rate < 15) return { label: t('report.status.good'), color: 'text-blue-500', icon: TrendingUp, bg: 'bg-blue-500/10' };
    return { label: t('report.status.attention'), color: 'text-amber-500', icon: Eye, bg: 'bg-amber-500/10' };
  };

  const handleExportPDF = async () => {
    if (!printRef.current) return;
    setIsExporting(true);
    try {
      const element = printRef.current;
      // Make it visible momentarily for capture
      element.style.display = 'block';

      // Ensure it's in the DOM and rendered
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        allowTaint: true,
      });

      element.style.display = 'none';

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`blinkguard-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (e) {
      console.error('PDF export failed:', e);
    } finally {
      setIsExporting(false);
    }
  };

  const todayStatus = getHealthStatus(stats.blinkRate, stats.totalBlinks);

  // SVG Line Chart Data
  const chartPoints = useMemo(() => {
    if (history.length < 2) return "";
    const width = 400;
    const height = 120;
    const padding = 20;
    const maxRate = Math.max(...history.map(d => d.averageRate), 25);

    return history.map((day, i) => {
      const x = padding + (i * ((width - 2 * padding) / (history.length - 1)));
      const y = height - padding - (day.averageRate / maxRate) * (height - 2 * padding);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  }, [history]);

  return (
    <div className="alert-overlay" onClick={onClose} style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div
        ref={reportRef}
        className="alert-card max-w-xl w-full mx-4 max-h-[90vh] overflow-auto relative p-0"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'scaleIn 0.4s cubic-bezier(0.23, 1, 0.32, 1)' }}
      >
        {/* Modal UI */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">{t('report.title')}</h2>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary/80 transition-all active:scale-90">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <StatBox icon={Eye} label={t('stats.totalBlinks')} value={stats.totalBlinks} subValue={`${stats.sessionBlinks} session`} />
            <StatBox icon={Activity} label={t('stats.blinkRate')} value={stats.blinkRate.toFixed(1)} subValue={t('stats.rateUnit')} color="text-primary" />
            <StatBox icon={Clock} label={t('stats.monitorTime')} value={formatTime(stats.monitorTime)} subValue="Active Tracking" />
            <div className={`glass-card p-4 rounded-3xl border-none ${todayStatus.bg} flex flex-col justify-between`}>
              <todayStatus.icon className={`h-6 w-6 ${todayStatus.color}`} />
              <div>
                <span className={`text-xl font-bold block ${todayStatus.color}`}>{todayStatus.label}</span>
                <span className="text-xs text-muted-foreground">{t('report.healthStatus')}</span>
              </div>
            </div>
          </div>

          {/* Weekly Chart in UI */}
          {history.length > 1 && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 opacity-70">
                <TrendingUp className="h-4 w-4" />
                {t('report.weekly')} Trends
              </h3>
              <div className="glass-card p-4 rounded-3xl aspect-[4/1.2] flex items-end justify-between gap-1">
                {history.map((day) => (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-primary/20 rounded-t-lg transition-all duration-500 hover:bg-primary/40 group relative"
                      style={{ height: `${Math.max((day.averageRate / 25) * 100, 5)}%` }}
                    >
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {day.averageRate.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-[10px] opacity-50 font-mono italic">
                      {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-5 rounded-3xl bg-secondary/30 border border-white/5 space-y-2 mb-8">
            <h4 className="font-bold text-sm flex items-center gap-2 text-primary">
              <Award className="h-4 w-4" />
              {t('report.healthTip')}
            </h4>
            <p className="text-sm leading-relaxed text-muted-foreground/80">
              {stats.blinkRate < 10 && stats.blinkRate > 0
                ? t('report.pdf.lowAdvice')
                : stats.blinkRate >= 15 && stats.blinkRate <= 20
                  ? t('report.pdf.excellentAdvice')
                  : stats.blinkRate > 20
                    ? t('report.pdf.highAdvice')
                    : stats.blinkRate >= 10 && stats.blinkRate < 15
                      ? t('report.pdf.goodAdvice')
                      : t('report.pdf.noDataAdvice')}
            </p>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleExportPDF} disabled={isExporting} className="glass-button flex-1 h-12 rounded-2xl group">
              <FileDown className={`h-4 w-4 mr-2 transition-transform ${isExporting ? 'animate-bounce' : 'group-hover:-translate-y-1'}`} />
              {isExporting ? t('common.loading') : t('report.exportPDF')}
            </Button>
            <Button onClick={onClose} variant="secondary" className="px-6 h-12 rounded-2xl">
              {t('common.close')}
            </Button>
          </div>
        </div>

        {/* Footer info in Modal */}
        <div className="py-4 text-center border-t border-white/5">
          <p className="text-[10px] text-muted-foreground/40 font-mono tracking-widest uppercase">
            {t('app.footerMadeWith')}
          </p>
        </div>
      </div>

      {/* HIDDEN PRINTABLE VERSION - Optimized for PDF */}
      <div
        ref={printRef}
        style={{
          display: 'none',
          width: '210mm',
          padding: '20mm',
          backgroundColor: '#fff',
          color: '#1a1a1a',
          fontFamily: 'sans-serif',
          position: 'fixed',
          top: '-10000px',
          left: '-10000px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15mm', borderBottom: '2px solid #6366f1', paddingBottom: '5mm' }}>
          <div>
            <h1 style={{ fontSize: '28pt', margin: 0, color: '#6366f1' }}>{t('report.pdf.reportTitle')}</h1>
            <p style={{ margin: '2mm 0 0', opacity: 0.6 }}>{new Date().toLocaleDateString(undefined, { dateStyle: 'full' })}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontWeight: 'bold', margin: 0 }}>{t('report.pdf.signature')}</p>
            <p style={{ fontSize: '10pt', opacity: 0.5, margin: 0 }}>{t('report.pdf.certificate')}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '5mm', marginBottom: '15mm' }}>
          <PrintStat label={t('stats.totalBlinks')} value={stats.totalBlinks} />
          <PrintStat label={t('stats.blinkRate')} value={`${stats.blinkRate.toFixed(1)} ${t('stats.rateUnit')}`} />
          <PrintStat label={t('stats.monitorTime')} value={formatTime(stats.monitorTime)} />
          <PrintStat label={t('report.healthStatus')} value={todayStatus.label} subText={t('stats.basedOnRate')} />
        </div>

        {history.length > 1 && (
          <div style={{ marginBottom: '15mm' }}>
            <h3 style={{ fontSize: '14pt', borderLeft: '4px solid #6366f1', paddingLeft: '3mm', marginBottom: '5mm' }}>{t('report.pdf.weeklyTrend')}</h3>
            <div style={{ height: '60mm', width: '100%', border: '1px solid #eee', borderRadius: '4mm', padding: '5mm', position: 'relative' }}>
              <svg width="100%" height="100%" viewBox="0 0 400 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                <path d={chartPoints} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                {history.map((day, i) => {
                  const x = 20 + (i * (360 / (history.length - 1)));
                  const maxRate = Math.max(...history.map(d => d.averageRate), 25);
                  const y = 100 - (day.averageRate / maxRate) * 80;
                  return (
                    <circle key={i} cx={x} cy={y} r="3" fill="#6366f1" />
                  );
                })}
              </svg>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2mm' }}>
                {history.map(d => (
                  <span key={d.date} style={{ fontSize: '9pt', opacity: 0.5 }}>{new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' })}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={{ backgroundColor: '#f9fafb', padding: '8mm', borderRadius: '5mm', marginBottom: '15mm' }}>
          <h4 style={{ margin: '0 0 3mm', color: '#6366f1' }}>{t('report.pdf.adviceTitle')}</h4>
          <p style={{ margin: 0, lineHeight: 1.6, fontSize: '11pt' }}>
            {stats.blinkRate < 10 && stats.blinkRate > 0
              ? t('report.pdf.lowAdvice')
              : stats.blinkRate >= 15 && stats.blinkRate <= 20
                ? t('report.pdf.excellentAdvice')
                : stats.blinkRate > 20
                  ? t('report.pdf.highAdvice')
                  : stats.blinkRate >= 10 && stats.blinkRate < 15
                    ? t('report.pdf.goodAdvice')
                    : t('report.pdf.noDataAdvice')}
          </p>
        </div>

        <div style={{ textAlign: 'center', opacity: 0.3, marginTop: '20mm', fontSize: '10pt', borderTop: '1px dashed #ccc', paddingTop: '5mm' }}>
          {t('report.pdf.footerInfo')} {t('app.footerMadeWith')}
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon: Icon, label, value, subValue, color = "" }: any) {
  return (
    <div className="glass-card p-4 rounded-3xl border-none flex flex-col justify-between">
      <Icon className={`h-6 w-6 opacity-40 mb-2 ${color}`} />
      <div>
        <span className={`text-2xl font-black block tracking-tight ${color}`}>{value}</span>
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground font-semibold uppercase">{label}</span>
          <span className="text-[9px] opacity-40 italic">{subValue}</span>
        </div>
      </div>
    </div>
  );
}

function PrintStat({ label, value, subText }: any) {
  return (
    <div style={{ border: '1px solid #eee', padding: '5mm', borderRadius: '3mm' }}>
      <p style={{ fontSize: '9pt', color: '#666', margin: '0 0 2mm', textTransform: 'uppercase' }}>{label}</p>
      <p style={{ fontSize: '16pt', fontWeight: 'bold', margin: '0 0 1mm' }}>{value}</p>
      {subText && <p style={{ fontSize: '8pt', opacity: 0.5, margin: 0 }}>{subText}</p>}
    </div>
  );
}
