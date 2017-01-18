class SplashState extends Phaser.State {
    preload() {
        this.duration = Game.config.splash.duration;
        this.title = Game.config.gameTitle;
    }

    create() {
        console.log('SplashState create');

        const text = this.add.text(
            this.world.width/2,
            this.world.height/5,
            this.title,
            {
                font: `${Game.config.splash.fontSize}px ${Game.config.fontFamily}`,
                fontWeight: 'bold',
                fill: "#0CFA68"
            }
        );
        text.anchor.set(0.5, 0.5);

        // switch to next state after duration elapses
        this.time.events.add(this.duration, this.next, this);
    }
    next() {
        this.game.state.start('PlayerSelectState');
    }
}

