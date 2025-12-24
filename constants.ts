
import { Subject } from './types';

export const SUBJECTS: Subject[] = [
  { id: 'geo', name: { en: 'Geography', hi: 'भूगोल' }, icon: 'fa-earth-americas', color: 'bg-blue-500' },
  { id: 'hist', name: { en: 'History', hi: 'इतिहास' }, icon: 'fa-monument', color: 'bg-orange-500' },
  { id: 'polity', name: { en: 'Polity', hi: 'राजव्यवस्था' }, icon: 'fa-landmark-dome', color: 'bg-indigo-500' },
  { id: 'math', name: { en: 'Mathematics', hi: 'गणित' }, icon: 'fa-calculator', color: 'bg-emerald-500' },
  { id: 'sci', name: { en: 'Science', hi: 'विज्ञान' }, icon: 'fa-flask', color: 'bg-rose-500' },
  { id: 'gk', name: { en: 'GK & Reasoning', hi: 'सामान्य ज्ञान' }, icon: 'fa-brain', color: 'bg-purple-500' },
];

export const EXAMS = [
  { id: 'upsc', name: 'UPSC (IAS/IPS)' },
  { id: 'ssc', name: 'SSC CGL/CHSL' },
  { id: 'railway', name: 'Railway RRB' },
  { id: 'bank', name: 'Banking (IBPS/SBI)' },
  { id: 'state', name: 'State PCS (BPSC/UPPSC)' },
  { id: 'k12', name: 'Class 1-12 Board' },
];
