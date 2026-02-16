"use client";
import { useEffect, useRef, useState } from "react";
import { MazeData } from "@/hooks/useMazeGeneration";
import { useMazeCanvas } from "@/hooks/useMazeCanvas";
import { renderMazeImage } from "@/lib/api";

const PADDING = 800;

interface MazeCanvasProps {
  maze: MazeData;
  showSave?: boolean;
  highlights?: [number, number][];
  solutionPath?: [number, number][];
}

export default function MazeCanvas({
  maze,
  showSave = true,
  highlights = [],
  solutionPath = [],
}: MazeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visibleHighlights, setVisibleHighlights] = useState<number>(0);

  const {
    containerRef,
    dynamicCellSize,
    transform,
    cssOffset,
    onMouseDown,
    handleZoom,
    centerMaze,
  } = useMazeCanvas(maze);

  const handleSave = async () => {
    try {
      const blob = await renderMazeImage(maze);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `maze_${maze.rows}x${maze.cols}_${Date.now()}.png`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(`FAILED TO SAVE: ${e.message}`);
    }
  };

  // Reset counter when a new search starts
  useEffect(() => {
    setVisibleHighlights(0);
  }, [highlights]);

  // Animation Buffer with Throttled Speed
  useEffect(() => {
    if (!highlights || highlights.length === 0) return;

    let frame: number;
    let lastTime = 0;

    const animate = (time: number) => {
      if (!lastTime) lastTime = time;
      const deltaTime = time - lastTime;

      if (deltaTime > 16) {
        setVisibleHighlights((prev) => {
          if (prev < highlights.length) {
            // Incremental step of 5 nodes per frame for a visible "scan"
            return Math.min(prev + 5, highlights.length);
          }
          return prev;
        });
        lastTime = time;
      }
      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [highlights]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !maze || dynamicCellSize === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = container.clientWidth + PADDING * 2;
    canvas.height = container.clientHeight + PADDING * 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(transform.x + PADDING, transform.y + PADDING);
    ctx.scale(transform.s, transform.s);

    const cellSize = dynamicCellSize;

    // 1. Draw Visited/Exploration Path (Light Purple)
    ctx.fillStyle = "rgba(167, 139, 250, 0.4)";
    for (let i = 0; i < visibleHighlights; i++) {
      const point = highlights?.[i];
      if (point) {
        const [r, c] = point;
        ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
      }
    }

    // 2. Draw Final Solution Path (Red)
    if (
      highlights &&
      visibleHighlights >= highlights.length &&
      solutionPath.length > 0
    ) {
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = cellSize * 0.4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      solutionPath.forEach(([r, c], idx) => {
        const x = c * cellSize + cellSize / 2;
        const y = r * cellSize + cellSize / 2;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    // 3. Draw Maze Walls
    const getWallColor = (w: number) =>
      w >= 1000
        ? "black"
        : `rgb(${220 - (w % 30)},${220 - (w % 30)},${220 - (w % 30)})`;

    ctx.lineWidth = cellSize > 5 ? 1 : 0.5;
    const wallBatches: Record<string, Path2D> = {};

    for (let r = 0; r < maze.rows; r++) {
      for (let c = 0; c < maze.cols; c++) {
        const x = c * cellSize;
        const y = r * cellSize;
        const cell = maze.grid[r][c];

        // Start/End Cells
        if (r === maze.start[0] && c === maze.start[1]) {
          ctx.fillStyle = "#90ee90";
          ctx.fillRect(x, y, cellSize, cellSize);
        } else if (r === maze.end[0] && c === maze.end[1]) {
          ctx.fillStyle = "#ff6347";
          ctx.fillRect(x, y, cellSize, cellSize);
        }

        cell.walls.forEach((w, i) => {
          if (w) {
            const color = getWallColor(cell.wall_weights[i]);
            if (!wallBatches[color]) wallBatches[color] = new Path2D();
            const path = wallBatches[color];
            if (i === 0) {
              path.moveTo(x, y);
              path.lineTo(x + cellSize, y);
            }
            if (i === 1) {
              path.moveTo(x + cellSize, y);
              path.lineTo(x + cellSize, y + cellSize);
            }
            if (i === 2) {
              path.moveTo(x, y + cellSize);
              path.lineTo(x + cellSize, y + cellSize);
            }
            if (i === 3) {
              path.moveTo(x, y);
              path.lineTo(x, y + cellSize);
            }
          }
        });
      }
    }

    Object.entries(wallBatches).forEach(([color, path]) => {
      ctx.strokeStyle = color;
      ctx.stroke(path);
    });
    ctx.restore();
  }, [
    maze,
    dynamicCellSize,
    transform,
    visibleHighlights,
    solutionPath,
    highlights,
  ]);

  return (
    <div className="relative w-full h-full flex items-center justify-center p-8">
      <div
        ref={containerRef}
        className="w-full h-full relative overflow-hidden cursor-grab active:cursor-grabbing border-2 border-black bg-white"
        onMouseDown={onMouseDown}
      >
        <div
          style={{
            transform: `translate3d(${cssOffset.x - PADDING}px, ${cssOffset.y - PADDING}px, 0)`,
            willChange: "transform",
          }}
          className="w-fit h-fit"
        >
          <canvas ref={canvasRef} className="block select-none" />
        </div>
      </div>

      {showSave && (
        <div className="absolute bottom-6 left-6 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-30">
          <button
            onClick={handleSave}
            title="SAVE_SYSTEM_IMAGE"
            className="p-3 hover:bg-black hover:text-white transition-colors cursor-pointer"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
          </button>
        </div>
      )}

      {/* Viewport Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] divide-y-2 divide-black z-30">
        <button
          onClick={() => {
            const r = containerRef.current?.getBoundingClientRect();
            if (r) handleZoom(-1, r.width / 2, r.height / 2);
          }}
          className="p-3 hover:bg-black hover:text-white font-bold text-lg cursor-pointer"
        >
          +
        </button>
        <button
          onClick={() => {
            const r = containerRef.current?.getBoundingClientRect();
            if (r) handleZoom(1, r.width / 2, r.height / 2);
          }}
          className="p-3 hover:bg-black hover:text-white font-bold text-lg cursor-pointer"
        >
          -
        </button>
        <button
          onClick={() => centerMaze(dynamicCellSize)}
          className="p-2 text-[9px] hover:bg-black hover:text-white font-bold uppercase cursor-pointer"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
