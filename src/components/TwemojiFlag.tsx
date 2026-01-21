'use client';

import { useEffect, useRef } from 'react';
import twemoji from 'twemoji';

interface TwemojiFlagProps {
  emoji: string;
  className?: string;
}

export default function TwemojiFlag({ emoji, className = '' }: TwemojiFlagProps) {
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (spanRef.current) {
      twemoji.parse(spanRef.current, {
        folder: 'svg',
        ext: '.svg',
        base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/'
      });
    }
  }, [emoji]);

  return (
    <span
      ref={spanRef}
      className={`inline-flex items-center [&_img]:h-[1em] [&_img]:w-auto [&_img]:align-middle ${className}`}
    >
      {emoji}
    </span>
  );
}
