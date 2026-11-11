import React from 'react';

interface AmbientBackgroundProps {
  isDark?: boolean;
}

/**
 * AmbientBackground:
 * A slow-drifting soft gradient / aurora motion in the ember / violet family.
 * Kept low-contrast behind content so legibility remains crisp and effortless.
 */
export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({ isDark = false }) => {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Aurora Orb 1: Warm Ember, slow drifting ellipse */}
      <div
        className={`absolute -top-32 -left-20 w-[520px] h-[480px] rounded-full blur-[110px] transition-opacity duration-1000 ${
          isDark
            ? 'opacity-20 bg-gradient-to-br from-[#FF8A66] via-[#FF6B4A]/50 to-transparent'
            : 'opacity-10 bg-gradient-to-br from-[#FF6B4A] via-[#FFA38A]/60 to-transparent'
        }`}
        style={{
          animation: 'float-drift-1 28s ease-in-out infinite alternate',
        }}
      />

      {/* Aurora Orb 2: Signal Violet, drifting across center-right */}
      <div
        className={`absolute top-1/4 -right-32 w-[600px] h-[520px] rounded-full blur-[120px] transition-opacity duration-1000 ${
          isDark
            ? 'opacity-22 bg-gradient-to-bl from-[#8577FF] via-[#5B47E0]/40 to-transparent'
            : 'opacity-12 bg-gradient-to-bl from-[#5B47E0] via-[#8577FF]/40 to-transparent'
        }`}
        style={{
          animation: 'float-drift-2 34s ease-in-out infinite alternate',
        }}
      />

      {/* Aurora Orb 3: Twilight Ember-Violet core at bottom left */}
      <div
        className={`absolute -bottom-24 left-1/3 w-[560px] h-[440px] rounded-full blur-[130px] transition-opacity duration-1000 ${
          isDark
            ? 'opacity-18 bg-gradient-to-tr from-[#5B47E0]/50 via-[#FF8A66]/30 to-transparent'
            : 'opacity-08 bg-gradient-to-tr from-[#5B47E0]/40 via-[#FF6B4A]/30 to-transparent'
        }`}
        style={{
          animation: 'float-drift-3 26s ease-in-out infinite alternate',
        }}
      />
    </div>
  );
};
