import { audio } from '../audio.js';

export default class RowingGame {
    constructor(container, onComplete) {
        this.container = container;
        this.onComplete = onComplete;
        this.state = 'waiting'; // waiting, racing, ended
        this.scores = [0, 0]; // Progress (0 to 100)
        this.goal = 100;
        this.beatInterval = 800; // ms per beat
        this.lastBeatTime = 0;
        this.animationFrameId = null;
    }

    init() {
        this.container.innerHTML = `
            <div class="rowing-game">
                <div class="player-zone p1" data-player="1">
                    <div class="boat-lane">
                        <div class="boat" style="bottom: 0%"></div>
                        <div class="finish-line"></div>
                    </div>
                    <div class="rhythm-indicator">
                        <div class="beat-bar"></div>
                    </div>
                    <div class="message">TAP TO START</div>
                </div>
                <div class="divider"></div>
                <div class="player-zone p2" data-player="2">
                    <div class="boat-lane">
                        <div class="boat" style="bottom: 0%"></div>
                        <div class="finish-line"></div>
                    </div>
                    <div class="rhythm-indicator">
                        <div class="beat-bar"></div>
                    </div>
                    <div class="message">TAP TO START</div>
                </div>
            </div>
        `;

        const style = document.createElement('style');
        style.id = 'rowing-style';
        style.textContent = `
            .rowing-game {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                background: #006994; /* Ocean Blue */
            }
            .player-zone {
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                position: relative;
                overflow: hidden;
            }
            .player-zone.p1 {
                transform: rotate(180deg);
                border-bottom: 4px solid #fff;
            }
            .boat-lane {
                width: 80px;
                height: 80%;
                background-image: url('../assets/images/water.png');
                background-size: 64px;
                image-rendering: pixelated;
                position: relative;
                border-left: 4px solid rgba(255,255,255,0.3);
                border-right: 4px solid rgba(255,255,255,0.3);
                animation: scrollWater 2s linear infinite;
            }
            
            @keyframes scrollWater {
                from { background-position: 0 0; }
                to { background-position: 0 64px; }
            }

            .boat {
                width: 48px;
                height: 80px;
                background-size: contain;
                background-repeat: no-repeat;
                background-position: center;
                position: absolute;
                left: 16px;
                transition: bottom 0.2s linear;
                image-rendering: pixelated;
            }
            .p1 .boat { background-image: url('../assets/images/boat_blue.png'); }
            .p2 .boat { background-image: url('../assets/images/boat_red.png'); }
            
            .finish-line {
                position: absolute;
                top: 0;
                width: 100%;
                height: 20px;
                background-image: repeating-linear-gradient(
                    45deg,
                    #fff,
                    #fff 10px,
                    #000 10px,
                    #000 20px
                );
                opacity: 0.8;
                z-index: 2;
            }

            .rhythm-indicator {
                width: 200px;
                height: 20px;
                background: #000;
                border: 2px solid #fff;
                margin-top: 20px;
                position: relative;
            }
            .beat-bar {
                width: 10px;
                height: 100%;
                background: #fff;
                position: absolute;
                left: 0;
            }
            .hit-zone {
                position: absolute;
                left: 50%;
                top: 0;
                width: 40px;
                height: 100%;
                background: rgba(0, 255, 0, 0.3);
                transform: translateX(-50%);
            }
        `;
        this.container.appendChild(style);

        // Add hit zones to indicators
        this.container.querySelectorAll('.rhythm-indicator').forEach(el => {
            const zone = document.createElement('div');
            zone.className = 'hit-zone';
            el.appendChild(zone);
        });

        this.bindEvents();
        audio.enable();
    }

    bindEvents() {
        const zones = this.container.querySelectorAll('.player-zone');
        zones.forEach(zone => {
            zone.addEventListener('touchstart', (e) => this.handleTap(e, zone.dataset.player));
            zone.addEventListener('mousedown', (e) => this.handleTap(e, zone.dataset.player));
        });
    }

    handleTap(e, player) {
        e.preventDefault();
        if (this.state === 'waiting') {
            this.startRace();
        } else if (this.state === 'racing') {
            this.checkRhythm(player);
        }
    }

    startRace() {
        if (this.state === 'racing') return;
        this.state = 'racing';

        // Randomize beat interval (600ms to 1000ms) to prevent memorization
        this.beatInterval = 600 + Math.random() * 400;

        this.updateMessages("ROW!");
        this.lastBeatTime = performance.now();
        this.gameLoop();
    }

    gameLoop() {
        if (this.state !== 'racing') return;

        const now = performance.now();
        const progress = (now % this.beatInterval) / this.beatInterval; // 0 to 1

        // Oscillate the beat bar: 0 -> 1 -> 0
        // We want the "hit" to be at 0.5 (center)
        const barPos = progress * 100;

        // Update UI
        this.container.querySelectorAll('.beat-bar').forEach(bar => {
            // Simple left to right for now. 
            // Ideally we want it to bounce back and forth or loop.
            // Let's make it loop: Left (0) -> Right (100) -> Left (0)
            // Using sine wave for smooth motion
            const sinPos = (Math.sin(progress * Math.PI * 2) + 1) / 2 * 100;
            bar.style.left = `${sinPos}%`;
        });

        // Play metronome tick at the "center" (peak of sine wave? or crossing center?)
        // Let's say the beat is when it crosses the center.
        // Actually, simpler: Bar moves Left -> Right. Hit zone is in the middle.
        // That means hit is at 50%.

        this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
    }

    checkRhythm(player) {
        const now = performance.now();
        const progress = (now % this.beatInterval) / this.beatInterval;
        const sinPos = (Math.sin(progress * Math.PI * 2) + 1) / 2; // 0 to 1

        // Target is 0.5 (center)
        // Tolerance: +/- 0.15
        const diff = Math.abs(sinPos - 0.5);

        let power = 0;
        if (diff < 0.05) {
            power = 5; // Perfect!
            this.showFeedback(player, "PERFECT!", "green");
            audio.playTone(600, 'sine', 0.1); // High blip
        } else if (diff < 0.15) {
            power = 2; // Good
            this.showFeedback(player, "GOOD", "yellow");
            audio.playTone(400, 'sine', 0.1); // Low blip
        } else {
            power = 0; // Miss
            this.showFeedback(player, "MISS", "red");
            audio.playTone(150, 'sawtooth', 0.1); // Buzz
        }

        this.advanceBoat(player, power);
    }

    advanceBoat(player, amount) {
        const idx = parseInt(player) - 1;
        this.scores[idx] += amount;

        if (this.scores[idx] >= this.goal) {
            this.scores[idx] = this.goal;
            this.endGame(player);
        }

        const boat = this.container.querySelector(`.p${player} .boat`);
        boat.style.bottom = `${this.scores[idx]}%`;
    }

    showFeedback(player, text, color) {
        const msg = this.container.querySelector(`.p${player} .message`);
        msg.textContent = text;
        msg.style.color = color;
        setTimeout(() => {
            msg.style.color = '#fff';
        }, 300);
    }

    updateMessages(msg) {
        this.container.querySelectorAll('.message').forEach(el => el.textContent = msg);
    }

    endGame(winner) {
        this.state = 'ended';
        cancelAnimationFrame(this.animationFrameId);
        this.updateMessages(`P${winner} WINS!`);
        audio.playWin();

        setTimeout(() => {
            if (this.onComplete) this.onComplete();
        }, 3000);
    }

    cleanup() {
        const style = document.getElementById('rowing-style');
        if (style) style.remove();
        this.container.innerHTML = '';
        cancelAnimationFrame(this.animationFrameId);
    }
}
