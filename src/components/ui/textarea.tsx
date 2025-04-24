
import * as React from "react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxHeight?: number;
  scrollable?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, maxHeight, scrollable = false, ...props }, ref) => {
    const textAreaStyles = cn(
      "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    );

    if (scrollable) {
      return (
        <ScrollArea className={cn("w-full", maxHeight ? `max-h-[${maxHeight}px]` : "max-h-[200px]")}>
          <textarea
            className={textAreaStyles}
            ref={ref}
            {...props}
          />
        </ScrollArea>
      );
    }

    return (
      <textarea
        className={cn(textAreaStyles, maxHeight ? `max-h-[${maxHeight}px]` : "")}
        ref={ref}
        {...props}
      />
    );
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
