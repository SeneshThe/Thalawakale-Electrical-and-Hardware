interface BrandLogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
}

export function BrandLogo({ variant = 'light', size = 'md' }: BrandLogoProps) {
  const iconSize =
    size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-11 h-11' : 'w-9 h-9';

  const bgFill = variant === 'dark' ? '#FBBF24' : '#18181B';
  const primaryMark = variant === 'dark' ? '#18181B' : '#FFFFFF';
  const accentMark = variant === 'dark' ? '#FFFFFF' : '#FBBF24';
  const bevelStroke = variant === 'dark' ? '#18181B' : '#FBBF24';

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${iconSize} shrink-0`}
      aria-hidden="true"
    >
      {/* Chamfered Industrial Switchgear Plate */}
      <path
        d="M13 3H35L45 13V35L35 45H13L3 35V13L13 3Z"
        fill={bgFill}
      />

      {/* Inner Technical Bevel Frame */}
      <path
        d="M14.5 6H33.5L42 14.5V33.5L33.5 42H14.5L6 33.5V14.5L14.5 6Z"
        stroke={bevelStroke}
        strokeWidth="1.2"
        strokeOpacity={variant === 'dark' ? '0.28' : '0.4'}
      />

      {/* Corner Terminal Rivets */}
      <circle cx="10.5" cy="10.5" r="1.3" fill={accentMark} />
      <circle cx="37.5" cy="37.5" r="1.3" fill={accentMark} />

      {/* Left Monogram "T" — Machined Hardware Spanner Head & Stem */}
      <path
        d="M10 13H23.5L21.2 17.5H18.5V34.5H13.5V17.5H10V13Z"
        fill={primaryMark}
      />

      {/* Right Monogram "E" — Energized Copper-Amber Three-Terminal Busbar */}
      <path
        d="M25.5 13H38V17.5H29.8V21.5H36L34.2 25.8H29.8V30H38V34.5H24.5V18L25.5 13Z"
        fill={accentMark}
      />

      {/* Subtle Thalawakale Hill-Country Ridge Accent */}
      <path
        d="M13.5 38.5L19.5 36.2L24 38.2L29.5 35.8L35 38.5"
        stroke={primaryMark}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.65"
      />
    </svg>
  );
}
