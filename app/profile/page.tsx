'use client';

/**
 * Profile Page - User Settings and Subscription Management
 */

import { Card, Button } from '@/components';
import { useUser } from '@/store';
import { SubscriptionTier } from '@/types';

export default function ProfilePage() {
  const { user, isPremium, upgradeToPremiun, setUser } = useUser();

  const handleNameChange = () => {
    const newName = prompt('Enter new name:', user?.name);
    if (newName && user) {
      setUser({ ...user, name: newName });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Profile
        </h1>
        <p className="text-gray-600">
          Manage your account and preferences
        </p>
      </div>

      {/* User Info Card */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-4xl text-white">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-semibold text-gray-900 mb-1">
              {user?.name}
            </h2>
            <p className="text-gray-600 mb-2">{user?.email}</p>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                isPremium()
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {isPremium() ? '✨ Premium' : '🆓 Free'}
              </span>
            </div>
          </div>
          <Button variant="outline" onClick={handleNameChange}>
            Edit Profile
          </Button>
        </div>
      </Card>

      {/* Subscription Card */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Subscription
        </h2>
        {isPremium() ? (
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Premium Plan
                </h3>
                <p className="text-sm text-gray-600">
                  You have access to all premium features
                </p>
              </div>
              <div className="text-3xl">👑</div>
            </div>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Unlimited outfit history
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Advanced AI recommendations
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Priority support
              </li>
            </ul>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Free Plan
                </h3>
                <p className="text-sm text-gray-600">
                  Upgrade to unlock all features
                </p>
              </div>
              <div className="text-3xl">🔒</div>
            </div>
            <ul className="space-y-2 text-sm text-gray-700 mb-4">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Last 3 outfits in history
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gray-400">✗</span>
                <span className="text-gray-500">Unlimited outfit history</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gray-400">✗</span>
                <span className="text-gray-500">Advanced AI recommendations</span>
              </li>
            </ul>
            <Button onClick={upgradeToPremiun} fullWidth>
              Upgrade to Premium
            </Button>
          </div>
        )}
      </Card>

      {/* Preferences Card */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Preferences
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Favorite Colors
            </label>
            <div className="flex gap-2 flex-wrap">
              {['Pink', 'Black', 'White', 'Beige', 'Blue'].map((color) => (
                <button
                  key={color}
                  className="px-4 py-2 rounded-full border border-gray-200 text-sm hover:border-pink-300 hover:bg-pink-50 transition-all"
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Style Preference
            </label>
            <select className="w-full px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200">
              <option>Casual</option>
              <option>Elegant</option>
              <option>Sporty</option>
              <option>Bohemian</option>
              <option>Minimalist</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Account Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Account Actions
        </h2>
        <div className="space-y-3">
          <button className="w-full text-left px-4 py-3 rounded-3xl hover:bg-gray-50 transition-all">
            📧 Change Email
          </button>
          <button className="w-full text-left px-4 py-3 rounded-3xl hover:bg-gray-50 transition-all">
            🔒 Change Password
          </button>
          <button className="w-full text-left px-4 py-3 rounded-3xl hover:bg-gray-50 transition-all">
            🌙 Dark Mode
          </button>
          <button className="w-full text-left px-4 py-3 rounded-3xl hover:bg-red-50 text-red-600 transition-all">
            🚪 Log Out
          </button>
        </div>
      </Card>
    </div>
  );
}