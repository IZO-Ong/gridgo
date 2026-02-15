"use client";
import { useState } from "react";
import MazeCanvas from "@/components/MazeCanvas";
import AlgorithmSelect from "@/components/AlgorithmSelect";
import GridDimensionsInput from "@/components/GridDimensionsInput"; // New Import
import { useImageDimensions } from "@/hooks/useImageDimensions";
import { useMazeGeneration } from "@/hooks/useMazeGeneration";

const ALGORITHMS = [
  { id: "image", label: "IMAGE_KRUSKAL" },
  { id: "kruskal", label: "RANDOM_KRUSKAL" },
  { id: "recursive", label: "DFS_BACKTRACKER" },
];

export default function Home() {
  const { maze, loading, error, executeGeneration, setError } =
    useMazeGeneration();
  const [genType, setGenType] = useState("image");
  const [hasImage, setHasImage] = useState(false);
  const { dims, updateDim, clampDimensions, handleImageChange } =
    useImageDimensions();

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageChange(e);
    setHasImage(!!e.target.files?.[0]);
  };

  const isSubmitDisabled = loading || (genType === "image" && !hasImage);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clampDimensions();

    const formData = new FormData(e.currentTarget);
    const rows = parseInt(formData.get("rows") as string);
    const cols = parseInt(formData.get("cols") as string);

    if (rows < 2 || rows > 300 || cols < 2 || cols > 300) {
      setError("OUT_OF_BOUNDS: Range is 2-300");
      return;
    }

    if (genType === "image" && !formData.get("image")) {
      setError("IMAGE_REQUIRED");
      return;
    }

    await executeGeneration(formData);
  };

  return (
    <main className="p-8 bg-white min-h-screen font-mono text-sm text-black">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="border-b-4 border-black pb-2">
          <h1 className="text-2xl font-black uppercase tracking-tighter">
            GridGo
          </h1>
        </header>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-12 gap-6 items-end"
        >
          <input type="hidden" name="type" value={genType} />

          <div className="col-span-3 space-y-2">
            <label className="block font-bold">GRID_DIMENSIONS [2-300]</label>
            <GridDimensionsInput
              rows={dims.rows}
              cols={dims.cols}
              onUpdate={updateDim}
              onBlur={clampDimensions}
            />
          </div>

          <div className="col-span-4 space-y-2">
            <label className="block font-bold uppercase tracking-widest text-[10px]">
              Algorithm
            </label>
            <AlgorithmSelect
              value={genType}
              onChange={setGenType}
              options={ALGORITHMS}
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
            className={`col-span-12 border-2 border-black p-4 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex justify-start pl-8 ${isSubmitDisabled ? "bg-zinc-100 text-zinc-400 opacity-50" : "bg-white hover:bg-black hover:text-white active:shadow-none active:translate-y-1 cursor-pointer"}`}
          >
            {loading ? ">>> PROCESSING..." : ">>> GENERATE"}
          </button>
        </form>

        {error && (
          <div className="col-span-12 p-3 bg-red-50 border-2 border-red-600 text-red-600 font-bold animate-in fade-in slide-in-from-top-1 uppercase">
            {`>> ERROR: ${error}`}
          </div>
        )}

        <section className="relative border-4 border-black h-[750px] bg-zinc-50 overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col">
          <div className="h-7 border-b-2 border-black bg-white flex items-center px-3 justify-between z-30 shrink-0">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold tracking-widest uppercase tabular-nums">
                MAZE_OUTPUT
              </span>
              <span className="text-[10px] opacity-30 font-bold uppercase">
                DIM:{" "}
                {maze
                  ? `${maze.rows}x${maze.cols}`
                  : `${dims.rows}x${dims.cols}`}
              </span>
            </div>
          </div>

          <div className="relative flex-1 bg-white overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.05] pointer-events-none" />

            {maze ? (
              <MazeCanvas maze={maze} />
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center space-y-2">
                <p className="opacity-20 tracking-[0.5em] font-bold uppercase text-2xl select-none">
                  System_Idle
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
