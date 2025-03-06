import { CharacterStats } from "@/components/character-sheet";

// Initial character state
export const initialCharacter: CharacterStats = {
  name: "Craftmaster",
  level: 5,
  experience: 240,
  experienceToNextLevel: 500,
  strength: 8,
  speed: 6,
  health: 100,
  maxHealth: 100,
  magicPoints: 50,
  maxMagicPoints: 50,
  image: "/placeholder-user.jpg",
  craftingStats: {
    metalworking: 3,
    magicworking: 2,
    spellcraft: 2,
  },
  craftingExperience: {
    metalworking: 150,
    magicworking: 80,
    spellcraft: 50,
  },
  gold: 500,
  gems: 10,
  equipment: {
    rings: []
  }
};

// Initial inventory state
export const initialInventory = [
  { id: "wood", quantity: 5 },
  { id: "stone", quantity: 3 },
  { id: "iron", quantity: 2 },
  { id: "leather", quantity: 3 },
  { id: "herb", quantity: 4 },
  { id: "crystal", quantity: 2 },
  { id: "steel", quantity: 1 },
  { id: "cloth", quantity: 2 },
  { id: "silver", quantity: 1 },
  { id: "ancient_rune", quantity: 1 },
  { id: "dragon_scale", quantity: 1 },
  { id: "potion", quantity: 1 },
]; 