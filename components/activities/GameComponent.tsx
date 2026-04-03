'use client';

import { useState } from 'react';
import { Gamepad2, ChevronRight, Trophy } from 'lucide-react';
import type { Game, GameNode } from '@/lib/types';

interface GameComponentProps {
  game: Game;
  onComplete: (result: { path: string[]; correctCount: number; totalDecisions: number }) => void;
}

export default function GameComponent({ game, onComplete }: GameComponentProps) {
  const [currentNodeId, setCurrentNodeId] = useState(game.startNodeId);
  const [path, setPath] = useState<string[]>([game.startNodeId]);
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  const scoredNodes = game.nodes.filter(n => n.choices.some(c => c.isCorrect !== undefined));
  const totalDecisions = scoredNodes.length;
  const currentNode = game.nodes.find(n => n.id === currentNodeId) as GameNode;
  const decisionIndex = path.filter(id => scoredNodes.some(n => n.id === id)).length;

  const handleChoice = (index: number) => {
    if (selectedChoice !== null) return;
    setSelectedChoice(index);
    const choice = currentNode.choices[index];
    if (choice.isCorrect) setCorrectCount(prev => prev + 1);
  };

  const handleContinue = () => {
    const choice = currentNode.choices[selectedChoice!];
    if (choice.nextNodeId === 'end') {
      setFinished(true);
      const finalCorrect = correctCount;
      onComplete({ path, correctCount: finalCorrect, totalDecisions });
      return;
    }
    setPath(prev => [...prev, choice.nextNodeId]);
    setCurrentNodeId(choice.nextNodeId);
    setSelectedChoice(null);
  };

  const scorePercent = totalDecisions > 0 ? correctCount / totalDecisions : 0;
  const scoreColor = scorePercent === 1 ? 'green' : scorePercent >= 0.6 ? 'blue' : 'yellow';
  const scoreLabel = scorePercent === 1 ? 'Perfect!' : scorePercent >= 0.6 ? 'Good job!' : 'Needs work';

  if (finished) {
    const colors = {
      green: 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300',
      blue: 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300',
      yellow: 'border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300',
    };
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="flex-shrink-0 w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Trophy className="w-4 h-4" />
          </span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Scenario Complete</h3>
        </div>
        <div className={`p-6 rounded-xl border ${colors[scoreColor]} text-center space-y-2`}>
          <p className="text-3xl font-bold">{correctCount}/{totalDecisions}</p>
          <p className="text-sm font-medium">{scoreLabel}</p>
          <p className="text-sm opacity-80">correct decisions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="flex-shrink-0 w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
          <Gamepad2 className="w-4 h-4" />
        </span>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{game.title}</h3>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{game.description}</p>

      {/* Step indicator */}
      {totalDecisions > 0 && (
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Decision {Math.min(decisionIndex + 1, totalDecisions)} of {totalDecisions}
        </p>
      )}

      {/* Situation card */}
      <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line">
          {currentNode.situation}
        </p>
      </div>

      {/* Choices */}
      <div className="space-y-3">
        {currentNode.choices.map((choice, i) => {
          const isSelected = selectedChoice === i;
          const isRevealed = selectedChoice !== null;
          let btnClass = 'w-full text-left p-4 rounded-lg border text-sm font-medium transition-all flex items-center gap-3';

          if (!isRevealed) {
            btnClass += ' border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer';
          } else if (isSelected) {
            btnClass += choice.isCorrect
              ? ' border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
              : ' border-amber-400 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300';
          } else {
            btnClass += ' border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500';
          }

          return (
            <button key={i} onClick={() => handleChoice(i)} disabled={isRevealed} className={btnClass}>
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
              <span>{choice.label}</span>
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {selectedChoice !== null && (
        <div className={`p-4 rounded-lg border text-sm leading-relaxed ${
          currentNode.choices[selectedChoice].isCorrect
            ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
            : 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300'
        }`}>
          {currentNode.choices[selectedChoice].feedback}
        </div>
      )}

      {/* Continue button */}
      {selectedChoice !== null && (
        <button
          onClick={handleContinue}
          className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {currentNode.choices[selectedChoice].nextNodeId === 'end' ? 'See Results' : 'Continue'}
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
