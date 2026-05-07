import React from 'react';
import { Outlet } from 'react-router-dom';
import KairoMark from '../common/KairoMark';

export default function AuthLayout() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{
        background: '#001C33',
        backgroundImage: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(0,85,135,0.33) 0%, transparent 70%)',
      }}
    >
      {/* Decorative grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.04,
          backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative z-10 w-full max-w-[420px] flex flex-col items-center gap-0">
        {/* Brand lockup */}
        <div className="mb-4">
          <img
            src={`${process.env.PUBLIC_URL}/brand-lockup.png`}
            alt="Oracle × Tecnológico de Monterrey"
            style={{ height: 40, width: 'auto', filter: 'brightness(0) invert(1)', opacity: 0.65 }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>

        {/* Card */}
        <div className="w-full bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.4)' }}>
          {/* Top accent bar */}
          <div className="h-1" style={{ background: 'linear-gradient(90deg, #003865, #C74634)' }} />

          <div className="px-8 py-5">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-5">
              <KairoMark size={40} variant="oracle" />
              <div>
                <div className="font-display text-xl font-extrabold tracking-tight text-gray-900" style={{ letterSpacing: '-0.03em' }}>
                  Kairo
                </div>
                <div className="text-[10px] font-bold tracking-[0.10em] uppercase text-gray-400 mt-0.5">
                  TEConecta
                </div>
              </div>
            </div>

            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
