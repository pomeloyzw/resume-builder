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

interface MonthYearPickerProps {
  value?: string; // Expects YYYY-MM
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function MonthYearPicker({ value, onChange, disabled }: MonthYearPickerProps) {
  const [open, setOpen] = React.useState(false)
  const [currentYear, setCurrentYear] = React.useState<number>(() => {
    if (value && /^\d{4}-\d{2}$/.test(value)) {
      return parseInt(value.split('-')[0])
    }
    return new Date().getFullYear();
  })

  // Sync internal year view with incoming value if it changes
  React.useEffect(() => {
    if (value && /^\d{4}-\d{2}$/.test(value)) {
      setCurrentYear(parseInt(value.split('-')[0]));
    }
  }, [value]);

  const selectedMonthStr = value && /^\d{4}-\d{2}$/.test(value) ? value : null;

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
