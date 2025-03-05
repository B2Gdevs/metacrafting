# MetaCrafting System

A comprehensive crafting and equipment system for RPG games, featuring pattern-based crafting, equipment management, character progression, and turn-based combat.

## Features

### Crafting System
- Pattern-based crafting grid for creating items
- Visual feedback for crafting success rates
- Recipe discovery and management
- Crafting controls for fine-tuning item creation
- Rarity calculations based on materials and crafting skill
- Special crafting patterns for unique items

### Equipment System
- Visual equipment layout with slots for different gear types
- Stat bonuses from equipped items
- Elemental damage and resistance system
- Special skills and abilities from equipment
- Equipment upgrading and enhancement

### Combat System
- Turn-based combat with enemies of varying difficulty
- Special abilities and status effects
- Combat log with detailed information
- Enemy AI with different attack patterns
- Rewards based on enemy difficulty

### Character Progression
- Experience and leveling system
- Crafting skills that improve with use
- Inventory management
- Currency system with gold and gems
- Marketplace for buying and selling items

## Technologies Used

- Next.js
- TypeScript
- Tailwind CSS
- Framer Motion
- React DnD (Drag and Drop)
- Radix UI Components
- Lucide React Icons

## Getting Started

### Prerequisites
- Node.js 16.8 or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/metacrafting-system.git
cd metacrafting-system
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
metacrafting-system/
├── app/                  # Next.js app directory
│   ├── globals.css       # Global styles
│   └── page.tsx          # Main application page
├── components/           # React components
│   ├── character-sheet.tsx    # Character stats and equipment
│   ├── crafting-system.tsx    # Crafting interface
│   ├── crafting-controls.tsx  # Controls for crafting
│   ├── combat-system.tsx      # Combat interface
│   ├── equipment-layout.tsx   # Equipment slots layout
│   ├── item-slot.tsx          # Item display component
│   ├── marketplace.tsx        # Trading interface
│   ├── recipe-book.tsx        # Recipe collection
│   └── ui/                    # UI components
├── lib/                  # Utility functions and data
│   ├── items.ts          # Item definitions
│   ├── recipes.ts        # Crafting recipes
│   └── combat-utils.ts   # Combat calculations
└── public/               # Static assets
    └── images/           # Item and character images
```

## Future Enhancements

- Multiplayer crafting competitions
- More complex crafting patterns
- Enchantment system for equipment
- Quest system with crafting objectives
- Advanced character classes with unique crafting abilities
- Mobile-responsive design
- Save/load functionality
- More enemy types and combat scenarios
- Procedurally generated dungeons

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by crafting systems in popular RPGs
- UI design influenced by modern game interfaces
- Special thanks to the Next.js and React communities for their excellent tools and documentation 