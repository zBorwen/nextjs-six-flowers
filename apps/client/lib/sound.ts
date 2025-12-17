let muted = false;

export const isMuted = () => muted;
export const toggleMute = () => { muted = !muted; return muted; };

export function playSound(type: 'draw' | 'discard' | 'flip' | 'start' | 'win' | 'lose') {
    if (muted) return;
    // For MVP, just log or implementation placeholder.
    // In real app, load Audio() and play.
    console.log("Playing sound:", type);
    
    // Quick implementation if assets exist (they likely don't)
    // const audio = new Audio(`/sounds/${type}.mp3`);
    // audio.play().catch(() => {});
}
