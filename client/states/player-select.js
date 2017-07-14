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

        let group = this.add.group();

        group.inputEnableChildren = true;
        group.ignoreChildInput = false;

        var playerWrapper = document.querySelector('.player-wrapper');

        this.cache.getJSON('players').forEach((player) => {
            // group.create(0, 0, player.name);
            var el = document.createElement('li');
            playerWrapper.appendChild(el);
            el.textContent = player.name;
        });

        group.align(6, -1, 74, 74);

        group.onChildInputDown.add((sprite, pointer) => {
            console.log(`clicked on`, sprite);
            this.next();
        });
    }

    next() {
        // this.game.state.start('PlayState');
    }
}
