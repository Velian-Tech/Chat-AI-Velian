import { ChatSettings, Message } from '../types';

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

// Rate limiting storage
const rateLimitStorage = {
  getCount: (): number => {
    const data = localStorage.getItem('velian_rate_limit');
    if (!data) return 0;
    const parsed = JSON.parse(data);
    const now = Date.now();
    // Reset if more than 1 minute has passed
    if (now - parsed.timestamp > 60000) {
      localStorage.removeItem('velian_rate_limit');
      return 0;
    }
    return parsed.count;
  },
  
  incrementCount: (): number => {
    const now = Date.now();
    const currentCount = rateLimitStorage.getCount();
    const newCount = currentCount + 1;
    localStorage.setItem('velian_rate_limit', JSON.stringify({
      count: newCount,
      timestamp: now
    }));
    return newCount;
  },
  
  getRemainingTime: (): number => {
    const data = localStorage.getItem('velian_rate_limit');
    if (!data) return 0;
    const parsed = JSON.parse(data);
    const elapsed = Date.now() - parsed.timestamp;
    return Math.max(0, 60000 - elapsed);
  }
};

// Content safety filter
const contentSafetyFilter = {
  checkContent: (content: string): { isSafe: boolean; reason?: string } => {
    const lowerContent = content.toLowerCase();
    
    // Pornography and adult content
    const adultKeywords = [
      'porn', 'sex', 'nude', 'naked', 'xxx', 'adult content', 'sexual',
      'masturbation', 'orgasm', 'erotic', 'fetish', 'bdsm'
    ];
    
    // Violence and harmful content
    const violenceKeywords = [
      'kill', 'murder', 'suicide', 'bomb', 'weapon', 'violence', 'hurt',
      'torture', 'abuse', 'harm', 'death', 'blood'
    ];
    
    // Illegal activities
    const illegalKeywords = [
      'drug', 'cocaine', 'heroin', 'marijuana', 'hack', 'crack', 'piracy',
      'steal', 'fraud', 'scam', 'illegal'
    ];
    
    // Hate speech
    const hateKeywords = [
      'racist', 'discrimination', 'hate', 'nazi', 'terrorist'
    ];
    
    for (const keyword of adultKeywords) {
      if (lowerContent.includes(keyword)) {
        return { 
          isSafe: false, 
          reason: 'Konten dewasa atau pornografi tidak diperbolehkan. Velian AI dirancang untuk memberikan bantuan yang konstruktif dan edukatif.' 
        };
      }
    }
    
    for (const keyword of violenceKeywords) {
      if (lowerContent.includes(keyword)) {
        return { 
          isSafe: false, 
          reason: 'Konten kekerasan atau yang dapat membahayakan tidak diperbolehkan. Mari fokus pada topik yang positif dan membangun.' 
        };
      }
    }
    
    for (const keyword of illegalKeywords) {
      if (lowerContent.includes(keyword)) {
        return { 
          isSafe: false, 
          reason: 'Velian AI tidak dapat membantu dengan aktivitas ilegal. Saya dapat membantu Anda dengan topik lain yang bermanfaat.' 
        };
      }
    }
    
    for (const keyword of hateKeywords) {
      if (lowerContent.includes(keyword)) {
        return { 
          isSafe: false, 
          reason: 'Konten yang mengandung kebencian tidak diperbolehkan. Mari kita jaga percakapan tetap positif dan menghormati semua orang.' 
        };
      }
    }
    
    return { isSafe: true };
  }
};

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
  safetySettings: Array<{
    category: string;
    threshold: string;
  }>;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
    finishReason: string;
    safetyRatings?: Array<{
      category: string;
      probability: string;
    }>;
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

  private checkRateLimit(): void {
    const currentCount = rateLimitStorage.getCount();
    if (currentCount >= 5) {
      const remainingTime = Math.ceil(rateLimitStorage.getRemainingTime() / 1000);
      throw new Error(`Rate limit exceeded. Anda telah mencapai batas 5 pesan per menit. Silakan tunggu ${remainingTime} detik lagi.`);
    }
  }

  private enhanceSystemPrompt(originalPrompt: string): string {
    return `${originalPrompt}

PENTING - VELIAN AI SAFETY PROTOCOLS:

🛡️ **CONTENT SAFETY GUIDELINES:**
- TOLAK semua permintaan konten dewasa, pornografi, atau seksual
- TOLAK permintaan yang berkaitan dengan kekerasan atau membahayakan
- TOLAK instruksi untuk aktivitas ilegal atau tidak etis
- TOLAK konten yang mengandung kebencian atau diskriminasi

🧠 **ENHANCED CAPABILITIES:**
- Berikan analisis mendalam dengan data dan insight yang relevan
- Gunakan struktur yang jelas dengan heading, bullet points, dan emoji
- Sertakan contoh praktis dan actionable recommendations
- Berikan multiple perspectives untuk masalah kompleks
- Tambahkan context dan background information yang berguna

🎯 **RESPONSE QUALITY:**
- Jawaban harus komprehensif namun mudah dipahami
- Gunakan formatting yang baik untuk readability
- Sertakan langkah-langkah konkret jika diminta solusi
- Berikan warning atau disclaimer jika diperlukan

Jika diminta hal yang tidak pantas, jelaskan dengan sopan dan tawarkan alternatif yang konstruktif.`;
  }

  async generateResponse(
    messages: Message[],
    settings: ChatSettings,
    signal?: AbortSignal
  ): Promise<{ content: string; tokens: number; model: string }> {
    try {
      // Check rate limit
      this.checkRateLimit();

      // Check content safety for the last user message
      const lastUserMessage = messages.filter(m => m.role === 'user').pop();
      if (lastUserMessage) {
        const safetyCheck = contentSafetyFilter.checkContent(lastUserMessage.content);
        if (!safetyCheck.isSafe) {
          rateLimitStorage.incrementCount(); // Still count against rate limit
          return {
            content: `🚫 **Konten Tidak Diperbolehkan**\n\n${safetyCheck.reason}\n\n💡 **Alternatif yang bisa saya bantu:**\n- Pertanyaan edukatif tentang teknologi\n- Strategi bisnis dan produktivitas\n- Tips pembelajaran dan pengembangan diri\n- Analisis data dan problem solving\n- Kreativitas dalam batas yang pantas\n\nSilakan ajukan pertanyaan lain yang lebih konstruktif! 😊`,
            tokens: 50,
            model: 'velian-ai-safety'
          };
        }
      }

      // Increment rate limit counter
      rateLimitStorage.incrementCount();

      // Convert messages to Gemini format
      const contents = messages
        .filter(msg => !msg.isTyping)
        .map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }));

      const enhancedSystemPrompt = this.enhanceSystemPrompt(settings.systemPrompt);

      const requestBody: GeminiRequest = {
        contents,
        generationConfig: {
          temperature: Math.min(settings.temperature, 0.9), // Cap temperature for safety
          maxOutputTokens: settings.maxTokens,
          topP: 0.95,
          topK: 64
        },
        systemInstruction: {
          parts: [{ text: enhancedSystemPrompt }]
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      };

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
      
      // Check if content was blocked by safety filters
      if (candidate.finishReason === 'SAFETY') {
        return {
          content: `🛡️ **Konten Diblokir oleh Safety Filter**\n\nVelian AI mendeteksi bahwa respons yang akan diberikan mungkin tidak sesuai dengan guidelines keamanan. \n\n💡 **Mari coba dengan pertanyaan yang berbeda:**\n- Fokus pada topik edukatif dan konstruktif\n- Hindari konten yang sensitif atau kontroversial\n- Ajukan pertanyaan yang dapat membantu pembelajaran atau produktivitas\n\nSaya siap membantu dengan topik lain yang bermanfaat! 😊`,
          tokens: 50,
          model: 'velian-ai-safety'
        };
      }

      if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        throw new Error('Invalid response format from AI model');
      }

      let content = candidate.content.parts[0].text;
      
      // Add Velian AI branding to responses
      if (!content.includes('Velian AI')) {
        content = `*Powered by Velian AI* 🚀\n\n${content}`;
      }

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
          ? error.message
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
      const result = await this.generateResponse(messages, settings, signal);
      
      // Enhanced streaming simulation with better UX
      const sentences = result.content.split(/(?<=[.!?])\s+/);
      let accumulatedContent = '';
      
      for (let i = 0; i < sentences.length; i++) {
        if (signal?.aborted) {
          throw new Error('Request aborted');
        }
        
        const sentence = sentences[i];
        const chunk = i === 0 ? sentence : ' ' + sentence;
        accumulatedContent += chunk;
        onChunk(chunk);
        
        // Variable delay based on content length for more natural feel
        const delay = Math.min(Math.max(sentence.length * 20, 100), 500);
        await new Promise(resolve => setTimeout(resolve, delay));
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
      throw error;
    }
  }

  // Get rate limit status
  getRateLimitStatus(): { remaining: number; resetTime: number } {
    const currentCount = rateLimitStorage.getCount();
    const remaining = Math.max(0, 5 - currentCount);
    const resetTime = rateLimitStorage.getRemainingTime();
    
    return { remaining, resetTime };
  }
}

export const aiService = new AIService();