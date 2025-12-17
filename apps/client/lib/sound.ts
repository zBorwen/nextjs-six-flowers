// Simple synth for UI sounds
const AudioContext = (typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) || null;

let ctx: AudioContext | null = null;

const getContext = () => {
    if (!ctx && AudioContext) {
        ctx = new AudioContext();
    }
    return ctx;
};

export const playSound = (type: 'pop' | 'click' | 'shuffle' | 'notify') => {
    const context = getContext();
    if (!context) return;
    
    // Resume context if suspended (browser auto-play policy)
    if (context.state === 'suspended') {
        context.resume();
    }

    const osc = context.createOscillator();
    const gain = context.createGain();

    osc.connect(gain);
    gain.connect(context.destination);

    const now = context.currentTime;

    switch (type) {
        case 'click':
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
            break;
            
        case 'pop':
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.type = 'triangle';
            osc.start(now);
            osc.stop(now + 0.1);
            break;

        case 'notify':
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.linearRampToValueAtTime(880, now + 0.3);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.5);
            osc.type = 'sine';
            osc.start(now);
            osc.stop(now + 0.5);
            break;
    }
};
