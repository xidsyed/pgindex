import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { forwardRef, useEffect, useState } from "react"


interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: number | undefined | null
  onChange: (value: number | undefined) => void
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, className, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState("")

    // Sync external value to display value
    useEffect(() => {
      if (value === undefined || value === null) {
        setDisplayValue("")
      } else {
        setDisplayValue(value.toLocaleString("en-IN"))
      }
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value
      
      // Allow only digits and commas (but we strip commas to parse)
      const rawValue = inputValue.replace(/[^0-9]/g, "")
      
      // Update display immediately (though effect validates it, this makes typing responsive)
      // Actually, standard controlled input pattern:
      // We parse rawValue to number.
      if (rawValue === "") {
        onChange(undefined)
        setDisplayValue("")
      } else {
        const numberValue = parseInt(rawValue, 10)
        if (!isNaN(numberValue)) {
            onChange(numberValue)
            // Cursor management is tricky with formatting, so we might just show raw digits while typing?
            // Simple approach: Set display value to formatted string immediately?
            // This jumps the cursor if inserting in middle.
            // For this use case (Rent), usually typing at end.
            setDisplayValue(numberValue.toLocaleString("en-IN"))
        }
      }
    }

    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">₹</span>
        <Input
          {...props}
          ref={ref}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          className={cn("pl-7", className)}
        />
      </div>
    )
  }
)
CurrencyInput.displayName = "CurrencyInput"
