import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Edit, Trash2, Bookmark, MoreHorizontal, ThumbsUp, ThumbsDown, Heart, Smile, Sparkles, Shield } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Message } from '../types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface MessageBubbleProps {
  message: Message;
  onDelete: (id: string) => void;
  onEdit: (id: string, content: string) => void;
  onBookmark: (id: string) => void;
  onAddReaction: (id: string, emoji: string) => void;
}

export default function MessageBubble({
  message,
  onDelete,
  onEdit,
  onBookmark,
  onAddReaction
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showReactions, setShowReactions] = useState(false);

  const isUser = message.role === 'user';
  const isVelianAI = message.role === 'assistant';
  const reactions = ['👍', '👎', '❤️', '😊', '🤔', '🎉', '🔥', '💡'];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleEdit = () => {
    if (isEditing) {
      onEdit(message.id, editContent);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleReaction = (emoji: string) => {
    onAddReaction(message.id, emoji);
    setShowReactions(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`max-w-[85%] ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Avatar */}
        {!isUser && (
          <div className="flex items-end space-x-2 mb-2">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border border-white"></div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Velian AI
              </span>
              <Shield className="w-3 h-3 text-green-500" title="AI Aman & Terpercaya" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {format(message.timestamp, 'HH:mm', { locale: id })}
              </span>
            </div>
          </div>
        )}

        {/* Message Content */}
        <div
          className={`relative rounded-2xl px-4 py-3 shadow-lg ${
            isUser
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white ml-8'
              : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 mr-8'
          } ${message.isTyping ? 'animate-pulse' : ''}`}
        >
          {/* Bookmark indicator */}
          {message.isBookmarked && (
            <div className="absolute -top-2 -right-2">
              <Bookmark className="w-4 h-4 text-yellow-500 fill-current drop-shadow-sm" />
            </div>
          )}

          {/* Edit indicator */}
          {message.isEdited && (
            <div className="text-xs opacity-70 mb-1 flex items-center space-x-1">
              <span>(diedit)</span>
            </div>
          )}

          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors"
                >
                  Simpan
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(message.content);
                  }}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <div className={`prose prose-sm max-w-none ${isUser ? 'prose-invert' : 'dark:prose-invert'}`}>
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-lg !mt-2 !mb-2"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code 
                        className={`${className} ${
                          isUser 
                            ? 'bg-white/20 text-white px-1 py-0.5 rounded' 
                            : 'bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
                        }`} 
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  h1: ({ children }) => (
                    <h1 className="text-xl font-bold mb-3 mt-4 first:mt-0">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-lg font-bold mb-2 mt-3 first:mt-0">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-base font-bold mb-2 mt-3 first:mt-0">{children}</h3>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className={`border-l-4 pl-4 my-2 italic ${
                      isUser 
                        ? 'border-white/30' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          {/* Message metadata */}
          {!isUser && !isEditing && (
            <div className="flex items-center justify-between mt-3 text-xs opacity-70">
              <div className="flex items-center space-x-2">
                {message.model && (
                  <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                    {message.model.replace('velian-ai-', 'Velian ')}
                  </span>
                )}
                {message.tokens && (
                  <span className="bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full">
                    {message.tokens} tokens
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {message.reactions.map((reaction, index) => (
                <button
                  key={index}
                  onClick={() => handleReaction(reaction.emoji)}
                  className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-full px-2 py-1 text-xs transition-colors"
                >
                  <span>{reaction.emoji}</span>
                  <span>{reaction.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User timestamp */}
        {isUser && (
          <div className="text-right mt-1 mr-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {format(message.timestamp, 'HH:mm', { locale: id })}
            </span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: showActions ? 1 : 0, scale: showActions ? 1 : 0.8 }}
        className={`flex items-center space-x-1 ${
          isUser ? 'order-1 mr-2' : 'order-2 ml-2'
        }`}
      >
        <div className="flex flex-col space-y-1 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 p-1">
          <button
            onClick={handleCopy}
            className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
            title="Salin"
          >
            <Copy className="w-3 h-3" />
          </button>
          
          {isUser && (
            <button
              onClick={handleEdit}
              className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
              title="Edit"
            >
              <Edit className="w-3 h-3" />
            </button>
          )}
          
          <button
            onClick={() => onBookmark(message.id)}
            className={`p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors ${
              message.isBookmarked
                ? 'text-yellow-500'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
            title="Bookmark"
          >
            <Bookmark className="w-3 h-3" />
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowReactions(!showReactions)}
              className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
              title="Reaksi"
            >
              <Smile className="w-3 h-3" />
            </button>
            
            {showReactions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute bottom-full mb-1 left-0 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 p-2 flex flex-wrap gap-1 z-10 min-w-max"
              >
                {reactions.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-lg transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
          
          <button
            onClick={() => onDelete(message.id)}
            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            title="Hapus"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}