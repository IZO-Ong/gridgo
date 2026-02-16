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
  const [visibleSolutionStep, setVisibleSolutionStep] = useState(0);

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

  // UNIFIED ANIMATION LOGIC
  useEffect(() => {
    setVisibleHighlights(0);
    setVisibleSolutionStep(0);

    if (!highlights || highlights.length === 0) return;

    let frame: number;
    let lastTime = 0;
    const stepSize = 7;

    const animate = (time: number) => {
      if (!lastTime) lastTime = time;
      const deltaTime = time - lastTime;

      if (deltaTime > 16) {
        setVisibleHighlights((prev) => {
          // 1. Buffer exploration highlights first
          if (prev < highlights.length) {
            return Math.min(prev + stepSize, highlights.length);
          }

          // 2. Once highlights are done, buffer the red solution path
          setVisibleSolutionStep((solPrev) => {
            if (solPrev < solutionPath.length) {
              return Math.min(solPrev + stepSize, solutionPath.length);
            }
            return solPrev;
          });

          return prev;
        });
        lastTime = time;
      }
      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [highlights, solutionPath]);

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

    // 1. Draw Visited Path
    ctx.fillStyle = "rgba(167, 139, 250, 0.4)";
    for (let i = 0; i < visibleHighlights; i++) {
      const point = highlights?.[i];
      if (point) {
        ctx.fillRect(
          point[1] * cellSize,
          point[0] * cellSize,
          cellSize,
          cellSize
        );
      }
    }

    // 2. Draw Buffered Final Solution Path
    if (visibleHighlights >= highlights.length && solutionPath.length > 0) {
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = cellSize * 0.4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();

      const currentPath = solutionPath.slice(0, visibleSolutionStep);
      currentPath.forEach(([r, c], idx) => {
        const x = c * cellSize + cellSize / 2;
        const y = r * cellSize + cellSize / 2;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    // 3. Draw Maze Walls
    const getWallColor = (w: number) => {
      if (w >= 255) return "black";
      const brightness = Math.floor(230 - w * (230 / 255));
      return `rgb(${brightness}, ${brightness}, ${brightness})`;
    };

    ctx.lineWidth = cellSize > 5 ? 1 : 0.5;
    const wallBatches: Record<string, Path2D> = {};

    for (let r = 0; r < maze.rows; r++) {
      for (let c = 0; c < maze.cols; c++) {
        const x = c * cellSize;
        const y = r * cellSize;
        const cell = maze.grid[r][c];

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
    // ADDED visibleSolutionStep TO DEPENDENCIES
  }, [
    maze,
    dynamicCellSize,
    transform,
    visibleHighlights,
    visibleSolutionStep,
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
