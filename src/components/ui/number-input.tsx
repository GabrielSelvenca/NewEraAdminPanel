"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
  showControls?: boolean;
}

const NumberInput = React.forwardRef<HTMLDivElement, NumberInputProps>(
  (
    {
      value,
      onChange,
      min = 0,
      max = Infinity,
      step = 1,
      prefix,
      suffix,
      decimals = 0,
      size = "md",
      disabled = false,
      className,
      showControls = true,
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [localValue, setLocalValue] = React.useState(value.toFixed(decimals));
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
      if (!isFocused) {
        setLocalValue(value.toFixed(decimals));
      }
    }, [value, decimals, isFocused]);

    const handleIncrement = () => {
      if (disabled) return;
      const newValue = Math.min(max, value + step);
      onChange(Number(newValue.toFixed(decimals)));
    };

    const handleDecrement = () => {
      if (disabled) return;
      const newValue = Math.max(min, value - step);
      onChange(Number(newValue.toFixed(decimals)));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/[^\d.,\-]/g, "").replace(",", ".");
      setLocalValue(rawValue);
    };

    const handleBlur = () => {
      setIsFocused(false);
      let parsedValue = parseFloat(localValue.replace(",", "."));
      
      if (isNaN(parsedValue)) {
        parsedValue = min;
      }
      
      parsedValue = Math.max(min, Math.min(max, parsedValue));
      onChange(Number(parsedValue.toFixed(decimals)));
      setLocalValue(parsedValue.toFixed(decimals));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        handleIncrement();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        handleDecrement();
      } else if (e.key === "Enter") {
        handleBlur();
        inputRef.current?.blur();
      }
    };

    const sizeClasses = {
      sm: "h-9 text-sm",
      md: "h-11 text-base",
      lg: "h-14 text-lg",
    };

    const buttonSizeClasses = {
      sm: "w-8 h-8",
      md: "w-9 h-9",
      lg: "w-11 h-11",
    };

    const iconSizeClasses = {
      sm: "w-3.5 h-3.5",
      md: "w-4 h-4",
      lg: "w-5 h-5",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex items-center gap-2",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        {/* Decrement Button */}
        {showControls && (
          <motion.button
            type="button"
            onClick={handleDecrement}
            disabled={disabled || value <= min}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              buttonSizeClasses[size],
              "flex items-center justify-center rounded-xl",
              "bg-zinc-800 border border-zinc-700",
              "text-zinc-400 hover:text-white hover:bg-zinc-700 hover:border-zinc-600",
              "transition-all duration-200",
              "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-zinc-800 disabled:hover:text-zinc-400"
            )}
          >
            <Minus className={iconSizeClasses[size]} />
          </motion.button>
        )}

        {/* Input Container */}
        <div
          className={cn(
            sizeClasses[size],
            "relative flex items-center rounded-xl overflow-hidden",
            "bg-zinc-900 border transition-all duration-200",
            isFocused
              ? "border-cyan-500 ring-2 ring-cyan-500/20"
              : "border-zinc-700 hover:border-zinc-600",
            !showControls && "flex-1"
          )}
        >
          {/* Prefix */}
          {prefix && (
            <span className="pl-3 pr-1 text-zinc-400 font-medium select-none">
              {prefix}
            </span>
          )}

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            value={localValue}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className={cn(
              "w-24 bg-transparent text-center font-semibold text-white outline-none",
              "placeholder:text-zinc-500",
              disabled && "cursor-not-allowed",
              prefix ? "pl-1" : "pl-3",
              suffix ? "pr-1" : "pr-3"
            )}
          />

          {/* Suffix */}
          {suffix && (
            <span className="pr-3 pl-1 text-zinc-400 font-medium select-none">
              {suffix}
            </span>
          )}

          {/* Glow effect on focus */}
          <AnimatePresence>
            {isFocused && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-emerald-500/5 pointer-events-none"
              />
            )}
          </AnimatePresence>
        </div>

        {/* Increment Button */}
        {showControls && (
          <motion.button
            type="button"
            onClick={handleIncrement}
            disabled={disabled || value >= max}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              buttonSizeClasses[size],
              "flex items-center justify-center rounded-xl",
              "bg-zinc-800 border border-zinc-700",
              "text-zinc-400 hover:text-white hover:bg-zinc-700 hover:border-zinc-600",
              "transition-all duration-200",
              "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-zinc-800 disabled:hover:text-zinc-400"
            )}
          >
            <Plus className={iconSizeClasses[size]} />
          </motion.button>
        )}
      </div>
    );
  }
);

NumberInput.displayName = "NumberInput";

export { NumberInput };
