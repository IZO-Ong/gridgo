// src/components/MazeCanvas.tsx
"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { MazeData } from "@/hooks/useMazeGeneration";

export default function MazeCanvas({ maze }: { maze: MazeData }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dynamicCellSize, setDynamicCellSize] = useState(0);
  const [transform, setTransform] = useState({ s: 1, x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setTransform({ s: 1, x: 0, y: 0 });
  }, [maze]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      handleZoom(e.deltaY, e.clientX - rect.left, e.clientY - rect.top);
    };
    container.addEventListener("wheel", handleNativeWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleNativeWheel);
  }, [maze, transform]);

  useEffect(() => {
    if (!containerRef.current || !maze) return;
    const updateSize = () => {
      const parent = containerRef.current?.closest("section");
      if (!parent) return;
      const availableWidth = parent.clientWidth - 128;
      const availableHeight = parent.clientHeight - 128;
      setDynamicCellSize(
        Math.min(availableWidth / maze.cols, availableHeight / maze.rows)
      );
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [maze]);

  const handleZoom = useCallback(
    (delta: number, mouseX?: number, mouseY?: number) => {
      setTransform((prev) => {
        const scaleFactor = delta > 0 ? 0.9 : 1.1;
        const newScale = Math.min(Math.max(prev.s * scaleFactor, 1), 20);
        if (newScale === prev.s) return prev;
        return mouseX !== undefined && mouseY !== undefined
          ? {
              s: newScale,
              x: mouseX - (mouseX - prev.x) * (newScale / prev.s),
              y: mouseY - (mouseY - prev.y) * (newScale / prev.s),
            }
          : { ...prev, s: newScale };
      });
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !maze || dynamicCellSize === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = maze.cols * dynamicCellSize + 1;
    canvas.height = maze.rows * dynamicCellSize + 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Blending start

    ctx.save();
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.s, transform.s);

    const getWallColor = (w: number) =>
      w >= 1000
        ? "black"
        : `rgb(${220 - (w % 30)},${220 - (w % 30)},${220 - (w % 30)})`;
    ctx.fillStyle = "#90ee90";
    ctx.fillRect(
      maze.start[1] * dynamicCellSize,
      maze.start[0] * dynamicCellSize,
      dynamicCellSize,
      dynamicCellSize
    );
    ctx.fillStyle = "#ff6347";
    ctx.fillRect(
      maze.end[1] * dynamicCellSize,
      maze.end[0] * dynamicCellSize,
      dynamicCellSize,
      dynamicCellSize
    );

    ctx.lineWidth = dynamicCellSize > 5 ? 1 : 0.5;
    maze.grid.forEach((row, r) => {
      row.forEach((cell, c) => {
        const x = c * dynamicCellSize;
        const y = r * dynamicCellSize;
        cell.walls.forEach((w, i) => {
          if (w) {
            ctx.beginPath();
            ctx.strokeStyle = getWallColor(cell.wall_weights[i]);
            if (i === 0) {
              ctx.moveTo(x, y);
              ctx.lineTo(x + dynamicCellSize, y);
            }
            if (i === 1) {
              ctx.moveTo(x + dynamicCellSize, y);
              ctx.lineTo(x + dynamicCellSize, y + dynamicCellSize);
            }
            if (i === 2) {
              ctx.moveTo(x, y + dynamicCellSize);
              ctx.lineTo(x + dynamicCellSize, y + dynamicCellSize);
            }
            if (i === 3) {
              ctx.moveTo(x, y);
              ctx.lineTo(x, y + dynamicCellSize);
            }
            ctx.stroke();
          }
        });
      });
    });
    ctx.restore();
  }, [maze, dynamicCellSize, transform]);

  const baseMazeW = maze.cols * dynamicCellSize;
  const baseMazeH = maze.rows * dynamicCellSize;

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div
        ref={containerRef}
        style={{ width: baseMazeW, height: baseMazeH }}
        className="relative overflow-hidden cursor-grab active:cursor-grabbing border border-zinc-200/50"
        onMouseDown={(e) => {
          setIsDragging(true);
          dragStart.current = {
            x: e.clientX - transform.x,
            y: e.clientY - transform.y,
          };
        }}
        onMouseMove={(e) => {
          if (isDragging)
            setTransform((p) => ({
              ...p,
              x: e.clientX - dragStart.current.x,
              y: e.clientY - dragStart.current.y,
            }));
        }}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        {/* VIEWPORT BRACKETS: Fixed to the clipping boundaries */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-black z-20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-black z-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-black z-20 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-black z-20 pointer-events-none" />

        <canvas ref={canvasRef} className="drop-shadow-sm select-none" />
      </div>

      <div className="absolute bottom-6 right-6 flex flex-col border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] divide-y-2 divide-black z-30">
        <button
          onClick={() => handleZoom(-1)}
          className="p-3 hover:bg-black hover:text-white font-bold text-lg cursor-pointer"
        >
          +
        </button>
        <button
          onClick={() => handleZoom(1)}
          className="p-3 hover:bg-black hover:text-white font-bold text-lg cursor-pointer"
        >
          -
        </button>
        <button
          onClick={() => setTransform({ s: 1, x: 0, y: 0 })}
          className="p-2 text-[9px] hover:bg-black hover:text-white font-bold uppercase cursor-pointer"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
