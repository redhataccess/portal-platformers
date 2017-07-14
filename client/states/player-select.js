class PlayerSelectState extends Phaser.State {
    preload() {
        this.title = 'Player Select...';
        this.todo = 'TODO: add player select :)';
        this.duration = 2000;
        // TODO: prelaod players.json
        this.players = [];
    }

    create() {
        console.log('PlayerSelectState create');

        const text = this.add.text(this.world.width/2, this.world.height/5, this.title, { font: `${Game.config.splash.fontSize}px ${Game.config.fontFamily}`, fontWeight: 'bold', fill: '#0CFA68' });
        text.anchor.set(0.5, 0.5);

        const todo = this.add.text(this.world.width/2, this.world.height/4, this.todo, { font: `${Game.config.splash.fontSize}px ${Game.config.fontFamily}`, fontWeight: 'bold', fill: '#0CFA68' });
        todo.anchor.set(0.5, 0.5);

        // switch to next state after duration elapses
        // this.time.events.add(this.duration, this.next, this);

        let group = this.add.group();

        group.inputEnableChildren = true;
        group.ignoreChildInput = false;

        this.cache.getJSON('players').forEach((player) => {
            group.create(0, 0, player.name);
        });

        group.align(6, -1, 74, 74);

        group.onChildInputDown.add((sprite, pointer) => {
            console.log(`clicked on`, sprite);
            this.next();
        });
    }

    next() {
        this.game.state.start('PlayState');
    }
}

