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
  return (
    <div className="bg-[#313338] rounded-lg p-4 max-w-2xl">
      <div className="bg-[#2b2d31] rounded border-l-4 p-3" style={{ borderColor: color }}>
        <div className="flex gap-3">
          <div className="flex-1 min-w-0">
            {title && (
              <div className="text-white font-semibold text-base mb-2 break-words">
                {title}
              </div>
            )}
            {description && (
              <div className="text-[#dbdee1] text-sm leading-relaxed break-words whitespace-pre-wrap mb-3">
                {description}
              </div>
            )}
            {footerText && (
              <div className="flex items-center gap-2 text-xs text-[#949ba4] border-t border-[#3f4147] pt-2">
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
                alt="Banner" 
                className="w-24 h-24 rounded object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
