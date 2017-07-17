class PreloadState extends Phaser.State {
    preload() {
        // create a loading bar
        this.loadingBar = this.add.sprite(this.game.width/2, 30, 'loading-bar');
        this.loadingBar.anchor.x = 0.5;
        this.load.setPreloadSprite(this.loadingBar);

        // this.game.add.plugin(new Tiled(this.game, this.game.stage));

        this.add.plugin(Phaser.Plugin.Tiled);

        let cacheKey = Phaser.Plugin.Tiled.utils.cacheKey;

        this.load.spritesheet('player', 'assets/sprites/player-spritesheet.png', 50, 50);
        this.load.image('player-face-border', 'assets/sprites/face-border.png');

        this.load.tiledmap(
            cacheKey('sketchworld', 'tiledmap'),
            'assets/maps/sketchworld/sketchworld.json',
            null,
            Phaser.Tilemap.TILED_JSON
        );

        this.load.image(
            cacheKey('sketchworld', 'tileset', 'sketchworld'),
            'assets/maps/sketchworld/sketchworld.png'
        );

        this.cache.getJSON('players').forEach((player) => {
            this.load.image(player.name, player.face);
        });
    }

    create() {
        console.log('PreloadState create');
    }

    update() {
        this.game.state.start('SplashState');
    }
}

