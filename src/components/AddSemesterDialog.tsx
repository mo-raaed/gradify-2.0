import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddSemesterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddSemester: (name: string) => void;
  existingSemesterCount?: number;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => {
  const year = currentYear - 5 + i;
  return `${year}/${(year + 1).toString().slice(-2)}`;
});

const terms = ["Fall", "Winter", "Spring", "Summer"];

export function AddSemesterDialog({
  open,
  onOpenChange,
  onAddSemester,
}: AddSemesterDialogProps) {
  const [year, setYear] = useState(years[5]); // Current year
  const [term, setTerm] = useState("Fall");
  const [customName, setCustomName] = useState("");
  const [useCustom, setUseCustom] = useState(false);

  const handleSubmit = () => {
    const name = useCustom && customName.trim()
      ? customName.trim()
      : `${year} ${term}`;

    onAddSemester(name);
    onOpenChange(false);

    // Reset form
    setYear(years[5]);
    setTerm("Fall");
    setCustomName("");
    setUseCustom(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Add Semester</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!useCustom ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Academic Year</Label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger id="year">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="term">Term</Label>
                <Select value={term} onValueChange={setTerm}>
                  <SelectTrigger id="term">
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    {terms.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="custom-name">Semester Name</Label>
              <Input
                id="custom-name"
                placeholder="e.g., Summer Abroad 2024"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
              />
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setUseCustom(!useCustom)}
            className="text-muted-foreground"
          >
            {useCustom ? "Use standard format" : "Use custom name"}
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add Semester</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
