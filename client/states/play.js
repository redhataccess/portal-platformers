class PlayState extends Phaser.State {
    init({ player, players }) {
        console.log('player is');
        console.log(player);
        this.currentPlayer = player;
        this.currentPlayer.id = Math.random().toPrecision(10);
        this.players = players;
        window.state = this;
        this.playerSprites = {};
    }
    create() {
        console.log('PlayState create');

        this.createSounds();

        // the phaser-tiled plugin requires casting this.game; not normally recommended
        this.map = this.game.add.tiledmap('sketchworld');
        this.game.physics.startSystem(Phaser.Physics.P2JS);
        this.game.physics.p2.applyDamping = false;
        this.game.physics.p2.applyGravity = true;
        this.game.physics.p2.gravity.y = 1400;
        this.game.physics.p2.restitution = 0.0;
        this.game.physics.p2.friction = 0.0;
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
        if (this.player.data.dead) {
          if (this.player.y + this.player.height / 2 >= this.game.world.height) {
            this.revive();
          }

          return;
        }

        let airborne = !this.canJump();
        let moveAmt = airborne ? 1000 : 2000;
        let pressingLeft = this.cursors.left.isDown
            || game.input.keyboard.isDown(Phaser.Keyboard.A)
        let pressingRight = this.cursors.right.isDown
            || game.input.keyboard.isDown(Phaser.Keyboard.D)
        let pressingUp = this.cursors.up.isDown
            || game.input.keyboard.isDown(Phaser.Keyboard.W)
            || game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)
        let pressingDown = this.cursors.down.isDown
            || game.input.keyboard.isDown(Phaser.Keyboard.S)

        if (pressingUp && !airborne) {
            this.player.body.velocity.y = -700;
            if (!this.sounds.jump.isPlaying) {
                this.sounds.jump.play();
            }
        }

        if (pressingDown && pressingLeft) {
            moveAmt /= 4;
            this.player.scale.x = -2;
            this.player.body.thrustLeft(moveAmt);
            this.player.animations.play('crouchwalk');
            this.crouchFace(this.player);

        }
        else if (pressingDown && pressingRight) {
            moveAmt /= 4;
            this.player.scale.x = 2;
            this.player.body.thrustRight(moveAmt);
            this.player.animations.play('crouchwalk');
            this.crouchFace(this.player);

        }
        else if (pressingDown) {
            this.player.animations.play('crouch');
            this.crouchFace(this.player);
        }
        else if (pressingLeft) {
            this.player.scale.x = -2;
            // change direction quickly
            if (this.player.body.velocity.x > 0) {
                moveAmt *= 4;
            }
            this.player.body.thrustLeft(moveAmt);
            this.player.animations.play('walk');
            this.forwardFace(this.player);

        }
        else if (pressingRight) {
            this.player.scale.x = 2;
            // change direction quickly
            if (this.player.body.velocity.x < 0) {
                moveAmt *= 4;
            }
            this.player.body.thrustRight(moveAmt);
            this.player.animations.play('walk');
            this.forwardFace(this.player);

        }
        else if (!pressingDown && Math.abs(this.player.body.velocity.x) < 2.00){
            this.player.animations.play('idle');
            this.forwardFace(this.player);
        }
        else {
            // not holding any movement keys
            this.player.body.velocity.x *= 0.90;

        }

        if (airborne) {
            this.player.animations.play('jump');
            this.jumpFace(this.player);
        }

        // add min/max for x velocity
        if (this.player.body.velocity.x > 0) {
            this.player.body.velocity.x = Math.min(500, this.player.body.velocity.x);
        }
        else if (this.player.body.velocity.x < 0) {
            this.player.body.velocity.x = Math.max(-500, this.player.body.velocity.x);
        }

        this.sendPlayerUpdate();

        // check for death
        if (this.player.y + this.player.height / 2 >= this.game.world.height) {
          this.killPlayer();
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
    crouchFace(player) {
        this.noFace(player);
        player.data.faceCrouch.visible = true;
        player.data.faceBorder.position.set(-12, -15); // position border over face
    }
    noFace(player) {
        player.data.faceForward.visible = false;
        player.data.faceAction.visible = false;
        player.data.faceDead.visible = false;
        player.data.faceCrouch.visible = false;
        player.data.faceBorder.position.set(-14, -25); // position border over face
    }

    addPlayer(player, isMainPlayer) {
        const playerSprite = this.game.add.sprite(30, 10, 'player');
        playerSprite.data.id = player.id;
        if (player.position) {
            playerSprite.position.set(player.position.x, player.position.y);
        };
        playerSprite.scale.set(2, 2);

        // only enable physics for main player
        if (isMainPlayer) {
            this.game.physics.p2.enable(playerSprite);
            playerSprite.body.fixedRotation = true;
            playerSprite.body.setRectangle(40, 100, 0, 0); // resize hit box to better reflect mario's actual size on screen
        }

        playerSprite.anchor.setTo(0.5);
        playerSprite.collideWorldBounds = false;
        playerSprite.animations.add('idle', [0,1], 2, true);
        playerSprite.animations.add('walk', [2,3,4,5,4,3], 10, true);
        playerSprite.animations.add('jump', [6], 10, true);
        playerSprite.animations.add('dead', [8, 9], 10, true);
        playerSprite.animations.add('crouch', [12], 10, true);
        playerSprite.animations.add('crouchwalk', [12, 13, 14], 10, true);

        // add player face
        playerSprite.data.faceForward = this.game.add.sprite(0, 0, `${player.name}-forward`);
        playerSprite.data.faceAction = this.game.add.sprite(0, 0, `${player.name}-action`);
        playerSprite.data.faceDead = this.game.add.sprite(0, 0, `${player.name}-dead`);
        playerSprite.data.faceCrouch = this.game.add.sprite(0, 0, `${player.name}-forward`);
        playerSprite.data.faceBorder = this.game.add.sprite(0, 0, 'player-face-border');

        ['faceForward', 'faceAction', 'faceDead'].forEach(function (face) {
            playerSprite.data[face].position.set(-30, -30.5);
            playerSprite.data[face].scale.set(0.18, 0.18);
            playerSprite.addChild(playerSprite.data[face]);

            playerSprite.data[face].visible = false;
        });

        ['faceCrouch'].forEach(function (face) {
            playerSprite.data[face].position.set(-27.5, -20);
            playerSprite.data[face].scale.set(0.18, 0.18);
            playerSprite.addChild(playerSprite.data[face]);

            playerSprite.data[face].visible = false;
        });

        playerSprite.data.faceBorder.position.set(-14, -25); // position border over face
        playerSprite.addChild(playerSprite.data.faceBorder);

        playerSprite.data.faceForward.visible = true;

        if (isMainPlayer) {
            window.player = playerSprite;
            this.player = playerSprite;
            this.game.camera.follow(playerSprite);
        }

        // Add this sprite to list of current players
        this.playerSprites[player.id] = playerSprite;
    }

    revive() {
      this.player.data.dead = false;
      this.player.body.x = 30;
      this.player.body.y = 10;
      this.player.body.velocity.y = 0;
      this.player.body.velocity.x = 0;
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

    createSounds() {
        this.sounds = {
            jump: new Phaser.Sound(this.game, 'jump', 0.5),
            death: new Phaser.Sound(this.game, 'death', 0.5),
        };
    }

    socketConnect() {
        var self = this;

        let connectData = {
            query: 'id=' + this.currentPlayer.id + '&name=' + this.currentPlayer.name,
        };

        this.socket = this.game.data.socket = io("/", connectData);

        this.socket.on('connect', function () {
            console.log("[socket] WebSocket connection established and ready.");
        });

        this.socket.on('welcome', function (players) {
            console.log("[socket] Welcome to the game! Number of players: ", Object.keys(players).length);

            // Add all the other players currently in the game
            for (let playerId in players) {
                if (players.hasOwnProperty(playerId)) {
                    let otherPlayer = players[playerId];
                    if (self.currentPlayer.id != otherPlayer.id) {
                        self.addPlayer(otherPlayer, false);
                    }
                }
            }
        });

        this.socket.on('player_joined', function (player) {
            console.log('[socket] Player joined: ', player);

            // New Player joined
            if (self.currentPlayer.id != player.id) {
                self.addPlayer(player, false);
            }
        });

        this.socket.on('server_tick', function (players) {
            // update the players positions
            for (let playerId in players) {
                if (players.hasOwnProperty(playerId)) {
                    let otherPlayer = players[playerId];
                    if (self.currentPlayer.id != otherPlayer.id) {
                        let playerSprite = self.playerSprites[playerId];
                        playerSprite.position.set(otherPlayer.position.x, otherPlayer.position.y);
                    }
                }
            }
        });

        this.socket.on('player_left', function (playerId) {
            let playerSprite = self.playerSprites[playerId];
            playerSprite.destroy(true);
            delete self.playerSprites[playerId];

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

    killPlayer() {
      this.player.data.dead = true;
      console.log('DEAD!!!!');

      this.deadFace(this.player);
      this.player.animations.play('dead');
      this.player.body.velocity.y = -1000;
    }
}
