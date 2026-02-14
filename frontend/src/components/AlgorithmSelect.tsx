"use client";
import { useState, useRef, useEffect } from "react";

interface AlgorithmOption {
  id: string;
  label: string;
}

interface AlgorithmSelectProps {
  value: string;
  onChange: (id: string) => void;
  options: AlgorithmOption[];
}

/**
 * A custom brutalist dropdown to bypass OS-native styling.
 * Ensures font-mono and custom cursor consistency.
 */
export default function AlgorithmSelect({
  value,
  onChange,
  options,
}: AlgorithmSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown when user clicks outside the component
  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  return (
    <div
      className="relative border-2 border-black bg-white font-mono"
      ref={ref}
    >
      {/* Main Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2 pr-10 text-left flex justify-between items-center focus:bg-zinc-50 transition-colors cursor-pointer"
      >
        <span className="truncate">
          {options.find((o) => o.id === value)?.label}
        </span>

        {/* Fixed SVG Arrow centered vertically */}
        <div className="absolute right-2 top-0 bottom-0 flex items-center pointer-events-none">
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+2px)] left-[-2px] w-[calc(100%+4px)] border-2 border-black bg-white z-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                onChange(opt.id);
                setIsOpen(false);
              }}
              className="w-full p-2 text-left hover:bg-black hover:text-white transition-colors cursor-pointer"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
