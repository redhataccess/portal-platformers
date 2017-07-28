const NODEJS = typeof module !== 'undefined' && module.exports;

/**
 * This module contains all of the app logic and state,
 * @param io
 * @constructor
 */
var AppServer = function (io) {
    //  Scope.
    var self = this;

    self.players = {};
    self.sockets = {};

    self.io = io;

    self.serverTick = function appServerTick() {
        self.io.emit("server_tick", self.players);
    };

    self.io.on('connection', function (socket) {

        console.log('Client connected headers:', JSON.stringify(socket.handshake));

        var playerId = socket.handshake.query.id;
        var playerName = socket.handshake.query.name;

        // create the player
        var player = {
            id: playerId,
            name: playerName,
            face: 'none',
            position:  {
                x: 0,
                y: 0
            },
            scale:  {
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
            var thePlayer = self.players[playerData.id];
            if (thePlayer) {
                thePlayer.position.x = playerData.position.x;
                thePlayer.position.y = playerData.position.y;
                thePlayer.scale.x = playerData.scale.x;
                thePlayer.scale.y = playerData.scale.y;
                thePlayer.face = playerData.face;
                thePlayer.airborne = playerData.airborne;
                thePlayer.walking = playerData.walking;
                thePlayer.idle = playerData.idle;
            }
        });

        socket.on('binary_message', function (msg) {
            var ab = toArrayBuffer(msg);
            var arr = new Int32Array(ab);
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
            var ab = new ArrayBuffer(buffer.length);
            var view = new Uint8Array(ab);
            for (var i = 0; i < buffer.length; ++i) {
                view[i] = buffer[i];
            }
            return ab;
        }
    });

    setInterval(this.serverTick, 25);
};

if (NODEJS) module.exports = AppServer;
