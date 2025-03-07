import { CurrencyType, PlayerMarketItem } from "@/lib/marketplace-types";
import { Item } from "@/components/item-slot";

// Simple in-memory database for player listings
let playerMarketItems: PlayerMarketItem[] = [];

// Add a player listing
export function addPlayerListing(listing: {
  id: string;
  currencies: {
    [CurrencyType.GOLD]?: number;
    [CurrencyType.GEMS]?: number;
  };
  requireAllCurrencies: boolean;
  quantity: number;
  originalItem: Item | undefined;
  seller: string;
}): void {
  console.log("Adding player listing:", listing);
  
  // Simple validation
  if (!listing.id || !listing.seller) {
    console.error("Cannot add listing without id or seller");
    return;
  }
  
  // Validate currencies
  const goldPrice = listing.currencies?.[CurrencyType.GOLD] || 0;
  const gemsPrice = listing.currencies?.[CurrencyType.GEMS] || 0;
  
  if (goldPrice <= 0 && gemsPrice <= 0) {
    console.error("Cannot add listing without at least one currency");
    return;
  }
  
  // Create a deep copy to avoid reference issues
  const newListing = JSON.parse(JSON.stringify(listing));
  
  // Add to player market items
  playerMarketItems.push(newListing);
  console.log("Player market items:", playerMarketItems);
}

// Get all player listings
export function getPlayerListings(): PlayerMarketItem[] {
  return [...playerMarketItems]; // Return a copy to prevent direct mutation
}

// Clear all player listings (for testing)
export function clearPlayerListings(): void {
  playerMarketItems = [];
}

// Remove a player listing
export function removePlayerListing(id: string, seller: string): boolean {
  const initialLength = playerMarketItems.length;
  playerMarketItems = playerMarketItems.filter(
    item => !(item.id === id && item.seller === seller)
  );
  return playerMarketItems.length < initialLength;
} 