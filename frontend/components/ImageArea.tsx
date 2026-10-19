'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';

interface ImageAreaProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: 'video' | 'square' | 'wide' | 'auto';
  caption?: string;
  fallbackText?: string;
  priority?: boolean;
}

export const ImageArea: React.FC<ImageAreaProps> = ({
  src,
  alt,
  className = '',
  aspectRatio = 'video',
  caption,
  fallbackText,
  priority = false,
}) => {
  const [hasError, setHasError] = useState(false);

  const aspectClasses = {
    video: 'aspect-[16/9]',
    square: 'aspect-square',
    wide: 'aspect-[21/9]',
    auto: 'h-auto',
  }[aspectRatio];

  return (
    <figure suppressHydrationWarning className={`overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-soft)] ${className}`}>
      <div suppressHydrationWarning className={`relative w-full ${aspectClasses} flex items-center justify-center overflow-hidden`}>
        {!hasError ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-300 hover:scale-[1.02]"
            onError={() => setHasError(true)}
            priority={priority}
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center text-[var(--text-secondary)]">
            <div className="w-12 h-12 mb-2 rounded-full bg-[var(--border-color)] flex items-center justify-center text-[var(--accent-deep)]">
              <ImageIcon className="w-6 h-6 text-[var(--text-secondary)]" />
            </div>
            <p className="text-sm font-medium">{fallbackText || alt}</p>
          </div>
        )}
      </div>
      {caption && (
        <figcaption className="px-3 py-2 text-xs text-center border-t border-[var(--border-color)] text-[var(--text-secondary)] bg-[var(--bg-surface)]">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};
