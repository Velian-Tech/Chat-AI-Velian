import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Menu, X, Settings as SettingsIcon, BookOpen, Sparkles } from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useChat } from './hooks/useChat';
import ChatInterface from './components/ChatInterface';
import Sidebar from './components/Sidebar';
import SettingsPanel from './components/SettingsPanel';
import TemplateLibrary from './components/TemplateLibrary';
import { ChatSession, Template } from './types';
import { defaultSettings, availableModels, sampleTemplates, sampleSessions } from './data/mockData';
import { v4 as uuidv4 } from 'uuid';

// Helper function to convert date strings back to Date objects
const parseChatSessionDates = (sessions: any[]): ChatSession[] => {
  return sessions.map(session => ({
    ...session,
    createdAt: new Date(session.createdAt),
    updatedAt: new Date(session.updatedAt),
    messages: session.messages?.map((message: any) => ({
      ...message,
      timestamp: new Date(message.timestamp)
    })) || []
  }));
};

function App() {
  const [sessions, setSessions] = useLocalStorage<ChatSession[]>(
    'velian-chat-sessions', 
    sampleSessions,
    parseChatSessionDates
  );
  const [currentSessionId, setCurrentSessionId] = useLocalStorage<string | null>('velian-current-session', null);
  const [settings, setSettings] = useLocalStorage('velian-chat-settings', defaultSettings);
  const [templates] = useLocalStorage<Template[]>('velian-chat-templates', sampleTemplates);
  
  const [showSidebar, setShowSidebar] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const currentSession = sessions.find(s => s.id === currentSessionId) || null;
  
  const {
    messages,
    isLoading,
    sendMessage,
    stopGeneration,
    clearChat,
    deleteMessage,
    editMessage,
    bookmarkMessage,
    addReaction,
    setSettings: updateChatSettings
  } = useChat(settings);

  // Update chat settings when global settings change
  useEffect(() => {
    updateChatSettings(settings);
  }, [settings, updateChatSettings]);

  // Apply dark mode
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: uuidv4(),
      title: 'Chat Baru dengan Velian AI',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      model: settings.model,
      settings: { ...settings }
    };
    
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    clearChat();
  };

  const selectSession = (session: ChatSession) => {
    setCurrentSessionId(session.id);
    // Load session messages into chat
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
      clearChat();
    }
  };

  const archiveSession = (sessionId: string) => {
    setSessions(prev => prev.map(s => 
      s.id === sessionId 
        ? { ...s, isArchived: !s.isArchived }
        : s
    ));
  };

  const exportSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      const data = {
        session,
        exportDate: new Date().toISOString(),
        version: '2.0',
        platform: 'Velian AI'
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `velian-chat-${session.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleSendMessage = async (content: string, attachments?: any[]) => {
    // Update current session title if it's a new session
    if (currentSession && currentSession.messages.length === 0) {
      const title = content.length > 50 ? content.substring(0, 50) + '...' : content;
      setSessions(prev => prev.map(s => 
        s.id === currentSessionId 
          ? { ...s, title, updatedAt: new Date() }
          : s
      ));
    }
    
    await sendMessage(content, attachments);
    
    // Update session with new messages
    if (currentSessionId) {
      setSessions(prev => prev.map(s => 
        s.id === currentSessionId 
          ? { ...s, messages: [...messages, /* new messages */], updatedAt: new Date() }
          : s
      ));
    }
  };

  const handleTemplateSelect = (template: Template) => {
    // Process template variables and create prompt
    let prompt = template.prompt;
    
    // For demo, we'll just use the template as is
    // In a real app, you'd show a form to fill variables
    if (template.variables.length > 0) {
      // Show variable input form (simplified for demo)
      const values: Record<string, string> = {};
      template.variables.forEach(variable => {
        const value = window.prompt(`Enter ${variable.label}:`) || '';
        values[variable.name] = value;
        prompt = prompt.replace(new RegExp(`{{${variable.name}}}`, 'g'), value);
      });
    }
    
    handleSendMessage(prompt);
  };

  // Create initial session if none exists
  useEffect(() => {
    if (sessions.length === 0) {
      createNewSession();
    } else if (!currentSessionId && sessions.length > 0) {
      setCurrentSessionId(sessions[0].id);
    }
  }, [sessions.length, currentSessionId]);

  return (
    <div className="h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <Sidebar
            sessions={sessions}
            currentSession={currentSession}
            onSessionSelect={selectSession}
            onNewSession={createNewSession}
            onDeleteSession={deleteSession}
            onArchiveSession={archiveSession}
            onExportSession={exportSession}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {showSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Velian AI Platform
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Powered by {settings.model.replace('velian-ai-', 'Velian AI ')} • Cerdas & Aman
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowTemplates(true)}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Template Library"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Templates</span>
            </button>
            
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Settings"
            >
              <SettingsIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1">
          <ChatInterface
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            onStopGeneration={stopGeneration}
            onClearChat={clearChat}
            onDeleteMessage={deleteMessage}
            onEditMessage={editMessage}
            onBookmarkMessage={bookmarkMessage}
            onAddReaction={addReaction}
          />
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showSettings && (
          <SettingsPanel
            settings={settings}
            onSettingsChange={setSettings}
            onClose={() => setShowSettings(false)}
            availableModels={availableModels}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTemplates && (
          <TemplateLibrary
            templates={templates}
            onTemplateSelect={handleTemplateSelect}
            onClose={() => setShowTemplates(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;