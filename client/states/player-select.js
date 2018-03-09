class PlayerSelectState extends Phaser.State {
    preload() {
        this.duration = 2000;
        this.players = [];
        this.template = null;
        this.loading = false;

        if (Game.config.skipFirebase) {
            this.next(game.cache.getJSON('test-player'));
        }
    }

    create() {
        console.log('PlayerSelectState create');

        this.loader = document.querySelector('#loader');
        this.playerSelect = document.querySelector('#player-select');
        this.playerSelect.style.display = "block";

        const source   = document.getElementById('player-template').innerHTML.trim();
        this.template = Handlebars.compile(source);

        this.selectScreenMusic = game.add.audio('selectScreenMusic');
        this.selectScreenMusic.play();
        this.selectScreenMusic.volume = .2;

        this.loadPlayers()
          .then(this.toggleLoader.bind(this))
          .then(this.addPlayers.bind(this));
    }

    shutdown() {
        this.selectScreenMusic.stop();
        this.playerSelect.style.display = "none";
    }

    next(player) {
        this.game.state.start(
            'PlayState',
            true,
            false,
            {
                player: player,
                players: this.players,
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
        playerWrapper.innerHTML = this.template({
          players: this.players
        });

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
        });

        const playerEls = playerWrapper.querySelectorAll('li');

        Array.from(playerEls).forEach(link => {
          link.addEventListener('click', evt => {
            const index = evt.currentTarget.getAttribute('data-index');
            this.next(this.players[index]);
          });
        });

        // now start the loader
        loader.start()
    }

    toggleLoader() {
      this.loader.style.display = 'none';
    }
}
