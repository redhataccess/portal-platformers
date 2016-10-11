import * as Phaser from 'phaser';
import config from '../config';

export default class SplashState extends Phaser.State {

    readonly duration: number = config.splash.duration;
    readonly title: string = config.gameTitle;

    create() {
        console.log('SplashState create');

        const text = this.add.text(this.world.width/2, this.world.height/5, this.title, { font: `${config.splash.fontSize}px ${config.fontFamily}`, fontWeight: 'bold', fill: "#0CFA68" });
        text.anchor.set(0.5, 0.5);

        // switch to next state after duration elapses
        this.time.events.add(this.duration, this.next, this);
    }
    next() {
        this.game.state.start('PlayerSelectState');
    }
}

