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
          this.game.state.start('PlayerSelectState', true);
        });

        document.body.appendChild(resetButton);

        this.socketConnect();
    }
    update() {
        let jumping = !this.canJump();
        let moveAmt = jumping ? 100 : 300;
        let pressingLeft = this.cursors.left.isDown
            || game.input.keyboard.isDown(Phaser.Keyboard.A)
        let pressingRight = this.cursors.right.isDown
            || game.input.keyboard.isDown(Phaser.Keyboard.D)
        let pressingUp = this.cursors.up.isDown
            || game.input.keyboard.isDown(Phaser.Keyboard.W)
            || game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)
        let pressingDown = this.cursors.down.isDown
            || game.input.keyboard.isDown(Phaser.Keyboard.S)

        if (pressingUp && !jumping) {
            this.player.body.velocity.y = -400;
        }

        if (pressingLeft) {
            this.player.scale.x = -2;
            this.player.body.thrustLeft(moveAmt);
            this.player.animations.play('walk');
            this.forwardFace(this.player);
        }

        if (pressingRight) {
            this.player.scale.x = 2;
            this.player.body.thrustRight(moveAmt);
            this.player.animations.play('walk');
            this.forwardFace(this.player);
        }

        if (Math.abs(this.player.body.velocity.x) < 0.08){
            this.player.animations.play('idle');
            this.forwardFace(this.player);
        }
        if (jumping) {
            this.player.animations.play('jump');
            this.jumpFace(this.player);
        }

        if (pressingDown) {
            // show death face when holding down key; there is no way to die
            // yet and this allows us to see the death face
            this.deadFace(this.player);
        }


        this.sendPlayerUpdate();
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
        playerSprite.animations.add('idle', [0,1], 2, true);
        playerSprite.animations.add('walk', [2,3,4,5], 10, true);
        playerSprite.animations.add('jump', [6], 10, true);

        // add player face
        playerSprite.data.faceForward = this.game.add.sprite(0, 0, `${player.name}-forward`);
        playerSprite.data.faceAction = this.game.add.sprite(0, 0, `${player.name}-action`);
        playerSprite.data.faceDead = this.game.add.sprite(0, 0, `${player.name}-dead`);
        ['faceForward', 'faceAction', 'faceDead'].forEach(function (face) {
            playerSprite.data[face].position.set(-30, -30)
            playerSprite.data[face].scale.set(0.18, 0.18)
            playerSprite.addChild(playerSprite.data[face]);
            playerSprite.data[face].visible = false;
        });
        playerSprite.data.faceBorder = this.game.add.sprite(-30, -30, 'player-face-border');
        playerSprite.data.faceBorder.position.set(-14, -25); // position border over face
        playerSprite.addChild(playerSprite.data.faceBorder);
        playerSprite.data.faceForward.visible = true;

        if (isMainPlayer) {
            window.player = playerSprite;
            this.player = playerSprite;
            this.player.data.id = Math.random().toPrecision(10);
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

    socketConnect() {
        this.socket = this.game.data.socket = io("http://localhost:8080", {query: 'name=' + Date.now()});

        this.socket.on('connect', function () {
            console.log("WebSocket connection established and ready.");
        });

        this.socket.on('server_message', function (msg) {
            // console.log(msg);
        });

        this.socket.on('client_joined', function (msg) {
            // console.log(msg);
        });

        this.socket.on('client_left', function (msg) {
            // console.log(msg);
        });
    }

    sendPlayerUpdate() {
        let playerData = {
            id: this.player.data.id,
            position: {
                x: this.player.position.x,
                y: this.player.position.y,
            }
        };

        this.socket.emit('player_update', playerData);
    }
}
