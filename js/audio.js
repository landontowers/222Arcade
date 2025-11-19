class AudioController {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.3; // Keep it reasonable
        this.masterGain.connect(this.ctx.destination);
        this.enabled = false;
    }

    enable() {
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        this.enabled = true;
    }

    playTone(freq, type, duration, startTime = 0) {
        if (!this.enabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);

        gain.gain.setValueAtTime(0.3, this.ctx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + startTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(this.ctx.currentTime + startTime);
        osc.stop(this.ctx.currentTime + startTime + duration);
    }

    playNoise(duration) {
        if (!this.enabled) return;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        noise.connect(gain);
        gain.connect(this.masterGain);
        noise.start();
    }

    // SFX Presets
    playClick() {
        this.playTone(800, 'square', 0.05);
    }

    playCue() {
        this.playTone(440, 'sine', 0.1); // Low blip
    }

    playBang() {
        this.playTone(150, 'square', 0.1); // Sharp low square
        this.playNoise(0.2); // Gunshot noise
    }

    playWin() {
        // Arpeggio
        this.playTone(523.25, 'square', 0.1, 0);
        this.playTone(659.25, 'square', 0.1, 0.1);
        this.playTone(783.99, 'square', 0.2, 0.2);
    }

    playFoul() {
        this.playTone(150, 'sawtooth', 0.3);
        this.playTone(100, 'sawtooth', 0.3, 0.1);
    }
}

export const audio = new AudioController();
