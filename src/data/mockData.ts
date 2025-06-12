import { v4 as uuidv4 } from 'uuid';
import { ChatSession, Template, AIModel, ChatSettings } from '../types';

export const defaultSettings: ChatSettings = {
  model: 'gemini-2.0-flash',
  temperature: 0.7,
  maxTokens: 2048,
  systemPrompt: 'Anda adalah asisten AI yang membantu dan informatif. Jawab pertanyaan dengan jelas dan akurat.',
  autoSave: true,
  darkMode: false,
  fontSize: 'medium',
  language: 'id',
  voiceEnabled: true,
  autoTranslate: false
};

export const availableModels: AIModel[] = [
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    description: 'Model terbaru Google dengan kemampuan multimodal',
    provider: 'Google',
    maxTokens: 8192,
    costPer1kTokens: 0.002,
    capabilities: ['text', 'image', 'code', 'reasoning'],
    isAvailable: true
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    description: 'Model OpenAI dengan kemampuan reasoning tinggi',
    provider: 'OpenAI',
    maxTokens: 4096,
    costPer1kTokens: 0.01,
    capabilities: ['text', 'code', 'reasoning', 'analysis'],
    isAvailable: true
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    description: 'Model Anthropic yang aman dan helpful',
    provider: 'Anthropic',
    maxTokens: 4096,
    costPer1kTokens: 0.003,
    capabilities: ['text', 'code', 'analysis', 'creative'],
    isAvailable: true
  }
];

export const sampleTemplates: Template[] = [
  {
    id: uuidv4(),
    title: 'Email Profesional',
    description: 'Template untuk menulis email bisnis yang profesional',
    category: 'business',
    prompt: `Tulis email profesional dengan detail berikut:

Kepada: {{recipient}}
Subjek: {{subject}}
Tujuan: {{purpose}}
Tone: {{tone}}

Pastikan email terstruktur dengan baik, sopan, dan jelas.`,
    variables: [
      { name: 'recipient', type: 'text', label: 'Penerima', placeholder: 'Nama penerima', required: true },
      { name: 'subject', type: 'text', label: 'Subjek', placeholder: 'Subjek email', required: true },
      { name: 'purpose', type: 'textarea', label: 'Tujuan', placeholder: 'Jelaskan tujuan email', required: true },
      { name: 'tone', type: 'select', label: 'Tone', options: ['Formal', 'Semi-formal', 'Friendly'], required: true }
    ],
    isPublic: true,
    createdBy: 'system',
    usageCount: 245
  },
  {
    id: uuidv4(),
    title: 'Code Review',
    description: 'Template untuk melakukan review kode secara sistematis',
    category: 'coding',
    prompt: `Lakukan code review untuk kode berikut:

\`\`\`{{language}}
{{code}}
\`\`\`

Fokus pada:
- Kualitas kode dan best practices
- Performa dan optimisasi
- Keamanan
- Maintainability
- Bug potensial

Berikan feedback konstruktif dengan saran perbaikan.`,
    variables: [
      { name: 'language', type: 'select', label: 'Bahasa Pemrograman', options: ['JavaScript', 'Python', 'Java', 'TypeScript', 'Go', 'Rust'], required: true },
      { name: 'code', type: 'textarea', label: 'Kode', placeholder: 'Paste kode yang ingin direview', required: true }
    ],
    isPublic: true,
    createdBy: 'system',
    usageCount: 189
  },
  {
    id: uuidv4(),
    title: 'Analisis SWOT',
    description: 'Template untuk melakukan analisis SWOT bisnis',
    category: 'analysis',
    prompt: `Lakukan analisis SWOT untuk:

Perusahaan/Produk: {{subject}}
Industri: {{industry}}
Target Market: {{target_market}}

Analisis:
1. **Strengths (Kekuatan)**
2. **Weaknesses (Kelemahan)**  
3. **Opportunities (Peluang)**
4. **Threats (Ancaman)**

Berikan insight mendalam dan actionable recommendations.`,
    variables: [
      { name: 'subject', type: 'text', label: 'Subjek Analisis', placeholder: 'Nama perusahaan/produk', required: true },
      { name: 'industry', type: 'text', label: 'Industri', placeholder: 'Sektor industri', required: true },
      { name: 'target_market', type: 'text', label: 'Target Market', placeholder: 'Deskripsi target market', required: false }
    ],
    isPublic: true,
    createdBy: 'system',
    usageCount: 156
  },
  {
    id: uuidv4(),
    title: 'Creative Story',
    description: 'Template untuk menulis cerita kreatif',
    category: 'creative',
    prompt: `Tulis cerita kreatif dengan elemen berikut:

Genre: {{genre}}
Setting: {{setting}}
Karakter Utama: {{main_character}}
Konflik: {{conflict}}
Panjang: {{length}}

Buat cerita yang engaging dengan plot yang menarik, karakter yang berkembang, dan ending yang memuaskan.`,
    variables: [
      { name: 'genre', type: 'select', label: 'Genre', options: ['Fantasy', 'Sci-Fi', 'Mystery', 'Romance', 'Thriller', 'Drama'], required: true },
      { name: 'setting', type: 'text', label: 'Setting', placeholder: 'Waktu dan tempat cerita', required: true },
      { name: 'main_character', type: 'text', label: 'Karakter Utama', placeholder: 'Deskripsi karakter utama', required: true },
      { name: 'conflict', type: 'text', label: 'Konflik', placeholder: 'Konflik utama dalam cerita', required: true },
      { name: 'length', type: 'select', label: 'Panjang', options: ['Pendek (500 kata)', 'Sedang (1000 kata)', 'Panjang (2000+ kata)'], required: true }
    ],
    isPublic: true,
    createdBy: 'system',
    usageCount: 298
  },
  {
    id: uuidv4(),
    title: 'Lesson Plan',
    description: 'Template untuk membuat rencana pembelajaran',
    category: 'education',
    prompt: `Buat rencana pembelajaran dengan detail berikut:

Mata Pelajaran: {{subject}}
Tingkat: {{grade_level}}
Durasi: {{duration}}
Topik: {{topic}}
Tujuan Pembelajaran: {{objectives}}

Struktur:
1. **Pembukaan** ({{opening_time}} menit)
2. **Kegiatan Inti** ({{main_time}} menit)
3. **Penutup** ({{closing_time}} menit)

Sertakan metode pembelajaran, media yang digunakan, dan evaluasi.`,
    variables: [
      { name: 'subject', type: 'text', label: 'Mata Pelajaran', placeholder: 'Nama mata pelajaran', required: true },
      { name: 'grade_level', type: 'text', label: 'Tingkat', placeholder: 'Kelas/tingkat', required: true },
      { name: 'duration', type: 'number', label: 'Durasi (menit)', placeholder: '90', required: true },
      { name: 'topic', type: 'text', label: 'Topik', placeholder: 'Topik pembelajaran', required: true },
      { name: 'objectives', type: 'textarea', label: 'Tujuan Pembelajaran', placeholder: 'Tujuan yang ingin dicapai', required: true },
      { name: 'opening_time', type: 'number', label: 'Waktu Pembukaan', placeholder: '10', required: true },
      { name: 'main_time', type: 'number', label: 'Waktu Kegiatan Inti', placeholder: '70', required: true },
      { name: 'closing_time', type: 'number', label: 'Waktu Penutup', placeholder: '10', required: true }
    ],
    isPublic: true,
    createdBy: 'system',
    usageCount: 134
  }
];

export const sampleSessions: ChatSession[] = [
  {
    id: uuidv4(),
    title: 'Diskusi tentang AI dan Masa Depan',
    messages: [
      {
        id: uuidv4(),
        content: 'Bagaimana AI akan mengubah dunia kerja di masa depan?',
        role: 'user',
        timestamp: new Date(Date.now() - 3600000),
      },
      {
        id: uuidv4(),
        content: 'AI akan mengubah dunia kerja secara signifikan dalam beberapa cara:\n\n1. **Otomatisasi Tugas Rutin**: AI akan mengambil alih tugas-tugas repetitif dan rutin, memungkinkan manusia fokus pada pekerjaan yang lebih kreatif dan strategis.\n\n2. **Augmentasi Kemampuan Manusia**: AI akan menjadi partner yang membantu meningkatkan produktivitas dan kemampuan analisis manusia.\n\n3. **Penciptaan Pekerjaan Baru**: Meskipun beberapa pekerjaan akan hilang, AI juga akan menciptakan kategori pekerjaan baru seperti AI trainer, data scientist, dan ethics officer.\n\n4. **Transformasi Industri**: Sektor seperti healthcare, finance, dan manufacturing akan mengalami transformasi besar-besaran.\n\nKunci sukses adalah adaptasi dan pembelajaran berkelanjutan.',
        role: 'assistant',
        timestamp: new Date(Date.now() - 3500000),
        tokens: 156,
        model: 'gemini-2.0-flash'
      }
    ],
    createdAt: new Date(Date.now() - 3600000),
    updatedAt: new Date(Date.now() - 3500000),
    tags: ['AI', 'Future', 'Work'],
    model: 'gemini-2.0-flash',
    settings: defaultSettings
  },
  {
    id: uuidv4(),
    title: 'Belajar React Hooks',
    messages: [
      {
        id: uuidv4(),
        content: 'Bisakah kamu jelaskan useState dan useEffect di React?',
        role: 'user',
        timestamp: new Date(Date.now() - 7200000),
      },
      {
        id: uuidv4(),
        content: '## useState Hook\n\n`useState` adalah hook untuk mengelola state dalam functional component:\n\n```javascript\nimport React, { useState } from \'react\';\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  \n  return (\n    <div>\n      <p>Count: {count}</p>\n      <button onClick={() => setCount(count + 1)}>\n        Increment\n      </button>\n    </div>\n  );\n}\n```\n\n## useEffect Hook\n\n`useEffect` untuk side effects seperti API calls, subscriptions:\n\n```javascript\nimport React, { useState, useEffect } from \'react\';\n\nfunction UserProfile({ userId }) {\n  const [user, setUser] = useState(null);\n  \n  useEffect(() => {\n    fetchUser(userId).then(setUser);\n  }, [userId]); // Dependency array\n  \n  return user ? <div>{user.name}</div> : <div>Loading...</div>;\n}\n```\n\n**Key Points:**\n- useState mengembalikan array [value, setter]\n- useEffect berjalan setelah render\n- Dependency array mengontrol kapan effect berjalan',
        role: 'assistant',
        timestamp: new Date(Date.now() - 7100000),
        tokens: 234,
        model: 'gemini-2.0-flash',
        isBookmarked: true
      }
    ],
    createdAt: new Date(Date.now() - 7200000),
    updatedAt: new Date(Date.now() - 7100000),
    tags: ['React', 'JavaScript', 'Programming'],
    model: 'gemini-2.0-flash',
    settings: defaultSettings
  }
];