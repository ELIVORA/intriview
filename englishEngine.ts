/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EnglishScores,
  Achievement,
  SpeakingSessionReport,
  DailyChallenge,
  HRConversation,
  ReadingParagraph,
  ListeningExercise,
  GrammarErrorDetail,
  PronunciationErrorDetail,
  VocabularySuggestion,
  FluencyMetrics,
  ConfidenceMetrics
} from "./types";

// Initial dashboard scores and stats
export const INITIAL_SCORES: EnglishScores = {
  grammar: 82,
  pronunciation: 76,
  vocabulary: 80,
  fluency: 74,
  confidence: 85,
  speakingSpeed: 128,
  dailyStreak: 5,
  dailyGoalMinutes: 15,
  weeklyProgressMinutes: [12, 18, 15, 22, 10, 0, 0] // Mon-Sun
};

// Initial English achievements
export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: "streak_7",
    title: "7-Day Streak Master",
    description: "Maintain a daily speaking consistency streak for 7 consecutive days.",
    unlocked: true,
    unlockedAt: "2026-07-14T10:00:00Z",
    iconName: "Flame"
  },
  {
    id: "streak_30",
    title: "30-Day Elite Speaker",
    description: "Conquer the 30-day streak milestone to solidify elite fluency.",
    unlocked: false,
    iconName: "Calendar"
  },
  {
    id: "grammar_master",
    title: "Syntax Guard",
    description: "Complete 10 grammar evaluation exercises with a score of 95% or above.",
    unlocked: true,
    unlockedAt: "2026-07-15T16:45:00Z",
    iconName: "CheckCheck"
  },
  {
    id: "vocab_expert",
    title: "Lexicon Architect",
    description: "Integrate 50+ advanced business English vocabulary suggestions into interviews.",
    unlocked: false,
    iconName: "Sparkles"
  },
  {
    id: "fluent_speaker",
    title: "Eloquence Virtuoso",
    description: "Achieve a fluency rating above 90 WPM with less than 2% filler words.",
    unlocked: false,
    iconName: "Award"
  },
  {
    id: "interview_ready",
    title: "Interview Champion",
    description: "Unlock perfect marks from the AI HR Coach across all interview parameters.",
    unlocked: false,
    iconName: "UserCheck"
  }
];

// Pre-seeded speaking and introduction practice topics
export const PRACTICE_TOPICS = [
  { id: "intro_self", label: "General Self Introduction", category: "Self Introduction", prompt: "Introduce yourself to a panel of hiring managers. Include your academic credentials and interests." },
  { id: "tell_about_you", label: "Tell Me About Yourself", category: "Self Introduction", prompt: "Summarize your career journey, core technical stack, and what sets you apart from other candidates." },
  { id: "career_goals", label: "Short & Long-term Goals", category: "Self Introduction", prompt: "Where do you see yourself in 3 and 7 years respectively, and how does this role fit that roadmap?" },
  { id: "strengths_weaknesses", label: "Strengths and Weaknesses", category: "Self Introduction", prompt: "Detail your primary professional strength, and outline a real weakness you are proactively overcoming." },
  { id: "project_explain", label: "Technical Project Overview", category: "Self Introduction", prompt: "Explain a complex engineering or software project you built. Describe the stack, obstacles, and solution." },
  { id: "final_year_proj", label: "Final Year Project Pitch", category: "Self Introduction", prompt: "Deliver a 2-minute pitch explaining the social or business impact of your academic capstone project." },
  
  { id: "cloud_infra", label: "Explain Cloud Serverless architecture", category: "Technical Explanation", prompt: "Describe AWS Serverless or Google Cloud Functions to a non-technical manager." },
  { id: "teamwork_conflict", label: "Handling a Conflict in a Team", category: "Behavioral", prompt: "Talk about a time you had a technical disagreement with a teammate and how you resolved it constructively." },
  { id: "why_us", label: "Why do you want to join our firm?", category: "HR Conversation", prompt: "State your alignment with our culture of innovation, scale, and customer-centric deliverables." }
];

// Daily Challenges definitions
export const INITIAL_DAILY_CHALLENGES: DailyChallenge[] = [
  {
    id: "challenge_1",
    title: "Introduce Yourself Challenge",
    type: "Speaking",
    description: "Deliver a 1-minute pitch introducing your core projects without using the filler word 'actually'.",
    difficulty: "Intermediate",
    points: 150,
    isCompleted: false,
    targetMetric: "Filler Words Reduction"
  },
  {
    id: "challenge_2",
    title: "Prepositions Master Class",
    type: "Grammar",
    description: "Identify correct placement prepositions for enterprise SaaS system deployment scenarios.",
    difficulty: "Beginner",
    points: 100,
    isCompleted: false
  },
  {
    id: "challenge_3",
    title: "Verbal Precision Quest",
    type: "Vocabulary",
    description: "Learn and pronounce 5 advanced business verbs: 'Leverage', 'Optimize', 'Spearhead', 'Synthesize', and 'Mitigate'.",
    difficulty: "Advanced",
    points: 200,
    isCompleted: false
  },
  {
    id: "challenge_4",
    title: "Active Listening: Google Cloud Drive",
    type: "Listening",
    description: "Listen to an executive explaining storage pipelines and answer comprehension questions.",
    difficulty: "Intermediate",
    points: 120,
    isCompleted: false
  }
];

// Reading Paragraphs Practice items
export const READING_PARAGRAPHS: ReadingParagraph[] = [
  {
    id: "read_1",
    title: "Technical Scalability",
    difficulty: "Easy",
    text: "Building scalable web services requires an understanding of distributed systems. Developers must optimize database access, establish robust caching strategies with Redis, and balance network loads across multiple server instances. These practices minimize latency and ensure a seamless user experience under heavy traffic loads."
  },
  {
    id: "read_2",
    title: "SaaS Business Deliverables",
    difficulty: "Medium",
    text: "Our software-as-a-service platform leverages machine learning algorithms to automate enterprise recruitment workflows. By analyzing historical resume profiles and screening candidates in real-time, the system mitigates subconscious hiring biases. Consequently, talent acquisition officers can make objective, data-driven decisions that elevate team productivity."
  },
  {
    id: "read_3",
    title: "Microservices & Serverless Orchestration",
    difficulty: "Hard",
    text: "Orchestrating serverless microservices mandates rigorous monitoring of throughput, cold-starts, and transactional integrity. Engineers must utilize asynchronous messaging queues to decouple database operations. This prevents cascade failures during high-volume spikes and yields unparalleled resilient architectures."
  }
];

// Listening exercises with mock script audio
export const LISTENING_EXERCISES: ListeningExercise[] = [
  {
    id: "listen_1",
    title: "Project Architecture Sprint Review",
    audioScript: "Attention team, for our upcoming product launch, we are shifting our core architecture to a serverless architecture model. This transition will optimize server costs by sixty percent and significantly reduce cold-start latency. However, it requires migrating our existing relational database queries into a serverless-friendly schema. We expect to begin beta deployment on Wednesday morning, with a complete rollout completed by the end of next week. Please review your dashboard metrics by Tuesday night.",
    questions: [
      {
        id: "q1_1",
        questionText: "What is the primary benefit of shifting to a serverless model as mentioned in the briefing?",
        options: [
          "Eliminating the need for frontend developers",
          "Optimizing server costs by 60% and reducing cold-start latency",
          "Replacing Wednesday and Tuesday meeting loops",
          "Migrating the entire engineering office to AWS"
        ],
        correctAnswerIndex: 1
      },
      {
        id: "q1_2",
        questionText: "By when must team members review their dashboard metrics?",
        options: [
          "Wednesday morning",
          "Friday afternoon",
          "Tuesday night",
          "Next week rollout"
        ],
        correctAnswerIndex: 2
      }
    ]
  },
  {
    id: "listen_2",
    title: "Hiring Manager Expectations Overview",
    audioScript: "Hello class. When tech companies interview candidates for software engineering roles, they assess structural communication just as much as coding expertise. Excellent candidates explain their complex logic while designing. They do not jump directly to writing. Instead, they state assumptions, ask clarifying questions, and walk through multiple algorithmic paths. Remember, a silent engineer is extremely difficult to evaluate in a fast-paced panel.",
    questions: [
      {
        id: "q2_1",
        questionText: "According to the speaker, what is a key mistake candidates make during coding rounds?",
        options: [
          "Asking too many clarifying questions",
          "Writing code without explaining their thought process and design assumptions first",
          "Speaking too slowly during the intro pitch",
          "Listing multiple programming languages on their resume"
        ],
        correctAnswerIndex: 1
      },
      {
        id: "q2_2",
        questionText: "Which of the following is highly valued during tech panels?",
        options: [
          "Perfect silent typing speed",
          "Explaining thoughts aloud and proposing multiple design approaches",
          "Memorizing solution templates from Github repositories",
          "Strict adherence to Java algorithms over Python"
        ],
        correctAnswerIndex: 1
      }
    ]
  }
];

// Simulated HR conversation templates with follow-ups
export const CORE_HR_PROMPTS = [
  { id: "hr_1", question: "Tell me about yourself.", followup: "That's a solid background. You mentioned building technical projects; could you elaborate on the most challenging bug you solved?" },
  { id: "hr_2", question: "Why should we hire you over other candidates?", followup: "Interesting argument. If you are placed in a team with conflicting priorities, how would you convince other seniors of your strategy?" },
  { id: "hr_3", question: "What are your core strengths and weaknesses?", followup: "Thank you for the honesty. In what scenarios does your strength become a drawback, and what limits does your weakness impose?" },
  { id: "hr_4", question: "Describe a significant challenge you faced in your academic career.", followup: "Resiliency is vital. Did you require external mentorship, or did you structure the entire resolution framework independently?" },
  { id: "hr_5", question: "Why do you want to work at our company specifically?", followup: "Our cultural value of rapid deployment is high. How does your experience with agile practices match this tempo?" }
];

// Simulated vocabulary libraries
export const VOCABULARY_LIBRARY = [
  { original: "use", improved: "leverage", definition: "Use something to its maximum advantage.", example: "We leverage cloud containers to scale services.", category: "Business English" },
  { original: "make better", improved: "optimize", definition: "Make the best or most effective use of a situation or resource.", example: "Our team optimized relational indexes for faster lookups.", category: "Action Words" },
  { original: "led", improved: "spearheaded", definition: "Lead an attack, movement, or business initiative.", example: "She spearheaded the development of the AI resume parsing engine.", category: "Action Words" },
  { original: "combines", improved: "synthesizes", definition: "Combine elements or ideas into a coherent whole.", example: "The dashboard synthesizes complex audio metrics into readable scores.", category: "Professional" },
  { original: "reduce risk", improved: "mitigate", definition: "Make less severe, serious, or painful.", example: "Testing models thoroughly mitigates post-deployment crashes.", category: "Professional" },
  { original: "very important", improved: "pivotal", definition: "Of crucial importance in relation to the development or success of something.", example: "His contribution was pivotal to delivering the client demo on time.", category: "Interview" },
  { original: "talk about", improved: "articulate", definition: "Express an idea or feeling fluently and coherently.", example: "You must articulate your project architecture clearly during tech rounds.", category: "Interview" },
  { original: "build", improved: "architect", definition: "Design and construct a complex framework or system.", example: "We architected an enterprise SaaS with serverless microservices.", category: "Technical" }
];

// Grammar and pronunciation filler arrays for random generator fallback
const FILLER_WORDS_CATALOG = ["um", "uh", "actually", "basically", "like", "you know", "sort of"];
const GRAMMAR_ERRORS_CATALOG: GrammarErrorDetail[] = [
  { original: "I am having two years experience", corrected: "I have two years of experience", explanation: "Use present simple 'have' for possession instead of present continuous 'am having'.", type: "tense" },
  { original: "He don't know the answer", corrected: "He doesn't know the answer", explanation: "Subject-verb agreement requires 'doesn't' for singular third-person pronouns.", type: "subject-verb" },
  { original: "We discussed about the project architecture", corrected: "We discussed the project architecture", explanation: "The verb 'discuss' is transitive and does not require the preposition 'about'.", type: "preposition" },
  { original: "I built an scalable cloud platform", corrected: "I built a scalable cloud platform", explanation: "Use the article 'a' before consonant sounds (scalable) and 'an' before vowel sounds.", type: "article" },
  { original: "Deploying system were complex", corrected: "Deploying the system was complex", explanation: "Gerund subjects (Deploying) take singular verbs (was).", type: "subject-verb" }
];

const PRONUNCIATION_ERRORS_CATALOG: PronunciationErrorDetail[] = [
  { word: "leverage", expected: "LEV-er-ij", actual: "lee-ver-ayj", score: 62, type: "stress", suggestion: "Place primary emphasis on the first syllable: LEV." },
  { word: "architecture", expected: "AHR-ki-tek-cher", actual: "arch-i-tek-tur", score: 55, type: "phone", suggestion: "The 'ch' sound in architecture is pronounced as 'k', not 'ch'." },
  { word: "scalable", expected: "SKEY-luh-buhl", actual: "scal-ay-buhl", score: 68, type: "intonation", suggestion: "Open up the first vowel sound as in 'key' or 'play': SKEY." },
  { word: "orchestrate", expected: "AWR-kuh-streyt", actual: "or-ches-trat", score: 58, type: "stress", suggestion: "Pronounce with emphasis on the initial syllable: AWR." }
];

// Helper to calculate a score from a string and add some randomness
export function calculateSimulatedScores(inputText: string): {
  grammarScore: number;
  pronunciationScore: number;
  vocabularyScore: number;
  fluencyScore: number;
  confidenceScore: number;
  grammarErrors: GrammarErrorDetail[];
  pronunciationErrors: PronunciationErrorDetail[];
  vocabularySuggestions: VocabularySuggestion[];
  fluencyMetrics: FluencyMetrics;
  confidenceMetrics: ConfidenceMetrics;
} {
  const words = inputText.trim().split(/\s+/);
  const wordCount = words.length;

  // Generate score baselines with small variations based on length
  const grammarScore = Math.min(98, Math.max(65, 80 + Math.floor(Math.random() * 15)));
  const pronunciationScore = Math.min(96, Math.max(60, 75 + Math.floor(Math.random() * 20)));
  const vocabularyScore = Math.min(97, Math.max(62, 78 + Math.floor(Math.random() * 18)));
  const fluencyScore = Math.min(95, Math.max(55, 72 + Math.floor(Math.random() * 22)));
  const confidenceScore = Math.min(99, Math.max(65, 82 + Math.floor(Math.random() * 16)));

  // Extract grammar errors
  const grammarErrors: GrammarErrorDetail[] = [];
  if (grammarScore < 95) {
    const errorCount = grammarScore < 80 ? 2 : 1;
    for (let i = 0; i < errorCount; i++) {
      const randomErr = GRAMMAR_ERRORS_CATALOG[Math.floor(Math.random() * GRAMMAR_ERRORS_CATALOG.length)];
      if (!grammarErrors.find(e => e.original === randomErr.original)) {
        grammarErrors.push(randomErr);
      }
    }
  }

  // Pronunciation errors
  const pronunciationErrors: PronunciationErrorDetail[] = [];
  if (pronunciationScore < 95) {
    const errorCount = pronunciationScore < 75 ? 2 : 1;
    for (let i = 0; i < errorCount; i++) {
      const randomErr = PRONUNCIATION_ERRORS_CATALOG[Math.floor(Math.random() * PRONUNCIATION_ERRORS_CATALOG.length)];
      if (!pronunciationErrors.find(e => e.word === randomErr.word)) {
        pronunciationErrors.push(randomErr);
      }
    }
  }

  // Vocab improvements
  const vocabularySuggestions: VocabularySuggestion[] = [];
  const lowercaseInput = inputText.toLowerCase();
  VOCABULARY_LIBRARY.forEach(v => {
    if (lowercaseInput.includes(v.original) && vocabularySuggestions.length < 3) {
      vocabularySuggestions.push({
        originalWord: v.original,
        improvedWord: v.improved,
        definition: v.definition,
        exampleSentence: v.example,
        category: v.category as any
      });
    }
  });

  // If no matching words in text, suggest a couple of random ones anyway to make the coach helpful
  if (vocabularySuggestions.length === 0) {
    for (let i = 0; i < 2; i++) {
      const randomVoc = VOCABULARY_LIBRARY[Math.floor(Math.random() * VOCABULARY_LIBRARY.length)];
      vocabularySuggestions.push({
        originalWord: randomVoc.original,
        improvedWord: randomVoc.improved,
        definition: randomVoc.definition,
        exampleSentence: randomVoc.example,
        category: randomVoc.category as any
      });
    }
  }

  // Fluency metrics
  const wpm = Math.floor(110 + Math.random() * 40); // natural interviewer speed 110-150
  const detectedFiller: { word: string; count: number }[] = [];
  let fillerCount = 0;
  
  FILLER_WORDS_CATALOG.forEach(f => {
    if (lowercaseInput.includes(f) || Math.random() > 0.6) {
      const count = Math.floor(1 + Math.random() * 3);
      detectedFiller.push({ word: f, count });
      fillerCount += count;
    }
  });

  const fluencyMetrics: FluencyMetrics = {
    wpm,
    fillerWordsCount: fillerCount,
    fillerWordsDetected: detectedFiller,
    naturalPausesCount: Math.floor(2 + Math.random() * 6),
    repetitionsCount: Math.random() > 0.7 ? 1 : 0,
    hesitationsCount: Math.floor(Math.random() * 3)
  };

  // Confidence details
  const confidenceMetrics: ConfidenceMetrics = {
    voiceConfidence: Math.floor(75 + Math.random() * 23),
    toneStability: Math.floor(80 + Math.random() * 18),
    energyLevel: Math.floor(70 + Math.random() * 25),
    expressionScore: Math.floor(78 + Math.random() * 20)
  };

  return {
    grammarScore,
    pronunciationScore,
    vocabularyScore,
    fluencyScore,
    confidenceScore,
    grammarErrors,
    pronunciationErrors,
    vocabularySuggestions,
    fluencyMetrics,
    confidenceMetrics
  };
}

// Global persistence array for mock session evaluations (starts with one beautiful initial review)
export let SESSION_REPORTS_DATABASE: SpeakingSessionReport[] = [
  {
    id: "rep_initial_1",
    timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    topic: "Tell Me About Yourself",
    durationSeconds: 45,
    transcript: "I am having two years experience in building web applications. I use AWS scalable servers and love to make better relational database speed. Basically, I did spearheaded our final year project architecture which was discussed about last Tuesday.",
    grammarScore: 74,
    pronunciationScore: 82,
    vocabularyScore: 78,
    fluencyScore: 72,
    confidenceScore: 88,
    grammarErrors: [
      { original: "I am having two years experience", corrected: "I have two years of experience", explanation: "Use present simple 'have' for possession instead of present continuous 'am having'.", type: "tense" },
      { original: "discussed about", corrected: "discussed", explanation: "The verb 'discuss' is transitive and does not require the preposition 'about'.", type: "preposition" }
    ],
    pronunciationErrors: [
      { word: "architecture", expected: "AHR-ki-tek-cher", actual: "arch-i-tek-tur", score: 62, type: "phone", suggestion: "The 'ch' sound in architecture is pronounced as 'k', not 'ch'." }
    ],
    vocabularySuggestions: [
      { originalWord: "use", improvedWord: "leverage", definition: "Use something to its maximum advantage.", exampleSentence: "We leverage cloud containers to scale services.", category: "Business English" },
      { originalWord: "make better", improvedWord: "optimize", definition: "Make the best or most effective use of a situation or resource.", exampleSentence: "Our team optimized relational indexes for faster lookups.", category: "Action Words" }
    ],
    fluencyMetrics: {
      wpm: 125,
      fillerWordsCount: 2,
      fillerWordsDetected: [{ word: "basically", count: 2 }],
      naturalPausesCount: 5,
      repetitionsCount: 0,
      hesitationsCount: 1
    },
    confidenceMetrics: {
      voiceConfidence: 89,
      toneStability: 85,
      energyLevel: 90,
      expressionScore: 88
    }
  }
];

export function addSpeakingSessionReport(report: SpeakingSessionReport) {
  SESSION_REPORTS_DATABASE = [report, ...SESSION_REPORTS_DATABASE];
}
