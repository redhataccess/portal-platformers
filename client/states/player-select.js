class PlayerSelectState extends Phaser.State {
    preload() {
        this.duration = 2000;
        // TODO: prelaod players.json
        this.players = [];
    }

    create() {
        console.log('PlayerSelectState create');

        // switch to next state after duration elapses
        this.time.events.add(this.duration, this.next, this);

        this.playerSelect = document.querySelector('#player-select');
        this.playerSelect.style.display = "block";

        this.loadPlayers()
          .then(this.addPlayers.bind(this));
    }

    next() {
        // this.game.state.start('PlayState');
    }

    loadPlayers() {
      const promise = new Promise((resolve, reject) => {
        const playersRef = firebase.database().ref('/users');

        playersRef.on('value', snapshot => {
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
      console.log(this);

      this.players.forEach(player => {
        const el = document.createElement('li');

        playerWrapper.appendChild(el);
        el.textContent = player.name;
      });
    }
}
