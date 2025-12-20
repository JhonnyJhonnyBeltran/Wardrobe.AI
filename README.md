# Wardrobe.AI 👗✨

A modern, AI-powered fashion assistant Progressive Web App (PWA) built with Next.js 14, TypeScript, and Tailwind CSS. Features a beautiful "Clean Girl" aesthetic with mobile-first responsive design.

## 🎨 Features

- **AI Outfit Generator**: Create perfect outfits for any occasion with AI assistance
- **Digital Wardrobe**: Manage your clothing items and outfit history
- **Freemium Model**: Free tier with 3 outfit history limit, Premium for unlimited access
- **Fashion Chat Assistant**: Get personalized style advice through AI chat
- **User Profile Management**: Customize preferences and manage subscription
- **Progressive Web App**: Install on any device for native-like experience
- **Responsive Design**: Seamless experience from mobile to desktop

## 📱 Screenshots

### Desktop View
![Home Desktop](https://github.com/user-attachments/assets/7ed1a98e-f404-4eed-a1f3-8a892e121651)
![Closet Desktop](https://github.com/user-attachments/assets/64010eb4-59d9-4ae9-a9fd-b3068a441a70)

### Mobile View
![Home Mobile](https://github.com/user-attachments/assets/dbeb2cac-1214-49b6-8cfe-ec91de30361c)
![Closet Mobile](https://github.com/user-attachments/assets/b9712a83-21f7-49ad-b9cd-90df73888772)
![Chat Mobile](https://github.com/user-attachments/assets/e8aa159f-b8c4-47fe-aa7a-f8e426c2df1f)
![Profile Mobile](https://github.com/user-attachments/assets/80c784ef-dbf7-41db-8bba-987bddc7bf55)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/DaniFdezCab/Wardrobe.AI.git

# Navigate to project directory
cd Wardrobe.AI

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
Wardrobe.AI/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Home - Outfit Generator
│   ├── closet/            # Wardrobe management
│   ├── chat/              # AI Fashion Assistant
│   └── profile/           # User profile & settings
├── components/            # Reusable UI components
│   ├── AppLayout.tsx      # Main layout wrapper
│   ├── TabBar.tsx         # Mobile bottom navigation
│   ├── Sidebar.tsx        # Desktop side navigation
│   ├── Card.tsx           # Card component
│   └── Button.tsx         # Button component
├── store/                 # State management
│   └── userStore.tsx      # User & subscription context
├── types/                 # TypeScript definitions
│   ├── clothing.ts        # Clothing item types
│   ├── outfit.ts          # Outfit types
│   └── user.ts            # User & subscription types
└── public/               # Static assets
    └── manifest.json     # PWA manifest
```

## 🎯 Key Features Explained

### Clean Girl Design System

- **Rounded Corners**: All elements use `rounded-3xl` (24px) for soft, feminine aesthetic
- **Minimal Color Palette**: Pink and purple gradients on white backgrounds
- **Spacious Layout**: Generous padding and whitespace for clarity
- **Smooth Animations**: Subtle transitions and hover effects

### Responsive Navigation

- **Mobile**: Fixed bottom TabBar with 4 main sections
- **Desktop**: Left sidebar with navigation and premium upsell
- **Seamless Transition**: Automatic switching at md breakpoint (768px)

### Freemium Logic (Closet Page)

```typescript
// Free users can view only last 3 items
const freeLimit = 3;
const isLocked = !isPremium() && index >= freeLimit;

// Locked items show blurred preview with upgrade prompt
```

### State Management

Uses React Context API for global state:
- User profile and authentication
- Subscription tier (Free vs Premium)
- User preferences
- LocalStorage persistence

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State**: React Context API
- **PWA**: Next.js PWA support

## 📝 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## 🎨 Design Tokens

### Colors
- Primary: Pink (#ec4899) to Purple (#a855f7) gradient
- Background: Light gray (#fafafa)
- Text: Dark gray (#171717)
- Accents: Pink-50, Purple-50

### Typography
- System fonts: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto
- Font weights: Regular (400), Medium (500), Semibold (600), Bold (700)

### Spacing
- Base unit: 4px (Tailwind's default)
- Border radius: 24px (rounded-3xl) for main elements

## 🔮 Future Enhancements

- [ ] Backend API integration for real AI outfit generation
- [ ] Image upload for clothing items
- [ ] Social sharing of outfits
- [ ] Weather-based outfit suggestions
- [ ] Calendar integration for outfit planning
- [ ] Payment integration for Premium subscriptions

## 📄 License

This project is licensed under the MIT License.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
