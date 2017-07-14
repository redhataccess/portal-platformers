class PlayState extends Phaser.State {
    init({ player }) {
        console.log('player is');
        console.log(player);
        this.currentPlayer = player;
    }
    create() {
        console.log('PlayState create');

        // the phaser-tiled plugin requires casting this.game; not normally recommended
        this.map = this.game.add.tiledmap('sketchworld');
        this.game.physics.startSystem(Phaser.Physics.P2JS);
        this.game.physics.p2.applyDamping = true;
        this.game.physics.p2.applyGravity = true;
        this.game.physics.p2.gravity.y = 350;
        this.game.physics.p2.restitution = 0.1;
        this.game.physics.p2.friction = 0.3;
        this.game.physics.p2.world.setGlobalStiffness(1e5);
        // this.map.addTilesetImage('SuperMarioBros-World1-1', 'tiles');

        // this.layer = this.map.createLayer('World1');
        // this.layer.resizeWorld();

        this.player = this.game.add.sprite(30, 10, 'player');
        this.player.scale.set(2, 2);
        this.game.physics.p2.enable(this.player);
        this.player.body.fixedRotation = true;
        this.player.body.setRectangle(40, 100, 0, 0); // resize hit box to better reflect mario's actual size on screen
        this.player.anchor.setTo(0.5);
        this.player.animations.add('walk', [1, 2, 3, 4], 10, true);
        this.player.animations.add('jump', [5], 10, true);

        // add player face
        this.player.data.face = this.game.add.sprite(0, 0, `${this.currentPlayer.name}-forward`);
        this.player.data.face.scale.set(0.2, 0.2);
        this.player.data.face.position.set(-32, -32);
        this.player.addChild(this.player.data.face);

        this.game.camera.follow(this.player);

        // this.map.setCollisionBetween(1, 100, true, 'World1');
        // this.game.physics.arcade.collide(this.player, this.layer);

        // the phaser-tiled plugin requires casting this.game; not normally recommended
        this.game.physics.p2.convertTiledCollisionObjects(this.map, 'physics_layer');

        this.cursors = this.game.input.keyboard.createCursorKeys();
    }
    update() {
        let jumping = !this.canJump();
        let moveAmt = jumping ? 100 : 300;

        if (this.cursors.up.isDown && !jumping) {
            this.player.body.velocity.y = -400;
        }

        if (this.cursors.left.isDown) {
            this.player.scale.x = -2;
            this.player.body.thrustLeft(moveAmt);
            this.player.animations.play('walk');
        }

        if (this.cursors.right.isDown) {
            this.player.scale.x = 2;
            this.player.body.thrustRight(moveAmt);
            this.player.animations.play('walk');
        }

        if (Math.abs(this.player.body.velocity.x) < 0.08){
            this.player.animations.stop();
            this.player.frame = 0;
        }
        if (jumping) {
            this.player.animations.play('jump');
        }
    }

    canJump() {

        let result = false;

        for (let i=0; i < this.game.physics.p2.world.narrowphase.contactEquations.length; i++) {
            let c = this.game.physics.p2.world.narrowphase.contactEquations[i];

            if (c.bodyA === this.player.body.data || c.bodyB === this.player.body.data) {
                var d = p2.vec2.dot(c.normalA, p2.vec2.fromValues(0,1));

                if (c.bodyA === this.player.body.data) {
                    d *= -1;
                }

                if (d > 0.5) {
                    result = true;
                }
            }
        }

        return result;

    }
}
