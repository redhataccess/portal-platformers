import * as Phaser from 'phaser';
import config from '../config';

export default class PlayerSelectState extends Phaser.State {

    readonly title: string = 'Player Select...';
    readonly duration: number = 4000;

    create() {
        console.log('PlayerSelectState create');

        const text = this.add.text(this.world.width/2, this.world.height/5, this.title, { font: `${config.splashFontSize}px ${config.fontFamily}`, fontWeight: 'bold', fill: "#0CFA68" });
        text.anchor.set(0.5, 0.5);

        // switch to next state after duration elapses
        this.time.events.add(this.duration, this.next, this);
    }
    next() {
        this.game.state.start('PlayState');
    }
}

