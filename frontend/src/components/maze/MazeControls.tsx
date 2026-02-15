"use client";
import { useState, useRef } from "react";
import AlgorithmSelect from "@/components/ui/AlgorithmSelect";
import GridDimensionsInput from "@/components/ui/GridDimensionsInput";

interface MazeControlsProps {
  genType: string;
  setGenType: (val: string) => void;
  dims: { rows: number; cols: number };
  updateDim: (dim: "rows" | "cols", val: number) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement> | File) => void;
  selectedFile: File | null;
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
  selectedFile,
  onSubmit,
  loading,
  isSubmitDisabled,
  algorithms,
}: MazeControlsProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true);
    else if (e.type === "dragleave") setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-12 gap-6 items-end">
      <input type="hidden" name="type" value={genType} />

      <div className="col-span-3 space-y-2">
        <label className="block font-bold uppercase tracking-widest text-[10px]">
          Grid_Dimensions [2-300]
        </label>
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

      <div
        className={`col-span-5 space-y-2 transition-all ${
          genType === "image"
            ? "opacity-100"
            : "opacity-0 pointer-events-none hidden"
        }`}
      >
        <label className="block font-bold text-[10px] uppercase tracking-widest">
          Source_Image
        </label>
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative w-full h-[38px] border-2 border-dashed flex items-stretch transition-colors cursor-pointer bg-white ${
            isDragging ? "bg-zinc-100" : ""
          }`}
        >
          <input
            ref={fileInputRef}
            name="image"
            type="file"
            accept="image/*"
            onChange={(e) => onImageChange(e)}
            className="hidden"
          />
          <div className="flex-1 flex items-center px-3 min-w-0">
            <span className="truncate text-[10px] font-bold uppercase tracking-tight">
              {selectedFile ? selectedFile.name : "Select or drop image"}
            </span>
          </div>
          <div className="border-l-2 border-black bg-black text-white px-3 flex items-center text-[10px] font-black uppercase tracking-tighter">
            Browse
          </div>
        </div>
      </div>

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
