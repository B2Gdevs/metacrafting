"use client"

import { CharacterStats } from "@/components/character-sheet";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Coins, Diamond, Zap, Heart, Hammer, Sparkles, BookOpen } from "lucide-react";
import { getExperiencePercentage, getCraftingLevelProgress } from "@/lib/character-utils";

interface CharacterOverviewProps {
  character: CharacterStats;
  manaPotionCount: number;
  onConsumeMagicPotion: () => void;
}

export default function CharacterOverview({
  character,
  manaPotionCount,
  onConsumeMagicPotion
}: CharacterOverviewProps) {
  return (
    <div className="bg-gray-900 rounded-lg p-6 shadow-lg border border-gray-800">
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative w-20 h-20 rounded-full bg-gray-800 border-2 border-amber-500 flex items-center justify-center overflow-hidden">
          {character.image ? (
            <img src={character.image} alt={character.name} className="w-full h-full object-cover" />
          ) : (
            <User className="w-12 h-12 text-gray-400" />
          )}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">{character.name}</h2>
          <div className="flex items-center mt-1">
            <Badge variant="outline" className="bg-amber-900/50 text-amber-400 border-amber-900">
              Level {character.level}
            </Badge>
            <div className="ml-2 text-sm text-gray-400">
              {character.experience}/{character.experienceToNextLevel} XP
            </div>
          </div>
          <Progress 
            value={getExperiencePercentage(character.experience, character.experienceToNextLevel)} 
            className="h-2 mt-2 bg-gray-800" 
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800 rounded-md p-3">
          <div className="flex items-center text-red-400 mb-1">
            <Heart className="w-4 h-4 mr-2" />
            <span className="font-medium">Health</span>
          </div>
          <div className="text-xl font-bold text-white">{character.health}/{character.maxHealth}</div>
          <Progress 
            value={(character.health / character.maxHealth) * 100} 
            className="h-2 mt-1 bg-gray-900" 
            indicatorClassName="bg-red-500"
          />
        </div>
        <div className="bg-gray-800 rounded-md p-3">
          <div className="flex items-center text-blue-400 mb-1">
            <Zap className="w-4 h-4 mr-2" />
            <span className="font-medium">Magic</span>
          </div>
          <div className="text-xl font-bold text-white">{character.magicPoints}/{character.maxMagicPoints}</div>
          <Progress 
            value={(character.magicPoints / character.maxMagicPoints) * 100} 
            className="h-2 mt-1 bg-gray-900" 
            indicatorClassName="bg-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800 rounded-md p-3">
          <div className="flex items-center text-amber-400 mb-1">
            <Coins className="w-4 h-4 mr-2" />
            <span className="font-medium">Gold</span>
          </div>
          <div className="text-xl font-bold text-white">{character.gold}</div>
        </div>
        <div className="bg-gray-800 rounded-md p-3">
          <div className="flex items-center text-cyan-400 mb-1">
            <Diamond className="w-4 h-4 mr-2" />
            <span className="font-medium">Gems</span>
          </div>
          <div className="text-xl font-bold text-white">{character.gems}</div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-medium text-white mb-2">Crafting Skills</h3>
        <div className="bg-gray-800 rounded-md p-3">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center text-orange-400">
              <Hammer className="w-4 h-4 mr-2" />
              <span className="font-medium">Metalworking</span>
            </div>
            <span className="text-white font-bold">Level {character.craftingStats.metalworking}</span>
          </div>
          <Progress 
            value={getCraftingLevelProgress(character.craftingStats.metalworking, character.craftingExperience.metalworking)} 
            className="h-2 bg-gray-900" 
            indicatorClassName="bg-orange-500"
          />
        </div>
        <div className="bg-gray-800 rounded-md p-3">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center text-purple-400">
              <Sparkles className="w-4 h-4 mr-2" />
              <span className="font-medium">Magicworking</span>
            </div>
            <span className="text-white font-bold">Level {character.craftingStats.magicworking}</span>
          </div>
          <Progress 
            value={getCraftingLevelProgress(character.craftingStats.magicworking, character.craftingExperience.magicworking)} 
            className="h-2 bg-gray-900" 
            indicatorClassName="bg-purple-500"
          />
        </div>
        <div className="bg-gray-800 rounded-md p-3">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center text-blue-400">
              <BookOpen className="w-4 h-4 mr-2" />
              <span className="font-medium">Spellcraft</span>
            </div>
            <span className="text-white font-bold">Level {character.craftingStats.spellcraft}</span>
          </div>
          <Progress 
            value={getCraftingLevelProgress(character.craftingStats.spellcraft, character.craftingExperience.spellcraft)} 
            className="h-2 bg-gray-900" 
            indicatorClassName="bg-blue-500"
          />
        </div>
      </div>

      <div className="mt-6">
        <Button 
          variant="outline" 
          className="w-full bg-blue-900/30 text-blue-400 border-blue-900 hover:bg-blue-900/50"
          onClick={onConsumeMagicPotion}
          disabled={manaPotionCount <= 0}
        >
          <Zap className="mr-2 h-4 w-4" />
          Consume Magic Potion ({manaPotionCount})
        </Button>
      </div>
    </div>
  );
} 