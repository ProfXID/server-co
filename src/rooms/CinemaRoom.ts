import { CinemaRoomState } from './schema/CinemaRoomState';
import { Room, Client, matchMaker } from "colyseus";
import { Player } from './schema/Player';
import Moralis from "moralis/node";

export class CinemaRoom extends Room<CinemaRoomState> {

    onCreate(options: any) {
        this.setState(new CinemaRoomState());
        this.maxClients = 15;
        this.registerForMessages();
    }

    async onAuth(client: Client, options: any) {
        const query = new Moralis.Query("_Session");
        query.equalTo("sessionToken", options.sessionToken);
        query.select("user.username");
        const session = await query.first({ useMasterKey: true });

        if (session) {
            const user = session.get("user");
            console.log("session for user", user.get("username"), "found");
            return user;
        }
        else {
            console.log("No session found");
            return null;
        }
    }

    async onJoin(client: Client, options: any, user: Moralis.User) {
        const username = user.getUsername();

        const query = new Moralis.Query("_User");
        query.equalTo("username", username);
        query.select('characterModelID');

        const userObj = await query.first({ useMasterKey: true });

        this.state.players.set(client.sessionId, new Player());
        this.state.players.get(client.sessionId).username = username;
        this.state.players.get(client.sessionId).characterModelID = userObj.get("characterModelID");

        // this.state.players.set("dummy", new Player());
        // this.state.players.get("dummy").username = "dummy";

        if (this.state.roomMasterSessionId == null) {
            this.state.roomMasterSessionId = client.sessionId;
        }

        console.log(username, "joined! Character ID : ", userObj.get("characterModelID"));
    }

    onLeave(client: Client, consented: boolean) {
        this.state.players.delete(client.sessionId);
        // this.state.players.delete("dummy");

        if (client.sessionId == this.state.roomMasterSessionId) {
            this.state.roomMasterSessionId = null;
            this.state.players.forEach((_, key) => {
                if(this.state.roomMasterSessionId == null)
                    this.state.roomMasterSessionId = key;
            });
        }

        console.log(client.sessionId, "left!");
    }

    onDispose() {
        console.log("room", this.roomId, "disposing...");
    }

    registerForMessages() {
        this.onMessage("entityUpdate", (client: Client, updatedStates: [{ name: string, value: any }]) => {
            this.onEntityUpdate(client.sessionId, updatedStates);
        });
        this.onMessage("roomUpdate", (client: Client, updatedStates: [{ name: string, value: any }]) => {
            this.onRoomUpdate(client.sessionId, updatedStates);
        });
    }

    onEntityUpdate(sessionId: string, updatedStates: [{ name: string, value: any }]) {
        let playerState = this.state.players.get(sessionId) as any;
        updatedStates.forEach(updatedState => {
            playerState[updatedState.name] = updatedState.value;
        });

        // playerState = this.state.players.get("dummy") as any;
        // updatedStates.forEach(updatedState => {
        //     playerState[updatedState.name] = updatedState.value;
        // });
    }

    onRoomUpdate(sessionId: string, updatedStates: [{ name: string, value: any }]) {
        if (sessionId == this.state.roomMasterSessionId) {
            let roomState = this.state as any;
            updatedStates.forEach(updatedState => {
                roomState[updatedState.name] = updatedState.value;
            });
        }
    }
}
