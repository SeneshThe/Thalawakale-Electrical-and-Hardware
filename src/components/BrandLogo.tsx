interface BrandLogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
}

export function BrandLogo({ variant = 'light', size = 'md' }: BrandLogoProps) {
  const iconSize =
    size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8 sm:w-9 sm:h-9';

  const bgFill = variant === 'dark' ? '#FBBF24' : '#18181B';
  const strokeAccent = variant === 'dark' ? '#18181B' : '#FBBF24';
  const nodeFill = variant === 'dark' ? '#18181B' : '#FFFFFF';

  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${iconSize} shrink-0`}
      aria-hidden="true"
    >
      {/* Precision Hexagonal Industrial Nut / Switchgear Frame */}
      <path
        d="M20 2.5L35.1554 11.25V28.75L20 37.5L4.84456 28.75V11.25L20 2.5Z"
        fill={bgFill}
      />
      {/* Inner Hairline Technical Bevel */}
      <path
        d="M20 5.5L32.5574 12.75V27.25L20 34.5L7.44263 27.25V12.75L20 5.5Z"
        stroke={strokeAccent}
        strokeWidth="1.25"
        strokeOpacity="0.45"
      />
      {/* High-Contrast Electrical Bolt & Terminal Mark */}
      <path
        d="M22.2 9.5L13.2 21.4H19.4L17.6 30.5L26.8 18.6H20.6L22.2 9.5Z"
        fill={strokeAccent}
      />
      {/* Circuit Anchor Nodes */}
      <circle cx="20" cy="5.5" r="1.4" fill={nodeFill} />
      <circle cx="20" cy="34.5" r="1.4" fill={nodeFill} />
    </svg>
  );
}
