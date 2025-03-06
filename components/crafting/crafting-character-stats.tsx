"use client"

import { Button } from "@/components/ui/button"
import { gameItems } from "@/lib/items"

interface CraftingCharacterStatsProps {
  character: {
    name: string
    level: number
    experience: number
    experienceToNextLevel: number
    magicPoints: number
    maxMagicPoints: number
    gold: number
    gems: number
    craftingStats: {
      metalworking: number
      magicworking: number
      spellcraft: number
    }
    craftingExperience: {
      metalworking: number
      magicworking: number
      spellcraft: number
    }
    equipment: {
      head?: string
      chest?: string
      legs?: string
      feet?: string
      hands?: string
      rings: string[]
      weapon?: string
      offhand?: string
      neck?: string
    }
  }
  onConsumeMagicPotion: () => void
  manaPotionCount: number
}

export default function CraftingCharacterStats({ 
  character, 
  onConsumeMagicPotion,
  manaPotionCount
}: CraftingCharacterStatsProps) {
  return (
    <div className="game-card">
      <div className="game-card-header">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-amber-400">Crafter Profile</h3>
          <div className="flex items-center space-x-2">
            <div className="text-xs text-gray-400">Level {character.level}</div>
            <div className="w-20 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-500" 
                style={{ width: `${Math.min((character.experience / character.experienceToNextLevel) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="game-card-content">
        <div className="flex justify-between items-center mb-4">
          <div className="text-lg font-medium">{character.name}</div>
          <div className="flex space-x-3">
            <div className="flex items-center">
              <span className="text-amber-400 text-sm mr-1">Gold:</span>
              <span className="text-amber-400 font-medium">{character.gold}</span>
            </div>
            <div className="flex items-center">
              <span className="text-cyan-400 text-sm mr-1">Gems:</span>
              <span className="text-cyan-400 font-medium">{character.gems}</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          {/* Magic Points */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="text-sm font-medium">Magic Points</div>
              <div className="text-sm text-gray-400">{character.magicPoints}/{character.maxMagicPoints}</div>
            </div>
            <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500" 
                style={{ width: `${(character.magicPoints / character.maxMagicPoints) * 100}%` }}
              />
            </div>
            <div className="flex justify-end mt-1">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onConsumeMagicPotion}
                disabled={manaPotionCount <= 0}
                className="h-7 text-xs"
              >
                Use Magic Potion ({manaPotionCount})
              </Button>
            </div>
          </div>
          
          {/* Crafting Skills */}
          <div className="space-y-2">
            <div className="text-sm font-medium mb-1">Crafting Skills</div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <div className="text-xs">Metalworking</div>
                <div className="text-xs text-gray-400">Level {character.craftingStats.metalworking}</div>
              </div>
              <div className="relative h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-600" 
                  style={{ 
                    width: `${Math.min((character.craftingExperience.metalworking / (character.craftingStats.metalworking * 100)) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <div className="text-xs">Magicworking</div>
                <div className="text-xs text-gray-400">Level {character.craftingStats.magicworking}</div>
              </div>
              <div className="relative h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-600" 
                  style={{ 
                    width: `${Math.min((character.craftingExperience.magicworking / (character.craftingStats.magicworking * 100)) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <div className="text-xs">Spellcraft</div>
                <div className="text-xs text-gray-400">Level {character.craftingStats.spellcraft}</div>
              </div>
              <div className="relative h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyan-600" 
                  style={{ 
                    width: `${Math.min((character.craftingExperience.spellcraft / (character.craftingStats.spellcraft * 100)) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Crafting Equipment Effects */}
          <div>
            <div className="text-sm font-medium mb-1">Equipment Effects</div>
            <div className="text-xs text-gray-400">
              {Object.entries(character.equipment).some(([slot, item]) => {
                if (slot === "rings" && Array.isArray(item)) {
                  return item.some(ringId => {
                    const ring = gameItems[ringId];
                    return ring && ring.stats && (
                      ring.stats.magicworking || 
                      ring.stats.metalworking || 
                      ring.stats.spellcraft
                    );
                  });
                } else if (typeof item === 'string') {
                  const equip = gameItems[item];
                  return equip && equip.stats && (
                    equip.stats.magicworking || 
                    equip.stats.metalworking || 
                    equip.stats.spellcraft
                  );
                }
                return false;
              }) ? (
                <ul className="space-y-1">
                  {Object.entries(character.equipment).map(([slot, item]) => {
                    if (slot === "rings" && Array.isArray(item)) {
                      return item.map((ringId, index) => {
                        const ring = gameItems[ringId];
                        if (ring && ring.stats && (
                          ring.stats.magicworking || 
                          ring.stats.metalworking || 
                          ring.stats.spellcraft
                        )) {
                          return (
                            <li key={`ring-${index}`} className="flex items-center">
                              <span className="text-gray-300">{ring.name}:</span>
                              {ring.stats.metalworking && (
                                <span className="ml-1 text-amber-400">+{ring.stats.metalworking} Metalworking</span>
                              )}
                              {ring.stats.magicworking && (
                                <span className="ml-1 text-purple-400">+{ring.stats.magicworking} Magicworking</span>
                              )}
                              {ring.stats.spellcraft && (
                                <span className="ml-1 text-cyan-400">+{ring.stats.spellcraft} Spellcraft</span>
                              )}
                            </li>
                          );
                        }
                        return null;
                      });
                    } else if (typeof item === 'string') {
                      const equip = gameItems[item];
                      if (equip && equip.stats && (
                        equip.stats.magicworking || 
                        equip.stats.metalworking || 
                        equip.stats.spellcraft
                      )) {
                        return (
                          <li key={slot} className="flex items-center">
                            <span className="text-gray-300">{equip.name}:</span>
                            {equip.stats.metalworking && (
                              <span className="ml-1 text-amber-400">+{equip.stats.metalworking} Metalworking</span>
                            )}
                            {equip.stats.magicworking && (
                              <span className="ml-1 text-purple-400">+{equip.stats.magicworking} Magicworking</span>
                            )}
                            {equip.stats.spellcraft && (
                              <span className="ml-1 text-cyan-400">+{equip.stats.spellcraft} Spellcraft</span>
                            )}
                          </li>
                        );
                      }
                    }
                    return null;
                  })}
                </ul>
              ) : (
                <span>No crafting bonuses from equipment</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 