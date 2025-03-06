"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CombatEntity, CombatAction, StatusEffect } from "@/lib/combat-utils";
import { CombatLogEntry } from "@/hooks/use-combat";

interface CombatInterfaceProps {
  playerEntity: CombatEntity;
  enemyEntity: CombatEntity;
  combatLog: CombatLogEntry[];
  availableActions: CombatAction[];
  selectedAction: CombatAction | null;
  onActionSelect: (action: CombatAction) => void;
  onExecuteAction: () => void;
  getStatusEffectStyle: (effect: StatusEffect) => string;
  isPlayerTurn: boolean;
}

export default function CombatInterface({
  playerEntity,
  enemyEntity,
  combatLog,
  availableActions,
  selectedAction,
  onActionSelect,
  onExecuteAction,
  getStatusEffectStyle,
  isPlayerTurn
}: CombatInterfaceProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Player and Enemy Status */}
      <div className="space-y-4">
        {/* Player Status */}
        <Card className="game-card">
          <CardHeader className="game-card-header pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg text-amber-400">{playerEntity.name}</CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">Lvl {playerEntity.level}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="game-card-content pt-2">
            {/* Health Bar */}
            <div className="space-y-1 mb-2">
              <div className="flex justify-between text-sm">
                <span>Health</span>
                <span>{playerEntity.health} / {playerEntity.maxHealth}</span>
              </div>
              <Progress 
                value={(playerEntity.health / playerEntity.maxHealth) * 100} 
                className="h-2 bg-gray-800"
              />
            </div>
            
            {/* Magic Points Bar */}
            <div className="space-y-1 mb-2">
              <div className="flex justify-between text-sm">
                <span>Magic</span>
                <span>{playerEntity.magicPoints} / {playerEntity.maxMagicPoints}</span>
              </div>
              <Progress 
                value={(playerEntity.magicPoints / playerEntity.maxMagicPoints) * 100} 
                className="h-2 bg-gray-800"
              />
            </div>
            
            {/* Status Effects */}
            {playerEntity.statusEffects.length > 0 && (
              <div className="mt-2">
                <div className="text-sm mb-1">Status Effects:</div>
                <div className="flex flex-wrap gap-1">
                  {playerEntity.statusEffects.map((effect, index) => (
                    <Badge 
                      key={`${effect.type}-${index}`}
                      variant="outline"
                      className={getStatusEffectStyle(effect)}
                    >
                      {effect.name} ({effect.duration})
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Enemy Status */}
        <Card className="game-card">
          <CardHeader className="game-card-header pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg text-red-400">{enemyEntity.name}</CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">Lvl {enemyEntity.level}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="game-card-content pt-2">
            {/* Health Bar */}
            <div className="space-y-1 mb-2">
              <div className="flex justify-between text-sm">
                <span>Health</span>
                <span>{enemyEntity.health} / {enemyEntity.maxHealth}</span>
              </div>
              <Progress 
                value={(enemyEntity.health / enemyEntity.maxHealth) * 100} 
                className="h-2 bg-gray-800"
              />
            </div>
            
            {/* Status Effects */}
            {enemyEntity.statusEffects.length > 0 && (
              <div className="mt-2">
                <div className="text-sm mb-1">Status Effects:</div>
                <div className="flex flex-wrap gap-1">
                  {enemyEntity.statusEffects.map((effect, index) => (
                    <Badge 
                      key={`${effect.type}-${index}`}
                      variant="outline"
                      className={getStatusEffectStyle(effect)}
                    >
                      {effect.name} ({effect.duration})
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Combat Actions and Log */}
      <div className="space-y-4">
        {/* Combat Actions */}
        <Card className="game-card">
          <CardHeader className="game-card-header">
            <CardTitle className="text-lg text-amber-400">Combat Actions</CardTitle>
          </CardHeader>
          <CardContent className="game-card-content">
            <div className="grid grid-cols-2 gap-2">
              {availableActions.map((action) => (
                <Button
                  key={action.name}
                  variant={selectedAction?.name === action.name ? "default" : "outline"}
                  className={`
                    ${selectedAction?.name === action.name 
                      ? "bg-amber-700 hover:bg-amber-600 text-white" 
                      : "game-button-secondary"}
                    justify-start text-left
                  `}
                  disabled={!isPlayerTurn}
                  onClick={() => onActionSelect(action)}
                >
                  {action.name}
                </Button>
              ))}
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button
                variant="default"
                className="game-button-primary"
                disabled={!isPlayerTurn || !selectedAction}
                onClick={onExecuteAction}
              >
                Execute Action
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Combat Log */}
        <Card className="game-card">
          <CardHeader className="game-card-header">
            <CardTitle className="text-lg text-amber-400">Combat Log</CardTitle>
          </CardHeader>
          <CardContent className="game-card-content p-0">
            <div className="h-[300px] overflow-y-auto p-4">
              {combatLog.map((entry, index) => (
                <div 
                  key={index} 
                  className={`mb-1 text-sm ${
                    entry.type === "player" ? "text-blue-400" :
                    entry.type === "enemy" ? "text-red-400" :
                    entry.type === "loot" ? "text-amber-400" : "text-gray-400"
                  }`}
                >
                  {entry.message}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 