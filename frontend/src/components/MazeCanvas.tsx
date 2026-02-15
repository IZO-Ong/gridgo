"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { MazeData } from "@/hooks/useMazeGeneration";
import { renderMazeImage } from "@/lib/api";

const PADDING = 800; // Physical pixel buffer around the viewfinder

export default function MazeCanvas({ maze }: { maze: MazeData }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dynamicCellSize, setDynamicCellSize] = useState(0);
  const [transform, setTransform] = useState({ s: 1, x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const [cssOffset, setCssOffset] = useState({ x: 0, y: 0 });

  // RE-CENTER LOGIC:
  const centerMaze = useCallback(
    (cellSize: number) => {
      const container = containerRef.current;
      if (!container || !maze || cellSize === 0) return;
      const viewW = container.clientWidth;
      const viewH = container.clientHeight;
      const mazeW = maze.cols * cellSize;
      const mazeH = maze.rows * cellSize;

      setTransform({
        s: 1,
        x: (viewW - mazeW) / 2,
        y: (viewH - mazeH) / 2,
      });
      setCssOffset({ x: 0, y: 0 });
    },
    [maze]
  );

  useEffect(() => {
    if (dynamicCellSize > 0) centerMaze(dynamicCellSize);
  }, [maze, dynamicCellSize, centerMaze]);

  const commitDrag = useCallback((offset: { x: number; y: number }) => {
    setTransform((p) => ({ ...p, x: p.x + offset.x, y: p.y + offset.y }));
    setCssOffset({ x: 0, y: 0 });
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    const handleGlobalMove = (e: MouseEvent) => {
      setCssOffset({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      });
    };
    const handleGlobalUp = (e: MouseEvent) => {
      commitDrag({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      });
    };
    window.addEventListener("mousemove", handleGlobalMove);
    window.addEventListener("mouseup", handleGlobalUp);
    return () => {
      window.removeEventListener("mousemove", handleGlobalMove);
      window.removeEventListener("mouseup", handleGlobalUp);
    };
  }, [isDragging, commitDrag]);

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
      setCssOffset({ x: 0, y: 0 });
    },
    []
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      handleZoom(e.deltaY, e.clientX - rect.left, e.clientY - rect.top);
    };
    container.addEventListener("wheel", handleNativeWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleNativeWheel);
  }, [handleZoom]);

  useEffect(() => {
    if (!containerRef.current || !maze) return;
    const updateSize = () => {
      const parent = containerRef.current?.closest("section");
      if (!parent) return;
      setDynamicCellSize(
        Math.min(
          (parent.clientWidth - 128) / maze.cols,
          (parent.clientHeight - 128) / maze.rows
        )
      );
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [maze]);

  // RESTORED SAVE LOGIC
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
    const scaledCell = cellSize * transform.s;
    const OVERSCAN = 50; // Increased logical buffer

    const startCol = Math.max(
      0,
      Math.floor(-(transform.x + PADDING) / scaledCell) - OVERSCAN
    );
    const endCol = Math.min(
      maze.cols,
      Math.ceil((canvas.width - (transform.x + PADDING)) / scaledCell) +
        OVERSCAN
    );
    const startRow = Math.max(
      0,
      Math.floor(-(transform.y + PADDING) / scaledCell) - OVERSCAN
    );
    const endRow = Math.min(
      maze.rows,
      Math.ceil((canvas.height - (transform.y + PADDING)) / scaledCell) +
        OVERSCAN
    );

    const getWallColor = (w: number) =>
      w >= 1000
        ? "black"
        : `rgb(${220 - (w % 30)},${220 - (w % 30)},${220 - (w % 30)})`;
    ctx.lineWidth = cellSize > 5 ? 1 : 0.5;

    const wallBatches: Record<string, Path2D> = {};

    for (let r = startRow; r < endRow; r++) {
      for (let c = startCol; c < endCol; c++) {
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
  }, [maze, dynamicCellSize, transform]);

  return (
    <div className="relative w-full h-full flex items-center justify-center p-8">
      <div
        ref={containerRef}
        className="w-full h-full relative overflow-hidden cursor-grab active:cursor-grabbing border-2 border-black bg-white"
        onMouseDown={(e) => {
          setIsDragging(true);
          dragStart.current = { x: e.clientX, y: e.clientY };
        }}
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

        {/* Viewport Brackets */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-black z-20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-black z-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-black z-20 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-black z-20 pointer-events-none" />
      </div>

      {/* RESTORED SAVE BUTTON (Bottom-Left) */}
      <div className="absolute bottom-6 left-6 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-30">
        <button
          onClick={handleSave}
          title="SAVE_SYSTEM_IMAGE"
          className="p-3 hover:bg-black hover:text-white transition-colors cursor-pointer group"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="square"
            strokeLinejoin="miter"
          >
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </svg>
        </button>
      </div>

      {/* Controls (Bottom-Right) */}
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
