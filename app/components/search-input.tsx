"use client";

import type React from "react";
import {useEffect, useRef, useState} from "react";
import {Button} from "@/components/ui/button";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu";

import {Check, ChevronDown, Folder, FoldersIcon, Send} from 'lucide-react';
import {useRouter} from "next/navigation";
import {saveQuery} from "@/utils/query-storage";
import {PillButton} from "./pill-button";
import {useToast} from "@/hooks/use-toast";
import {collections} from "@/data/collections";

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

const createSlug = (text: string): string => {
  const slug = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").slice(0, 50);
  const uniqueId = Math.random().toString(36).substring(2, 8).toString();
  return `${slug}-${uniqueId}`;
};

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
  setSelectedCollection,
}: SearchInputProps) {
  const [collectionDropdownOpen, setCollectionDropdownOpen] = useState(false);
  const router = useRouter();
  const localInputRef = useRef<HTMLTextAreaElement>(null);
  const actualInputRef = inputRef || localInputRef;
  const { toast } = useToast();

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
      const fullSlug = createSlug(query);
      saveQuery(query, fullSlug);
      router.push(`/q/${fullSlug}${selectedCollection ? `?collection=${selectedCollection}` : ""}`);
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
            <DropdownMenu open={collectionDropdownOpen} onOpenChange={setCollectionDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <PillButton
                  className="h-9 flex items-center gap-1"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowSuggestions?.(false);
                  }}
                >
                  <Folder size={14} className="text-gray-300" />
                  <span className="text-xs">{currentCollection ? currentCollection.name : "All Collections"}</span>
                  <ChevronDown size={14} className={`transition-transform ${collectionDropdownOpen ? "rotate-180" : ""}`} />
                </PillButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="!bg-white dark:!bg-[#2a2a2a] !border-gray-200 dark:!border-[#3a3a3a] !text-gray-900 dark:!text-white z-50 min-w-[200px]">
                <DropdownMenuItem
                  className="cursor-pointer !text-gray-900 dark:!text-white hover:!bg-gray-100 dark:hover:!bg-[#3a3a3a] focus:!bg-gray-100 dark:focus:!bg-[#3a3a3a] hover:!text-gray-900 dark:hover:!text-white focus:!text-gray-900 dark:focus:!text-white"
                  onClick={() => setSelectedCollection?.(undefined)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <FoldersIcon size={14} className="text-gray-500 dark:text-gray-300" />
                    <div className="flex-1 text-sm">All Collections</div>
                  </div>
                  {!currentCollection && <Check size={14} className="text-blue-500 dark:text-blue-400" />}
                </DropdownMenuItem>
                {collections.map((c) => (
                  <DropdownMenuItem
                    key={c.id}
                    className="cursor-pointer !text-gray-900 dark:!text-white hover:!bg-gray-100 dark:hover:!bg-[#3a3a3a] focus:!bg-gray-100 dark:focus:!bg-[#3a3a3a] hover:!text-gray-900 dark:hover:!text-white focus:!text-gray-900 dark:focus:!text-white"
                    onClick={() => setSelectedCollection?.(c.id)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Folder size={14} className="text-gray-500 dark:text-gray-300" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{c.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{c.documents.length} files</div>
                      </div>
                    </div>
                    {currentCollection?.id === c.id && <Check size={14} className="text-blue-500 dark:text-blue-400" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </form>
  );
}
