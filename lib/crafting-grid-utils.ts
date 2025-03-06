"use client";

import { PatternBonus } from "@/lib/combat-utils";

/**
 * Get color for pattern type
 */
export const getPatternColor = (patternType: string): string => {
  switch (patternType) {
    case "linear": return "rgba(255, 0, 0, 0.2)";
    case "diagonal": return "rgba(0, 255, 0, 0.2)";
    case "square": return "rgba(0, 0, 255, 0.2)";
    case "cross": return "rgba(255, 255, 0, 0.2)";
    case "triangle": return "rgba(255, 0, 255, 0.2)";
    case "circle": return "rgba(0, 255, 255, 0.2)";
    default: return "rgba(255, 255, 255, 0.2)";
  }
};

/**
 * Generate pattern highlights for the grid
 */
export const generatePatternHighlights = (
  grid: (string | null)[],
  patterns: PatternBonus[]
): Record<number, string> => {
  const highlights: Record<number, string> = {};
  
  patterns.forEach(pattern => {
    const patternType = pattern.type;
    const color = getPatternColor(patternType);
    
    // Highlight cells based on pattern type
    switch (patternType) {
      case "linear":
        // Check horizontal lines
        for (let row = 0; row < 3; row++) {
          const rowItems = [grid[row * 3], grid[row * 3 + 1], grid[row * 3 + 2]];
          if (rowItems.every(item => item !== null)) {
            highlights[row * 3] = color;
            highlights[row * 3 + 1] = color;
            highlights[row * 3 + 2] = color;
          }
        }
        
        // Check vertical lines
        for (let col = 0; col < 3; col++) {
          const colItems = [grid[col], grid[col + 3], grid[col + 6]];
          if (colItems.every(item => item !== null)) {
            highlights[col] = color;
            highlights[col + 3] = color;
            highlights[col + 6] = color;
          }
        }
        break;
        
      case "diagonal":
        // Check diagonals
        const diagonal1 = [grid[0], grid[4], grid[8]];
        const diagonal2 = [grid[2], grid[4], grid[6]];
        
        if (diagonal1.every(item => item !== null)) {
          highlights[0] = color;
          highlights[4] = color;
          highlights[8] = color;
        }
        
        if (diagonal2.every(item => item !== null)) {
          highlights[2] = color;
          highlights[4] = color;
          highlights[6] = color;
        }
        break;
        
      case "square":
        // Check 2x2 squares
        const squares = [
          [0, 1, 3, 4], // Top-left
          [1, 2, 4, 5], // Top-right
          [3, 4, 6, 7], // Bottom-left
          [4, 5, 7, 8]  // Bottom-right
        ];
        
        squares.forEach(square => {
          if (square.every(index => grid[index] !== null)) {
            square.forEach(index => {
              highlights[index] = color;
            });
          }
        });
        break;
        
      case "cross":
        // Check cross pattern (center + adjacent)
        const cross = [1, 3, 4, 5, 7]; // Top, left, center, right, bottom
        if (cross.every(index => grid[index] !== null)) {
          cross.forEach(index => {
            highlights[index] = color;
          });
        }
        break;
        
      case "triangle":
        // Check triangle patterns
        const triangles = [
          [0, 1, 2, 4], // Top row + center
          [0, 3, 6, 4], // Left column + center
          [2, 5, 8, 4], // Right column + center
          [6, 7, 8, 4]  // Bottom row + center
        ];
        
        triangles.forEach(triangle => {
          if (triangle.every(index => grid[index] !== null)) {
            triangle.forEach(index => {
              highlights[index] = color;
            });
          }
        });
        break;
        
      case "circle":
        // Check circle pattern (all outer cells)
        const circle = [0, 1, 2, 3, 5, 6, 7, 8]; // All except center
        if (circle.every(index => grid[index] !== null)) {
          circle.forEach(index => {
            highlights[index] = color;
          });
        }
        break;
    }
  });
  
  return highlights;
}; 