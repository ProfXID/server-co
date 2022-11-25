import { CinemaRoom } from './rooms/CinemaRoom';
import Moralis from 'moralis/node';
import Arena from "@colyseus/arena";
import { monitor } from "@colyseus/monitor";

/**
 * Import your Room files
 */
import { LeslarCity } from './rooms/LeslarCity';

export default Arena({
    getId: () => "Your Colyseus App",

    initializeGameServer: async (gameServer) => {
        await Moralis.start({
            serverUrl: "https://yoojdb7rpnrc.usemoralis.com:2053/server",
            appId: "ZJcTf2JaEXRyqYGVu1z1yIUrOIxrjoTnvUQjwcCR",
            masterKey: "FoBCG1KEHrC2uEFr0AcYPfCb7wC90U0OWBKxj9W6"
        });

        /**
         * Define your room handlers:
         */
        gameServer.define('leslar_city', LeslarCity);
        gameServer.define('ll_cinema', LeslarCity);
        gameServer.define('ll_cinema_room', CinemaRoom);
        gameServer.define('ll_prestige', LeslarCity);

    },

    initializeExpress: (app) => {
        /**
         * Bind your custom express routes here:
         */
        app.get("/", (req, res) => {
            res.send("It's time to kick ass and chew bubblegum!");
        });

        /**
         * Bind @colyseus/monitor
         * It is recommended to protect this route with a password.
         * Read more: https://docs.colyseus.io/tools/monitor/
         */
        app.use("/colyseus", monitor());
    },


    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    }
});