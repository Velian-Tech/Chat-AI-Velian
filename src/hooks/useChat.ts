import { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, ChatSession, ChatSettings } from '../types';
import { aiService } from '../services/aiService';

export function useChat(initialSettings: ChatSettings) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [settings, setSettings] = useState<ChatSettings>(initialSettings);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (content: string, attachments?: any[]) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: uuidv4(),
      content,
      role: 'user',
      timestamp: new Date(),
      attachments
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Create assistant message for streaming
    const assistantMessageId = uuidv4();
    const assistantMessage: Message = {
      id: assistantMessageId,
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      isTyping: true
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      abortControllerRef.current = new AbortController();
      
      // Use streaming response
      let fullContent = '';
      const result = await aiService.generateStreamResponse(
        [...messages, userMessage],
        settings,
        (chunk: string) => {
          fullContent += chunk;
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content: fullContent, isTyping: true }
              : msg
          ));
        },
        abortControllerRef.current.signal
      );

      // Finalize the message
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { 
              ...msg, 
              content: fullContent,
              isTyping: false,
              tokens: result.tokens,
              model: result.model
            }
          : msg
      ));

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request was aborted');
        setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId));
      } else {
        console.error('Error sending message:', error);
        const errorMessage: Message = {
          id: assistantMessageId,
          content: `Maaf, terjadi kesalahan: ${error instanceof Error ? error.message : 'Unknown error'}. Silakan coba lagi.`,
          role: 'assistant',
          timestamp: new Date(),
          isTyping: false
        };
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId ? errorMessage : msg
        ));
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [messages, settings, isLoading]);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      setMessages(prev => prev.map(msg => 
        msg.isTyping ? { ...msg, isTyping: false } : msg
      ));
    }
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  const deleteMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  }, []);

  const editMessage = useCallback((messageId: string, newContent: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, content: newContent, isEdited: true, originalContent: msg.content }
        : msg
    ));
  }, []);

  const bookmarkMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, isBookmarked: !msg.isBookmarked }
        : msg
    ));
  }, []);

  const addReaction = useCallback((messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = msg.reactions || [];
        const existingReaction = reactions.find(r => r.emoji === emoji);
        
        if (existingReaction) {
          existingReaction.count += 1;
          existingReaction.users.push('current-user');
        } else {
          reactions.push({
            emoji,
            count: 1,
            users: ['current-user']
          });
        }
        
        return { ...msg, reactions };
      }
      return msg;
    }));
  }, []);

  return {
    messages,
    isLoading,
    currentSession,
    settings,
    sendMessage,
    stopGeneration,
    clearChat,
    deleteMessage,
    editMessage,
    bookmarkMessage,
    addReaction,
    setSettings,
    setCurrentSession
  };
}