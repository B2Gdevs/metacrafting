"use client"

import { Item } from "@/components/item-slot";

// Define enums
export enum CurrencyType {
  GOLD = "gold",
  GEMS = "gems"
}

// Define types
export interface CurrencyValues {
  [CurrencyType.GOLD]: number;
  [CurrencyType.GEMS]: number;
}

export interface MarketplaceItem {
  id: string;
  currencies: Partial<CurrencyValues>;
  requireAllCurrencies: boolean;
  quantity: number;
  originalItem?: Item;
}

export interface PlayerMarketItem extends MarketplaceItem {
  seller: string;
}

export interface NpcItem extends MarketplaceItem {
  // NPC-specific properties can be added here if needed
}

export interface Notification {
  message: string;
  type: "success" | "error";
} 