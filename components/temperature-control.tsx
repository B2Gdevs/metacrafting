"use client"
import { Slider } from "@/components/ui/slider"
import { Flame } from "lucide-react"

interface TemperatureControlProps {
  temperature: number
  onTemperatureChange: (value: number) => void
}

export default function TemperatureControl({ temperature, onTemperatureChange }: TemperatureControlProps) {
  const getTemperatureColor = () => {
    if (temperature < 100) return "text-blue-500"
    if (temperature < 500) return "text-green-500"
    if (temperature < 1000) return "text-yellow-500"
    if (temperature < 1500) return "text-orange-500"
    return "text-red-500"
  }

  const getTemperatureLabel = () => {
    if (temperature < 100) return "Cold"
    if (temperature < 500) return "Warm"
    if (temperature < 1000) return "Hot"
    if (temperature < 1500) return "Very Hot"
    return "Extreme"
  }

  const handleTemperatureChange = (value: number[]) => {
    onTemperatureChange(value[0])
  }

  return (
    <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Flame className={`h-5 w-5 ${getTemperatureColor()}`} />
          <span className="font-medium">Temperature</span>
        </div>
        <div className="flex items-center gap-1">
          <span className={`text-sm font-medium ${getTemperatureColor()}`}>{temperature}°</span>
          <span className="text-xs text-gray-500">({getTemperatureLabel()})</span>
        </div>
      </div>
      <Slider
        defaultValue={[temperature]}
        min={0}
        max={2000}
        step={50}
        onValueChange={handleTemperatureChange}
        className="py-2"
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>Cold</span>
        <span>Warm</span>
        <span>Hot</span>
        <span>Extreme</span>
      </div>
    </div>
  )
}

