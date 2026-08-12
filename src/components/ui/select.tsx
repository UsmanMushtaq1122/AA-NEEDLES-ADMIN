"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  placeholder?: string;
  onValueChange?: (value: string) => void;
}

/**
 * Recursively collect all <option> elements from children,
 * skipping wrapper components like SelectContent, SelectTrigger, SelectValue.
 */
function collectOptions(children: React.ReactNode): React.ReactNode[] {
  const options: React.ReactNode[] = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;

    // If it's a native <option>, keep it
    if (child.type === "option") {
      options.push(child);
      return;
    }

    // If it's SelectItem (renders <option>), keep the rendered output
    // SelectItem returns <option value={...}>{children}</option>
    const childType = child.type as any;
    if (childType?.displayName === "SelectItem" || childType === SelectItem) {
      const val = (child.props as any).value
      options.push(
        <option key={val} value={val}>
          {(child.props as any).children}
        </option>
      );
      return;
    }

    // For wrapper components (SelectContent, SelectTrigger, fragments), recurse
    if ((child.props as any)?.children) {
      options.push(...collectOptions((child.props as any).children));
    }
  });
  return options;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, placeholder, children, id, onValueChange, onChange, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e);
      onValueChange?.(e.target.value);
    };

    // Collect only valid <option> elements from all children
    const options = collectOptions(children);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="mb-1.5 block text-sm font-medium text-[#1A1A1A]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            className={cn(
              "flex h-10 w-full appearance-none rounded-lg border border-gray-200 bg-[#F5F0EB]/50 px-3 py-2 pr-10 text-sm text-[#1A1A1A] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/30 focus:border-[#C9A96E] disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-red-500 focus:ring-red-500/30 focus:border-red-500",
              className
            )}
            ref={ref}
            onChange={handleChange}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="bg-white text-[#1A1A1A]">
                {placeholder}
              </option>
            )}
            {options}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";

const SelectTrigger = Select;

const SelectValue = ({ placeholder }: { placeholder?: string }) => null;

function SelectContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <>{children}</>;
}

function SelectItem({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  return <option value={value}>{children}</option>;
}
SelectItem.displayName = "SelectItem";

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };

