/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type QuadrantId = 'do' | 'plan' | 'delegate' | 'eliminate';

export interface Task {
  id: string;
  text: string;
  quadrant: QuadrantId;
  createdAt: number;
  aiFeedback?: string;
  aiSuggestion?: QuadrantId;
  isAnalyzing?: boolean;
}

export interface QuadrantInfo {
  id: QuadrantId;
  title: string;
  subtitle: string;
  question: string;
  color: string;
  description: string;
}

export const QUADRANTS: Record<QuadrantId, QuadrantInfo> = {
  do: {
    id: 'do',
    title: 'Hacer (Urgente / Importante)',
    subtitle: 'Urgente e Importante',
    question: '¿Sabes dónde está el extintor?',
    color: 'bg-rose-500',
    description: 'Tareas críticas que requieren atención inmediata.'
  },
  plan: {
    id: 'plan',
    title: 'Planificar (No Urgente / Importante)',
    subtitle: 'No Urgente e Importante',
    question: '¿Cuándo vas a planificar esto?',
    color: 'bg-indigo-500',
    description: 'Tareas importantes que contribuyen a tus objetivos a largo plazo.'
  },
  delegate: {
    id: 'delegate',
    title: 'Delegar (Urgente / No Importante)',
    subtitle: 'Urgente y No Importante',
    question: '¿A quién? ¿Cuándo?',
    color: 'bg-amber-500',
    description: 'Tareas que deben hacerse pronto pero no necesariamente por ti.'
  },
  eliminate: {
    id: 'eliminate',
    title: 'Eliminar (No Urgente / No Importante)',
    subtitle: 'No Urgente y No Importante',
    question: '¿Cuándo vas a eliminar esto de tu día a día?',
    color: 'bg-slate-500',
    description: 'Distracciones y tareas que no aportan valor.'
  }
};
