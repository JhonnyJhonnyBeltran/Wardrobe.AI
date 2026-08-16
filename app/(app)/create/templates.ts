
export interface TemplateSlot {
    top: string;
    left: string;
    width: string;
    height?: string; // Auto if not set
    rotate: number; // Graduos
    zIndex: number;
}

export interface OutfitTemplate {
    id: string;
    name: string;
    itemCount: number; // Número exacto de items para este template
    // label?: string; // 'Editorial', 'Minimal', 'Street'
    slots: TemplateSlot[];
}

export const getTemplatesForCount = (count: number): OutfitTemplate[] => {
    return ALL_TEMPLATES.filter(t => t.itemCount === count);
};

const ALL_TEMPLATES: OutfitTemplate[] = [
    // --- 2 ITEMS (Basic Set) ---
    {
        id: 'duo-1',
        name: 'Dúo Dinámico',
        itemCount: 2,
        slots: [
            { top: '15%', left: '10%', width: '45%', rotate: -5, zIndex: 1 },
            { top: '25%', left: '50%', width: '40%', rotate: 5, zIndex: 2 }
        ]
    },
    {
        id: 'duo-2',
        name: 'Vertical Stack',
        itemCount: 2,
        slots: [
            { top: '10%', left: '25%', width: '50%', rotate: 0, zIndex: 1 },
            { top: '55%', left: '25%', width: '50%', rotate: 0, zIndex: 2 }
        ]
    },
    {
        id: 'duo-3',
        name: 'Overlap',
        itemCount: 2,
        slots: [
            { top: '20%', left: '15%', width: '50%', rotate: -10, zIndex: 1 },
            { top: '15%', left: '40%', width: '45%', rotate: 10, zIndex: 2 }
        ]
    },

    // --- 3 ITEMS (Top, Bottom, Shoes) ---
    {
        id: 'trio-1',
        name: 'Classic Triangle',
        itemCount: 3,
        slots: [
            { top: '10%', left: '10%', width: '40%', rotate: -5, zIndex: 1 }, // Top
            { top: '10%', left: '55%', width: '35%', rotate: 5, zIndex: 2 },  // Bottom
            { top: '55%', left: '30%', width: '40%', rotate: 0, zIndex: 3 }   // Shoes
        ]
    },
    {
        id: 'trio-2',
        name: 'Diagonal Flow',
        itemCount: 3,
        slots: [
            { top: '5%', left: '5%', width: '35%', rotate: -10, zIndex: 1 },
            { top: '35%', left: '35%', width: '35%', rotate: 0, zIndex: 2 },
            { top: '65%', left: '60%', width: '35%', rotate: 10, zIndex: 3 }
        ]
    },
    {
        id: 'trio-3',
        name: 'Center Stage',
        itemCount: 3,
        slots: [
            { top: '15%', left: '25%', width: '50%', rotate: 0, zIndex: 2 }, // Main
            { top: '60%', left: '10%', width: '35%', rotate: -15, zIndex: 1 },
            { top: '60%', left: '55%', width: '35%', rotate: 15, zIndex: 1 }
        ]
    },
    {
        id: 'trio-4',
        name: 'Magazine Left',
        itemCount: 3,
        slots: [
            { top: '10%', left: '5%', width: '55%', rotate: 0, zIndex: 1 },
            { top: '15%', left: '65%', width: '30%', rotate: 5, zIndex: 2 },
            { top: '65%', left: '55%', width: '40%', rotate: -5, zIndex: 3 }
        ]
    },
    {
        id: 'trio-5',
        name: 'Minimal Grid',
        itemCount: 3,
        slots: [
            { top: '10%', left: '10%', width: '35%', rotate: 0, zIndex: 1 },
            { top: '10%', left: '55%', width: '35%', rotate: 0, zIndex: 1 },
            { top: '55%', left: '32%', width: '35%', rotate: 0, zIndex: 1 }
        ]
    },

    // --- 4 ITEMS (Full Outfit) ---
    {
        id: 'quad-1',
        name: 'The Essential',
        itemCount: 4,
        slots: [
            { top: '5%', left: '5%', width: '40%', rotate: -2, zIndex: 1 }, // Top
            { top: '5%', left: '50%', width: '45%', rotate: 2, zIndex: 2 }, // Outer
            { top: '50%', left: '10%', width: '35%', rotate: 0, zIndex: 3 }, // Bottom
            { top: '50%', left: '55%', width: '35%', rotate: -5, zIndex: 4 } // Shoes
        ]
    },
    {
        id: 'quad-2',
        name: 'Layered Look',
        itemCount: 4,
        slots: [
            { top: '10%', left: '15%', width: '45%', rotate: -5, zIndex: 1 },
            { top: '15%', left: '35%', width: '50%', rotate: 0, zIndex: 2 }, // Layer overlap
            { top: '60%', left: '10%', width: '35%', rotate: 10, zIndex: 3 },
            { top: '65%', left: '50%', width: '40%', rotate: -5, zIndex: 4 }
        ]
    },
    {
        id: 'quad-3',
        name: 'Editorial Spread',
        itemCount: 4,
        slots: [
            { top: '10%', left: '10%', width: '30%', rotate: 0, zIndex: 1 },
            { top: '45%', left: '10%', width: '30%', rotate: 0, zIndex: 2 },
            { top: '5%', left: '50%', width: '40%', rotate: 5, zIndex: 3 }, // Hero item
            { top: '65%', left: '50%', width: '35%', rotate: -10, zIndex: 4 }
        ]
    },
    {
        id: 'quad-4',
        name: 'Chaos Chic',
        itemCount: 4,
        slots: [
            { top: '10%', left: '20%', width: '35%', rotate: -15, zIndex: 2 },
            { top: '25%', left: '50%', width: '40%', rotate: 15, zIndex: 1 },
            { top: '55%', left: '10%', width: '40%', rotate: 5, zIndex: 3 },
            { top: '50%', left: '45%', width: '35%', rotate: -10, zIndex: 4 }
        ]
    },
    {
        id: 'quad-5',
        name: 'Structured Grid',
        itemCount: 4,
        slots: [
            { top: '10%', left: '10%', width: '35%', rotate: 0, zIndex: 1 },
            { top: '10%', left: '55%', width: '35%', rotate: 0, zIndex: 1 },
            { top: '55%', left: '10%', width: '35%', rotate: 0, zIndex: 1 },
            { top: '55%', left: '55%', width: '35%', rotate: 0, zIndex: 1 }
        ]
    },

    // --- 5 Items ---
    {
        id: 'penta-1',
        name: 'Full Set',
        itemCount: 5,
        slots: [
            { top: '5%', left: '5%', width: '35%', rotate: -5, zIndex: 1 },
            { top: '5%', left: '45%', width: '35%', rotate: 5, zIndex: 2 },
            { top: '40%', left: '30%', width: '40%', rotate: 0, zIndex: 5 }, // Centerpiece
            { top: '70%', left: '10%', width: '30%', rotate: 10, zIndex: 3 },
            { top: '70%', left: '60%', width: '30%', rotate: -10, zIndex: 4 }
        ]
    },
    {
        id: 'penta-2',
        name: 'Curated Collection',
        itemCount: 5,
        slots: [
            { top: '10%', left: '10%', width: '25%', rotate: 0, zIndex: 1 },
            { top: '35%', left: '10%', width: '25%', rotate: 0, zIndex: 2 },
            { top: '60%', left: '10%', width: '25%', rotate: 0, zIndex: 3 },
            { top: '10%', left: '45%', width: '45%', rotate: 5, zIndex: 4 }, // Big right
            { top: '65%', left: '50%', width: '40%', rotate: -5, zIndex: 5 }
        ]
    },
    {
        id: 'penta-3',
        name: 'X Layout',
        itemCount: 5,
        slots: [
            { top: '5%', left: '5%', width: '30%', rotate: -15, zIndex: 1 },
            { top: '5%', left: '65%', width: '30%', rotate: 15, zIndex: 2 },
            { top: '35%', left: '35%', width: '30%', rotate: 0, zIndex: 5 }, // Center
            { top: '65%', left: '5%', width: '30%', rotate: 15, zIndex: 3 },
            { top: '65%', left: '65%', width: '30%', rotate: -15, zIndex: 4 }
        ]
    },
    {
        id: 'penta-4',
        name: 'Floating',
        itemCount: 5,
        slots: [
            { top: '15%', left: '15%', width: '35%', rotate: -5, zIndex: 1 },
            { top: '10%', left: '55%', width: '30%', rotate: 10, zIndex: 2 },
            { top: '45%', left: '5%', width: '30%', rotate: 5, zIndex: 3 },
            { top: '50%', left: '60%', width: '35%', rotate: -5, zIndex: 4 },
            { top: '70%', left: '35%', width: '30%', rotate: 0, zIndex: 5 }
        ]
    },
    {
        id: 'penta-5',
        name: 'Clean Grid 5',
        itemCount: 5,
        slots: [
            { top: '10%', left: '5%', width: '28%', rotate: 0, zIndex: 1 },
            { top: '10%', left: '36%', width: '28%', rotate: 0, zIndex: 1 },
            { top: '10%', left: '67%', width: '28%', rotate: 0, zIndex: 1 },
            { top: '55%', left: '15%', width: '30%', rotate: 0, zIndex: 1 },
            { top: '55%', left: '55%', width: '30%', rotate: 0, zIndex: 1 }
        ]
    }
];
