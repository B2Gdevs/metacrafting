"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CombatVictoryProps {
  rewards: {
    gold: number;
    experience: number;
    items: { id: string; quantity: number }[];
  };
  onCollectRewards: () => void;
}

export function CombatVictory({ rewards, onCollectRewards }: CombatVictoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Victory!</CardTitle>
        <CardDescription>You have defeated the enemy!</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Rewards:</h3>
            <ul className="list-disc list-inside">
              <li>{rewards.gold} Gold</li>
              <li>{rewards.experience} Experience</li>
              {rewards.items.map((item, index) => (
                <li key={index}>{item.quantity}x {item.id}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onCollectRewards} className="w-full">Continue</Button>
      </CardFooter>
    </Card>
  );
}

interface CombatDefeatProps {
  onContinue: () => void;
}

export function CombatDefeat({ onContinue }: CombatDefeatProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Defeat</CardTitle>
        <CardDescription>You have been defeated!</CardDescription>
      </CardHeader>
      <CardContent>
        <p>You have been restored to 10% health and magic points.</p>
      </CardContent>
      <CardFooter>
        <Button onClick={onContinue} className="w-full">Continue</Button>
      </CardFooter>
    </Card>
  );
} 