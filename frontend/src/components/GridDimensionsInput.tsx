"use client";

interface GridDimensionsInputProps {
  rows: number | string;
  cols: number | string;
  onUpdate: (name: "rows" | "cols", value: string) => void;
  onBlur: () => void;
}

export default function GridDimensionsInput({
  rows,
  cols,
  onUpdate,
  onBlur,
}: GridDimensionsInputProps) {
  return (
    <div className="flex border-2 border-black divide-x-2 divide-black overflow-hidden bg-white">
      {/* rows field */}
      <div className="flex items-center flex-1 px-3 gap-2 group transition-colors focus-within:bg-zinc-100">
        <input
          name="rows"
          type="number"
          value={rows}
          onChange={(e) => onUpdate("rows", e.target.value)}
          onBlur={onBlur}
          className="w-full py-2 outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span className="text-[9px] font-black opacity-30 select-none">
          ROWS
        </span>
      </div>

      {/* cols field */}
      <div className="flex items-center flex-1 px-3 gap-2 group transition-colors focus-within:bg-zinc-100">
        <input
          name="cols"
          type="number"
          value={cols}
          onChange={(e) => onUpdate("cols", e.target.value)}
          onBlur={onBlur}
          className="w-full py-2 outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span className="text-[9px] font-black opacity-30 select-none">
          COLS
        </span>
      </div>
    </div>
  );
}
