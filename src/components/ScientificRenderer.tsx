import React, { useState } from 'react';
import katex from 'katex';
import { ZoomIn, X } from 'lucide-react';

interface ScientificRendererProps {
  content: string;
  latex?: string;
  imageUrl?: string;
  imageAlt?: string;
  className?: string;
  isInline?: boolean;
}

export const ScientificRenderer: React.FC<ScientificRendererProps> = ({
  content,
  latex,
  imageUrl,
  imageAlt,
  className = '',
  isInline = false,
}) => {
  const [isZoomed, setIsZoomed] = useState(false);

  // Helper to render KaTeX formula safely
  const renderLatex = (latexString: string) => {
    try {
      const html = katex.renderToString(latexString, {
        throwOnError: false,
        displayMode: !isInline,
      });
      return <span dangerouslySetInnerHTML={{ __html: html }} />;
    } catch {
      return <code>{latexString}</code>;
    }
  };

  // Helper to highlight inline formulas enclosed in $...$
  const parseFormattedText = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\$[^$]+\$)/g);

    return parts.map((part, idx) => {
      if (part.startsWith('$') && part.endsWith('$')) {
        const rawFormula = part.slice(1, -1);
        try {
          const html = katex.renderToString(rawFormula, {
            throwOnError: false,
            displayMode: false,
          });
          return <span key={idx} dangerouslySetInnerHTML={{ __html: html }} className="inline-block mx-0.5" />;
        } catch {
          return <code key={idx} className="bg-neutral-800 text-amber-300 px-1 py-0.5 rounded text-xs">{rawFormula}</code>;
        }
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div className={`leading-relaxed break-words max-w-full overflow-x-auto ${className}`}>
      {content && <div className="text-neutral-100 break-words leading-relaxed">{parseFormattedText(content)}</div>}

      {latex && (
        <div className="my-3 p-3 bg-neutral-900/80 border border-neutral-800 rounded-xl overflow-x-auto text-center">
          {renderLatex(latex)}
        </div>
      )}

      {imageUrl && (
        <div className="my-3">
          <div
            className="relative group rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 max-w-md mx-auto cursor-pointer"
            onClick={() => setIsZoomed(true)}
          >
            <img
              src={imageUrl}
              alt={imageAlt || 'Diagrama ou figura da questão'}
              className="w-full h-auto object-contain max-h-64"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-xs font-semibold text-white">
              <ZoomIn size={16} /> Clique para ampliar
            </div>
          </div>

          {/* Modal de Zoom da Imagem */}
          {isZoomed && (
            <div
              className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
              onClick={() => setIsZoomed(false)}
            >
              <div className="relative max-w-4xl max-h-[90vh] bg-neutral-900 border border-neutral-800 rounded-2xl p-4 overflow-hidden flex flex-col items-center">
                <button
                  onClick={() => setIsZoomed(false)}
                  className="absolute top-4 right-4 p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 transition-colors"
                >
                  <X size={20} />
                </button>
                <img
                  src={imageUrl}
                  alt={imageAlt || 'Diagrama ampliado'}
                  className="max-h-[80vh] max-w-full object-contain rounded-lg"
                />
                {imageAlt && <p className="mt-3 text-xs text-neutral-400 text-center">{imageAlt}</p>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
