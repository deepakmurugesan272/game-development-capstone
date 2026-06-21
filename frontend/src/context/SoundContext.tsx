import React, { createContext, useContext, useState, useEffect } from 'react';
import * as soundGen from '../utils/soundGenerator';

interface SoundContextType {
  soundEnabled: boolean;
  musicEnabled: boolean;
  toggleSound: () => void;
  toggleMusic: () => void;
  playSeedClick: (delay?: number) => void;
  playDiceRoll: () => void;
  playMove: () => void;
  playVictory: () => void;
  playDefeat: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('sound_enabled');
    return saved !== null ? saved === 'true' : true;
  });

  const [musicEnabled, setMusicEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('music_enabled');
    return saved !== null ? saved === 'true' : false; // default off for clean startup
  });

  useEffect(() => {
    localStorage.setItem('sound_enabled', String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('music_enabled', String(musicEnabled));
    if (musicEnabled) {
      soundGen.startAmbientMusic();
    } else {
      soundGen.stopAmbientMusic();
    }
    return () => {
      soundGen.stopAmbientMusic();
    };
  }, [musicEnabled]);

  const toggleSound = () => setSoundEnabled(prev => !prev);
  const toggleMusic = () => setMusicEnabled(prev => !prev);

  const wrapSound = (fn: (...args: any[]) => void) => {
    return (...args: any[]) => {
      if (soundEnabled) {
        fn(...args);
      }
    };
  };

  return (
    <SoundContext.Provider
      value={{
        soundEnabled,
        musicEnabled,
        toggleSound,
        toggleMusic,
        playSeedClick: wrapSound(soundGen.playSeedClick),
        playDiceRoll: wrapSound(soundGen.playDiceRoll),
        playMove: wrapSound(soundGen.playMove),
        playVictory: wrapSound(soundGen.playVictory),
        playDefeat: wrapSound(soundGen.playDefeat)
      }}
    >
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};
