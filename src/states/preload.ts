import * as Phaser from 'phaser';
import * as Tiled from 'phaser-tiled';

// declare let Tiled: any; // hack to make 'Tiled' available; the tiled plugin is weird around AMD

export default class PreloadState extends Phaser.State {
    preload() {
        this.game.add.plugin(new Tiled(this.game, this.game.stage));

        let cacheKey = Tiled.utils.cacheKey;

        this.load.spritesheet('mario', 'assets/mariospritesheet-small.png', 50, 50);

        // the phaser-tiled plugin requires casting this.load; not normally recommended
        (<any>this.load).tiledmap(cacheKey('testmap', 'tiledmap'),  'assets/map/grouptest.json', null, Phaser.Tilemap.TILED_JSON);

        this.load.image(cacheKey('testmap', 'tileset', 'super_mario'), 'assets/super_mario.png');
    }

    create() {
        console.log('PreloadState create');
        this.game.state.start('SplashState');
    }
}

