import { CurrencyType, PlayerMarketItem } from "@/lib/marketplace-types";
import { Item } from "@/components/item-slot";
import { useState, useEffect } from 'react';

// Define the store state
interface MarketplaceState {
  // Player listings
  playerListings: PlayerMarketItem[];
  draftListing: PlayerMarketItem | null;
  
  // Actions
  addListing: (listing: PlayerMarketItem) => void;
  removeListing: (id: string, seller: string) => void;
  setDraftListing: (draft: PlayerMarketItem | null) => void;
  updateDraftListing: (updates: Partial<PlayerMarketItem>) => void;
  clearDraftListing: () => void;
  getListings: () => PlayerMarketItem[];
  setPlayerListings: (listings: PlayerMarketItem[]) => void;
}

// Create a simple store implementation
class MarketplaceStore {
  private playerListings: PlayerMarketItem[] = [];
  private draftListing: PlayerMarketItem | null = null;
  private listeners: (() => void)[] = [];

  // Get the current state
  getState(): Pick<MarketplaceState, 'playerListings' | 'draftListing'> {
    return {
      playerListings: [...this.playerListings],
      draftListing: this.draftListing ? structuredClone(this.draftListing) : null
    };
  }

  // Subscribe to state changes
  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners of state changes
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  // Add a listing
  addListing(listing: PlayerMarketItem): void {
    console.log("Adding listing to store:", listing);
    
    // Validate listing
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
    const newListing = structuredClone(listing);
    
    // Ensure currencies object exists and contains only positive values
    if (!newListing.currencies) {
      newListing.currencies = {};
    }
    
    // Explicitly set currencies with positive values
    if (goldPrice > 0) {
      newListing.currencies[CurrencyType.GOLD] = goldPrice;
    }
    
    if (gemsPrice > 0) {
      newListing.currencies[CurrencyType.GEMS] = gemsPrice;
    }
    
    console.log("Final listing with currencies:", newListing);
    
    // Add to player listings
    this.playerListings.push(newListing);
    console.log("Player listings after add:", this.playerListings);
    
    // Notify listeners
    this.notifyListeners();
  }

  // Remove a listing
  removeListing(id: string, seller: string): void {
    const initialLength = this.playerListings.length;
    this.playerListings = this.playerListings.filter(
      item => !(item.id === id && item.seller === seller)
    );
    
    if (this.playerListings.length < initialLength) {
      this.notifyListeners();
    }
  }

  // Set the draft listing
  setDraftListing(draft: PlayerMarketItem | null): void {
    this.draftListing = draft ? structuredClone(draft) : null;
    this.notifyListeners();
  }

  // Update the draft listing
  updateDraftListing(updates: Partial<PlayerMarketItem>): void {
    if (!this.draftListing) return;
    
    console.log("Updating draft listing with:", updates);
    
    // Create a deep copy of the current draft
    const updated = structuredClone(this.draftListing);
    
    // Handle special case for currencies
    if (updates.currencies) {
      if (!updated.currencies) {
        updated.currencies = {};
      }
      
      // Merge currencies
      Object.entries(updates.currencies).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value > 0) {
          updated.currencies[key as CurrencyType] = value;
        }
      });
      
      console.log("Updated currencies:", updated.currencies);
    }
    
    // Apply all other updates
    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'currencies' && value !== undefined) {
        (updated as any)[key] = value;
      }
    });
    
    console.log("Updated draft listing:", updated);
    
    // Set the updated draft
    this.draftListing = updated;
    this.notifyListeners();
  }

  // Clear the draft listing
  clearDraftListing(): void {
    this.draftListing = null;
    this.notifyListeners();
  }

  // Get all listings
  getListings(): PlayerMarketItem[] {
    return [...this.playerListings];
  }
  
  // Set all player listings
  setPlayerListings(listings: PlayerMarketItem[]): void {
    this.playerListings = listings.map(listing => structuredClone(listing));
    this.notifyListeners();
  }
}

// Create a singleton instance
const marketplaceStore = new MarketplaceStore();

// Export the store instance
export default marketplaceStore;

// Export a hook to use the store
export function useMarketplaceStore() {
  const [state, setState] = useState(marketplaceStore.getState());
  
  useEffect(() => {
    const unsubscribe = marketplaceStore.subscribe(() => {
      setState(marketplaceStore.getState());
    });
    
    return unsubscribe;
  }, []);
  
  return {
    ...state,
    addListing: marketplaceStore.addListing.bind(marketplaceStore),
    removeListing: marketplaceStore.removeListing.bind(marketplaceStore),
    setDraftListing: marketplaceStore.setDraftListing.bind(marketplaceStore),
    updateDraftListing: marketplaceStore.updateDraftListing.bind(marketplaceStore),
    clearDraftListing: marketplaceStore.clearDraftListing.bind(marketplaceStore),
    getListings: marketplaceStore.getListings.bind(marketplaceStore),
    setPlayerListings: marketplaceStore.setPlayerListings.bind(marketplaceStore)
  };
} 