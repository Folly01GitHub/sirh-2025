
import React from "react";

interface NumericBoxGroupProps {
  value?: number | string;
  onChange?: (value: number | string) => void;
  readOnly?: boolean;
}

export const NumericBoxGroup: React.FC<NumericBoxGroupProps> = ({ value, onChange, readOnly = false }) => {
  const handleSelect = (val: number | string) => {
    if (!readOnly && onChange) onChange(val);
  };

  const isSelected = (val: number | string) => {
    // Handle "N/A" case
    if (val === "N/A" && value === "N/A") {
      return true;
    }
    
    // For numeric values, convert both to numbers for comparison
    if (typeof val === 'number' && value !== "N/A") {
      const numericValue = typeof value === 'string' ? parseFloat(value) : value;
      return numericValue === val;
    }
    
    return false;
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {[1, 2, 3, 4, 5].map((num) => (
        <button
          key={num}
          type="button"
          disabled={readOnly}
          tabIndex={readOnly ? -1 : 0}
          onClick={() => handleSelect(num)}
          className={`
            w-9 h-9 flex items-center justify-center rounded border text-base font-semibold
            ${readOnly ? "border-gray-300 bg-gray-100 text-gray-400" : "border-primary"}
            ${isSelected(num) ? (readOnly ? "bg-primary/30 text-primary font-bold" : "bg-primary text-white font-bold") : ""}
            transition-colors duration-100
            focus:outline-none focus:ring-2 focus:ring-primary
            cursor-pointer
            ${!readOnly && !isSelected(num) ? "hover:bg-primary/10" : ""}
          `}
          aria-pressed={isSelected(num)}
        >
          {num}
        </button>
      ))}
      <button
        key="na"
        type="button"
        disabled={readOnly}
        tabIndex={readOnly ? -1 : 0}
        onClick={() => handleSelect("N/A")}
        className={`
          px-3 h-9 flex items-center justify-center rounded border text-sm font-semibold
          ${readOnly ? "border-gray-300 bg-gray-100 text-gray-400" : "border-orange-400"}
          ${isSelected("N/A") ? (readOnly ? "bg-orange-400/30 text-orange-600 font-bold" : "bg-orange-400 text-white font-bold") : "text-orange-600"}
          transition-colors duration-100
          focus:outline-none focus:ring-2 focus:ring-orange-400
          cursor-pointer
          ${!readOnly && !isSelected("N/A") ? "hover:bg-orange-400/10" : ""}
        `}
        aria-pressed={isSelected("N/A")}
      >
        N/A
      </button>
    </div>
  );
};

export default NumericBoxGroup;
