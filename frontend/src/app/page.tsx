"use client";
import { useState } from "react";
import { generateMaze } from "@/lib/api";
import MazeCanvas from "@/components/MazeCanvas";
import AlgorithmSelect from "@/components/AlgorithmSelect";
import { useImageDimensions } from "@/hooks/useImageDimensions";

const ALGORITHMS = [
  { id: "image", label: "IMAGE_KRUSKAL" },
  { id: "kruskal", label: "RANDOM_KRUSKAL" },
  { id: "recursive", label: "DFS_BACKTRACKER" },
];

export default function Home() {
  const [maze, setMaze] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);

      if (genType === "image" && !formData.get("image")) {
        throw new Error("IMAGE_REQUIRED");
      }

      const data = await generateMaze(formData);
      setMaze(data);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.message || "SYSTEM_FAILURE";
      if (errorMessage !== error) {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
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
            <label className="block font-bold">GRID_DIMENSIONS [2-500]</label>
            <div className="flex border-2 border-black divide-x-2 divide-black">
              <input
                name="rows"
                type="number"
                min="2"
                max="500"
                value={dims.rows}
                onChange={(e) => updateDim("rows", e.target.value)}
                onBlur={clampDimensions}
                className="w-full p-2 outline-none focus:bg-zinc-100 bg-transparent transition-colors"
              />
              <input
                name="cols"
                type="number"
                min="2"
                max="500"
                value={dims.cols}
                onChange={(e) => updateDim("cols", e.target.value)}
                onBlur={clampDimensions}
                className="w-full p-2 outline-none focus:bg-zinc-100 bg-transparent transition-colors"
              />
            </div>
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
              <label className="block font-bold">SOURCE_IMAGE</label>
              <input
                name="image"
                type="file"
                accept="image/*"
                onChange={onImageChange}
                className="w-full border-2 border-black p-[5px] text-xs file:bg-black file:text-white file:border-none file:px-3 file:py-1 file:mr-3 file:font-mono cursor-pointer"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className={`col-span-12 border-2 border-black p-4 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex justify-start pl-8
              ${
                isSubmitDisabled
                  ? "bg-zinc-100 text-zinc-400 cursor-not-allowed shadow-none translate-y-1 opacity-50"
                  : "bg-white hover:bg-black hover:text-white active:shadow-none active:translate-y-1 cursor-pointer"
              }`}
          >
            {loading ? ">>> PROCESSING_BUFFER..." : ">>> EXECUTE_GENERATION"}
          </button>
        </form>

        {error && (
          <div className="col-span-12 p-3 bg-red-50 border-2 border-red-600 text-red-600 font-bold animate-in fade-in slide-in-from-top-1">
            {`>> ERROR: ${error}`}
          </div>
        )}

        <section className="border-4 border-black h-[700px] overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] flex flex-col items-center p-8 shadow-inner relative">
          {maze ? (
            <div className="flex-1 w-full flex justify-center items-center overflow-hidden">
              <MazeCanvas maze={maze} />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="opacity-20 tracking-[0.3em] font-bold uppercase select-none">
                System_Idle
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
