import { audio } from '../audio.js';

export default class MathGame {
    constructor(container, onComplete) {
        this.container = container;
        this.onComplete = onComplete;
        this.state = 'waiting'; // waiting, playing, ended
        this.scores = [0, 0];
        this.winningScore = 5;
        this.currentProblem = null;
        this.frozenPlayers = [false, false]; // [p1, p2]
    }

    init() {
        this.container.innerHTML = `
            <div class="math-game">
                <div class="player-zone p1" data-player="1">
                    <div class="hud-row">
                        <div class="question-box">READY?</div>
                        <div class="score-board">YOU: 0 | OPP: 0</div>
                    </div>
                    <div class="answers"></div>
                    <div class="status-msg"></div>
                </div>
                <div class="divider"></div>
                <div class="player-zone p2" data-player="2">
                    <div class="hud-row">
                        <div class="question-box">READY?</div>
                        <div class="score-board">YOU: 0 | OPP: 0</div>
                    </div>
                    <div class="answers"></div>
                    <div class="status-msg"></div>
                </div>
            </div>
        `;

        const style = document.createElement('style');
        style.id = 'math-style';
        style.textContent = `
            .math-game {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                background: #222034;
            }
            .player-zone {
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                position: relative;
                padding: 20px;
                box-sizing: border-box;
            }
            .player-zone.p1 {
                transform: rotate(180deg);
                border-bottom: 4px solid #fff;
            }
            
            .hud-row {
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: center;
                gap: 20px;
                margin-bottom: 20px;
                width: 100%;
            }

            .question-box {
                background: #000;
                border: 4px solid #fff;
                padding: 15px 20px;
                font-size: 2rem;
                color: #fff;
                min-width: 120px;
                text-align: center;
            }

            .score-board {
                font-size: 1rem;
                background: rgba(0, 0, 0, 0.5);
                padding: 10px;
                border: 2px solid #fff;
                border-radius: 4px;
                white-space: nowrap;
            }

            .answers {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 10px;
                width: 100%;
            }
            .answer-btn {
                background: #3f3f74;
                border: 4px solid #fff;
                color: #fff;
                padding: 20px 5px;
                font-size: 1.5rem;
                font-family: inherit;
                cursor: pointer;
            }
            .answer-btn:active {
                transform: scale(0.95);
            }
            .player-zone.frozen {
                opacity: 0.5;
                pointer-events: none;
            }
            .status-msg {
                height: 20px;
                margin-top: 10px;
                color: #ff0055;
                font-weight: bold;
            }
        `;
        this.container.appendChild(style);

        // Start button for first round
        this.container.querySelectorAll('.answers').forEach(el => {
            el.innerHTML = '<button class="answer-btn start-btn">START</button>';
        });

        this.bindEvents();
        audio.enable();
    }

    bindEvents() {
        this.container.addEventListener('click', (e) => {
            if (e.target.classList.contains('start-btn')) {
                this.startGame();
            } else if (e.target.classList.contains('answer-btn')) {
                const zone = e.target.closest('.player-zone');
                if (zone && !zone.classList.contains('frozen')) {
                    this.handleAnswer(zone.dataset.player, parseInt(e.target.dataset.val));
                }
            }
        });
    }

    startGame() {
        if (this.state === 'playing') return;
        this.state = 'playing';
        this.nextRound();
    }

    nextRound() {
        this.generateProblem();
        this.renderProblem();
    }

    generateProblem() {
        // Simple arithmetic: +, -, *
        const types = ['+', '-', '*'];
        const type = types[Math.floor(Math.random() * types.length)];
        let a, b, ans;

        switch (type) {
            case '+':
                a = Math.floor(Math.random() * 20) + 1;
                b = Math.floor(Math.random() * 20) + 1;
                ans = a + b;
                break;
            case '-':
                a = Math.floor(Math.random() * 20) + 5;
                b = Math.floor(Math.random() * a); // Ensure positive result
                ans = a - b;
                break;
            case '*':
                a = Math.floor(Math.random() * 9) + 2;
                b = Math.floor(Math.random() * 9) + 2;
                ans = a * b;
                break;
        }

        this.currentProblem = { text: `${a} ${type} ${b}`, ans: ans };
    }

    renderProblem() {
        // Update question boxes for both players
        this.container.querySelectorAll('.question-box').forEach(el => {
            el.textContent = this.currentProblem.text;
        });

        // Generate answers (1 correct, 2 wrong)
        const correct = this.currentProblem.ans;
        const answers = [correct];

        while (answers.length < 3) {
            // Generate wrong answer close to real one
            const offset = Math.floor(Math.random() * 5) + 1;
            const sign = Math.random() > 0.5 ? 1 : -1;
            const wrong = correct + (offset * sign);
            if (!answers.includes(wrong) && wrong >= 0) {
                answers.push(wrong);
            }
        }

        // Shuffle answers
        answers.sort(() => Math.random() - 0.5);

        // Render buttons
        this.container.querySelectorAll('.answers').forEach(el => {
            el.innerHTML = answers.map(val =>
                `<button class="answer-btn" data-val="${val}">${val}</button>`
            ).join('');
        });
    }

    handleAnswer(player, val) {
        if (this.state !== 'playing') return;

        if (val === this.currentProblem.ans) {
            // Correct!
            this.handleWinRound(player);
        } else {
            // Wrong!
            this.handlePenalty(player);
        }
    }

    handleWinRound(player) {
        const idx = parseInt(player) - 1;
        this.scores[idx]++;
        this.updateScores();
        audio.playClick(); // Success sound (TODO: Add specific success sound)

        if (this.scores[idx] >= this.winningScore) {
            this.endGame(player);
        } else {
            this.nextRound();
        }
    }

    handlePenalty(player) {
        const idx = parseInt(player) - 1;
        this.frozenPlayers[idx] = true;

        const zone = this.container.querySelector(`.p${player}`);
        zone.classList.add('frozen');
        zone.querySelector('.status-msg').textContent = "FROZEN!";

        audio.playFoul();

        setTimeout(() => {
            this.frozenPlayers[idx] = false;
            zone.classList.remove('frozen');
            zone.querySelector('.status-msg').textContent = "";
        }, 2000);
    }

    updateScores() {
        // P1 View: YOU: X | OPP: Y
        this.container.querySelector('.p1 .score-board').textContent = `YOU: ${this.scores[0]} | OPP: ${this.scores[1]}`;
        // P2 View: YOU: X | OPP: Y
        this.container.querySelector('.p2 .score-board').textContent = `YOU: ${this.scores[1]} | OPP: ${this.scores[0]}`;
    }

    endGame(winner) {
        console.log('Game Over. Winner:', winner);
        this.state = 'ended';

        try {
            this.container.querySelectorAll('.question-box').forEach(el => {
                el.textContent = `P${winner} WINS!`;
            });
            audio.playWin();
        } catch (e) {
            console.error('Error in endGame visuals/audio:', e);
        }

        setTimeout(() => {
            console.log('Calling onComplete callback');
            if (this.onComplete) {
                this.onComplete();
            } else {
                console.error('onComplete callback missing!');
            }
        }, 3000);
    }

    cleanup() {
        const style = document.getElementById('math-style');
        if (style) style.remove();
        this.container.innerHTML = '';
    }
}
