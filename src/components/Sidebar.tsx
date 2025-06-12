import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Plus,
  Search,
  Settings,
  Archive,
  Bookmark,
  Download,
  Upload,
  Trash2,
  Star,
  Filter,
  Calendar,
  Tag,
  MoreHorizontal
} from 'lucide-react';
import { ChatSession } from '../types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface SidebarProps {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  onSessionSelect: (session: ChatSession) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  onArchiveSession: (sessionId: string) => void;
  onExportSession: (sessionId: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({
  sessions,
  currentSession,
  onSessionSelect,
  onNewSession,
  onDeleteSession,
  onArchiveSession,
  onExportSession,
  isCollapsed
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'bookmarked' | 'archived'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');

  const filteredSessions = sessions
    .filter(session => {
      const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.messages.some(msg => msg.content.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesFilter = filterBy === 'all' || 
        (filterBy === 'archived' && session.isArchived) ||
        (filterBy === 'bookmarked' && session.messages.some(msg => msg.isBookmarked));
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      return a.title.localeCompare(b.title);
    });

  const SessionItem = ({ session }: { session: ChatSession }) => {
    const [showActions, setShowActions] = useState(false);
    const isActive = currentSession?.id === session.id;
    const hasBookmarks = session.messages.some(msg => msg.isBookmarked);
    const messageCount = session.messages.length;
    const lastMessage = session.messages[session.messages.length - 1];

    return (
      <motion.div
        layout
        className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 ${
          isActive
            ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
        }`}
        onClick={() => onSessionSelect(session)}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {session.title}
              </h3>
              {hasBookmarks && (
                <Star className="w-3 h-3 text-yellow-500 flex-shrink-0" />
              )}
              {session.isArchived && (
                <Archive className="w-3 h-3 text-gray-400 flex-shrink-0" />
              )}
            </div>
            
            {lastMessage && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-1">
                {lastMessage.content.substring(0, 50)}...
              </p>
            )}
            
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{format(session.updatedAt, 'dd MMM', { locale: id })}</span>
              <span>{messageCount} pesan</span>
            </div>
            
            {session.tags && session.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {session.tags.slice(0, 2).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                {session.tags.length > 2 && (
                  <span className="text-xs text-gray-400">
                    +{session.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>

          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col space-y-1 ml-2"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onExportSession(session.id);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  title="Export"
                >
                  <Download className="w-3 h-3" />
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchiveSession(session.id);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  title={session.isArchived ? 'Unarchive' : 'Archive'}
                >
                  <Archive className="w-3 h-3" />
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  title="Hapus"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };

  if (isCollapsed) {
    return (
      <div className="w-16 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center py-4 space-y-4">
        <button
          onClick={onNewSession}
          className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          title="Chat Baru"
        >
          <Plus className="w-5 h-5" />
        </button>
        
        <div className="flex flex-col space-y-2">
          {sessions.slice(0, 5).map((session) => (
            <button
              key={session.id}
              onClick={() => onSessionSelect(session)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                currentSession?.id === session.id
                  ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
              title={session.title}
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Chat Sessions
          </h2>
          <button
            onClick={onNewSession}
            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            title="Chat Baru"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari chat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex space-x-2">
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as any)}
            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua</option>
            <option value="bookmarked">Bookmark</option>
            <option value="archived">Arsip</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Tanggal</option>
            <option value="title">Judul</option>
          </select>
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <AnimatePresence>
          {filteredSessions.map((session) => (
            <SessionItem key={session.id} session={session} />
          ))}
        </AnimatePresence>
        
        {filteredSessions.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">
              {searchQuery ? 'Tidak ada chat yang ditemukan' : 'Belum ada chat'}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>{sessions.length} chat total</span>
          <button className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-300">
            <Settings className="w-4 h-4" />
            <span>Pengaturan</span>
          </button>
        </div>
      </div>
    </div>
  );
}