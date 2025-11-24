/**
 * QuestKbdShortcuts Component
 * Keyboard shortcut handler for quest interactions
 */

import { useEffect } from 'react';

interface QuestKbdShortcutsProps {
  onAddQuest: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete?: () => void;
  onClaim?: () => void;
  onToggleNotes?: () => void;
}

export function QuestKbdShortcuts({
  onAddQuest,
  onMoveUp,
  onMoveDown,
  onDelete,
  onClaim,
  onToggleNotes,
}: QuestKbdShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const isMod = e.metaKey || e.ctrlKey;

      // n → focus add input
      if (e.key === 'n' && !isMod) {
        e.preventDefault();
        onAddQuest();
      }

      // Cmd/Ctrl + Up → move up
      if (e.key === 'ArrowUp' && isMod && onMoveUp) {
        e.preventDefault();
        onMoveUp();
      }

      // Cmd/Ctrl + Down → move down
      if (e.key === 'ArrowDown' && isMod && onMoveDown) {
        e.preventDefault();
        onMoveDown();
      }

      // Cmd/Ctrl + Backspace → delete
      if (e.key === 'Backspace' && isMod && onDelete) {
        e.preventDefault();
        onDelete();
      }

      // c → claim
      if (e.key === 'c' && !isMod && onClaim) {
        e.preventDefault();
        onClaim();
      }

      // e → expand/collapse notes
      if (e.key === 'e' && !isMod && onToggleNotes) {
        e.preventDefault();
        onToggleNotes();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onAddQuest, onMoveUp, onMoveDown, onDelete, onClaim, onToggleNotes]);

  return null;
}
