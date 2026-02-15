"use client";
import { useEffect, useRef } from "react";

export default function MazeMargin({ side }: { side: "left" | "right" }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const updateCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const marginWidth = 70;
      const cols = 7;
      const cellSize = marginWidth / cols;

      canvas.width = marginWidth;
      canvas.height = Math.max(
        document.documentElement.scrollHeight,
        window.innerHeight
      );

      const rows = Math.ceil(canvas.height / cellSize);

      ctx.strokeStyle = "black";
      ctx.lineWidth = 1.5;
      ctx.lineCap = "square";
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * cellSize;
          const y = r * cellSize;

          ctx.beginPath();

          const carveNorth = Math.random() > 0.5;
          const isTopRow = r === 0;
          const isLastCol = c === cols - 1;

          if (isTopRow && isLastCol) {
          } else if (isTopRow) {
            // Force East
            ctx.moveTo(x + cellSize, y);
            ctx.lineTo(x + cellSize, y + cellSize);
          } else if (isLastCol) {
            // Force North
            ctx.moveTo(x, y);
            ctx.lineTo(x + cellSize, y);
          } else {
            if (carveNorth) {
              ctx.moveTo(x, y);
              ctx.lineTo(x + cellSize, y);
            } else {
              ctx.moveTo(x + cellSize, y);
              ctx.lineTo(x + cellSize, y + cellSize);
            }
          }
          ctx.stroke();
        }
      }

      ctx.beginPath();
      const borderX = side === "left" ? canvas.width - 1 : 1;
      ctx.moveTo(borderX, 0);
      ctx.lineTo(borderX, canvas.height);
      ctx.stroke();
    };

    updateCanvas();

    const resizeObserver = new ResizeObserver(() => updateCanvas());
    resizeObserver.observe(document.body);

    return () => resizeObserver.disconnect();
  }, [side]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute top-0 ${side}-0 pointer-events-none z-0`}
      style={{ width: "70px" }}
    />
  );
}
