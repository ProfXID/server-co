import { RoomState } from '../src/rooms/schema/RoomState';
import assert from "assert";
import { ColyseusTestServer, boot } from "@colyseus/testing";

import appConfig from "../src/arena.config";
import { Player } from '../src/rooms/schema/Player';
import Moralis from 'moralis/node';

describe("testing your Colyseus app", () => {
    let colyseus: ColyseusTestServer;

    before(async () => colyseus = await boot(appConfig));
    after(async () => colyseus.shutdown());

    beforeEach(async () => await colyseus.cleanup());

    it("connecting into a room", async () => {
        await Moralis.start({
            serverUrl: "https://thd4d5zpydro.usemoralis.com:2053/server",
            appId: "TlzUUVQVNaMqTXy6TRZz7R7AD3yievfVk0LkMYp2",
            masterKey: "2eFE8W0kEpUIfSxST2yWGD3SowIcjaDlA14WRnUf"
        });

        const query = new Moralis.Query("_Session");
        query.select("user.username", "sessionToken");
        const session = await query.first({ useMasterKey: true });

        const room = await colyseus.createRoom<RoomState>("leslar_city", {});
        const client1 = await colyseus.connectTo(room, { sessionToken: session?.get("sessionToken") });

        assert.strictEqual(client1.sessionId, room.clients[0].sessionId);
        await room.waitForNextPatch();

        const expectedState = new RoomState();
        expectedState.players.set(client1.sessionId, new Player().assign({
            username: session?.get("user").get("username")
        }));
        // expectedState.players.set("dummy", new Player().assign({ username: "dummy" }));
        assert.deepStrictEqual(client1.state.toJSON(), expectedState.toJSON());

        const client2 = await colyseus.connectTo(room, { sessionToken: session?.get("sessionToken") });

        assert.strictEqual(client2.sessionId, room.clients[1].sessionId);
        await room.waitForNextPatch();

        expectedState.players.set(client2.sessionId, new Player().assign({
            username: session?.get("user").get("username")
        }));
        assert.deepStrictEqual(client2.state.toJSON(), expectedState.toJSON());
    });
});
