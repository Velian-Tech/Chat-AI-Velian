import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Mic, Square, Settings, MoreVertical, Sparkles, Shield, Clock, Zap } from 'lucide-react';
import { Message } from '../types';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import VoiceRecorder from './VoiceRecorder';
import AttachmentUpload from './AttachmentUpload';
import { aiService } from '../services/aiService';

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (content: string, attachments?: any[]) => void;
  onStopGeneration: () => void;
  onClearChat: () => void;
  onDeleteMessage: (id: string) => void;
  onEditMessage: (id: string, content: string) => void;
  onBookmarkMessage: (id: string) => void;
  onAddReaction: (id: string, emoji: string) => void;
}

export default function ChatInterface({
  messages,
  isLoading,
  onSendMessage,
  onStopGeneration,
  onClearChat,
  onDeleteMessage,
  onEditMessage,
  onBookmarkMessage,
  onAddReaction
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [rateLimitStatus, setRateLimitStatus] = useState({ remaining: 5, resetTime: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update rate limit status
  useEffect(() => {
    const updateRateLimit = () => {
      const status = aiService.getRateLimitStatus();
      setRateLimitStatus(status);
    };

    updateRateLimit();
    const interval = setInterval(updateRateLimit, 1000);
    return () => clearInterval(interval);
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((input.trim() || attachments.length > 0) && rateLimitStatus.remaining > 0) {
      onSendMessage(input.trim(), attachments);
      setInput('');
      setAttachments([]);
      setShowAttachments(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  const suggestedPrompts = [
    "Analisis tren teknologi AI terbaru dan dampaknya pada industri",
    "Buatkan strategi marketing digital untuk startup teknologi",
    "Jelaskan konsep machine learning dengan contoh praktis",
    "Rancang sistem pembelajaran online yang efektif"
  ];

  const formatResetTime = (milliseconds: number) => {
    const seconds = Math.ceil(milliseconds / 1000);
    return `${seconds}s`;
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Velian AI
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-2">
              {isLoading ? (
                <span className="flex items-center space-x-1">
                  <motion.div
                    className="w-2 h-2 bg-blue-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <span>Sedang berpikir...</span>
                </span>
              ) : (
                <>
                  <Shield className="w-3 h-3 text-green-500" />
                  <span>Online • AI Cerdas & Aman</span>
                </>
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Rate Limit Indicator */}
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {rateLimitStatus.remaining}/5
            </span>
            {rateLimitStatus.remaining === 0 && (
              <span className="text-xs text-red-500">
                Reset: {formatResetTime(rateLimitStatus.resetTime)}
              </span>
            )}
          </div>
          
          <button
            onClick={onClearChat}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Hapus Chat"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-24 h-24 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl"
            >
              <Sparkles className="w-12 h-12 text-white" />
            </motion.div>
            
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3"
            >
              Selamat datang di Velian AI
            </motion.h2>
            
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-600 dark:text-gray-400 mb-2 max-w-md"
            >
              AI Assistant yang cerdas, aman, dan membantu untuk semua kebutuhan Anda
            </motion.p>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center space-x-4 mb-8 text-sm text-gray-500 dark:text-gray-400"
            >
              <div className="flex items-center space-x-1">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span>Super Cerdas</span>
              </div>
              <div className="flex items-center space-x-1">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Aman & Etis</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>5 pesan/menit</span>
              </div>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-3xl">
              {suggestedPrompts.map((prompt, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  onClick={() => setInput(prompt)}
                  className="p-4 text-left bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-200 group"
                >
                  <p className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {prompt}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onDelete={onDeleteMessage}
              onEdit={onEditMessage}
              onBookmark={onBookmarkMessage}
              onAddReaction={onAddReaction}
            />
          ))}
        </AnimatePresence>
        
        {isLoading && messages.some(m => m.isTyping) && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Rate Limit Warning */}
      {rateLimitStatus.remaining <= 1 && rateLimitStatus.remaining > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
        >
          <div className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-200">
            <Clock className="w-4 h-4" />
            <span className="text-sm">
              Peringatan: Anda memiliki {rateLimitStatus.remaining} pesan tersisa dalam menit ini
            </span>
          </div>
        </motion.div>
      )}

      {/* Attachment Preview */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-4 py-2 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700"
          >
            <div className="flex flex-wrap gap-2">
              {attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 bg-white dark:bg-gray-700 rounded-lg p-2 border border-gray-200 dark:border-gray-600 shadow-sm"
                >
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {attachment.name}
                  </span>
                  <button
                    onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                    className="text-red-500 hover:text-red-700 text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="p-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                rateLimitStatus.remaining === 0 
                  ? `Rate limit tercapai. Reset dalam ${formatResetTime(rateLimitStatus.resetTime)}`
                  : "Tanyakan apa saja kepada Velian AI..."
              }
              disabled={rateLimitStatus.remaining === 0}
              className="w-full resize-none rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-sm px-4 py-3 pr-12 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            
            <div className="absolute right-2 bottom-2 flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setShowAttachments(!showAttachments)}
                disabled={rateLimitStatus.remaining === 0}
                className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              
              <VoiceRecorder
                isRecording={isRecording}
                onStartRecording={() => setIsRecording(true)}
                onStopRecording={(transcript) => {
                  setIsRecording(false);
                  if (transcript) {
                    setInput(prev => prev + (prev ? ' ' : '') + transcript);
                  }
                }}
              />
            </div>
          </div>

          {isLoading ? (
            <button
              type="button"
              onClick={onStopGeneration}
              className="flex items-center justify-center w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors duration-200 shadow-lg"
            >
              <Square className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={(!input.trim() && attachments.length === 0) || rateLimitStatus.remaining === 0}
              className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl transition-all duration-200 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 shadow-lg disabled:transform-none"
            >
              <Send className="w-5 h-5" />
            </button>
          )}
        </form>

        {/* Attachment Upload */}
        <AnimatePresence>
          {showAttachments && (
            <AttachmentUpload
              onAttachmentAdd={(attachment) => {
                setAttachments(prev => [...prev, attachment]);
                setShowAttachments(false);
              }}
              onClose={() => setShowAttachments(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}