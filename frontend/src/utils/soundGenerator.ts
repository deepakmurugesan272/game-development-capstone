// Web Audio API Synthesizer & Music Generator for Tamil Heritage Games Hub
// No external assets required, fully offline-functional and reliable

let audioCtx: AudioContext | null = null;
let musicInterval: any = null;
let droneOsc1: OscillatorNode | null = null;
let droneOsc2: OscillatorNode | null = null;
let droneGain: GainNode | null = null;
let isMusicPlaying = false;

const getAudioContext = (): AudioContext => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

// Play a short woody click (e.g., seeds falling)
export const playSeedClick = (delay = 0) => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime + delay;
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.08);

    filter.type = 'bandpass';
    filter.frequency.value = 1000;
    filter.Q.value = 3;

    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  } catch (err) {
    console.warn('Audio play failed:', err);
  }
};

// Play dice rattle
export const playDiceRoll = () => {
  try {
    const ctx = getAudioContext();
    const start = ctx.currentTime;
    
    for (let i = 0; i < 6; i++) {
      const clickTime = start + i * 0.06;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1500 - (i * 100), clickTime);
      osc.frequency.exponentialRampToValueAtTime(300, clickTime + 0.04);
      
      gainNode.gain.setValueAtTime(0.08, clickTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.04);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(clickTime);
      osc.stop(clickTime + 0.05);
    }
  } catch (err) {
    console.warn('Audio play failed:', err);
  }
};

// Play game token move
export const playMove = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(250, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.15);
    
    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.16);
  } catch (err) {
    console.warn('Audio play failed:', err);
  }
};

// Play victory Carnatic Mohanam scale melody (C - D - E - G - A - C)
export const playVictory = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const melody = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
    const noteDuration = 0.12;

    melody.forEach((freq, idx) => {
      const startTime = now + idx * noteDuration;
      
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 8;
      lfoGain.gain.value = 5;
      
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      
      gainNode.gain.setValueAtTime(0.0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      lfo.start(startTime);
      osc.start(startTime);
      
      lfo.stop(startTime + noteDuration);
      osc.stop(startTime + noteDuration);
    });
  } catch (err) {
    console.warn('Audio play failed:', err);
  }
};

// Play defeat drone sound
export const playDefeat = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(150, now);
    osc1.frequency.linearRampToValueAtTime(90, now + 1.2);
    
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(154.5, now);
    osc2.frequency.linearRampToValueAtTime(92.7, now + 1.2);
    
    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.linearRampToValueAtTime(0.2, now + 0.4);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc1.start(now);
    osc2.start(now);
    
    osc1.stop(now + 1.3);
    osc2.stop(now + 1.3);
  } catch (err) {
    console.warn('Audio play failed:', err);
  }
};

// Play a single soft ambient note (Mohanam scale flute note)
const playSoftAmbientNote = (ctx: AudioContext, time: number) => {
  const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25]; // C4, D4, E4, G4, A4, C5, D5, E5
  const randomFreq = notes[Math.floor(Math.random() * notes.length)];
  
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(randomFreq, time);
  
  // Lowpass filter to emulate woodwinds / flute
  filter.type = 'lowpass';
  filter.frequency.value = 600;
  
  // Soft attack & release
  gainNode.gain.setValueAtTime(0, time);
  gainNode.gain.linearRampToValueAtTime(0.04, time + 0.8); // low volume
  gainNode.gain.exponentialRampToValueAtTime(0.001, time + 2.8);
  
  osc.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  osc.start(time);
  osc.stop(time + 3.0);
};

// Start ambient music (Drone + soft flute sequence)
export const startAmbientMusic = () => {
  if (isMusicPlaying) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    isMusicPlaying = true;
    
    // Create base drone (Tanpura/shruti box feel)
    droneOsc1 = ctx.createOscillator();
    droneOsc2 = ctx.createOscillator();
    droneGain = ctx.createGain();
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 150; // cut all high harshness
    
    droneOsc1.type = 'triangle';
    droneOsc1.frequency.value = 130.81; // C3
    
    droneOsc2.type = 'sawtooth';
    droneOsc2.frequency.value = 196.00; // G3 (perfect fifth)
    
    droneGain.gain.setValueAtTime(0.015, now); // very subtle back ground
    
    droneOsc1.connect(filter);
    droneOsc2.connect(filter);
    filter.connect(droneGain);
    droneGain.connect(ctx.destination);
    
    droneOsc1.start();
    droneOsc2.start();
    
    // Play melody notes sequentially
    musicInterval = setInterval(() => {
      const activeCtx = getAudioContext();
      playSoftAmbientNote(activeCtx, activeCtx.currentTime);
    }, 3200);
    
    console.log('✔ Background ambient music synthesizer active.');
  } catch (err) {
    console.warn('Could not start ambient music:', err);
  }
};

// Stop ambient music
export const stopAmbientMusic = () => {
  isMusicPlaying = false;
  try {
    if (musicInterval) {
      clearInterval(musicInterval);
      musicInterval = null;
    }
    if (droneGain) {
      droneGain.gain.setValueAtTime(droneGain.gain.value, getAudioContext().currentTime);
      droneGain.gain.exponentialRampToValueAtTime(0.001, getAudioContext().currentTime + 0.5);
      setTimeout(() => {
        try {
          if (droneOsc1) { droneOsc1.stop(); droneOsc1 = null; }
          if (droneOsc2) { droneOsc2.stop(); droneOsc2 = null; }
        } catch (e) {}
      }, 600);
    }
    console.log('✔ Background ambient music synthesizer disabled.');
  } catch (err) {
    console.warn('Could not stop ambient music:', err);
  }
};
