import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from "react";

// Types for search results
export interface SearchResult {
  type: "course" | "semester";
  semesterId: string;
  courseId?: string;
  match: string;
}

export type FilterType = "all" | "completed" | "planned";

// Layout context state
interface LayoutContextState {
  // Sidebar state
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Mobile nav state
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;

  // Search state
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: SearchResult[];
  setSearchResults: (results: SearchResult[]) => void;

  // Filter state
  activeFilter: FilterType;
  setActiveFilter: (filter: FilterType) => void;

  // Highlight state for search matches
  highlightedCourses: Set<string>;
  setHighlightedCourses: (courses: Set<string>) => void;
  highlightedSemesters: Set<string>;
  setHighlightedSemesters: (semesters: Set<string>) => void;

  // Scroll refs for semester cards
  semesterRefs: Map<string, HTMLDivElement>;
  registerSemesterRef: (id: string, element: HTMLDivElement | null) => void;

  // Active section tracking (for breadcrumbs)
  activeSection: string | null;
  setActiveSection: (section: string | null) => void;

  // Scroll to semester
  scrollToSemester: (semesterId: string) => void;

  // Mobile search toggle (from bottom tab bar)
  mobileSearchOpen: boolean;
  setMobileSearchOpen: (open: boolean) => void;
}

const LayoutContext = createContext<LayoutContextState | undefined>(undefined);

// Custom hook to use layout context
export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout must be used within LayoutProvider");
  }
  return context;
}

// Provider component
interface LayoutProviderProps {
  children: ReactNode;
}

export function LayoutProvider({ children }: LayoutProviderProps) {
  // Sidebar state - detect screen size for initial collapsed state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 1280 && window.innerWidth >= 1024;
    }
    return false;
  });

  // Mobile nav state
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // Filter state
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  // Highlight state
  const [highlightedCourses, setHighlightedCourses] = useState<Set<string>>(new Set());
  const [highlightedSemesters, setHighlightedSemesters] = useState<Set<string>>(new Set());

  // Semester refs
  const semesterRefsRef = useRef<Map<string, HTMLDivElement>>(new Map());

  // Active section
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Mobile search toggle (from bottom tab bar)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Register semester ref
  const registerSemesterRef = useCallback((id: string, element: HTMLDivElement | null) => {
    if (element) {
      semesterRefsRef.current.set(id, element);
      return;
    }
    semesterRefsRef.current.delete(id);
  }, []);

  // Scroll to semester
  const scrollToSemester = useCallback((semesterId: string) => {
    const element = semesterRefsRef.current.get(semesterId);
    if (element) {
      const headerOffset = 100; // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  }, []);

  // Handle responsive sidebar collapse based on viewport
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      // Auto-collapse between 1024-1280px
      if (width < 1280 && width >= 1024) {
        setSidebarCollapsed(true);
      } else if (width >= 1280) {
        setSidebarCollapsed(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const value: LayoutContextState = {
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileNavOpen,
    setMobileNavOpen,
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    activeFilter,
    setActiveFilter,
    highlightedCourses,
    setHighlightedCourses,
    highlightedSemesters,
    setHighlightedSemesters,
    semesterRefs: semesterRefsRef.current,
    registerSemesterRef,
    activeSection,
    setActiveSection,
    scrollToSemester,
    mobileSearchOpen,
    setMobileSearchOpen,
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
}
