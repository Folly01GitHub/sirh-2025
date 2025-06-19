
import React, { useState, useEffect, useRef } from "react";
import { Input } from "./input";
import { ChevronDown } from "lucide-react";

interface SearchableSelectProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch?: (query: string) => void;
  options: { label: string; value: string }[];
  loading?: boolean;
  disabled?: boolean;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  placeholder = "",
  value,
  onChange,
  onSearch,
  options,
  loading,
  disabled,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Sync value to label
  const selectedOption = options.find(opt => opt.value === value);

  // Debounced search for remote/autocomplete mode
  useEffect(() => {
    const handler = setTimeout(() => {
      if (onSearch) onSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search, onSearch]);

  // Simple filter for local list when onSearch is not supplied
  const visibleOptions = onSearch
    ? options
    : options.filter(
        opt =>
          opt.label.toLowerCase().includes(search.toLowerCase()) ||
          String(opt.value).toLowerCase().includes(search.toLowerCase())
      );

  return (
    <div className="w-full relative" ref={containerRef}>
      {label && <label className="block mb-1 text-sm">{label}</label>}
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className={`flex items-center justify-between w-full border rounded h-10 px-3 py-2 text-sm bg-background ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        tabIndex={0}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selectedOption ? "" : "text-muted-foreground"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className="w-4 h-4 ml-2 opacity-60" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 bg-white border rounded w-full shadow max-h-64 overflow-auto animate-fade-in">
          <div className="p-2">
            <Input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="mb-2"
              placeholder={placeholder}
              disabled={disabled}
            />
          </div>
          {loading ? (
            <div className="px-4 py-2 text-muted-foreground text-sm">Chargement…</div>
          ) : visibleOptions.length === 0 ? (
            <div className="px-4 py-2 text-muted-foreground text-sm">Aucun résultat</div>
          ) : (
            visibleOptions.map(opt => (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                  setSearch("");
                }}
                className={`px-4 py-2 text-sm cursor-pointer hover:bg-primary/10 ${
                  value === opt.value ? "bg-primary/10" : ""
                }`}
                role="option"
                aria-selected={value === opt.value}
              >
                {opt.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
