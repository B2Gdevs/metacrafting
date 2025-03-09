"use client"

interface PatternVisualProps {
  pattern: string;
}

export default function PatternVisual({ pattern }: PatternVisualProps) {
  // If no pattern or "none", return nothing
  if (!pattern || pattern === "none") {
    return <div className="text-gray-500 italic text-xs">No specific pattern used</div>;
  }
  
  // Split multiple patterns
  const patterns = pattern.includes(",") ? pattern.split(",") : [pattern];
  
  // Define pattern colors and icons
  const patternInfo: Record<string, { color: string, icon: string }> = {
    lShape: { color: "bg-purple-500", icon: "L" },
    square: { color: "bg-blue-500", icon: "■" },
    cross: { color: "bg-green-500", icon: "✚" },
    triangle: { color: "bg-amber-500", icon: "▲" },
    diagonal: { color: "bg-red-500", icon: "╲" },
    linear: { color: "bg-cyan-500", icon: "—" },
    circle: { color: "bg-pink-500", icon: "○" }
  };
  
  return (
    <div className="flex flex-wrap gap-1">
      {patterns.map((p, index) => {
        const info = patternInfo[p] || { color: "bg-gray-500", icon: "?" };
        const textColor = p === "amber" ? "text-amber-400" : `text-${info.color.split('-')[1]}-400`;
        
        return (
          <div key={index} className="flex items-center bg-gray-800/70 rounded px-2 py-1">
            <div className={`w-4 h-4 rounded-sm ${info.color} mr-1 flex items-center justify-center text-xs font-bold text-white`}>
              {info.icon}
            </div>
            <span className={`text-xs ${textColor}`}>
              {p.charAt(0).toUpperCase() + p.slice(1).replace(/([A-Z])/g, ' $1')}
            </span>
          </div>
        );
      })}
    </div>
  );
} 