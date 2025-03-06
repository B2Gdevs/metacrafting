"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EnemyType } from "@/hooks/use-combat";

interface CombatEnemySelectionProps {
  enemies: EnemyType[];
  onSelectEnemy: (enemy: EnemyType) => void;
}

export default function CombatEnemySelection({ enemies, onSelectEnemy }: CombatEnemySelectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {enemies.map(enemy => (
        <Card key={enemy.id} className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => onSelectEnemy(enemy)}>
          <CardHeader>
            <CardTitle>{enemy.name}</CardTitle>
            <CardDescription>Level {enemy.level}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 bg-muted rounded-md flex items-center justify-center">
                {enemy.image ? (
                  <img src={enemy.image} alt={enemy.name} className="max-w-full max-h-full" />
                ) : (
                  <span>{enemy.name[0]}</span>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Health:</span>
                <span>{enemy.baseHealth}</span>
              </div>
              <div className="flex justify-between">
                <span>Attack:</span>
                <span>{enemy.baseStats.attack}</span>
              </div>
              <div className="flex justify-between">
                <span>Defense:</span>
                <span>{enemy.baseStats.defense}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Fight</Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
} 