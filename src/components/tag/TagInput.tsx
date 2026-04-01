'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTagAutocomplete } from '@/hooks/useTagAutocomplete';
import {
  TAG_MAX_COUNT,
  TAG_MAX_LENGTH,
  TAG_MIN_LENGTH,
  TAG_ALLOWED_PATTERN,
  TAG_PALETTE_CLASSES,
} from '@/constants/tag';
import type { TagSuggestion } from '@/types/tag';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  placeholder?: string;
  suggestions?: string[];
  id?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Strip '#' prefix, trim, and remove disallowed characters. */
function normalizeInput(raw: string): string {
  return raw.replace(/^#/, '').replace(TAG_ALLOWED_PATTERN, '').trim();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TagInput({
  tags,
  onChange,
  maxTags = TAG_MAX_COUNT,
  placeholder = '태그 추가 후 Enter',
  suggestions = [],
  id,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isFull = tags.length >= maxTags;

  // ---- Debounce input → query ----
  useEffect(() => {
    const normalized = normalizeInput(inputValue);
    if (normalized.length < TAG_MIN_LENGTH) {
      setDebouncedQuery('');
      return;
    }
    const timer = setTimeout(() => {
      setDebouncedQuery(normalized);
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  // ---- Autocomplete query ----
  const { data: autocompleteResults, isLoading } =
    useTagAutocomplete(debouncedQuery);

  // Filter out already-selected tags from autocomplete results
  const filteredResults: TagSuggestion[] = (autocompleteResults ?? []).filter(
    (s) => !tags.includes(s.canonical),
  );

  // Filter out already-selected tags from static suggestions
  const filteredSuggestions = suggestions.filter((s) => !tags.includes(s));

  // Show dropdown when there is a debounced query
  useEffect(() => {
    setIsDropdownOpen(debouncedQuery.length > 0);
  }, [debouncedQuery]);

  // ---- Add tag ----
  const addTag = useCallback(
    (canonical: string) => {
      const normalized = canonical.trim();
      if (
        normalized.length < TAG_MIN_LENGTH ||
        normalized.length > TAG_MAX_LENGTH
      ) {
        return;
      }
      if (tags.includes(normalized) || tags.length >= maxTags) return;

      onChange([...tags, normalized]);
      setInputValue('');
      setDebouncedQuery('');
      setIsDropdownOpen(false);
      inputRef.current?.focus();
    },
    [tags, onChange, maxTags],
  );

  // ---- Remove tag ----
  const removeTag = useCallback(
    (tagToRemove: string) => {
      onChange(tags.filter((t) => t !== tagToRemove));
    },
    [tags, onChange],
  );

  // ---- Keyboard handling ----
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const normalized = normalizeInput(inputValue);
      if (normalized) addTag(normalized);
    }
    if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  // ---- Blur / focus for dropdown ----
  const handleBlur = () => {
    // Delay to allow click on dropdown item to fire first
    blurTimeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 200);
  };

  const handleFocus = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    if (debouncedQuery.length > 0) {
      setIsDropdownOpen(true);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    };
  }, []);

  return (
    <div className="w-full">
      {/* Tag chips */}
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, i) => {
          const palette = TAG_PALETTE_CLASSES[i % TAG_PALETTE_CLASSES.length];
          return (
            <span
              key={tag}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium ${palette.bg} ${palette.fg}`}
            >
              #{tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className={`ml-0.5 hover:opacity-70 ${palette.fg}`}
                aria-label={`${tag} 태그 삭제`}
              >
                &times;
              </button>
            </span>
          );
        })}
      </div>

      {/* Input + dropdown wrapper */}
      <div className="relative">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            id={id}
            name={id}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onFocus={handleFocus}
            disabled={isFull}
            placeholder={isFull ? '태그를 더 추가할 수 없습니다' : placeholder}
            maxLength={TAG_MAX_LENGTH + 1} // +1 for potential '#'
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
          />
          <span className="text-xs text-gray-400 whitespace-nowrap">
            {tags.length}/{maxTags}
          </span>
        </div>

        {/* Autocomplete dropdown */}
        {isDropdownOpen && (filteredResults.length > 0 || isLoading) && (
          <ul className="absolute left-0 right-0 z-10 mt-1 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
            {isLoading && filteredResults.length === 0 && (
              <li className="px-3 py-2 text-sm text-gray-400">검색 중...</li>
            )}
            {filteredResults.map((suggestion) => (
              <li key={suggestion.tagId}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault(); // prevent blur before click
                    addTag(suggestion.canonical);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-indigo-50 hover:text-indigo-600"
                >
                  #{suggestion.displayName}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Static suggestion pills */}
      {filteredSuggestions.length > 0 && !isFull && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {filteredSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addTag(s)}
              className="rounded-full border border-gray-200 px-2.5 py-1 text-xs text-gray-500 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50 transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
