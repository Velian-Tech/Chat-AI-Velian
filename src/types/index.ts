export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isTyping?: boolean;
  tokens?: number;
  model?: string;
  attachments?: Attachment[];
  reactions?: Reaction[];
  isBookmarked?: boolean;
  isEdited?: boolean;
  originalContent?: string;
}

export interface Attachment {
  id: string;
  type: 'image' | 'file' | 'code';
  name: string;
  url?: string;
  content?: string;
  language?: string;
}

export interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  isArchived?: boolean;
  tags?: string[];
  model: string;
  settings: ChatSettings;
}

export interface ChatSettings {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  autoSave: boolean;
  darkMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
  language: string;
  voiceEnabled: boolean;
  autoTranslate: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: UserPreferences;
  subscription: 'free' | 'pro' | 'enterprise';
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: boolean;
  soundEffects: boolean;
  autoSave: boolean;
  defaultModel: string;
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  provider: string;
  maxTokens: number;
  costPer1kTokens: number;
  capabilities: string[];
  isAvailable: boolean;
}

export interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  prompt: string;
  variables: TemplateVariable[];
  isPublic: boolean;
  createdBy: string;
  usageCount: number;
}

export interface TemplateVariable {
  name: string;
  type: 'text' | 'number' | 'select' | 'textarea';
  label: string;
  placeholder?: string;
  options?: string[];
  required: boolean;
}

export interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  isEnabled: boolean;
  settings: Record<string, any>;
}

export interface Analytics {
  totalMessages: number;
  totalTokens: number;
  totalCost: number;
  averageResponseTime: number;
  mostUsedModel: string;
  dailyUsage: DailyUsage[];
  topPrompts: string[];
}

export interface DailyUsage {
  date: string;
  messages: number;
  tokens: number;
  cost: number;
}