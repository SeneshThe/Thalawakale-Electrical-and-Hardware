import { useState } from 'react';
import { Zap } from 'lucide-react';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export function ProductImage({
  src,
  alt,
  className = 'w-full h-full object-contain',
  fallbackLabel,
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  const base = import.meta.env.BASE_URL || './';
  const resolvedSrc = src.startsWith('/src/assets/')
    ? `${base}${src.slice(1)}`
    : src.startsWith('src/assets/')
      ? `${base}${src}`
      : src;

  if (failed || !resolvedSrc) {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 text-zinc-500 p-4 text-center"
        role="img"
        aria-label={alt}
      >
        <Zap className="w-8 h-8 mb-2 text-zinc-400" strokeWidth={1.75} />
        <span className="text-xs font-medium text-zinc-600 line-clamp-2">
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
