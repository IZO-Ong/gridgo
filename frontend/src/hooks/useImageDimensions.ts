"use client";
import { useState } from "react";

export function useImageDimensions(initialRows = 30, initialCols = 30) {
  const [dims, setDims] = useState({ rows: initialRows, cols: initialCols });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const scaleFactor = Math.min(300 / img.width, 300 / img.height, 1);

      setDims({
        rows: Math.max(2, Math.floor(img.height * scaleFactor)),
        cols: Math.max(2, Math.floor(img.width * scaleFactor)),
      });
      URL.revokeObjectURL(img.src);
    };
  };

  const updateDim = (key: "rows" | "cols", val: number) => {
    setDims((prev) => ({ ...prev, [key]: val }));
  };

  // values are between 2 and 300
  const clampDimensions = () => {
    setDims((prev) => ({
      rows: Math.min(300, Math.max(2, prev.rows)),
      cols: Math.min(300, Math.max(2, prev.cols)),
    }));
  };

  return { dims, updateDim, clampDimensions, handleImageChange };
}
