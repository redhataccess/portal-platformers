import * as Phaser from 'phaser';
import * as Tiled from 'phaser-tiled';

// declare let Tiled: any; // hack to make 'Tiled' available; the tiled plugin is weird around AMD

export default class BootState extends Phaser.State {

    preload() {
        this.load.image('loading-bar', 'assets/images/loading-bar.png');
    }

    create() {
        console.log('BootState create');
    }

    update() {
        this.game.state.start('PreloadState');
    }

}

