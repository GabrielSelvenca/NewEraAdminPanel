"use client";

interface DiscordEmbedPreviewProps {
  title?: string;
  description?: string;
  color?: string;
  footerText?: string;
  thumbnailUrl?: string;
  timestamp?: boolean;
}

export function DiscordEmbedPreview({
  title = "Título do Embed",
  description = "Descrição do embed aparece aqui",
  color = "#257e24",
  footerText = "Footer do embed",
  thumbnailUrl,
  timestamp = true
}: DiscordEmbedPreviewProps) {
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 37, g: 126, b: 36 };
  };

  const rgb = hexToRgb(color);

  return (
    <div className="bg-[#2b2d31] rounded-lg p-4 font-['gg_sans']">
      <div className="flex gap-3">
        <div 
          className="w-1 rounded-full flex-shrink-0" 
          style={{ backgroundColor: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` }}
        />
        <div className="flex-1 min-w-0">
          <div className="bg-[#2b2d31] border-l-4 rounded" style={{ borderColor: color }}>
            <div className="p-4 pr-3">
              <div className="flex gap-4">
                <div className="flex-1 min-w-0">
                  {title && (
                    <div className="text-[#00aff4] font-semibold text-sm mb-2 break-words">
                      {title}
                    </div>
                  )}
                  {description && (
                    <div className="text-[#dbdee1] text-sm leading-[1.375rem] break-words whitespace-pre-wrap">
                      {description}
                    </div>
                  )}
                  {footerText && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-[#949ba4]">
                      <span>{footerText}</span>
                      {timestamp && (
                        <>
                          <span>•</span>
                          <span>{new Date().toLocaleString('pt-BR', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                {thumbnailUrl && (
                  <div className="flex-shrink-0">
                    <img 
                      src={thumbnailUrl} 
                      alt="Thumbnail" 
                      className="w-20 h-20 rounded object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
