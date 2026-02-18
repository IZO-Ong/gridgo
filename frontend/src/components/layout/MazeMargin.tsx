"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const seededRandom = (r: number, c: number) => {
  let h = (r * 0x45d9f3b) ^ c;
  h = ((h >>> 16) ^ h) * 0x45d9f3b;
  h = ((h >>> 16) ^ h) * 0x45d9f3b;
  h = (h >>> 16) ^ h;
  return h % 100 > 50;
};

// Added 'flip' parameter
export default function MazeMargin({
  side,
  flip,
}: {
  side: "left" | "right";
  flip?: boolean;
}) {
  const [bgPattern, setBgPattern] = useState<string>("");
  const [opacity, setOpacity] = useState(1);
  const pathname = usePathname();

  const sideClasses = {
    left: "left-0",
    right: "right-0",
  };

  useEffect(() => {
    const handleZoomOpacity = () => {
      const width = window.innerWidth;
      const startFade = 1200;
      const endFade = 1100;
      if (width < endFade) setOpacity(0);
      else if (width > startFade) setOpacity(1);
      else setOpacity((width - endFade) / (startFade - endFade));
    };

    window.addEventListener("resize", handleZoomOpacity);
    handleZoomOpacity();
    return () => window.removeEventListener("resize", handleZoomOpacity);
  }, []);

  useEffect(() => {
    const marginWidth = 70;
    const cols = 7;
    const cellSize = marginWidth / cols;
    const tileRows = 50;

    const canvas = document.createElement("canvas");
    canvas.width = marginWidth;
    canvas.height = tileRows * cellSize;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2; // Updated to 2 as requested
      ctx.lineCap = "square";
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Main Borders
      ctx.beginPath();
      // Adjusting offset for lineWidth 2
      ctx.moveTo(1, 0);
      ctx.lineTo(1, canvas.height);
      ctx.moveTo(marginWidth - 1, 0);
      ctx.lineTo(marginWidth - 1, canvas.height);
      ctx.stroke();

      // Draw Maze Pattern
      for (let r = 0; r < tileRows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * cellSize;
          const y = r * cellSize;
          const carveNorth = seededRandom(r, c);

          ctx.beginPath();
          if (r !== 0 || c !== cols - 1) {
            if (r === 0) {
              ctx.moveTo(x + cellSize, y);
              ctx.lineTo(x + cellSize, y + cellSize);
            } else if (c < cols - 1) {
              if (carveNorth) {
                ctx.moveTo(x, y);
                ctx.lineTo(x + cellSize, y);
              } else {
                ctx.moveTo(x + cellSize, y);
                ctx.lineTo(x + cellSize, y + cellSize);
              }
            }
          }
          ctx.stroke();
        }
      }
      setBgPattern(canvas.toDataURL());
    }
  }, [pathname]);

  return (
    <div
      className={`absolute top-0 bottom-0 ${sideClasses[side]} pointer-events-none z-0 transition-opacity duration-150`}
      style={{
        width: "70px",
        opacity: opacity,
        backgroundImage: `url(${bgPattern})`,
        backgroundRepeat: "repeat-y",
        backgroundSize: "70px auto",
        transform: flip ? "scaleX(-1)" : "none",
      }}
    />
  );
}
