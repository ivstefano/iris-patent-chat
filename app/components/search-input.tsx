"use client";

import type React from "react";
import {useEffect, useRef, useState} from "react";
import {Button} from "@/components/ui/button";

import {Send} from 'lucide-react';
import {useRouter} from "next/navigation";
import {saveQuery} from "@/utils/query-storage";
import {useToast} from "@/hooks/use-toast";
import {collections} from "@/data/collections";
import {useConversationStore} from "@/store/conversation-store";

interface SearchInputProps {
  query: string;
  setQuery: (query: string) => void;
  onSearch: (e: React.FormEvent) => void;
  searchMode: string;
  setSearchMode: (mode: string) => void;
  isMobile: boolean;
  onFocus: () => void;
  placeholder?: string;
  inputRef?: React.RefObject<HTMLTextAreaElement>;
  suggestions?: string[];
  showSuggestions?: boolean;
  setShowSuggestions?: (show: boolean) => void;
  selectedSuggestionIndex?: number;
  setSelectedSuggestionIndex?: (index: number) => void;
  onSuggestionSelect?: (suggestion: string) => void;

  selectedCollection?: string;
  setSelectedCollection?: (id?: string) => void;
}

export default function SearchInput({
  query,
  setQuery,
  onSearch,
  onFocus,
  placeholder,
  inputRef,
  suggestions = [],
  showSuggestions = false,
  selectedSuggestionIndex = -1,
  setSelectedSuggestionIndex,
  onSuggestionSelect,
  selectedCollection,
}: SearchInputProps) {
  const router = useRouter();
  const localInputRef = useRef<HTMLTextAreaElement>(null);
  const actualInputRef = inputRef || localInputRef;
  const { createConversation } = useConversationStore();

  const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
    if (!textarea) return;
    textarea.style.height = "auto";
    const lineHeight = 24;
    const newHeight = textarea.scrollHeight;
    const maxHeight = lineHeight * 5;
    textarea.style.height = `${Math.min(newHeight, maxHeight)}px`;
    textarea.style.overflowY = newHeight > maxHeight ? "auto" : "hidden";
  };

  useEffect(() => {
    if (actualInputRef.current) {
      setTimeout(() => adjustTextareaHeight(actualInputRef.current!), 0);
    }
  }, []);

  const currentCollection = collections.find((c) => c.id === selectedCollection);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    onSearch(e);

    if (window.location.pathname === "/") {
      // Create new conversation
      const collectionName = currentCollection?.name;
      const conversationId = createConversation(query.trim(), collectionName);
      
      // Save query for history
      saveQuery(query, conversationId);
      
      // Navigate to chat page
      router.push(`/q/${conversationId}`);
    }
  };


  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative flex flex-col w-full">
        <div className="relative w-full bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-[#3a3a3a] rounded-xl overflow-hidden">
          <textarea
            ref={actualInputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              requestAnimationFrame(() => adjustTextareaHeight(e.target));
            }}
            onFocus={(e) => {
              onFocus?.();
              adjustTextareaHeight(e.target);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                if (query.trim()) handleSubmit(e);
                return;
              }
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (showSuggestions && suggestions.length > 0 && selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestions.length) {
                  onSuggestionSelect?.(suggestions[selectedSuggestionIndex]);
                  return;
                }
                if (query.trim()) handleSubmit(e);
              }
              if (showSuggestions && suggestions.length > 0 && setSelectedSuggestionIndex) {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setSelectedSuggestionIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : 0));
                }
              }
            }}
            placeholder={placeholder || "Ask me anything about the selected data set?"}
            className="w-full bg-transparent border-none px-4 pt-[0.825rem] pb-[0.825rem] pr-12 focus:outline-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none min-h-[48px] whitespace-pre-wrap break-words overflow-x-auto"
            style={{ height: "48px", overflowY: "hidden" }}
            rows={1}
          />

          <div className="absolute right-3 bottom-3 flex items-center gap-2">
            <Button
              type="submit"
              size="icon"
              className="h-9 w-9 bg-blue-600 hover:bg-blue-700 rounded-full"
              onClick={(e) => {
                if (query.trim()) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            >
              <Send size={16} className="text-white" />
            </Button>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-2 px-4 pb-3 bg-gray-50 dark:bg-[#252525]">
            {/* Collection Dropdown */}
          </div>
        </div>
      </div>
    </form>
  );
}
