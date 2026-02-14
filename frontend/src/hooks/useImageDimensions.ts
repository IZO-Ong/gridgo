import { useState } from "react";

export function useImageDimensions(initialRows = 30, initialCols = 30) {
  const [dims, setDims] = useState({ rows: initialRows, cols: initialCols });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      // 200 maze cap
      const scaleFactor = Math.min(200 / img.width, 200 / img.height, 1);
      setDims({
        rows: Math.floor(img.height * scaleFactor),
        cols: Math.floor(img.width * scaleFactor),
      });
      URL.revokeObjectURL(img.src);
    };
  };

  return { dims, setDims, handleImageChange };
}
