import React from 'react';

interface BrandLogoProps {
  size?: number;
  className?: string;
  isDark?: boolean;
}

/**
 * Nova Brand Mark:
 * A point of light mid-ignition — warm ember core cooling into a violet edge.
 * Real radial gradient from ember (#FF6B4A light / #FF8A66 dark) at the core
 * to signal-violet (#5B47E0 light / #8577FF dark) at the outer edge.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 28,
  className = '',
  isDark = false,
}) => {
  const emberCore = isDark ? '#FF9A7B' : '#FF6B4A';
  const emberMid = isDark ? '#FF7A59' : '#F85A38';
  const signalEdge = isDark ? '#8577FF' : '#5B47E0';
  const deepEdge = isDark ? '#6050E0' : '#4532C2';

  const gradId = `nova-radial-ignition-${isDark ? 'dark' : 'light'}-${size}`;
  const ringId = `nova-ring-grad-${isDark ? 'dark' : 'light'}-${size}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Nova Logo"
      role="img"
    >
      <defs>
        {/* Full-span radial gradient: Ember nucleus cooling into Violet periphery */}
        <radialGradient
          id={gradId}
          cx="38%"
          cy="38%"
          r="62%"
          fx="38%"
          fy="38%"
        >
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
          <stop offset="15%" stopColor={emberCore} />
          <stop offset="48%" stopColor={emberMid} />
          <stop offset="78%" stopColor={signalEdge} />
          <stop offset="100%" stopColor={deepEdge} />
        </radialGradient>

        {/* Ambient violet-ember halo border */}
        <linearGradient id={ringId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={emberCore} stopOpacity="0.9" />
          <stop offset="50%" stopColor={signalEdge} stopOpacity="0.8" />
          <stop offset="100%" stopColor={deepEdge} stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* Outer subtle containment rim */}
      <circle
        cx="16"
        cy="16"
        r="14.5"
        stroke={`url(#${ringId})`}
        strokeWidth="1.2"
        strokeOpacity="0.4"
      />

      {/* Main ignition orb: glowing radial gradient from ember center to violet perimeter */}
      <circle
        cx="16"
        cy="16"
        r="12.5"
        fill={`url(#${gradId})`}
      />

      {/* High-intensity ignition core highlight */}
      <circle
        cx="14"
        cy="14"
        r="2.5"
        fill="#FFFFFF"
        fillOpacity="0.65"
      />
    </svg>
  );
};
