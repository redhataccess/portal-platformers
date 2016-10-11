import * as Phaser from 'phaser';
import config from '../config';

export default class PlayState extends Phaser.State {

    private map: Phaser.Tilemap;
    private player: Phaser.Sprite;
    private cursors: Phaser.CursorKeys;

    create() {
        console.log('PlayState create');

        // the phaser-tiled plugin requires casting this.game; not normally recommended
        this.map = (<any>this.game).add.tiledmap('sketchworld');
        this.game.physics.startSystem(Phaser.Physics.P2JS);
        this.game.physics.p2.applyDamping = true;
        this.game.physics.p2.applyGravity = true;
        this.game.physics.p2.gravity.y = 8000;
        this.game.physics.p2.restitution = 0.1;
        this.game.physics.p2.friction = 0.01;
        // this.map.addTilesetImage('SuperMarioBros-World1-1', 'tiles');

        // this.layer = this.map.createLayer('World1');
        // this.layer.resizeWorld();

        this.player = this.game.add.sprite(30, 10, 'player');
        this.game.physics.p2.enable(this.player);
        this.player.body.fixedRotation = true;
        this.player.body.setRectangle(20, 50, 0, 0); // resize hit box to better reflect mario's actual size on screen
        this.player.anchor.setTo(0.5);
        this.player.animations.add('walk', [1, 2, 3, 4], 10, true);

        this.game.camera.follow(this.player);

        // this.map.setCollisionBetween(1, 100, true, 'World1');
        // this.game.physics.arcade.collide(this.player, this.layer);

        // the phaser-tiled plugin requires casting this.game; not normally recommended
        (<any>this.game).physics.p2.convertTiledCollisionObjects(this.map, 'physics_layer');

        this.cursors = this.game.input.keyboard.createCursorKeys();
    }
    update() {
        this.player.body.force.x = 0;
        this.player.body.velocity.y = 0;

        if (this.cursors.up.isDown) {
            this.player.body.moveUp(400);
        }

        if (this.cursors.left.isDown) {
            this.player.scale.x = -1;
            this.player.body.thrustLeft(300);
            this.player.animations.play('walk');
        }

        if (this.cursors.right.isDown) {
            this.player.scale.x = 1;
            this.player.body.thrustRight(300);
            this.player.animations.play('walk');
        }

        if (Math.abs(this.player.body.velocity.x) < 0.08){
            this.player.animations.stop();
            this.player.frame = 0;
        }
    }
}
