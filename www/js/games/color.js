import { audio } from '../audio.js';

export default class ColorGame {
    constructor(container, onComplete) {
        this.container = container;
        this.onComplete = onComplete;
        this.state = 'waiting'; // waiting, standoff, ended
        this.scores = [0, 0];
        this.winningScore = 5;
        this.colors = ['RED', 'BLUE', 'GREEN', 'YELLOW'];
        this.cssColors = {
            'RED': '#ff0055',
            'BLUE': '#0099db',
            'GREEN': '#00cc66',
            'YELLOW': '#ffcc00'
        };
        this.timeoutIds = [];
    }

    init() {
        this.container.innerHTML = `
            <div class="color-game">
                <div class="player-zone p1" data-player="1">
                    <div class="score-board">YOU: 0 | OPP: 0</div>
                    <div class="tap-zone">TAP ON MATCH!</div>
                    <div class="status-msg"></div>
                </div>
                <div class="divider"></div>
                <div class="player-zone p2" data-player="2">
                    <div class="score-board">YOU: 0 | OPP: 0</div>
                    <div class="tap-zone">TAP ON MATCH!</div>
                    <div class="status-msg"></div>
                </div>
                <div class="center-display">
                    <div class="stroop-card hidden">
                        <span class="stroop-text">READY</span>
                    </div>
                </div>
            </div>
        `;

        const style = document.createElement('style');
        style.id = 'color-style';
        style.textContent = `
            .color-game {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                background: #1a1a1a;
            }
            .player-zone {
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                position: relative;
                transition: background 0.2s;
            }
            .player-zone.p1 {
                transform: rotate(180deg);
                border-bottom: 4px solid #fff;
            }
            .score-board {
                position: absolute;
                top: 20px;
                font-size: 1.2rem;
                background: rgba(0, 0, 0, 0.5);
                padding: 5px 10px;
                border: 2px solid #fff;
                border-radius: 4px;
                z-index: 5;
            }
            .tap-zone {
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 2rem;
                opacity: 0.3;
                user-select: none;
            }
            .player-zone:active {
                background: #333;
            }
            .center-display {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 10;
                pointer-events: none;
            }
            .stroop-card {
                background: #000;
                border: 6px solid #fff;
                padding: 30px 50px;
                min-width: 200px;
                text-align: center;
            }
            .stroop-card.hidden {
                display: none;
            }
            .stroop-text {
                font-size: 4rem;
                font-weight: bold;
                text-transform: uppercase;
                font-family: 'Press Start 2P', cursive; /* Ensure retro font */
            }
            .status-msg {
                position: absolute;
                bottom: 20px;
                color: #ff0055;
                font-weight: bold;
                font-size: 1.5rem;
            }
        `;
        this.container.appendChild(style);

        this.bindEvents();
        audio.enable();

        // Start the game loop
        this.startRound();
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
        if (this.state !== 'standoff') return;

        const card = this.currentCard;
        if (!card) return;

        if (card.isMatch) {
            // Valid Tap!
            this.handleWinRound(player);
        } else {
            // Foul! (Tapped on mismatch)
            this.handleFoul(player);
        }
    }

    startRound() {
        if (this.state === 'ended') return;
        this.state = 'waiting';

        const card = this.container.querySelector('.stroop-card');
        card.classList.add('hidden');
        this.updateMessages("");

        // Random delay before showing a card (2-5 seconds)
        const delay = 2000 + Math.random() * 3000;

        const timeout = setTimeout(() => {
            this.showCard();
        }, delay);
        this.timeoutIds.push(timeout);
    }

    showCard() {
        if (this.state === 'ended') return;

        const textIndex = Math.floor(Math.random() * this.colors.length);
        const colorIndex = Math.floor(Math.random() * this.colors.length);

        // 40% chance of match to keep tension high
        // Actually, let's force match/mismatch logic if we want specific ratios
        // But random is fine for now.

        const text = this.colors[textIndex];
        const colorName = this.colors[colorIndex];
        const cssColor = this.cssColors[colorName];
        const isMatch = (text === colorName);

        this.currentCard = { text, colorName, isMatch };
        this.state = 'standoff';

        const cardEl = this.container.querySelector('.stroop-card');
        const textEl = this.container.querySelector('.stroop-text');

        textEl.textContent = text;
        textEl.style.color = cssColor;
        cardEl.classList.remove('hidden');

        if (!isMatch) {
            // If it's a mismatch (Fakeout), hide it after a short time and continue waiting
            // This mimics the "Ready... Banana!" fakeouts in Bang!
            audio.playCue(); // Soft blip
            const timeout = setTimeout(() => {
                this.startRound(); // Go back to waiting for next card
            }, 1000); // Show fakeout for 1s
            this.timeoutIds.push(timeout);
        } else {
            // It's a MATCH! "BANG!" equivalent
            audio.playBang(); // Loud sound
            // Wait for input...
        }
    }

    handleWinRound(player) {
        this.state = 'waiting';
        const idx = parseInt(player) - 1;
        this.scores[idx]++;
        this.updateScores();

        this.updateMessages(`P${player} POINT!`);
        audio.playWin();

        if (this.scores[idx] >= this.winningScore) {
            this.endGame(player);
        } else {
            const timeout = setTimeout(() => this.startRound(), 2000);
            this.timeoutIds.push(timeout);
        }
    }

    handleFoul(player) {
        this.state = 'waiting';
        // Opponent gets a point
        const opponentIdx = (parseInt(player) - 1) === 0 ? 1 : 0;
        this.scores[opponentIdx]++;
        this.updateScores();

        this.container.querySelector(`.p${player} .status-msg`).textContent = "FOUL!";
        audio.playFoul();

        if (this.scores[opponentIdx] >= this.winningScore) {
            this.endGame(opponentIdx + 1);
        } else {
            const timeout = setTimeout(() => this.startRound(), 2000);
            this.timeoutIds.push(timeout);
        }
    }

    updateScores() {
        this.container.querySelector('.p1 .score-board').textContent = `YOU: ${this.scores[0]} | OPP: ${this.scores[1]}`;
        this.container.querySelector('.p2 .score-board').textContent = `YOU: ${this.scores[1]} | OPP: ${this.scores[0]}`;
    }

    updateMessages(msg) {
        this.container.querySelectorAll('.status-msg').forEach(el => el.textContent = msg);
    }

    endGame(winner) {
        this.state = 'ended';
        this.clearAllTimeouts();

        const card = this.container.querySelector('.stroop-card');
        card.classList.remove('hidden');
        card.querySelector('.stroop-text').textContent = `P${winner} WINS!`;
        card.querySelector('.stroop-text').style.color = '#fff';

        audio.playWin();

        setTimeout(() => {
            if (this.onComplete) this.onComplete();
        }, 3000);
    }

    clearAllTimeouts() {
        this.timeoutIds.forEach(id => clearTimeout(id));
        this.timeoutIds = [];
    }

    cleanup() {
        this.clearAllTimeouts();
        const style = document.getElementById('color-style');
        if (style) style.remove();
        this.container.innerHTML = '';
    }
}
