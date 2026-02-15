interface GridDimensionsInputProps {
  rows: number;
  cols: number;
  onUpdate: (dim: "rows" | "cols", val: number) => void;
  onBlur?: () => void;
}

export default function GridDimensionsInput({
  rows,
  cols,
  onUpdate,
  onBlur,
}: GridDimensionsInputProps) {
  return (
    <div className="flex border-2 border-black bg-white h-[38px] divide-x-2 divide-black">
      <div className="relative flex-1 flex items-center group">
        <input
          name="rows"
          type="number"
          value={rows}
          onChange={(e) => onUpdate("rows", Number(e.target.value))}
          onBlur={onBlur}
          className="w-full h-full pl-3 pr-10 outline-none font-bold text-sm bg-transparent focus:bg-zinc-50 transition-colors"
        />
        <span className="absolute right-2 text-[9px] font-black text-zinc-300 uppercase pointer-events-none tracking-tighter">
          Rows
        </span>
      </div>

      <div className="relative flex-1 flex items-center group">
        <input
          name="cols"
          type="number"
          value={cols}
          onChange={(e) => onUpdate("cols", Number(e.target.value))}
          onBlur={onBlur}
          className="w-full h-full pl-3 pr-10 outline-none font-bold text-sm bg-transparent focus:bg-zinc-50 transition-colors"
        />
        <span className="absolute right-2 text-[9px] font-black text-zinc-300 uppercase pointer-events-none tracking-tighter">
          Cols
        </span>
      </div>
    </div>
  );
}
