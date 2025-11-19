const app = {
    currentGame: null,

    init() {
        this.bindEvents();
        console.log('MiniGames App Initialized');
    },

    bindEvents() {
        // Menu Navigation
        document.querySelectorAll('.menu-buttons button[data-game]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const gameId = e.target.dataset.game;
                this.loadGame(gameId);
            });
        });

        document.getElementById('back-btn').addEventListener('click', () => {
            this.showMenu();
        });

        document.getElementById('shuffle-btn').addEventListener('click', () => {
            alert('Shuffle Mode coming soon!');
        });
    },

    async loadGame(gameId) {
        console.log(`Loading game: ${gameId}`);

        let GameClass;
        try {
            const module = await import(`./games/${gameId}.js`);
            GameClass = module.default;
        } catch (e) {
            console.error(`Failed to load game: ${gameId}`, e);
            alert('Game not implemented yet!');
            return;
        }

        document.getElementById('menu').classList.remove('active');
        document.getElementById('menu').classList.add('hidden');

        const gameContainer = document.getElementById('game-container');
        const canvas = document.getElementById('game-canvas');
        gameContainer.classList.remove('hidden');
        gameContainer.classList.add('active');

        this.currentGame = new GameClass(canvas, () => this.showMenu());
        this.currentGame.init();
    },

    showMenu() {
        if (this.currentGame) {
            this.currentGame.cleanup();
            this.currentGame = null;
        }

        document.getElementById('game-container').classList.remove('active');
        document.getElementById('game-container').classList.add('hidden');

        document.getElementById('menu').classList.remove('hidden');
        document.getElementById('menu').classList.add('active');
    }
};

window.addEventListener('DOMContentLoaded', () => {
    app.init();
});
