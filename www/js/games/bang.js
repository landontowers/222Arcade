import { audio } from '../audio.js';

export default class BangGame {
    constructor(container, onComplete) {
        this.container = container;
        this.onComplete = onComplete;
        this.state = 'waiting'; // waiting, ready, draw, ended
        this.scores = [0, 0];
        this.rounds = 5;
        this.currentRound = 0;
        this.cues = ["Ready...", "Steady...", "Banana!", "Cactus!", "Draw...", "Wait...", "Hold..."];
        this.winCue = "BANG!";
        this.timeoutId = null;

        // Enable audio on first interaction if not already
        audio.enable();
    }

    init() {
        this.container.innerHTML = `
            <div class="bang-game">
                <div class="player-zone p1" data-player="1">
                    <div class="score-board">0 - 0</div>
                    <div class="message">TAP TO START</div>
                </div>
                <div class="divider"></div>
                <div class="player-zone p2" data-player="2">
                    <div class="score-board">0 - 0</div>
                    <div class="message">TAP TO START</div>
                </div>
                <div class="center-display">
                    <div class="npc-sprite"></div>
                    <div class="cue-text"></div>
                </div>
            </div>
        `;

        // Add Styles specifically for this game
        // Note: In a real app, we might load a separate CSS file, but for this prototype we'll inject styles
        const style = document.createElement('style');
        style.id = 'bang-style';
        style.textContent = `
            .bang-game {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                position: relative;
            }
            .player-zone {
                flex: 1;
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
                font-size: 2rem;
                position: relative;
                transition: background 0.1s;
            }
            .player-zone.p1 {
                transform: rotate(180deg);
                border-bottom: 2px solid #fff;
            }
            .score-board {
                position: absolute;
                top: 20px;
                width: 100%;
                text-align: center;
                font-size: 1.5rem;
                opacity: 0.8;
                pointer-events: none;
            }
            .divider {
                height: 4px;
                background: #fff;
                width: 100%;
            }
            .center-display {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #000;
                padding: 10px 20px;
                border: 2px solid #fff;
                font-size: 1.5rem;
                z-index: 10;
                display: none; /* Toggled by JS */
            }
            .winner { background: #00ff00 !important; color: #000; }
            .loser { background: #ff0000 !important; color: #fff; }
        `;
        this.container.appendChild(style);

        this.bindEvents();
    }

    bindEvents() {
        const zones = this.container.querySelectorAll('.player-zone');
        zones.forEach(zone => {
            zone.addEventListener('touchstart', (e) => this.handleTap(e, zone.dataset.player));
            zone.addEventListener('mousedown', (e) => this.handleTap(e, zone.dataset.player));
        });
    }

    handleTap(e, player) {
        e.preventDefault(); // Prevent double firing on some devices
        if (this.state === 'waiting') {
            this.startRound();
        } else if (this.state === 'ready') {
            this.handleFoul(player);
        } else if (this.state === 'draw') {
            this.handleWin(player);
        }
    }

    startRound() {
        if (this.currentRound >= this.rounds) {
            this.endGame();
            return;
        }

        this.state = 'ready';
        this.updateMessages("WAIT...");
        this.resetZones();

        // Random delay between 3s and 9s (under 10s total)
        const winDelay = 3000 + Math.random() * 6000;

        this.activeTimeouts = [];

        // Schedule Fake Cues
        this.scheduleCues(winDelay);

        // Schedule Win Cue
        const winId = setTimeout(() => {
            this.state = 'draw';
            this.updateMessages(this.winCue);
            this.container.querySelector('.bang-game').style.background = '#333'; // Flash effect
            audio.playBang();
        }, winDelay);
        this.activeTimeouts.push(winId);
    }

    scheduleCues(winDelay) {
        let currentTime = 1000 + Math.random() * 1000; // First cue after 1-2s

        while (currentTime < winDelay - 1000) { // Stop 1s before BANG
            const cue = this.cues[Math.floor(Math.random() * this.cues.length)];

            const timeoutId = setTimeout(() => {
                if (this.state === 'ready') { // Only show if still waiting
                    this.updateMessages(cue);
                    audio.playCue();
                }
            }, currentTime);

            this.activeTimeouts.push(timeoutId);

            // Next cue in 1.5s - 3s
            currentTime += 1500 + Math.random() * 1500;
        }
    }

    clearAllTimeouts() {
        if (this.activeTimeouts) {
            this.activeTimeouts.forEach(id => clearTimeout(id));
            this.activeTimeouts = [];
        }
        if (this.timeoutId) clearTimeout(this.timeoutId); // Legacy cleanup
    }

    handleFoul(player) {
        this.clearAllTimeouts();
        const otherPlayer = player === "1" ? "2" : "1";
        this.updateMessages(`P${player} FOUL!`);
        audio.playFoul();
        this.givePoint(otherPlayer);
    }

    handleWin(player) {
        this.updateMessages(`P${player} WINS!`);
        audio.playWin();
        this.givePoint(player);
    }

    givePoint(player) {
        this.state = 'ended';
        const playerIdx = parseInt(player) - 1;
        this.scores[playerIdx]++;
        this.updateScores();

        const winnerZone = this.container.querySelector(`.p${player}`);
        winnerZone.classList.add('winner');

        const loserZone = this.container.querySelector(`.p${player === "1" ? "2" : "1"}`);
        loserZone.classList.add('loser');

        this.currentRound++;

        setTimeout(() => {
            this.state = 'waiting';
            this.updateMessages("TAP TO NEXT ROUND");
            this.resetZones();
        }, 2000);
    }

    updateScores() {
        // Player 1 View: P1 - P2
        this.container.querySelector('.p1 .score-board').textContent = `${this.scores[0]} - ${this.scores[1]}`;
        // Player 2 View: P2 - P1
        this.container.querySelector('.p2 .score-board').textContent = `${this.scores[1]} - ${this.scores[0]}`;
    }

    updateMessages(msg) {
        this.container.querySelectorAll('.message').forEach(el => el.textContent = msg);

        // Update Center Display (NPC)
        const centerDisplay = this.container.querySelector('.center-display');
        const cueText = this.container.querySelector('.cue-text');
        const npc = this.container.querySelector('.npc-sprite');

        if (this.state === 'ready' || this.state === 'draw') {
            centerDisplay.style.display = 'flex';
            cueText.textContent = msg;

            // Animate NPC
            npc.classList.remove('speaking');
            void npc.offsetWidth; // Trigger reflow
            npc.classList.add('speaking');
        } else {
            centerDisplay.style.display = 'none';
            npc.classList.remove('speaking');
        }
    }

    resetZones() {
        this.container.querySelectorAll('.player-zone').forEach(el => {
            el.classList.remove('winner', 'loser');
        });
        this.container.querySelector('.bang-game').style.background = 'transparent';
    }

    endGame() {
        const winner = this.scores[0] > this.scores[1] ? "1" : "2";
        this.updateMessages(`GAME OVER! P${winner} WINS!`);
        setTimeout(() => {
            if (this.onComplete) this.onComplete();
        }, 3000);
    }

    cleanup() {
        const style = document.getElementById('bang-style');
        if (style) style.remove();
        this.container.innerHTML = '';
        this.clearAllTimeouts();
    }
}
