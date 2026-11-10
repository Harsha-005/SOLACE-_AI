/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ScreenType, UserProfile, MoodEntry } from './types';
import { storage } from './utils/storage';
import { MobileFrame } from './components/MobileFrame';
import { Navigation } from './components/Navigation';
import { AudioDock } from './components/AudioDock';
import { OnboardingScreen } from './components/screens/OnboardingScreen';
import { HomeScreen } from './components/screens/HomeScreen';
import { ChatScreen } from './components/screens/ChatScreen';
import { BreathingScreen } from './components/screens/BreathingScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(() => storage.getProfile());
  const [currentScreen, setCurrentScreen] = useState<ScreenType>(() => {
    const p = storage.getProfile();
    return p.onboardingCompleted ? 'home' : 'onboarding';
  });
  const [activeMoodContext, setActiveMoodContext] = useState<MoodEntry | null>(null);

  // Sync profile updates
  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    const newProfile = { ...profile, ...updated };
    setProfile(newProfile);
    storage.saveProfile(newProfile);
  };

  const handleOnboardingComplete = (data: Partial<UserProfile>) => {
    const updated = {
      ...profile,
      ...data,
      onboardingCompleted: true,
    };
    setProfile(updated);
    storage.saveProfile(updated);
    setCurrentScreen('home');
  };

  const handleResetAll = () => {
    if (window.confirm("Are you sure you want to reset all sanctuary logs and restart onboarding?")) {
      storage.clearAllData();
      const fresh = storage.getProfile();
      setProfile(fresh);
      setCurrentScreen('onboarding');
      setActiveMoodContext(null);
    }
  };

  return (
    <MobileFrame>
      {/* Active Screen Rendering */}
      <main className="w-full h-full relative">
        {currentScreen === 'onboarding' && (
          <OnboardingScreen onComplete={handleOnboardingComplete} />
        )}

        {currentScreen === 'home' && (
          <HomeScreen
            profile={profile}
            onNavigate={(screen) => setCurrentScreen(screen)}
            onSelectMoodForChat={(mood) => {
              setActiveMoodContext(mood);
              setCurrentScreen('chat');
            }}
          />
        )}

        {currentScreen === 'chat' && (
          <ChatScreen
            profile={profile}
            currentMood={activeMoodContext}
            onNavigate={(screen) => setCurrentScreen(screen)}
          />
        )}

        {currentScreen === 'breathing' && (
          <BreathingScreen
            profile={profile}
            onNavigate={(screen) => setCurrentScreen(screen)}
            onUpdateStats={(updated) => setProfile(updated)}
          />
        )}

        {currentScreen === 'profile' && (
          <ProfileScreen
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onNavigate={(screen) => setCurrentScreen(screen)}
            onResetAll={handleResetAll}
          />
        )}
      </main>

      {/* Persistent Audio Dock (when not onboarding) */}
      {currentScreen !== 'onboarding' && (
        <AudioDock
          profile={profile}
          onUpdateProfile={handleUpdateProfile}
        />
      )}

      {/* Bottom Navigation (when not onboarding) */}
      {currentScreen !== 'onboarding' && (
        <Navigation
          currentScreen={currentScreen}
          onNavigate={(screen) => setCurrentScreen(screen)}
        />
      )}
    </MobileFrame>
  );
}
