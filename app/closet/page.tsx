'use client';

/**
 * Closet Page - Wardrobe Management with Freemium Logic
 */

import { useState } from 'react';
import { Card } from '@/components';
import { useUser } from '@/store';

// Mock data for demonstration
const mockOutfits = [
  { id: '1', name: 'Summer Casual', date: '2024-01-15', image: '☀️' },
  { id: '2', name: 'Business Look', date: '2024-01-14', image: '💼' },
  { id: '3', name: 'Date Night', date: '2024-01-13', image: '💕' },
  { id: '4', name: 'Weekend Brunch', date: '2024-01-12', image: '🥂' },
  { id: '5', name: 'Gym Fit', date: '2024-01-11', image: '⚽' },
  { id: '6', name: 'Party Ready', date: '2024-01-10', image: '🎉' },
];

export default function ClosetPage() {
  const { isPremium, upgradeToPremiun } = useUser();
  const [activeTab, setActiveTab] = useState<'outfits' | 'items'>('outfits');
  const freeLimit = 3;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            My Closet
          </h1>
          <p className="text-gray-600">
            Your wardrobe and outfit history
          </p>
        </div>
        {!isPremium() && (
          <button
            onClick={upgradeToPremiun}
            className="hidden md:block bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-2 rounded-full text-sm font-medium hover:shadow-lg transition-all"
          >
            Upgrade
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('outfits')}
          className={`px-6 py-3 font-medium rounded-t-3xl transition-all ${
            activeTab === 'outfits'
              ? 'bg-pink-50 text-pink-600 border-b-2 border-pink-500'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Outfits
        </button>
        <button
          onClick={() => setActiveTab('items')}
          className={`px-6 py-3 font-medium rounded-t-3xl transition-all ${
            activeTab === 'items'
              ? 'bg-pink-50 text-pink-600 border-b-2 border-pink-500'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Items
        </button>
      </div>

      {/* Freemium Banner */}
      {!isPremium() && (
        <Card className="p-6 bg-gradient-to-r from-pink-50 to-purple-50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Unlock Unlimited History 🔓
              </h3>
              <p className="text-sm text-gray-600">
                Free users can view only the last {freeLimit} items. Upgrade to Premium for unlimited access!
              </p>
            </div>
            <button
              onClick={upgradeToPremiun}
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-2 rounded-full text-sm font-medium hover:shadow-lg transition-all whitespace-nowrap"
            >
              Go Premium
            </button>
          </div>
        </Card>
      )}

      {/* Outfits Grid */}
      {activeTab === 'outfits' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockOutfits.map((outfit, index) => {
            const isLocked = !isPremium() && index >= freeLimit;
            return (
              <Card 
                key={outfit.id}
                className={`relative overflow-hidden ${isLocked ? 'opacity-60' : ''}`}
              >
                <div className={`aspect-square bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center text-6xl ${isLocked ? 'blur-sm' : ''}`}>
                  {outfit.image}
                </div>
                {isLocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🔒</div>
                      <p className="text-white font-medium">Premium Only</p>
                    </div>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">{outfit.name}</h3>
                  <p className="text-sm text-gray-500">{outfit.date}</p>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Items Grid */}
      {activeTab === 'items' && (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">👗</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Items Yet
          </h3>
          <p className="text-gray-600">
            Start adding clothing items to your wardrobe
          </p>
          <button className="mt-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-2 rounded-full text-sm font-medium hover:shadow-lg transition-all">
            Add Item
          </button>
        </Card>
      )}
    </div>
  );
}