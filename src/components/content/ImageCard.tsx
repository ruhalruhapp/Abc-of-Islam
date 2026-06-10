import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ZoomIn, X } from 'lucide-react';

interface ImageCardProps {
  src: string;
  alt: string;
  icon: string;
}

export default function ImageCard({ src, alt, icon }: ImageCardProps) {
  const [zoomed, setZoomed] = useState(false);
  const [extIndex, setExtIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  // Compute Candidates for Fallback Image Paths (e.g. .webp, .png, .jpg, .jpeg)
  const getImagePathList = () => {
    const dotIndex = src.lastIndexOf('.');
    const base = dotIndex !== -1 ? src.substring(0, dotIndex) : src;
    const origExt = dotIndex !== -1 ? src.substring(dotIndex) : '';

    const candidateExtensions = [origExt, '.webp', '.png', '.jpg', '.jpeg'].filter(Boolean);
    return candidateExtensions.filter((value, index, self) => self.indexOf(value) === index);
  };

  const uniqueCandidates = getImagePathList();
  const currentImagePath = extIndex < uniqueCandidates.length 
    ? `/images/${src.lastIndexOf('.') !== -1 ? src.substring(0, src.lastIndexOf('.')) : src}${uniqueCandidates[extIndex]}`
    : null;

  const handleImageError = () => {
    if (extIndex < uniqueCandidates.length - 1) {
      setExtIndex(prev => prev + 1);
    } else {
      setHasError(true);
    }
  };

  const isFailedAll = hasError || currentImagePath === null;

  return (
    <>
      <div
        id={`image-card-${src}`}
        className="relative rounded-3xl overflow-hidden border-2 border-emerald-100 cursor-pointer group hover:shadow-xl hover:scale-[1.02] hover:border-emerald-300 transition-all duration-300 bg-white shadow-md"
        onClick={() => setZoomed(true)}
      >
        <div className="aspect-[4/3] bg-gradient-to-b from-emerald-50/40 to-amber-50/20 flex items-center justify-center overflow-hidden relative border-b border-emerald-50">
          {isFailedAll ? (
            <div className="flex flex-col items-center justify-center text-center p-6 gap-2">
              <span className="text-7xl filter select-none">{icon}</span>
              <span className="text-sm font-bold uppercase tracking-wider text-emerald-800 mt-3 font-sans">{alt}</span>
            </div>
          ) : (
            <img
              src={currentImagePath}
              alt={alt}
              onError={handleImageError}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          )}
        </div>
        <div className="absolute top-3.5 right-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="p-2.5 bg-white/90 backdrop-blur border border-emerald-100 shadow-md rounded-full">
            <ZoomIn className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
          </div>
        </div>
        {!isFailedAll && (
          <div className="absolute bottom-3.5 left-3.5 text-2xl filter drop-shadow-sm leading-none select-none">
            {icon}
          </div>
        )}
      </div>

      <AnimatePresence>
        {zoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm no-print"
            onClick={() => setZoomed(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="relative max-w-4xl w-full bg-transparent p-2 rounded-3xl overflow-hidden flex items-center justify-center m-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {isFailedAll ? (
                <div className="aspect-[4/3] w-full max-w-xl bg-white border-4 border-emerald-200 rounded-3xl flex flex-col items-center justify-center text-center p-12 gap-4 shadow-xl">
                  <span className="text-9xl filter">{icon}</span>
                  <h3 className="text-2xl font-serif font-bold text-emerald-800">{alt}</h3>
                </div>
              ) : (
                <img
                  src={currentImagePath}
                  alt={alt}
                  className="w-full h-auto rounded-3xl border-4 border-white shadow-2xl object-contain max-h-[85vh]"
                />
              )}
              <button
                onClick={() => setZoomed(false)}
                className="absolute top-5 right-5 p-2.5 bg-white text-[#2C3E50] border border-black/5 rounded-full shadow-lg hover:bg-rose-500 hover:text-white transition-all cursor-pointer hover:scale-105"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
