import { Search, X } from "lucide-react";
import { useLayout } from "@/context/LayoutContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function GlobalSearch() {
  const { searchQuery, setSearchQuery, searchResults, scrollToSemester } = useLayout();
  const [inputValue, setInputValue] = useState(searchQuery);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(inputValue);
      setShowResults(inputValue.trim().length > 0);
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, setSearchQuery]);

  // Close results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClear = () => {
    setInputValue("");
    setSearchQuery("");
    setShowResults(false);
  };

  const handleResultClick = (semesterId: string) => {
    scrollToSemester(semesterId);
    setShowResults(false);
  };

  return (
    <div ref={searchRef} className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search courses, semesters, or grades..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setShowResults(inputValue.trim().length > 0)}
          className="pl-9 pr-9 h-10 bg-secondary/50 border-border/5 focus-visible:ring-primary/30"
        />
        {inputValue && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Results Dropdown */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border/5 rounded-[1rem] shadow-tonal dark:shadow-ambient max-h-[300px] overflow-y-auto z-50">
          {searchResults.slice(0, 10).map((result, index) => (
            <button
              key={`${result.semesterId}-${result.courseId || index}`}
              onClick={() => handleResultClick(result.semesterId)}
              className={cn(
                "w-full px-4 py-3 text-left hover:bg-secondary/50 transition-colors",
                "flex items-start gap-3 border-b border-border/5 last:border-0"
              )}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{result.match}</p>
                <p className="text-xs text-muted-foreground">
                  {result.type === "course" ? "Course" : "Semester"}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {showResults && searchQuery && searchResults.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border/5 rounded-[1rem] shadow-tonal dark:shadow-ambient p-4 z-50">
          <p className="text-sm text-muted-foreground text-center">
            No results found for "{searchQuery}"
          </p>
        </div>
      )}
    </div>
  );
}
