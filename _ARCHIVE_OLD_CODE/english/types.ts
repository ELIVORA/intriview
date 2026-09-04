/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface EnglishScores {
  grammar: number;
  pronunciation: number;
  vocabulary: number;
  fluency: number;
  confidence: number;
  speakingSpeed: number; // Words per minute (WPM)
  dailyStreak: number;
  dailyGoalMinutes: number;
  weeklyProgressMinutes: number[]; // Mon-Sun
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
  iconName: string;
}

export interface PronunciationErrorDetail {
  word: string;
  expected: string;
  actual: string;
  score: number;
  type: "stress" | "intonation" | "phone" | "pause";
  suggestion: string;
}

export interface GrammarErrorDetail {
  original: string;
  corrected: string;
  explanation: string;
  type: "tense" | "article" | "preposition" | "subject-verb" | "sentence-structure";
}

export interface VocabularySuggestion {
  originalWord: string;
  improvedWord: string;
  definition: string;
  exampleSentence: string;
  category: "Professional" | "Interview" | "Business English" | "Action Words" | "Technical";
}

export interface FluencyMetrics {
  wpm: number;
  fillerWordsCount: number;
  fillerWordsDetected: { word: string; count: number }[];
  naturalPausesCount: number;
  repetitionsCount: number;
  hesitationsCount: number;
}

export interface ConfidenceMetrics {
  voiceConfidence: number;
  toneStability: number;
  energyLevel: number;
  expressionScore: number;
}

export interface SpeakingSessionReport {
  id: string;
  timestamp: string;
  topic: string;
  durationSeconds: number;
  transcript: string;
  audioUrl?: string;
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
}

export interface DailyChallenge {
  id: string;
  title: string;
  type: "Speaking" | "Grammar" | "Vocabulary" | "Listening" | "Interview";
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  points: number;
  isCompleted: boolean;
  targetMetric?: string;
}

export interface DialogueTurn {
  speaker: "AI" | "Candidate" | "ParticipantA" | "ParticipantB" | "Moderator";
  speakerName: string;
  text: string;
  timestamp: string;
  avatarUrl?: string;
}

export interface HRConversation {
  id: string;
  title: string;
  category: "Self Introduction" | "HR Core" | "Behavioral" | "Presentation" | "Group Discussion";
  turns: DialogueTurn[];
  status: "idle" | "recording" | "analyzing" | "completed";
}

export interface ReadingParagraph {
  id: string;
  title: string;
  text: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface ListeningQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  userAnswerIndex?: number;
}

export interface ListeningExercise {
  id: string;
  title: string;
  audioScript: string; // Text to speak via TTS or simulate
  questions: ListeningQuestion[];
  score?: number;
}

export interface GroupDiscussionEvaluation {
  leadershipScore: number;
  communicationScore: number;
  activeListeningScore: number;
  teamworkScore: number;
  feedbackSummary: string;
}
