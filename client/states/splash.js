class SplashState extends Phaser.State {
    preload() {
        this.duration = Game.config.splash.duration;
        this.title = Game.config.gameTitle;
    }

    create() {
        console.log('SplashState create');

        // connect to server
        this.socketConnect();

        const text = this.add.text(
            this.world.width/2,
            this.world.height/5,
            this.title,
            {
                font: `${Game.config.splash.fontSize}px ${Game.config.fontFamily}`,
                fontWeight: 'bold',
                fill: "#0CFA68"
            }
        );
        text.anchor.set(0.5, 0.5);

        // switch to next state after duration elapses
        this.time.events.add(this.duration, this.next, this);
    }

    next() {
        this.game.state.start('PlayerSelectState');
    }

    socketConnect() {
        let socket = this.game.data.socket = io("http://localhost:3000", {query: 'name=' + Date.now()});

        socket.on('connect', function () {
            console.log("WebSocket connection established and ready.");
        });

        socket.on('server_message', function (msg) {
            console.log(msg);
        });

        socket.on('client_joined', function (msg) {
            console.log(msg);
        });

        socket.on('client_left', function (msg) {
            console.log(msg);
        });

        function sendString() {
            let now = Date.now();
            socket.emit('string_message', 'Date.now() = ' + now);
        }

        setInterval(sendString, 500);
    }
}

