import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Edit, Trash2, Bookmark, MoreHorizontal, ThumbsUp, ThumbsDown, Heart, Smile } from 'lucide-react';
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
  const reactions = ['👍', '👎', '❤️', '😊', '🤔', '🎉'];

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
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Avatar */}
        {!isUser && (
          <div className="flex items-end space-x-2 mb-1">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {format(message.timestamp, 'HH:mm', { locale: id })}
            </span>
          </div>
        )}

        {/* Message Content */}
        <div
          className={`relative rounded-2xl px-4 py-3 shadow-sm ${
            isUser
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
              : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
          }`}
        >
          {/* Bookmark indicator */}
          {message.isBookmarked && (
            <div className="absolute -top-2 -right-2">
              <Bookmark className="w-4 h-4 text-yellow-500 fill-current" />
            </div>
          )}

          {/* Edit indicator */}
          {message.isEdited && (
            <div className="text-xs opacity-70 mb-1">
              (diedit)
            </div>
          )}

          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm resize-none"
                rows={3}
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleEdit}
                  className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs hover:bg-green-600"
                >
                  Simpan
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(message.content);
                  }}
                  className="px-3 py-1 bg-gray-500 text-white rounded-lg text-xs hover:bg-gray-600"
                >
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-lg"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          {/* Message metadata */}
          {!isUser && (
            <div className="flex items-center justify-between mt-2 text-xs opacity-70">
              <div className="flex items-center space-x-2">
                {message.model && (
                  <span className="bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                    {message.model}
                  </span>
                )}
                {message.tokens && (
                  <span className="bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                    {message.tokens} tokens
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {message.reactions.map((reaction, index) => (
                <button
                  key={index}
                  onClick={() => handleReaction(reaction.emoji)}
                  className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-600 rounded-full px-2 py-1 text-xs hover:bg-gray-200 dark:hover:bg-gray-500"
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
          <div className="text-right mt-1">
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
                className="absolute bottom-full mb-1 left-0 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 p-2 flex space-x-1 z-10"
              >
                {reactions.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-lg"
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