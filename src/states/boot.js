class BootState extends Phaser.State {

    preload() {
        this.load.image('loading-bar', 'assets/sprites/loading-bar.png');
        this.load.json('players', '../data/players.json');
    }

    create() {
        console.log('BootState create');

        // Phaser automatically pauses the game when focus is lost, but we
        // don't want that.
        this.stage.disableVisibilityChange = true;
    }

    update() {
        this.game.state.start('PreloadState');
    }

}
