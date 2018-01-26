const NODEJS = typeof module !== 'undefined' && module.exports;

/**
 * This module contains all of the app logic and state,
 * @param io
 * @constructor
 */
const AppServer = function (io) {
    //  Scope.
    const self = this;

    self.players = {};
    self.sockets = {};

    self.io = io;

    self.serverTick = function appServerTick() {
        self.io.emit("server_tick", self.players);
    };

    self.io.on('connection', function (socket) {

        console.log('Client connected headers:', JSON.stringify(socket.handshake));

        const playerId = socket.handshake.query.id;
        const playerName = socket.handshake.query.name;

        // create the player
        const player = {
            id: playerId,
            name: playerName,
            face: 'none',
            position: {
                x: 0,
                y: 0
            },
            scale: {
                x: 0,
                y: 0
            },
            airborne: false,
            walking: false,
            idle: true,
        };

        // Add player to list of players
        self.players[playerId] = player;

        console.log("Player joined:", playerId, playerName);

        socket.emit("welcome", self.players);

        self.io.emit('player_joined', player);

        socket.on('player_update', function (playerData) {
            const thePlayer = self.players[playerData.id];
            if (thePlayer) {
                thePlayer.position.x = playerData.position.x;
                thePlayer.position.y = playerData.position.y;
                thePlayer.scale.x = playerData.scale.x;
                thePlayer.scale.y = playerData.scale.y;
                thePlayer.face = playerData.face;
                thePlayer.airborne = playerData.airborne;
                thePlayer.crouching = playerData.crouching;
                thePlayer.walking = playerData.walking;
                thePlayer.idle = playerData.idle;
                thePlayer.dead = playerData.dead;
            }
        });

        socket.on('binary_message', function (msg) {
            const ab = toArrayBuffer(msg);
            const arr = new Int32Array(ab);
            console.log(arr[0]);
        });

        socket.on('string_message', function (msg) {
            console.log(msg);
        });

        socket.on('disconnect', function () {
            self.io.emit('player_left', playerId);
            delete self.players[playerId];
            console.log('Client connection closed');
        });

        function toArrayBuffer(buffer) {
            const ab = new ArrayBuffer(buffer.length);
            const view = new Uint8Array(ab);
            for (let i = 0; i < buffer.length; ++i) {
                view[i] = buffer[i];
            }
            return ab;
        }
    });

    setInterval(this.serverTick, 25);
};

if (NODEJS) module.exports = AppServer;
