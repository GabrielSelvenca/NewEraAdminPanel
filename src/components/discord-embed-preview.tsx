"use client";

interface DiscordEmbedPreviewProps {
  title?: string;
  description?: string;
  color?: string;
  footerText?: string;
  thumbnailUrl?: string;
  timestamp?: boolean;
  storeName?: string;
  gamesList?: string[];
  pricePerK?: number;
  status?: string;
}

export function DiscordEmbedPreview({
  title = "Título do Embed",
  description = "Descrição do embed aparece aqui",
  color = "#257e24",
  footerText = "Footer do embed",
  thumbnailUrl,
  timestamp = true,
  storeName = "Nova Era Store",
  gamesList = [],
  pricePerK = 27.99,
  status = "🟢 Disponível"
}: DiscordEmbedPreviewProps) {
  
  // Processa variáveis dinâmicas
  const processVariables = (text: string): string => {
    let processed = text;
    
    // {store-name}
    processed = processed.replace(/\{store-name\}/g, storeName);
    
    // {games-list}
    const gamesListText = gamesList.length > 0 
      ? gamesList.map(g => `• ${g}`).join('\n')
      : '• Nenhum jogo cadastrado';
    processed = processed.replace(/\{games-list\}/g, gamesListText);
    
    // {robux-price [valor]}
    processed = processed.replace(/\{robux-price\s+(\d+)\}/g, (_, robux) => {
      const amount = parseInt(robux);
      const price = (amount / 1000) * pricePerK;
      return `R$ ${price.toFixed(2)}`;
    });
    
    // {status-gamepass} e {status-robux}
    processed = processed.replace(/\{status-gamepass\}/g, status);
    processed = processed.replace(/\{status-robux\}/g, status);
    
    // Mantém compatibilidade com {status} antigo
    processed = processed.replace(/\{status\}/g, status);
    
    return processed;
  };

  // Renderiza texto com markdown Discord
  const renderMarkdown = (text: string) => {
    if (!text) return null;
    
    // Processa variáveis primeiro
    text = processVariables(text);
    
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    
    // Regex para capturar markdown: **bold**, *italic*, __underline__
    const markdownRegex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(__(.+?)__)/g;
    let match;
    
    while ((match = markdownRegex.exec(text)) !== null) {
      // Adiciona texto antes do match
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      // Identifica tipo de formatação
      if (match[1]) {
        // **bold**
        parts.push(<strong key={match.index}>{match[2]}</strong>);
      } else if (match[3]) {
        // *italic*
        parts.push(<em key={match.index}>{match[4]}</em>);
      } else if (match[5]) {
        // __underline__
        parts.push(<u key={match.index}>{match[6]}</u>);
      }
      
      lastIndex = match.index + match[0].length;
    }
    
    // Adiciona texto restante
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : text;
  };

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
                {renderMarkdown(description)}
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
