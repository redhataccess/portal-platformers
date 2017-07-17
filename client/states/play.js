class PlayState extends Phaser.State {
    init({ player, players }) {
        console.log('player is');
        console.log(player);
        this.currentPlayer = player;
        this.players = players;
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

        this.addPlayer(this.currentPlayer, true);

        // this.map.setCollisionBetween(1, 100, true, 'World1');
        // this.game.physics.arcade.collide(this.player, this.layer);

        // the phaser-tiled plugin requires casting this.game; not normally recommended
        this.game.physics.p2.convertTiledCollisionObjects(this.map, 'physics_layer');

        this.cursors = this.game.input.keyboard.createCursorKeys();

        let resetButton = document.createElement('a');
        resetButton.classList.add('reset-btn');
        resetButton.textContent = 'Restart';

        resetButton.addEventListener('click', () => {
          document.body.removeChild(resetButton);
          this.game.state.start('PlayerSelectState');
        });

        document.body.appendChild(resetButton);
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
            this.forwardFace(this.player);
        }

        if (this.cursors.right.isDown) {
            this.player.scale.x = 2;
            this.player.body.thrustRight(moveAmt);
            this.player.animations.play('walk');
            this.forwardFace(this.player);
        }

        if (Math.abs(this.player.body.velocity.x) < 0.08){
            this.player.animations.stop();
            this.player.frame = 0;
            this.player.animations.play('idle');
            this.forwardFace(this.player);
        }
        if (jumping) {
            this.player.animations.play('jump');
            this.jumpFace(this.player);
        }

        if (this.cursors.down.isDown) {
            // show death face when holding down key; there is no way to die
            // yet and this allows us to see the death face
            this.deadFace(this.player);
        }

    }

    forwardFace(player) {
        this.noFace(player);
        player.data.faceForward.visible = true;
    }
    jumpFace(player) {
        this.noFace(player);
        player.data.faceAction.visible = true;
    }
    deadFace(player) {
        this.noFace(player);
        player.data.faceDead.visible = true;
    }
    noFace(player) {
        player.data.faceForward.visible = false;
        player.data.faceAction.visible = false;
        player.data.faceDead.visible = false;
    }

    addPlayer(player, isMainPlayer) {
        const playerSprite = this.game.add.sprite(30, 10, 'player');
        playerSprite.scale.set(2, 2);
        this.game.physics.p2.enable(playerSprite);
        playerSprite.body.fixedRotation = true;
        playerSprite.body.setRectangle(40, 100, 0, 0); // resize hit box to better reflect mario's actual size on screen
        playerSprite.anchor.setTo(0.5);
        playerSprite.animations.add('idle', [0,1], 10, true);
        playerSprite.animations.add('walk', [2,3,4,5], 10, true);
        playerSprite.animations.add('jump', [6], 10, true);

        // add player face
        playerSprite.data.faceForward = this.game.add.sprite(0, 0, `${player.name}-forward`);
        playerSprite.data.faceAction = this.game.add.sprite(0, 0, `${player.name}-action`);
        playerSprite.data.faceDead = this.game.add.sprite(0, 0, `${player.name}-dead`);
        ['faceForward', 'faceAction', 'faceDead'].forEach(function (face) {
            playerSprite.data[face].scale.set(0.2, 0.2);
            playerSprite.data[face].position.set(-32, -32);
            playerSprite.addChild(playerSprite.data[face]);
            playerSprite.data[face].visible = false;
        });
        playerSprite.data.faceForward.visible = true;

        if (isMainPlayer) {
            this.player = playerSprite;
            this.game.camera.follow(playerSprite);
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
