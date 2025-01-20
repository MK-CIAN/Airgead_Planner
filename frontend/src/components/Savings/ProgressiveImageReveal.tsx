import React, { useMemo } from "react";

interface ProgressiveImageRevealProps {
  imageUrl: string;
  progress: number; // Percentage progress (0-100)
}

const ProgressiveImageReveal: React.FC<ProgressiveImageRevealProps> = ({
  imageUrl,
  progress,
}) => {
  // Define grid size (number of rows and columns)
  const rows = 4;
  const cols = 5;
  const totalPieces = rows * cols;

  // Memoize shuffled indices to ensure consistent random order
  const shuffledIndices = useMemo(() => {
    const indices = Array.from({ length: totalPieces }, (_, index) => index);
    for (let i = indices.length - 1; i > 0; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[randomIndex]] = [indices[randomIndex], indices[i]];
    }
    return indices;
  }, [totalPieces]);

  // Calculate how many pieces to reveal based on progress
  const revealedPieces = Math.floor((progress / 100) * totalPieces);

  return (
    <div className="relative w-full aspect-video overflow-hidden rounded-md">
      {/* Image */}
      <img
        src={imageUrl}
        alt="Savings Goal"
        className="w-full h-full object-fit-cover"
      />
      {/* Overlay Mask */}
      <div
        className="absolute inset-0 grid"
        style={{
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
        }}
      >
        {Array.from({ length: totalPieces }, (_, index) => (
          <div
            key={index}
            className={`bg-neutral-200 ${
              shuffledIndices.indexOf(index) < revealedPieces
                ? "opacity-0"
                : "opacity-100"
            } transition-opacity duration-500`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default ProgressiveImageReveal;
