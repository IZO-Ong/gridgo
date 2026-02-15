"use client";
import AlgorithmSelect from "@/components/ui/AlgorithmSelect";
import GridDimensionsInput from "@/components/ui/GridDimensionsInput";

interface MazeControlsProps {
  genType: string;
  setGenType: (val: string) => void;
  dims: { rows: number; cols: number };
  updateDim: (dim: "rows" | "cols", val: number) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  loading: boolean;
  isSubmitDisabled: boolean;
  algorithms: { id: string; label: string }[];
}

export default function MazeControls({
  genType,
  setGenType,
  dims,
  updateDim,
  onImageChange,
  onSubmit,
  loading,
  isSubmitDisabled,
  algorithms,
}: MazeControlsProps) {
  return (
    <form onSubmit={onSubmit} className="grid grid-cols-12 gap-6 items-end">
      <input type="hidden" name="type" value={genType} />

      <div className="col-span-3 space-y-2">
        <label className="block font-bold">GRID_DIMENSIONS [2-300]</label>
        <GridDimensionsInput
          rows={dims.rows}
          cols={dims.cols}
          onUpdate={updateDim}
        />
      </div>

      <div className="col-span-4 space-y-2">
        <label className="block font-bold uppercase tracking-widest text-[10px]">
          Algorithm
        </label>
        <AlgorithmSelect
          value={genType}
          onChange={setGenType}
          options={algorithms}
        />
      </div>

      {genType === "image" && (
        <div className="col-span-5 space-y-2 animate-in fade-in slide-in-from-left-2">
          <label className="block font-bold text-[10px] uppercase tracking-widest">
            Source_Image
          </label>
          <input
            name="image"
            type="file"
            accept="image/*"
            onChange={onImageChange}
            className="w-full border-2 border-black p-[5px] text-xs file:bg-black file:text-white file:border-none file:px-3 file:py-1 cursor-pointer"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitDisabled}
        className={`col-span-12 border-2 border-black p-4 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex justify-start pl-8 ${
          isSubmitDisabled
            ? "bg-zinc-100 text-zinc-400 opacity-50"
            : "bg-white hover:bg-black hover:text-white active:shadow-none active:translate-y-1 cursor-pointer"
        }`}
      >
        {loading ? ">>> PROCESSING..." : ">>> GENERATE"}
      </button>
    </form>
  );
}
