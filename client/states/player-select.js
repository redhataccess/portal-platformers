class PlayerSelectState extends Phaser.State {
    preload() {
        this.duration = 2000;
        this.players = [];
    }

    create() {
        console.log('PlayerSelectState create');

        this.playerSelect = document.querySelector('#player-select');
        this.playerSelect.style.display = "block";

        this.loadPlayers()
            .then(this.addPlayers.bind(this));
    }

    shutdown() {
        this.playerSelect.style.display = "none";
    }

    next(player) {
        this.game.state.start(
            'PlayState',
            true,
            false,
            {
                player: player
            }
        );
    }

    loadPlayers() {
        const promise = new Promise((resolve, reject) => {
            const playersRef = firebase.database().ref('/users');

        playersRef.once('value', snapshot => {
          const players = snapshot.val();
          Object.keys(players).forEach(key => {
            this.players.push(players[key]);
          });

                resolve();
            });
        });

        return promise;
    }

    addPlayers() {
        const playerWrapper = document.querySelector('.player-wrapper');

        const loader = new Phaser.Loader(this.game);
        loader.onLoadComplete.addOnce(onLoaded);
        function onLoaded(){
            console.log('[player-select] player data loaded and ready to be used');
        };

        this.players.forEach(player => {
            // add face images to game cache
            loader.image(`${player.name}-forward`, player.images.imageForward);
            loader.image(`${player.name}-action`, player.images.imageAction);
            loader.image(`${player.name}-dead`, player.images.imageDead);

            // create menu elements!

            const el = document.createElement('li');
            const h5 = document.createElement('h5')
            const img = document.createElement('img');

            img.src = player.images.imageForward;
            h5.textContent = player.name;

            el.appendChild(img);
            el.appendChild(h5);
            playerWrapper.appendChild(el);

            el.addEventListener('click', () => this.next(player));
        });

        // now start the loader
        loader.start()
    }
}
