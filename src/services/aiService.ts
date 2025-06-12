import { ChatSettings, Message } from '../types';

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

interface GeminiRequest {
  contents: Array<{
    role: string;
    parts: Array<{ text: string }>;
  }>;
  generationConfig: {
    temperature: number;
    maxOutputTokens: number;
    topP: number;
    topK: number;
  };
  systemInstruction?: {
    parts: Array<{ text: string }>;
  };
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
    finishReason: string;
  }>;
  usageMetadata: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export class AIService {
  private apiKey: string;

  constructor() {
    this.apiKey = GOOGLE_API_KEY;
    if (!this.apiKey) {
      throw new Error('Google API key not found. Please check your environment variables.');
    }
  }

  async generateResponse(
    messages: Message[],
    settings: ChatSettings,
    signal?: AbortSignal
  ): Promise<{ content: string; tokens: number; model: string }> {
    try {
      // Convert messages to Gemini format
      const contents = messages
        .filter(msg => !msg.isTyping)
        .map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }));

      const requestBody: GeminiRequest = {
        contents,
        generationConfig: {
          temperature: settings.temperature,
          maxOutputTokens: settings.maxTokens,
          topP: 0.95,
          topK: 64
        }
      };

      // Add system instruction if provided
      if (settings.systemPrompt) {
        requestBody.systemInstruction = {
          parts: [{ text: settings.systemPrompt }]
        };
      }

      const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API request failed: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
      }

      const data: GeminiResponse = await response.json();

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response generated from AI model');
      }

      const candidate = data.candidates[0];
      if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        throw new Error('Invalid response format from AI model');
      }

      const content = candidate.content.parts[0].text;
      const tokens = data.usageMetadata?.totalTokenCount || 0;

      return {
        content,
        tokens,
        model: settings.model
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }
      
      console.error('AI Service Error:', error);
      throw new Error(
        error instanceof Error 
          ? `Failed to generate response: ${error.message}`
          : 'Failed to generate response: Unknown error'
      );
    }
  }

  async generateStreamResponse(
    messages: Message[],
    settings: ChatSettings,
    onChunk: (chunk: string) => void,
    signal?: AbortSignal
  ): Promise<{ tokens: number; model: string }> {
    try {
      // For now, we'll use the regular API and simulate streaming
      // Gemini's streaming API has a different endpoint and format
      const result = await this.generateResponse(messages, settings, signal);
      
      // Simulate streaming by sending chunks
      const words = result.content.split(' ');
      for (let i = 0; i < words.length; i++) {
        if (signal?.aborted) {
          throw new Error('Request aborted');
        }
        
        const chunk = i === 0 ? words[i] : ' ' + words[i];
        onChunk(chunk);
        
        // Add small delay to simulate streaming
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      return {
        tokens: result.tokens,
        model: result.model
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }
      
      console.error('AI Streaming Service Error:', error);
      throw new Error(
        error instanceof Error 
          ? `Failed to generate streaming response: ${error.message}`
          : 'Failed to generate streaming response: Unknown error'
      );
    }
  }
}

export const aiService = new AIService();