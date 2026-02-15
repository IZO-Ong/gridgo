"use client";
import { useEffect, useRef, useState } from "react";

export default function MazeCanvas({ maze }: { maze: any }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dynamicCellSize, setDynamicCellSize] = useState(0);

  useEffect(() => {
    if (!containerRef.current || !maze) return;

    const updateSize = () => {
      const parent = containerRef.current?.closest("section");
      if (!parent) return;

      const availableWidth = parent.clientWidth - 64;
      const availableHeight = parent.clientHeight - 64;

      const cellW = availableWidth / maze.cols;
      const cellH = availableHeight / maze.rows;
      const stableSize = Math.floor(Math.min(cellW, cellH) * 100) / 100;
      setDynamicCellSize(stableSize);
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [maze]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !maze || dynamicCellSize === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = maze.cols * dynamicCellSize + 1;
    canvas.height = maze.rows * dynamicCellSize + 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const getWallColor = (weight: number) => {
      if (weight >= 1000) {
        return "rgb(0, 0, 0)";
      }

      const intensity = 230 - (weight % 30);
      return `rgb(${intensity}, ${intensity}, ${intensity})`;
    };

    const [sR, sC] = maze.start;
    const [eR, eC] = maze.end;
    ctx.fillStyle = "rgb(144, 238, 144)";
    ctx.fillRect(
      sC * dynamicCellSize,
      sR * dynamicCellSize,
      dynamicCellSize,
      dynamicCellSize
    );
    ctx.fillStyle = "rgb(255, 99, 71)";
    ctx.fillRect(
      eC * dynamicCellSize,
      eR * dynamicCellSize,
      dynamicCellSize,
      dynamicCellSize
    );

    ctx.lineWidth = dynamicCellSize > 5 ? 1 : 0.5;

    maze.grid.forEach((row: any[], r: number) => {
      row.forEach((cell: any, c: number) => {
        const x = c * dynamicCellSize;
        const y = r * dynamicCellSize;
        const dCS = dynamicCellSize;

        if (cell.walls[0]) {
          ctx.beginPath();
          ctx.strokeStyle = getWallColor(cell.wall_weights[0]);
          ctx.moveTo(x, y);
          ctx.lineTo(x + dCS, y);
          ctx.stroke();
        }

        if (cell.walls[1]) {
          ctx.beginPath();
          ctx.strokeStyle = getWallColor(cell.wall_weights[1]);
          ctx.moveTo(x + dCS, y);
          ctx.lineTo(x + dCS, y + dCS);
          ctx.stroke();
        }

        if (cell.walls[2]) {
          ctx.beginPath();
          ctx.strokeStyle = getWallColor(cell.wall_weights[2]);
          ctx.moveTo(x, y + dCS);
          ctx.lineTo(x + dCS, y + dCS);
          ctx.stroke();
        }

        if (cell.walls[3]) {
          ctx.beginPath();
          ctx.strokeStyle = getWallColor(cell.wall_weights[3]);
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + dCS);
          ctx.stroke();
        }
      });
    });
  }, [maze, dynamicCellSize]);

  return (
    <div
      ref={containerRef}
      className="w-full flex justify-center items-center p-4 bg-transparent"
    >
      <canvas ref={canvasRef} className="max-w-full h-auto drop-shadow-sm" />
    </div>
  );
}
