
import React from "react";

interface NumericBoxGroupProps {
  value?: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
}

export const NumericBoxGroup: React.FC<NumericBoxGroupProps> = ({ value = 0, onChange, readOnly = false }) => {
  const handleSelect = (val: number) => {
    if (!readOnly && onChange) onChange(val);
  };

  return (
    <div className="flex gap-2">
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
            ${num === value ? (readOnly ? "bg-primary/30 text-primary font-bold" : "bg-primary text-white font-bold") : ""}
            transition-colors duration-100
            focus:outline-none focus:ring-2 focus:ring-primary
            cursor-pointer
          `}
          aria-pressed={num === value}
        >
          {num}
        </button>
      ))}
    </div>
  );
};

export default NumericBoxGroup;
