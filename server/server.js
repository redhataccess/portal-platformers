#!/bin/env node
//  Sample Node.js WebSocket Client-Server application
const http = require('http');
const express = require('express');
const AppServer = require('./AppServer.js');
const porty = require('porty');

// Patch console.x methods in order to add timestamp information
require("console-stamp")(console, {pattern: "mm/dd/yyyy HH:MM:ss.l"});

/**
 *  Define the sample server.
 */
const MainServer = function () {

    //  Scope.
    const self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server env variables/defaults.
     */
    self.setupVariables = async function () {
        //  Set the environment variables we need.
        if (process.env.PORT) {
            self.port = process.env.PORT;
        }
        else {
            self.port = await porty.find();
        }
    };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     */
    self.terminator = function (sig) {
        if (typeof sig === "string") {
            console.log('Received %s - terminating sample server ...', sig);
            process.exit(1);
        }
        console.log('Node server stopped.');
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function () {
        //  Process on exit and signals.
        process.on('exit', function () {
            self.terminator(0);
        });

        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
            'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function (element) {
            process.on(element, function () {
                self.terminator(element);
            });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function () {
        self.routes = {};

        self.routes['/api/example'] = function (req, res) {
            res.setHeader('Content-Type', 'application/json');
            res.send("{}");
        };
    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function () {
        self.createRoutes();
        self.app = express();
        self.httpServer = http.Server(self.app);
        self.io = require('socket.io')(self.httpServer);

        // The app server contains all the logic and state of the WebSocket app
        self.appServer = new AppServer(self.io);

        // Set up express static content root
        self.app.use(express.static(__dirname + '/../' + (process.argv[2] || 'client')));

        //  Add handlers for the app (from the routes).
        for (let r in self.routes) {
            if (self.routes.hasOwnProperty(r)) {
                self.app.get(r, self.routes[r]);
            }
        }
    };


    /**
     *  Initializes the server
     */
    self.initialize = async function () {
        await self.setupVariables();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server
     */
    self.start = function () {
        //  Start the app on the specific interface (and port).
        self.httpServer.listen(self.port, function () {
            console.log('Node server started on http://localhost:%d ...', self.port);
        });
    };
};


/**
 *  main():  Main code.
 */
const mainServer = new MainServer();
mainServer.initialize().then(() => {
    mainServer.start();
});

