import { useEffect } from 'react';
import { X } from 'lucide-react';

/** Overlay em tela cheia para ver a arte inteira (object-contain, zoom real). */
export function ArtLightbox({ src, alt, onClose }: { src: string; alt?: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex cursor-zoom-out items-center justify-center bg-black/95 p-4"
      onClick={onClose}
    >
      <img
        src={src}
        alt={alt ?? 'Arte — visualização completa'}
        className="max-h-full max-w-full object-contain"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-3xl leading-none text-white/70 hover:text-white"
        aria-label="Fechar"
      >
        <X className="h-7 w-7" />
      </button>
    </div>
  );
}
