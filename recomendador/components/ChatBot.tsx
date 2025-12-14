import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendChatMessage } from '../services/gemini';

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: '¡Hola! Soy CineBot. Pregúntame sobre cualquier película, actor o recomendación.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const responseText = await sendChatMessage(input);
    
    setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    setLoading(false);
  };

  return (
    <>
      {/* Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 p-4 bg-gradient-to-br from-[#45a29e] to-[#66fcf1] text-[#0b0c10] rounded-full shadow-[0_0_20px_rgba(102,252,241,0.4)] hover:scale-110 transition-all z-50 flex items-center gap-2 group"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-8 right-8 w-[350px] sm:w-[400px] h-[550px] bg-[#141420]/90 backdrop-blur-[20px] border border-white/10 rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 flex flex-col overflow-hidden animate-[fadeUp_0.4s_ease_forwards]">
          {/* Header */}
          <div className="p-5 bg-[#0f0f19] border-b border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#66fcf1]/20 flex items-center justify-center text-[#66fcf1]">
                 <Bot className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-lg">CineBot AI</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-[#b1b1b1] hover:text-[#66fcf1] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-transparent scrollbar-thin">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${
                  msg.role === 'user' ? 'bg-[#45a29e] text-[#0b0c10]' : 'bg-[#141420] border border-white/10 text-[#66fcf1]'
                }`}>
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className={`p-3.5 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-[#66fcf1]/10 text-[#66fcf1] border border-[#66fcf1]/20 rounded-tr-sm' 
                    : 'bg-[#1f1f2e] text-[#e0e0e0] border border-white/5 rounded-tl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                 <div className="w-8 h-8 rounded-full bg-[#141420] border border-white/10 flex items-center justify-center flex-shrink-0 text-[#66fcf1]">
                  <Bot size={14} />
                </div>
                <div className="bg-[#1f1f2e] p-4 rounded-2xl rounded-tl-sm border border-white/5">
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 bg-[#66fcf1] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-[#66fcf1] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-[#66fcf1] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-[#0f0f19] border-t border-white/5 flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Escribe tu consulta..."
              className="flex-1 bg-[#141420] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#66fcf1] placeholder-[#555]"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="p-3 bg-gradient-to-br from-[#45a29e] to-[#66fcf1] text-[#0b0c10] rounded-xl hover:shadow-[0_0_10px_#66fcf1] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};