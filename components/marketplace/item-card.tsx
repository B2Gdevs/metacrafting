"use client"

import { CharacterStats } from "@/components/character-sheet";
import { Item } from "@/components/item-slot";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  canAffordItem,
  formatStatName,
  getItemTypeIcon,
  getRarityClass,
  getRarityTextClass
} from "@/lib/marketplace-utils";
import { Coins, Diamond, Info, Package, ShoppingCart, Plus } from "lucide-react";
import { CurrencyType, MarketplaceItem } from "@/lib/marketplace-types";

interface ItemCardProps {
  item: MarketplaceItem;
  action: "buy" | "sell" | "list";
  gameItems: Record<string, Item>;
  playerGold: number;
  playerGems: number;
  onAction: () => void;
  character?: CharacterStats;
  onShowOverlay?: (top: number) => void;
  onHideOverlay?: () => void;
}

export default function ItemCard({
  item,
  action,
  gameItems,
  playerGold,
  playerGems,
  onAction,
  character,
  onShowOverlay,
  onHideOverlay
}: ItemCardProps) {
  const gameItem = item.originalItem || gameItems[item.id];
  
  if (!gameItem) {
    console.error(`Item not found: ${item.id}`);
    return null;
  }
  
  const canAfford = canAffordItem(playerGold, playerGems, item);
  
  const actionText = {
    buy: "Buy",
    sell: "Sell",
    list: "List for Sale"
  };
  
  const actionDisabled = {
    buy: !canAfford || item.quantity <= 0,
    sell: false,
    list: false
  };
  
  const stockText = {
    buy: `Stock: ${item.quantity}`,
    sell: "",
    list: ""
  };

  // Get action icon
  const getActionIcon = () => {
    switch (action) {
      case "buy":
        return <ShoppingCart className="mr-2 h-4 w-4" />;
      case "sell":
        return <Coins className="mr-2 h-4 w-4" />;
      case "list":
        return <Package className="mr-2 h-4 w-4" />;
    }
  };

  // Get button style based on rarity
  const getButtonStyle = () => {
    if (!gameItem.rarity) return {};
    
    const baseStyles = {
      fontWeight: 'bold',
      border: '2px solid',
    };
    
    switch (gameItem.rarity) {
      case "uncommon":
        return {
          ...baseStyles,
          backgroundColor: 'rgba(74, 222, 128, 0.2)',
          borderColor: 'rgb(74, 222, 128)',
          color: 'rgb(74, 222, 128)'
        };
      case "rare":
        return {
          ...baseStyles,
          backgroundColor: 'rgba(96, 165, 250, 0.2)',
          borderColor: 'rgb(96, 165, 250)',
          color: 'rgb(96, 165, 250)'
        };
      case "epic":
        return {
          ...baseStyles,
          backgroundColor: 'rgba(192, 132, 252, 0.2)',
          borderColor: 'rgb(192, 132, 252)',
          color: 'rgb(192, 132, 252)'
        };
      case "legendary":
        return {
          ...baseStyles,
          backgroundColor: 'rgba(251, 191, 36, 0.2)',
          borderColor: 'rgb(251, 191, 36)',
          color: 'rgb(251, 191, 36)'
        };
      case "mythic":
        return {
          ...baseStyles,
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          borderColor: 'rgb(239, 68, 68)',
          color: 'rgb(239, 68, 68)'
        };
      default:
        return {
          ...baseStyles,
          backgroundColor: 'rgba(156, 163, 175, 0.2)',
          borderColor: 'rgb(156, 163, 175)',
          color: 'rgb(156, 163, 175)'
        };
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (gameItem.equippable && character && onShowOverlay) {
      const rect = e.currentTarget.getBoundingClientRect();
      onShowOverlay(rect.top);
    }
  };
  
  // Currency Display - Always visible
  const renderCurrencyDisplay = () => {
    const hasGold = !!item.currencies[CurrencyType.GOLD];
    const hasGems = !!item.currencies[CurrencyType.GEMS];
    const hasBothCurrencies = hasGold && hasGems;

    if (hasBothCurrencies) {
      return (
        <div className="mb-3">
          {/* Dual Currency Badge - Prominent at the top */}
          <div className={`w-full mb-2 flex justify-center`}>
            <Badge 
              className={`px-3 py-1 text-xs font-bold ${
                item.requireAllCurrencies 
                  ? "bg-purple-900/60 text-purple-200 border border-purple-500/50" 
                  : "bg-gray-800/60 text-gray-200 border border-gray-600/50"
              }`}
            >
              {item.requireAllCurrencies ? "REQUIRES BOTH CURRENCIES" : "ACCEPTS EITHER CURRENCY"}
            </Badge>
          </div>
          
          {/* Currency Display Box */}
          <div className={`
            rounded-lg p-2 border border-gray-700/50
            ${item.requireAllCurrencies 
              ? 'bg-gradient-to-r from-amber-900/30 via-purple-900/20 to-blue-900/30 border-purple-700/30' 
              : 'bg-gradient-to-r from-amber-900/30 to-blue-900/30'}
          `}>
            {/* Gold Display */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-full bg-amber-900/40">
                  <Coins className="h-4 w-4 text-amber-400" />
                </div>
                <p className="text-sm font-semibold text-amber-400">{item.currencies[CurrencyType.GOLD]} Gold</p>
              </div>
            </div>
            
            {/* Connector */}
            <div className="flex justify-center items-center my-1">
              <div className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                item.requireAllCurrencies 
                  ? "bg-purple-900/40 text-purple-300" 
                  : "bg-gray-800 text-gray-400"
              }`}>
                {item.requireAllCurrencies ? "AND" : "OR"}
              </div>
            </div>
            
            {/* Gems Display */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-full bg-blue-900/40">
                  <Diamond className="h-4 w-4 text-blue-400" />
                </div>
                <p className="text-sm font-semibold text-blue-400">{item.currencies[CurrencyType.GEMS]} Gems</p>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      // Single currency display
      return (
        <div className="mb-3">
          <p className="text-sm font-semibold flex items-center justify-center">
            {hasGold ? (
              <span className="flex items-center bg-amber-900/20 px-3 py-1.5 rounded-lg border border-amber-700/30">
                <Coins className="h-5 w-5 mr-2 text-amber-500" />
                <span className="text-amber-400 font-bold">{item.currencies[CurrencyType.GOLD]} Gold</span>
              </span>
            ) : (
              <span className="flex items-center bg-blue-900/20 px-3 py-1.5 rounded-lg border border-blue-700/30">
                <Diamond className="h-5 w-5 mr-2 text-blue-500" />
                <span className="text-blue-400 font-bold">{item.currencies[CurrencyType.GEMS]} Gems</span>
              </span>
            )}
          </p>
        </div>
      );
    }
  };

  return (
    <div 
      className={`border-2 ${getRarityClass(gameItem.rarity || 'common')} rounded-lg overflow-hidden bg-card text-card-foreground shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] relative`}
      style={{
        boxShadow: gameItem.rarity === 'legendary' ? '0 0 20px rgba(251,191,36,0.6)' : 
                  gameItem.rarity === 'mythic' ? '0 0 25px rgba(239,68,68,0.7)' :
                  gameItem.rarity === 'epic' ? '0 0 15px rgba(192,132,252,0.5)' :
                  gameItem.rarity === 'rare' ? '0 0 15px rgba(96,165,250,0.5)' :
                  gameItem.rarity === 'uncommon' ? '0 0 15px rgba(74,222,128,0.5)' : 'none'
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onHideOverlay}
    >
      {/* Header */}
      <div className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <h3 className={`text-lg font-bold ${getRarityTextClass(gameItem.rarity || 'common')}`}>
            {getItemTypeIcon(gameItem.type)} {gameItem.name}
          </h3>
          <div className="flex flex-col gap-1 items-end">
            {gameItem.rarity && (
              <Badge variant="outline" className={`capitalize ${getRarityTextClass(gameItem.rarity)}`}>
                {gameItem.rarity}
              </Badge>
            )}
            {gameItem.equippable && character && (
              <Badge variant="outline" className={`text-xs ${gameItem.rarity && gameItem.rarity !== "common" ? getRarityTextClass(gameItem.rarity) : ""}`}>
                Equippable
              </Badge>
            )}
            {item.quantity > 1 && (
              <Badge variant="outline" className="text-xs bg-gray-800 text-gray-200">
                Qty: {item.quantity}
              </Badge>
            )}
          </div>
        </div>
        {gameItem.type && (
          <Badge variant="secondary" className="capitalize mt-1">
            {gameItem.type}
          </Badge>
        )}
      </div>
      
      {/* Content */}
      <div className="px-4 py-2 max-h-[100px] overflow-y-auto">
        <p className="text-sm text-muted-foreground">{gameItem.description}</p>
        
        {gameItem.stats && Object.keys(gameItem.stats).length > 0 && (
          <div className="mt-2">
            <p className="text-sm font-semibold">Stats:</p>
            <div className="grid grid-cols-2 gap-1">
              {Object.entries(gameItem.stats).map(([stat, value]) => (
                <div key={stat} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{formatStatName(stat)}:</span>
                  <span className={`text-xs font-medium ${value > 0 ? 'text-green-400' : value < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                    {value > 0 ? `+${value}` : value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {gameItem.equippable && (
          <div className="flex items-center space-x-1 mt-2">
            <span className="text-xs text-muted-foreground">Slot:</span>
            <span className="text-xs font-medium capitalize">{gameItem.slot}</span>
            {gameItem.equippable && character && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 ml-1 text-blue-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="w-48">
                    <div className="text-xs">
                      <span className="text-green-400">Hover to see comparison</span>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}
        
        {gameItem.specialAbility && (
          <div className="mt-2">
            <p className="text-xs font-semibold">Special Ability:</p>
            <p className="text-xs text-purple-400">{gameItem.specialAbility}</p>
          </div>
        )}
      </div>
      
      {/* Price and Button - Always visible */}
      <div className="bg-card border-t border-border p-4 pt-3">
        {/* Currency Display */}
        {renderCurrencyDisplay()}
        
        <div className="flex justify-between items-center mb-2">
          {action === "buy" && item.quantity > 0 && (
            <p className="text-xs text-muted-foreground">{stockText[action]}</p>
          )}
          
          {action === "buy" && !canAfford && (
            <Badge variant="destructive" className="ml-auto text-xs">
              Cannot Afford
            </Badge>
          )}
        </div>
        
        <button
          className="w-full py-2 px-4 rounded-md flex items-center justify-center transition-colors hover:brightness-110 active:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={getButtonStyle()}
          onClick={onAction}
          disabled={actionDisabled[action]}
        >
          {getActionIcon()}
          <span className="font-bold text-base">{actionText[action]}</span>
        </button>
      </div>
      
      {/* Rarity effects - particles for legendary and mythic items */}
      {(gameItem.rarity === 'legendary' || gameItem.rarity === 'mythic') && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-b 
            ${gameItem.rarity === 'legendary' ? 'from-amber-500/5 to-amber-500/10' : 'from-red-500/5 to-red-500/10'} 
            animate-pulse`}></div>
          
          {Array.from({ length: 10 }).map((_, i) => {
            const top = `${Math.random() * 100}%`;
            const left = `${Math.random() * 100}%`;
            const delay = `${Math.random() * 2}s`;
            const size = `${Math.random() * 0.5 + 0.5}px`;
            const color = gameItem.rarity === 'legendary' ? 'bg-amber-400' : 'bg-red-400';
            
            return (
              <div 
                key={i}
                className={`absolute rounded-full ${color} animate-float-particle opacity-0`}
                style={{ 
                  top, 
                  left, 
                  width: size, 
                  height: size, 
                  animationDelay: delay 
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
} 