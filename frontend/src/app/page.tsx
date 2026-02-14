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
  const [genType, setGenType] = useState("image");
  const { dims, setDims, handleImageChange } = useImageDimensions();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      setMaze(await generateMaze(formData));
    } catch (err) {
      alert(err);
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
            <label className="block font-bold uppercase">Grid_Dimensions</label>
            <div className="flex border-2 border-black divide-x-2 divide-black">
              <input
                name="rows"
                type="number"
                value={dims.rows}
                onChange={(e) =>
                  setDims({ ...dims, rows: parseInt(e.target.value) || 0 })
                }
                className="w-full p-2 outline-none focus:bg-zinc-100 bg-transparent"
              />
              <input
                name="cols"
                type="number"
                value={dims.cols}
                onChange={(e) =>
                  setDims({ ...dims, cols: parseInt(e.target.value) || 0 })
                }
                className="w-full p-2 outline-none focus:bg-zinc-100 bg-transparent"
              />
            </div>
          </div>

          <div className="col-span-4 space-y-2">
            <label className="block font-bold uppercase">Algorithm</label>
            <AlgorithmSelect
              value={genType}
              onChange={setGenType}
              options={ALGORITHMS}
            />
          </div>

          {genType === "image" && (
            <div className="col-span-5 space-y-2">
              <label className="block font-bold uppercase">Input_Source</label>
              <input
                name="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full border-2 border-black p-[5px] text-xs file:bg-black file:text-white file:px-3 file:py-1 file:mr-3"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`col-span-12 border-2 border-black p-4 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${loading ? "bg-zinc-200 cursor-wait" : "bg-white hover:bg-black hover:text-white transition-all active:shadow-none active:translate-y-1"}`}
          >
            {loading ? ">>> PROCESSING..." : ">>> EXECUTE_GENERATION"}
          </button>
        </form>

        <section className="border-4 border-black min-h-[500px] flex items-center justify-center p-4 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
          {maze ? (
            <MazeCanvas maze={maze} />
          ) : (
            <p className="opacity-30 tracking-widest font-bold">SYSTEM_IDLE</p>
          )}
        </section>
      </div>
    </main>
  );
}
