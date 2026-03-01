import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

function normalizeToYYYYMM(val?: string): string | null {
  if (!val) return null;
  val = val.trim();
  if (/^\d{4}-\d{2}$/.test(val)) return val;

  const str = val.toLowerCase();
  const yearMatch = str.match(/\b(20\d{2}|19\d{2})\b/);
  if (!yearMatch) return null;
  const year = yearMatch[1];

  let monthIndex = -1;
  const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  for (let i = 0; i < monthNames.length; i++) {
    if (str.includes(monthNames[i])) {
      monthIndex = i;
      break;
    }
  }

  if (monthIndex === -1) {
    const slashMatch = str.match(/\b(\d{1,2})\/\d{4}\b/);
    if (slashMatch) {
      const p = parseInt(slashMatch[1], 10);
      if (p >= 1 && p <= 12) monthIndex = p - 1;
    }
  }

  if (monthIndex !== -1) {
    return `${year}-${(monthIndex + 1).toString().padStart(2, '0')}`;
  }

  return `${year}-01`;
}

interface MonthYearPickerProps {
  value?: string; // Expects YYYY-MM, but now handles varied inputs gracefully
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function MonthYearPicker({ value, onChange, disabled }: MonthYearPickerProps) {
  const [open, setOpen] = React.useState(false)

  const normalizedValue = React.useMemo(() => normalizeToYYYYMM(value), [value]);

  const [currentYear, setCurrentYear] = React.useState<number>(() => {
    if (normalizedValue) {
      return parseInt(normalizedValue.split('-')[0], 10);
    }
    return new Date().getFullYear();
  })

  // Sync internal year view with incoming value if it changes
  React.useEffect(() => {
    if (normalizedValue) {
      setCurrentYear(parseInt(normalizedValue.split('-')[0], 10));
    }
  }, [normalizedValue]);

  const selectedMonthStr = normalizedValue;

  const handleMonthSelect = (monthIndex: number) => {
    const paddedMonth = (monthIndex + 1).toString().padStart(2, '0');
    onChange(`${currentYear}-${paddedMonth}`);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal h-auto py-2.5 px-3 border-gray-300 shadow-none hover:bg-gray-50 focus:ring-1 focus:ring-blue-500",
            !selectedMonthStr && "text-gray-400",
            disabled && "bg-gray-100 opacity-50 cursor-not-allowed"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
          {selectedMonthStr ? (
            format(new Date(parseInt(selectedMonthStr.split('-')[0]), parseInt(selectedMonthStr.split('-')[1]) - 1), "MMM yyyy")
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3 z-[110]" align="start">
        <div className="flex items-center justify-between pt-1 pb-4">
          <Button
            variant="outline"
            className="h-8 w-8 bg-transparent p-0 text-gray-600 hover:text-gray-900 cursor-pointer"
            onClick={() => setCurrentYear(y => y - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-semibold text-gray-900">{currentYear}</div>
          <Button
            variant="outline"
            className="h-8 w-8 bg-transparent p-0 text-gray-600 hover:text-gray-900 cursor-pointer"
            onClick={() => setCurrentYear(y => y + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {MONTHS.map((month, idx) => {
            const isSelected = selectedMonthStr === `${currentYear}-${(idx + 1).toString().padStart(2, '0')}`;
            return (
              <Button
                key={month}
                variant={isSelected ? "default" : "ghost"}
                className={cn(
                  "h-9 w-full text-xs font-medium cursor-pointer",
                  isSelected ? "bg-blue-600 text-white hover:bg-blue-700" : "hover:bg-blue-100 hover:text-blue-900 text-gray-700"
                )}
                onClick={() => handleMonthSelect(idx)}
              >
                {month}
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
