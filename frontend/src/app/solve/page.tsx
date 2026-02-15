"use client";
import { useState } from "react";
import MazeCanvas from "@/components/maze/MazeCanvas";
import AlgorithmSelect from "@/components/ui/AlgorithmSelect";

const SOLVE_ALGORITHMS = [
  { id: "astar", label: "A*_SEARCH" },
  { id: "bfs", label: "BREADTH_FIRST" },
  { id: "floodfill", label: "FLOOD_FILL" },
];

export default function SolvePage() {
  const [isSolving, setIsSolving] = useState(false);
  const [solveType, setSolveType] = useState("astar");

  return (
    <div className="space-y-8">
      <form className="grid grid-cols-12 gap-6 items-end">
        <div className="col-span-3 space-y-2">
          <label className="block font-bold uppercase tracking-widest text-[10px]">
            Target_Complexity
          </label>
          <div className="h-[38px] border-2 border-black bg-zinc-100 flex items-center px-3 italic text-[10px] opacity-50">
            Auto-detected from maze...
          </div>
        </div>

        <div className="col-span-4 space-y-2">
          <label className="block font-bold uppercase tracking-widest text-[10px]">
            Solve_Algorithm
          </label>
          <AlgorithmSelect
            value={solveType}
            onChange={setSolveType}
            options={SOLVE_ALGORITHMS}
          />
        </div>

        <button
          type="button"
          onClick={() => setIsSolving(true)}
          disabled={isSolving}
          className={`col-span-12 border-2 border-black p-4 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex justify-start pl-8 ${
            isSolving
              ? "bg-zinc-100 text-zinc-400 opacity-50"
              : "bg-white hover:bg-black hover:text-white active:shadow-none active:translate-y-1 cursor-pointer"
          }`}
        >
          {isSolving ? ">>> EXECUTING PATHFINDER..." : ">>> RUN SOLVER"}
        </button>
      </form>

      <section className="relative border-4 border-black h-[750px] bg-zinc-50 overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col">
        <div className="h-7 border-b-2 border-black bg-white flex items-center px-3 justify-between z-30 shrink-0">
          <span className="text-[10px] font-bold tracking-widest uppercase">
            SOLVER_OUTPUT
          </span>
          <span className="text-[10px] opacity-30 font-bold uppercase">
            EST_PATH: --
          </span>
        </div>

        <div className="relative flex-1 bg-white overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.05] pointer-events-none" />

          <div className="h-full w-full flex items-center justify-center">
            <p className="opacity-20 tracking-[0.5em] font-bold uppercase text-2xl">
              Load a maze to solve
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
