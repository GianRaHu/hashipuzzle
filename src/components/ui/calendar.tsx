import * as React from "react"
import { Calendar as CalendarPrimitive } from "react-day-picker"

import { cn } from "@/lib/utils"

const Calendar = React.forwardRef<
  React.ElementRef<typeof CalendarPrimitive>,
  React.ComponentPropsWithoutRef<typeof CalendarPrimitive>
>(({ className, classNames, showOutsideDays = true, ...props }, ref) => (
  <CalendarPrimitive
    ref={ref}
    className={cn(
      "p-3",
      className
    )}
    classNames={{
      day: cn(
        "h-9 w-9 p-0 text-center text-sm focus:outline-none focus:ring-ring focus:ring-offset-2 transition-colors hover:bg-accent hover:text-accent-foreground data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[disabled]:opacity-50 data-[disabled]:pointer-events-none data-[today]:ring-1 data-[today]:ring-ring"
      ),
      day_outside: cn(
        "day-outside text-muted-foreground opacity-50 data-[selected]:bg-accent data-[selected]:text-accent-foreground data-[disabled]:opacity-50 data-[disabled]:pointer-events-none"
      ),
      day_today: cn("day-today"),
      day_selected: cn("day-selected"),
      day_disabled: cn("day-disabled"),
      day_range_end: cn("day-range-end"),
      day_range_start: cn("day-range-start"),
      caption: cn("flex justify-center pt-1 relative items-center"),
      caption_label: cn("text-sm font-medium"),
      nav: cn(
        "space-x-1 flex items-center",
      ),
      nav_button: cn(
        "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
      ),
      nav_button_previous: cn("nav-button-previous absolute left-1"),
      nav_button_next: cn("nav-button-next absolute right-1"),
      table: cn("w-full border-collapse space-y-1"),
      head_row: cn("head-row"),
      head_cell: cn(
        "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]"
      ),
      row: cn("row"),
      cell: cn("cell"),
      footer: cn("mt-2 flex justify-center")
    }}
    {...props}
  />
))
Calendar.displayName = "Calendar"

export { Calendar }
