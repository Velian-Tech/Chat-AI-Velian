import { v4 as uuidv4 } from 'uuid';
import { ChatSession, Template, AIModel, ChatSettings } from '../types';

export const defaultSettings: ChatSettings = {
  model: 'velian-ai-pro',
  temperature: 0.7,
  maxTokens: 2048,
  systemPrompt: `Anda adalah Velian AI, asisten AI yang sangat cerdas dan membantu. Anda memiliki kemampuan:

1. **Analisis Mendalam**: Mampu menganalisis masalah kompleks dengan detail
2. **Kreativitas Tinggi**: Dapat menghasilkan ide-ide inovatif dan solusi kreatif
3. **Pembelajaran Adaptif**: Belajar dari konteks percakapan untuk memberikan respons yang lebih personal
4. **Multi-Domain Expertise**: Ahli dalam berbagai bidang seperti teknologi, bisnis, pendidikan, dan sains

**BATASAN KETAT:**
- TIDAK akan membahas konten pornografi, kekerasan, atau hal-hal yang merugikan
- TIDAK akan memberikan informasi untuk aktivitas ilegal atau berbahaya
- TIDAK akan menyebarkan informasi palsu atau menyesatkan
- TIDAK akan melanggar privasi atau etika

Selalu berikan respons yang konstruktif, edukatif, dan bermanfaat. Jika diminta hal yang tidak pantas, jelaskan dengan sopan mengapa tidak bisa membantu dan tawarkan alternatif yang positif.`,
  autoSave: true,
  darkMode: false,
  fontSize: 'medium',
  language: 'id',
  voiceEnabled: true,
  autoTranslate: false
};

export const availableModels: AIModel[] = [
  {
    id: 'velian-ai-pro',
    name: 'Velian AI Pro',
    description: 'Model AI terdepan dengan kemampuan reasoning dan analisis tingkat tinggi',
    provider: 'Velian Tech',
    maxTokens: 8192,
    costPer1kTokens: 0.001,
    capabilities: ['text', 'image', 'code', 'reasoning', 'analysis', 'creative', 'multilingual'],
    isAvailable: true
  },
  {
    id: 'velian-ai-creative',
    name: 'Velian AI Creative',
    description: 'Spesialis untuk tugas-tugas kreatif dan penulisan',
    provider: 'Velian Tech',
    maxTokens: 4096,
    costPer1kTokens: 0.0008,
    capabilities: ['text', 'creative', 'writing', 'storytelling'],
    isAvailable: true
  },
  {
    id: 'velian-ai-code',
    name: 'Velian AI Code',
    description: 'Ahli programming dan pengembangan software',
    provider: 'Velian Tech',
    maxTokens: 6144,
    costPer1kTokens: 0.0012,
    capabilities: ['code', 'debugging', 'architecture', 'optimization'],
    isAvailable: true
  }
];

export const sampleTemplates: Template[] = [
  {
    id: uuidv4(),
    title: 'Analisis Bisnis Mendalam',
    description: 'Template untuk analisis bisnis komprehensif dengan insight strategis',
    category: 'business',
    prompt: `Sebagai Velian AI, lakukan analisis bisnis mendalam untuk:

**Perusahaan/Produk:** {{subject}}
**Industri:** {{industry}}
**Target Market:** {{target_market}}
**Periode Analisis:** {{period}}

**Analisis Komprehensif:**

1. **Market Position & Competitive Landscape**
   - Posisi pasar saat ini
   - Analisis kompetitor utama
   - Unique value proposition

2. **Financial Health Assessment**
   - Proyeksi revenue dan profitabilitas
   - Cash flow analysis
   - Investment requirements

3. **SWOT Analysis Plus**
   - Strengths (internal advantages)
   - Weaknesses (areas for improvement)
   - Opportunities (market potential)
   - Threats (external risks)

4. **Strategic Recommendations**
   - Short-term action items (3-6 bulan)
   - Medium-term goals (6-18 bulan)
   - Long-term vision (2-5 tahun)

5. **Risk Mitigation Strategies**
   - Identifikasi risiko utama
   - Contingency planning
   - Monitoring metrics

Berikan insight yang actionable dan data-driven dengan rekomendasi spesifik.`,
    variables: [
      { name: 'subject', type: 'text', label: 'Perusahaan/Produk', placeholder: 'Nama perusahaan atau produk', required: true },
      { name: 'industry', type: 'text', label: 'Industri', placeholder: 'Sektor industri', required: true },
      { name: 'target_market', type: 'text', label: 'Target Market', placeholder: 'Deskripsi target market', required: true },
      { name: 'period', type: 'select', label: 'Periode Analisis', options: ['Q1 2024', 'Q2 2024', 'H1 2024', 'Full Year 2024'], required: true }
    ],
    isPublic: true,
    createdBy: 'velian-system',
    usageCount: 342
  },
  {
    id: uuidv4(),
    title: 'Code Architecture Review',
    description: 'Review arsitektur kode dengan standar enterprise dan best practices',
    category: 'coding',
    prompt: `Sebagai Velian AI Code Expert, lakukan review arsitektur kode berikut:

**Bahasa/Framework:** {{language}}
**Tipe Aplikasi:** {{app_type}}
**Scale:** {{scale}}

\`\`\`{{language}}
{{code}}
\`\`\`

**Comprehensive Code Review:**

1. **Architecture Assessment**
   - Design patterns yang digunakan
   - Separation of concerns
   - Scalability considerations

2. **Code Quality Analysis**
   - Clean code principles
   - SOLID principles compliance
   - DRY, KISS, YAGNI implementation

3. **Performance Optimization**
   - Bottleneck identification
   - Memory usage optimization
   - Algorithm efficiency

4. **Security Review**
   - Vulnerability assessment
   - Input validation
   - Authentication/authorization

5. **Maintainability Score**
   - Code readability
   - Documentation quality
   - Test coverage

6. **Refactoring Recommendations**
   - Priority improvements
   - Step-by-step refactoring plan
   - Alternative approaches

Berikan rating 1-10 untuk setiap aspek dan roadmap perbaikan yang detail.`,
    variables: [
      { name: 'language', type: 'select', label: 'Bahasa/Framework', options: ['JavaScript/React', 'TypeScript/Node.js', 'Python/Django', 'Java/Spring', 'Go', 'Rust', 'C#/.NET'], required: true },
      { name: 'app_type', type: 'select', label: 'Tipe Aplikasi', options: ['Web App', 'Mobile App', 'API/Backend', 'Desktop App', 'Microservice'], required: true },
      { name: 'scale', type: 'select', label: 'Scale', options: ['Startup/MVP', 'Medium Scale', 'Enterprise', 'High Traffic'], required: true },
      { name: 'code', type: 'textarea', label: 'Kode', placeholder: 'Paste kode yang ingin direview', required: true }
    ],
    isPublic: true,
    createdBy: 'velian-system',
    usageCount: 289
  },
  {
    id: uuidv4(),
    title: 'Creative Content Strategy',
    description: 'Strategi konten kreatif untuk marketing dan branding',
    category: 'creative',
    prompt: `Sebagai Velian AI Creative Strategist, buat strategi konten kreatif untuk:

**Brand/Produk:** {{brand}}
**Target Audience:** {{audience}}
**Platform:** {{platform}}
**Tujuan:** {{objective}}
**Budget Range:** {{budget}}
**Timeline:** {{timeline}}

**Creative Content Strategy:**

1. **Brand Voice & Personality**
   - Tone of voice definition
   - Brand personality traits
   - Communication guidelines

2. **Content Pillars (4-6 pillars)**
   - Educational content
   - Entertainment value
   - Behind-the-scenes
   - User-generated content
   - Product showcases
   - Industry insights

3. **Content Calendar (30 hari)**
   - Daily content themes
   - Posting schedule optimization
   - Seasonal/trending topics

4. **Creative Formats**
   - Visual content ideas
   - Video concepts
   - Interactive content
   - Story formats

5. **Engagement Strategies**
   - Community building tactics
   - User interaction methods
   - Viral potential elements

6. **Performance Metrics**
   - KPI definitions
   - Tracking methods
   - Success benchmarks

7. **Content Production Workflow**
   - Creation process
   - Approval workflow
   - Publishing schedule

Sertakan 10 ide konten spesifik yang siap dieksekusi.`,
    variables: [
      { name: 'brand', type: 'text', label: 'Brand/Produk', placeholder: 'Nama brand atau produk', required: true },
      { name: 'audience', type: 'text', label: 'Target Audience', placeholder: 'Deskripsi target audience', required: true },
      { name: 'platform', type: 'select', label: 'Platform Utama', options: ['Instagram', 'TikTok', 'LinkedIn', 'YouTube', 'Twitter/X', 'Multi-platform'], required: true },
      { name: 'objective', type: 'select', label: 'Tujuan Utama', options: ['Brand Awareness', 'Lead Generation', 'Sales Conversion', 'Community Building', 'Thought Leadership'], required: true },
      { name: 'budget', type: 'select', label: 'Budget Range', options: ['< $1K/month', '$1K-5K/month', '$5K-20K/month', '$20K+/month'], required: true },
      { name: 'timeline', type: 'select', label: 'Timeline', options: ['1 bulan', '3 bulan', '6 bulan', '1 tahun'], required: true }
    ],
    isPublic: true,
    createdBy: 'velian-system',
    usageCount: 456
  },
  {
    id: uuidv4(),
    title: 'Learning Path Designer',
    description: 'Desain jalur pembelajaran yang personal dan efektif',
    category: 'education',
    prompt: `Sebagai Velian AI Education Expert, buat learning path komprehensif untuk:

**Subjek/Skill:** {{subject}}
**Current Level:** {{current_level}}
**Target Level:** {{target_level}}
**Learning Style:** {{learning_style}}
**Available Time:** {{time_commitment}}
**Deadline:** {{deadline}}

**Personalized Learning Path:**

1. **Skill Assessment & Gap Analysis**
   - Current competency mapping
   - Required skills identification
   - Learning gap analysis

2. **Learning Objectives (SMART Goals)**
   - Specific milestones
   - Measurable outcomes
   - Achievable targets
   - Relevant applications
   - Time-bound checkpoints

3. **Structured Curriculum (Phase-by-Phase)**
   - Foundation Phase (Weeks 1-2)
   - Intermediate Phase (Weeks 3-6)
   - Advanced Phase (Weeks 7-10)
   - Mastery Phase (Weeks 11-12)

4. **Learning Resources & Materials**
   - Primary resources (books, courses)
   - Supplementary materials
   - Practice platforms
   - Community resources

5. **Hands-on Projects & Exercises**
   - Progressive difficulty projects
   - Real-world applications
   - Portfolio building

6. **Assessment & Feedback Methods**
   - Self-assessment tools
   - Peer review opportunities
   - Expert feedback channels

7. **Learning Schedule & Time Management**
   - Daily study plan
   - Weekly goals
   - Progress tracking system

8. **Motivation & Accountability**
   - Reward systems
   - Progress celebrations
   - Support network building

Sertakan checklist harian dan weekly review template.`,
    variables: [
      { name: 'subject', type: 'text', label: 'Subjek/Skill', placeholder: 'Apa yang ingin dipelajari', required: true },
      { name: 'current_level', type: 'select', label: 'Level Saat Ini', options: ['Complete Beginner', 'Some Knowledge', 'Intermediate', 'Advanced'], required: true },
      { name: 'target_level', type: 'select', label: 'Target Level', options: ['Basic Understanding', 'Intermediate Proficiency', 'Advanced Expertise', 'Professional Mastery'], required: true },
      { name: 'learning_style', type: 'select', label: 'Gaya Belajar', options: ['Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing', 'Mixed'], required: true },
      { name: 'time_commitment', type: 'select', label: 'Waktu Tersedia', options: ['1-2 jam/hari', '3-4 jam/hari', '5-6 jam/hari', 'Full-time'], required: true },
      { name: 'deadline', type: 'select', label: 'Target Waktu', options: ['1 bulan', '3 bulan', '6 bulan', '1 tahun'], required: true }
    ],
    isPublic: true,
    createdBy: 'velian-system',
    usageCount: 378
  }
];

export const sampleSessions: ChatSession[] = [
  {
    id: uuidv4(),
    title: 'Strategi AI untuk Bisnis Modern',
    messages: [
      {
        id: uuidv4(),
        content: 'Bagaimana AI dapat mengoptimalkan operasional bisnis di era digital?',
        role: 'user',
        timestamp: new Date(Date.now() - 3600000),
      },
      {
        id: uuidv4(),
        content: `# Optimalisasi Operasional Bisnis dengan AI

Sebagai Velian AI, saya akan menjelaskan bagaimana AI dapat mentransformasi operasional bisnis modern:

## 🎯 **Otomatisasi Proses Bisnis**
- **Customer Service**: Chatbot AI untuk respons 24/7 dengan tingkat akurasi 95%
- **Data Processing**: Automasi analisis data real-time untuk decision making
- **Inventory Management**: Prediksi demand dan optimasi stok otomatis

## 📊 **Predictive Analytics**
- **Sales Forecasting**: Prediksi penjualan dengan akurasi hingga 90%
- **Risk Assessment**: Identifikasi risiko bisnis sebelum terjadi
- **Market Trend Analysis**: Analisis tren pasar untuk strategic planning

## 🔧 **Operational Efficiency**
- **Resource Allocation**: Optimasi penggunaan sumber daya berdasarkan data
- **Quality Control**: Deteksi defect otomatis dalam produksi
- **Supply Chain**: Optimasi rantai pasok dengan AI logistics

## 💡 **Personalization at Scale**
- **Customer Experience**: Personalisasi produk/layanan untuk setiap customer
- **Marketing Campaigns**: Targeting yang lebih presisi dan efektif
- **Product Recommendations**: Sistem rekomendasi yang meningkatkan conversion

## 🚀 **Implementation Roadmap**
1. **Assessment Phase** (Bulan 1-2): Audit proses existing
2. **Pilot Project** (Bulan 3-4): Implementasi di satu area
3. **Scale Up** (Bulan 5-8): Ekspansi ke area lain
4. **Optimization** (Ongoing): Continuous improvement

**ROI yang dapat dicapai**: 25-40% peningkatan efisiensi dalam 12 bulan pertama.`,
        role: 'assistant',
        timestamp: new Date(Date.now() - 3500000),
        tokens: 298,
        model: 'velian-ai-pro'
      }
    ],
    createdAt: new Date(Date.now() - 3600000),
    updatedAt: new Date(Date.now() - 3500000),
    tags: ['AI', 'Business', 'Strategy', 'Digital Transformation'],
    model: 'velian-ai-pro',
    settings: defaultSettings
  }
];