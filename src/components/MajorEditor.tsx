import { useState, useEffect } from "react";
import { Edit2, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MajorEditorProps {
  major?: string;
  onUpdate: (major: string) => void;
  className?: string;
}

export function MajorEditor({ major, onUpdate, className }: MajorEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(major || "");

  // Sync editValue when major prop changes (e.g., after transcript parsing)
  useEffect(() => {
    if (!isEditing) {
      setEditValue(major || "");
    }
  }, [major, isEditing]);

  const handleSave = () => {
    if (editValue.trim() !== major) {
      onUpdate(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(major || "");
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your major"
          className="h-8 text-sm"
          autoFocus
        />
        <div className="flex gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSave}
            className="h-7 w-7 hover:bg-primary/10 hover:text-primary"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className={cn(
        "group flex items-center justify-between gap-2 w-full cursor-text",
        "px-2 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary",
        "transition-colors text-left",
        className
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
          Major
        </p>
        <p className="text-sm font-medium whitespace-normal break-words leading-snug">
          {major || "Not set"}
        </p>
      </div>
      <Edit2 className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </button>
  );
}
