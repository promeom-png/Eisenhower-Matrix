/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, AlertCircle, CheckCircle2, Info, ArrowRight, BrainCircuit } from 'lucide-react';
import { Task, QuadrantId, QUADRANTS, QuadrantInfo } from './types';
import { analyzeTaskPlacement } from './lib/gemini';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('eisenhower-tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [isAddingTask, setIsAddingTask] = useState<QuadrantId | null>(null);
  const [newTaskText, setNewTaskText] = useState('');

  useEffect(() => {
    localStorage.setItem('eisenhower-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = async (quadrant: QuadrantId) => {
    if (!newTaskText.trim()) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      text: newTaskText,
      quadrant,
      createdAt: Date.now(),
      isAnalyzing: true
    };

    setTasks(prev => [newTask, ...prev]);
    setNewTaskText('');
    setIsAddingTask(null);

    // AI Analysis
    const analysis = await analyzeTaskPlacement(newTask.text, quadrant);
    
    setTasks(prev => prev.map(t => 
      t.id === newTask.id 
        ? { ...t, aiFeedback: analysis.reasoning, isAnalyzing: false, 
            aiSuggestion: analysis.isCorrect ? undefined : analysis.suggestion } 
        : t
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const moveTask = (id: string, toQuadrant: QuadrantId) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, quadrant: toQuadrant, aiSuggestion: undefined, aiFeedback: undefined } : t
    ));
  };

  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      <header className="mb-8 text-center relative">
        <div className="absolute top-0 right-0">
          <button 
            onClick={() => setShowHelp(true)}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
            title="¿Qué es esto?"
          >
            <Info size={20} />
          </button>
        </div>
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold tracking-tight text-slate-900 mb-2"
        >
          Matriz de Eisenhower AI
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-slate-500 max-w-2xl mx-auto"
        >
          Prioriza tus tareas con inteligencia. El sistema te ayudará a decidir si tus tareas están en el lugar adecuado.
        </motion.p>
      </header>

      <div className="quadrant-grid">
        {(Object.values(QUADRANTS) as QuadrantInfo[]).map((q) => (
          <Quadrant 
            key={q.id}
            info={q}
            tasks={tasks.filter(t => t.quadrant === q.id)}
            onAddTask={() => setIsAddingTask(q.id)}
            onDeleteTask={deleteTask}
            onMoveTask={moveTask}
          />
        ))}
      </div>

      <AnimatePresence>
        {isAddingTask && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${QUADRANTS[isAddingTask].color}`} />
                Añadir a {QUADRANTS[isAddingTask].title}
              </h3>
              <textarea
                autoFocus
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="¿Qué necesitas hacer?"
                className="w-full h-32 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none mb-4"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    addTask(isAddingTask);
                  }
                }}
              />
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setIsAddingTask(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => addTask(isAddingTask)}
                  className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
                >
                  Añadir Tarea
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHelp && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl"
            >
              <h3 className="text-2xl font-bold mb-6">¿Qué es la Matriz de Eisenhower?</h3>
              <div className="space-y-6 text-slate-600">
                <p>Es una herramienta de gestión del tiempo que ayuda a priorizar tareas clasificándolas según su urgencia e importancia.</p>
                <div className="grid gap-4">
                  <div className="flex gap-4">
                    <div className="w-2 h-2 rounded-full bg-rose-500 mt-2 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900">Hacer (Urgente e Importante)</p>
                      <p className="text-sm">Tareas críticas que requieren atención inmediata. ¡Hazlas ahora!</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900">Planificar (No Urgente e Importante)</p>
                      <p className="text-sm">Tareas importantes que contribuyen a tus objetivos. Ponles fecha.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900">Delegar (Urgente y No Importante)</p>
                      <p className="text-sm">Tareas que deben hacerse pronto pero no necesariamente por ti. Busca ayuda.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-2 h-2 rounded-full bg-slate-500 mt-2 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900">Eliminar (No Urgente y No Importante)</p>
                      <p className="text-sm">Distracciones y tareas que no aportan valor. ¡Fuera de tu lista!</p>
                    </div>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setShowHelp(false)}
                className="mt-8 w-full py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-medium"
              >
                Entendido
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="mt-12 text-center text-slate-400 text-sm">
        <p>Tus tareas se guardan localmente en tu navegador.</p>
      </footer>
    </div>
  );
}

function Quadrant({ info, tasks, onAddTask, onDeleteTask, onMoveTask }: { 
  info: QuadrantInfo; 
  tasks: Task[]; 
  onAddTask: () => void;
  onDeleteTask: (id: string) => void;
  onMoveTask: (id: string, to: QuadrantId) => void;
  key?: string;
}) {
  return (
    <motion.div 
      layout
      className="glass rounded-2xl flex flex-col overflow-hidden h-full"
    >
      <div className={`${info.color} p-4 text-white`}>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-bold text-lg leading-tight">{info.title}</h2>
            <p className="text-white/80 text-xs uppercase tracking-wider font-medium">{info.subtitle}</p>
          </div>
          <button 
            onClick={onAddTask}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            title="Añadir tarea"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
        <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-xs text-slate-500 italic flex items-start gap-2">
            <Info size={14} className="mt-0.5 shrink-0" />
            {info.description}
          </p>
          <p className="text-sm font-medium text-slate-700 mt-2">
            💡 {info.question}
          </p>
        </div>

        <AnimatePresence mode="popLayout">
          {tasks.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-32 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-xl"
            >
              <p className="text-sm">No hay tareas</p>
            </motion.div>
          ) : (
            tasks.map((task) => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onDelete={() => onDeleteTask(task.id)}
                onMove={(to) => onMoveTask(task.id, to)}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function TaskItem({ task, onDelete, onMove }: { task: Task; onDelete: () => void; onMove: (to: QuadrantId) => void; key?: string }) {
  const [showFeedback, setShowFeedback] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex justify-between items-start gap-3">
        <p className="text-slate-800 leading-relaxed flex-1">{task.text}</p>
        <button 
          onClick={onDelete}
          className="text-slate-300 hover:text-rose-500 p-1 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {task.isAnalyzing && (
        <div className="mt-3 flex items-center gap-2 text-xs text-indigo-500 font-medium animate-pulse">
          <BrainCircuit size={14} />
          Analizando con IA...
        </div>
      )}

      {task.aiFeedback && !task.isAnalyzing && (
        <div className="mt-3">
          <button 
            onClick={() => setShowFeedback(!showFeedback)}
            className={`flex items-center gap-2 text-xs font-medium transition-colors ${
              task.aiSuggestion ? 'text-amber-600 hover:text-amber-700' : 'text-emerald-600 hover:text-emerald-700'
            }`}
          >
            {task.aiSuggestion ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
            {showFeedback ? 'Ocultar análisis' : 'Ver análisis de IA'}
          </button>
          
          <AnimatePresence>
            {showFeedback && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2 p-3 bg-slate-50 rounded-lg text-xs text-slate-600 leading-relaxed border border-slate-100">
                  {task.aiFeedback}
                  
                  {task.aiSuggestion && (
                    <div className="mt-3 pt-3 border-t border-slate-200 flex flex-col gap-2">
                      <p className="font-semibold text-slate-700">Sugerencia de cambio:</p>
                      <button 
                        onClick={() => onMove(task.aiSuggestion!)}
                        className="flex items-center justify-between w-full p-2 bg-white border border-slate-200 rounded-lg hover:border-indigo-500 hover:text-indigo-600 transition-all group/btn"
                      >
                        <span className="capitalize">{QUADRANTS[task.aiSuggestion].title}</span>
                        <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
