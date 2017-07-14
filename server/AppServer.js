const NODEJS = typeof module !== 'undefined' && module.exports;

/**
 * This module contains all of the app logic and state,
 * @param io
 * @constructor
 */
let AppServer = function (io) {
    //  Scope.
    let self = this;

    self.io = io;

    // Example state
    let updateCount = 0;

    setInterval(function () {
        // send to all clients
        self.io.emit('server_message', ++updateCount);
    }, 100);

    self.io.on('connection', function (socket) {

        console.log('Client connected headers:', JSON.stringify(socket.handshake));

        let name = socket.handshake.query.name;

        console.log("Name:", name);

        self.io.emit('client_joined', "Client joined: " + name);

        socket.on('binary_message', function (msg) {
            let ab = toArrayBuffer(msg);
            let arr = new Int32Array(ab);
            console.log(arr[0]);
        });

        socket.on('string_message', function (msg) {
            console.log(msg);
        });

        socket.on('disconnect', function () {
            self.io.emit('client_left', "Client left: " + name);
            console.log('Client connection closed');
        });

        function toArrayBuffer(buffer) {
            let ab = new ArrayBuffer(buffer.length);
            let view = new Uint8Array(ab);
            for (let i = 0; i < buffer.length; ++i) {
                view[i] = buffer[i];
            }
            return ab;
        }
    });
};

if (NODEJS) module.exports = AppServer;
