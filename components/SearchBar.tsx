"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export default function SearchBar() {
  const [query, setQuery] = useState("");

  return (
    <div className="relative group mx-auto w-full max-w-2xl">
      <div className="absolute -inset-1 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="relative flex items-center bg-white/60 backdrop-blur-md border border-border/60 rounded-full shadow-soft h-14 sm:h-16 px-3 sm:px-4 focus-within:ring-2 focus-within:ring-primary/30 focus-within:ring-offset-2 focus-within:ring-offset-background transition-all duration-500">
        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center mr-2 sm:mr-4 transition-all duration-500 group-hover:bg-primary group-hover:text-primary-foreground text-primary">
          <Search size={22} strokeWidth={2.5} className="transition-colors duration-500" />
        </div>
        <input
          type="text"
          className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-base sm:text-lg px-2"
          placeholder="지역명으로 검색해보세요 (예: 강남구, 서초구)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="bg-primary text-primary-foreground px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-medium text-sm sm:text-base hover:scale-105 active:scale-95 transition-all duration-300 shadow-soft hover:shadow-[0_6px_24px_-4px_rgba(93,112,82,0.25)] ml-2">
          검색
        </button>
      </div>
    </div>
  );
}
