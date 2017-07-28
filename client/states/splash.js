class SplashState extends Phaser.State {
    preload() {
        this.duration = Game.config.splash.duration;
        // this.title = Game.config.gameTitle;
    }

    create() {
        console.log('SplashState create');

        this.splash = document.querySelector('#splash-screen');
        this.splash.style.display = "block";

        // switch to next state after duration elapses
        this.time.events.add(this.duration, this.next, this);
    }

    next() {
        this.game.state.start('PlayerSelectState');
    }

    shutdown() {
        this.splash.style.display = "none";
    }
}
