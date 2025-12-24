
export enum Language {
  HINDI = 'hi',
  ENGLISH = 'en'
}

export enum AppScreen {
  HOME = 'home',
  SUBJECTS = 'subjects',
  CURRENT_AFFAIRS = 'current_affairs',
  AI_TEACHER = 'ai_teacher',
  PHOTO_SEARCH = 'photo_search',
  QUIZ = 'quiz',
  PLANNER = 'planner',
  NOTES = 'notes',
  PROFILE = 'profile'
}

export interface Subject {
  id: string;
  name: { en: string; hi: string };
  icon: string;
  color: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface StudyPlan {
  exam: string;
  duration: string;
  schedule: { day: string; topics: string[] }[];
}

export interface CurrentAffair {
  title: string;
  summary: string;
  category: string;
  date: string;
}
