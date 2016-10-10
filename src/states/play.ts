import * as Phaser from 'phaser';
import config from '../config';

export default class PlayState extends Phaser.State {
    create() {
        console.log('PlayState create');

        this.add.text(32, 64, 'COMING SOON', { font: `${config.fontSize}px ${config.fontFamily}`, fill: "#19de65" });
    }
}
