'use client';

/**
 * Home Page - Outfit Generator
 */

import { useState } from 'react';
import { Card, Button } from '@/components';
import { OutfitOccasion } from '@/types';

const occasions = [
  { value: OutfitOccasion.CASUAL, label: 'Casual', icon: '👕' },
  { value: OutfitOccasion.FORMAL, label: 'Formal', icon: '👔' },
  { value: OutfitOccasion.BUSINESS, label: 'Business', icon: '💼' },
  { value: OutfitOccasion.PARTY, label: 'Party', icon: '🎉' },
  { value: OutfitOccasion.SPORT, label: 'Sport', icon: '⚽' },
  { value: OutfitOccasion.DATE, label: 'Date', icon: '💕' },
];

const seasons = [
  { value: 'spring', label: 'Spring', icon: '🌸' },
  { value: 'summer', label: 'Summer', icon: '☀️' },
  { value: 'fall', label: 'Fall', icon: '🍂' },
  { value: 'winter', label: 'Winter', icon: '❄️' },
];

export default function Home() {
  const [selectedOccasion, setSelectedOccasion] = useState<OutfitOccasion | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<string>('spring');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate API call
    setTimeout(() => {
      setIsGenerating(false);
      alert('Outfit generated! (This is a demo)');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Generate Your Perfect Outfit
        </h1>
        <p className="text-gray-600">
          Let AI create a stunning look for any occasion
        </p>
      </div>

      {/* Occasion Selection */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Choose an Occasion
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {occasions.map((occasion) => (
            <button
              key={occasion.value}
              onClick={() => setSelectedOccasion(occasion.value)}
              className={`flex flex-col items-center gap-2 p-4 rounded-3xl border-2 transition-all ${
                selectedOccasion === occasion.value
                  ? 'border-pink-500 bg-pink-50'
                  : 'border-gray-200 hover:border-pink-300'
              }`}
            >
              <span className="text-3xl">{occasion.icon}</span>
              <span className="text-sm font-medium">{occasion.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Season Selection */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Select Season
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {seasons.map((season) => (
            <button
              key={season.value}
              onClick={() => setSelectedSeason(season.value)}
              className={`flex flex-col items-center gap-2 p-4 rounded-3xl border-2 transition-all ${
                selectedSeason === season.value
                  ? 'border-pink-500 bg-pink-50'
                  : 'border-gray-200 hover:border-pink-300'
              }`}
            >
              <span className="text-3xl">{season.icon}</span>
              <span className="text-sm font-medium">{season.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Generate Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleGenerate}
          disabled={!selectedOccasion || isGenerating}
          size="lg"
          className="min-w-[200px]"
        >
          {isGenerating ? '✨ Generating...' : '✨ Generate Outfit'}
        </Button>
      </div>

      {/* Preview Section */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Your Outfit Preview
        </h2>
        <div className="aspect-square bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl flex items-center justify-center">
          <p className="text-gray-400 text-center">
            {selectedOccasion 
              ? 'Click Generate to create your outfit'
              : 'Select an occasion to get started'}
          </p>
        </div>
      </Card>
    </div>
  );
}
