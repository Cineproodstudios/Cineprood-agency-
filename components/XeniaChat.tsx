import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface XeniaChatProps {
  isActive: boolean;
  onExit?: () => void;
}

export const XeniaChat: React.FC<XeniaChatProps> = ({ isActive, onExit }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hola, soy Xenia, la Productora Creativa IA de CINEPROOD.\n\nEstoy integrada en el núcleo de nuestra productora para ayudarte a conceptualizar y estructurar tu proyecto (videoclip, spot publicitario, ficción o pieza conceptual). Cuéntame tu idea y definamos juntos la ruta óptima de producción: Tradicional, IA o Híbrida.',
      timestamp: 'ONLINE'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isActive) {
      scrollToBottom();
    }
  }, [messages, isLoading, isActive]);

  const sendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || input).trim();
    if (!messageContent || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const payload = newMessages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: payload })
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const reply = data.reply || 'Entendido. Cuéntame más detalles sobre lo que imaginas para tu proyecto.';

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Error al consultar a Xenia:', err);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Ha ocurrido una incidencia temporal en la conexión. Puedes volver a intentarlo o escribir directamente a nuestro equipo humano en cineprood@gmail.com.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Conversación reiniciada. Espacio de Xenia restablecido. ¿Qué nuevo proyecto o consulta audiovisual deseas plantear?',
        timestamp: 'ONLINE'
      }
    ]);
  };

  return (
    <div 
      className={`w-full max-w-5xl mx-auto flex flex-col h-full transition-opacity duration-500 ${
        isActive ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      {/* Top Ambient Bar inside Xenia Space */}
      <div className="flex items-center justify-between pb-6 border-b border-black/5 dark:border-white/5 shrink-0 px-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
            <span className="text-[10px] font-mono tracking-[0.35em] uppercase text-red-600 font-semibold">
              SESIÓN ACTIVA
            </span>
          </div>
          <span className="hidden sm:inline text-black/20 dark:text-white/20 font-mono text-[10px]">•</span>
          <span className="hidden sm:inline text-[10px] font-mono tracking-[0.25em] uppercase opacity-40">
            PRODUCCIÓN HÍBRIDA
          </span>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="mailto:cineprood@gmail.com"
            className="text-[10px] font-mono tracking-[0.25em] uppercase opacity-50 hover:opacity-100 hover:text-red-600 transition-colors"
          >
            cineprood@gmail.com
          </a>
          <button
            type="button"
            onClick={handleReset}
            className="text-[10px] font-mono tracking-[0.25em] uppercase opacity-40 hover:opacity-100 hover:text-red-600 transition-colors"
          >
            REINICIAR
          </button>
        </div>
      </div>

      {/* Messages Stream: Expansive, Natural, No Boxed Card */}
      <div className="flex-1 overflow-y-auto overscroll-contain py-8 space-y-8 px-2 scroll-smooth">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} transition-all`}
            >
              <div className="flex items-center gap-2 mb-2 px-1">
                {!isUser ? (
                  <span className="text-[10px] font-mono font-bold tracking-[0.3em] uppercase text-red-600">
                    XENIA
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-medium tracking-[0.3em] uppercase opacity-40">
                    TÚ
                  </span>
                )}
                <span className="text-[9px] font-mono opacity-25">
                  [{m.timestamp}]
                </span>
              </div>

              {isUser ? (
                <div className="max-w-[90%] sm:max-w-xl md:max-w-2xl px-6 py-4 rounded-2xl bg-red-600 text-white text-sm sm:text-base leading-relaxed shadow-lg shadow-red-600/15 font-normal">
                  {m.content}
                </div>
              ) : (
                <div className="w-full max-w-3xl pl-5 border-l-2 border-red-600/70 py-1">
                  <div className="text-sm sm:text-base md:text-lg font-light leading-relaxed whitespace-pre-line text-black/90 dark:text-white/90">
                    {m.content}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex flex-col items-start pl-5 border-l-2 border-red-600/40 py-2">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
              <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-red-600 font-semibold">
                Xenia estructurando respuesta...
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-red-600 animate-bounce [animation-delay:0.15s]"></span>
              <span className="w-2 h-2 rounded-full bg-red-600 animate-bounce [animation-delay:0.3s]"></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Dock: Minimalist, Optical, Translucent */}
      <div className="pt-3 pb-2 shrink-0 px-2">
        {/* Cinematic Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className={`relative flex items-center gap-3 p-2 rounded-full transition-all duration-500 backdrop-blur-md bg-black/[0.03] dark:bg-white/[0.03] border ${
            isInputFocused 
              ? 'border-red-600/50 shadow-[0_0_25px_rgba(255,0,80,0.12),inset_0_1px_2px_rgba(255,255,255,0.15)]' 
              : 'border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20'
          }`}
        >
          {/* Subtle focus chromatic edge sheen */}
          {isInputFocused && (
            <div className="absolute -inset-[1px] rounded-full pointer-events-none opacity-40 prism-edge-refraction" />
          )}

          <div className="pl-4 pr-1 text-red-600">
            <span className="font-mono text-[10px] font-bold tracking-[0.25em] hidden sm:inline opacity-70">
              IDEA //
            </span>
          </div>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            placeholder="Pregunta a Xenia sobre tu proyecto, estética, rodaje o presupuesto..."
            disabled={isLoading}
            className="flex-1 bg-transparent py-2.5 px-2 text-sm sm:text-base focus:outline-none placeholder:text-black/30 dark:placeholder:text-white/30 disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 disabled:opacity-20 text-white font-black text-xs uppercase tracking-[0.3em] shadow-md shadow-red-600/20 transition-all flex items-center gap-1.5 shrink-0 active:scale-95 cursor-pointer"
          >
            <span>ENVIAR</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default XeniaChat;
