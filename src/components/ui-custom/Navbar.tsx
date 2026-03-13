import { useState, useEffect } from 'react';
import { Github, Languages } from "lucide-react";
import { ThemeToggle } from '../theme/ThemeToggle';
import { getLanguage, setLanguage } from '@/i18n';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'py-2 px-4' : 'py-4 px-6'
        }`}
    >
      <nav
        className={`mx-auto transition-all duration-500 ${scrolled ? 'max-w-4xl glass-card py-2 px-4 !overflow-visible' : 'max-w-7xl py-2 px-4'
          }`}
        style={{
          borderRadius: scrolled ? '1.5rem' : '0',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          animation: 'slideDown 0.8s cubic-bezier(0.23, 1, 0.32, 1)',
        }}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 group cursor-default">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
              <img src={`${import.meta.env.BASE_URL}favicon.svg`} className="h-6 w-6 object-contain" alt="Logo" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight text-foreground">
                Blink<span className="text-primary">Guard</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                Smart Eye Protection
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLanguage(getLanguage() === 'zh' ? 'en' : 'zh')}
              className="h-10 px-3 rounded-xl glass-card flex items-center justify-center gap-2 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all duration-300 hover:scale-105 active:scale-95 active:rotate-[-2deg]"
              title={getLanguage() === 'zh' ? 'Switch to English' : '切换至中文'}
            >
              <Languages className="h-4 w-4" />
              <span className="text-xs font-bold uppercase">{getLanguage() === 'zh' ? 'EN' : '中文'}</span>
            </button>
            <a
              href="https://github.com/xlongDev/BlinkGuard"
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 w-10 rounded-xl glass-card flex items-center justify-center hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all duration-300 hover:scale-110 hover:rotate-[8deg] active:scale-90 active:rotate-0"
            >
              <Github className="h-5 w-5" />
            </a>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <style>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </header >
  );
}
