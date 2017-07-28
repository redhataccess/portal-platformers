# Portal Platformers

A collaboration game for the Customer Portal team.

## Getting started

This game is built with [Phaser](), an HTML5 game framework.  To get a feel for how Phaser works, I recommend going through the [Making your first Phaser game](http://phaser.io/tutorials/making-your-first-phaser-game) tutorial.  That should be a good preparation for working on Portal Platformers!

## Setup

    git clone git@github.com:redhataccess/portal-platformers.git
    cd portal-platformers
    npm install

## Development commands

Start a dev server:

    npm start

BrowserSync will automatically reload your browser when files change.

To run a build:

    npm run build

**Note**: builds are *not* required during development.  As long as you use a
modern browser during development, it will support enough ES6 that you can skip
the build entirely, which speeds up development.  Builds are only needed when
it's time to deploy to production, since players aren't guaranteed to have
modern browsers.  A consequence of this is that there's one ES6 feature we
can't use, `import`/`export`.  All new modules are included via old-school
script tags.  All other ES6 features are fair game.

## External libraries

Currently, external libraries like Phaser and Lodash are from a CDN, just for
simplicity.

## Docker

You can also use docker to run node/deps

    npm install
    docker-compose up
    
once the platform is up, the code is exported into the container live.