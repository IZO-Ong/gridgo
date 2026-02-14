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

export default function AlgorithmSelect({
  value,
  onChange,
  options,
}: AlgorithmSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  return (
    <div
      className="relative border-2 border-black bg-white font-mono"
      ref={ref}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2 pr-8 text-left flex justify-between items-center focus:bg-zinc-100"
      >
        <span>{options.find((o) => o.id === value)?.label}</span>
        <span className={`transition-transform ${isOpen ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+2px)] left-[-2px] w-[calc(100%+4px)] border-2 border-black bg-white z-50">
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                onChange(opt.id);
                setIsOpen(false);
              }}
              className="w-full p-2 text-left hover:bg-black hover:text-white transition-colors"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
