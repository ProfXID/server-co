import { RoomState } from './schema/RoomState';
import { Room, Client, matchMaker } from "colyseus";
import { Player } from './schema/Player';
import Moralis from "moralis/node";

export class LeslarCity extends Room<RoomState> {

    onCreate(options: any) {
        this.setState(new RoomState());
        this.maxClients = 100;
        this.registerForMessages();
    }

    async onAuth(client: Client, options: any, model: any) {
        const query = new Moralis.Query("_Session");
        query.equalTo("sessionToken", options.sessionToken);
        query.select("user.username");
        const session = await query.first({ useMasterKey: true });

        if (session) {
            const user = session.get("user");
            console.log("session for user", user.get("username"), "Joined!");
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

        console.log(username, "joined! Character ID : ", userObj.get("characterModelID"));
    }

    onLeave(client: Client, consented: boolean) {
        this.state.players.delete(client.sessionId);
        // this.state.players.delete("dummy");
        console.log(client.sessionId, "left!");
    }

    onDispose() {
        console.log("room", this.roomId, "disposing...");
    }

    registerForMessages() {
        this.onMessage("entityUpdate", (client: Client, updatedStates: [{ name: string, value: any }]) => {
            this.onEntityUpdate(client.sessionId, updatedStates);
        });
    }

    async changePlayerCharacterModel(modelId: number, username: string) {
        // codingannya ke moralis
        const query = new Moralis.Query("_User");
        query.equalTo("username", username);
        query.select('characterModelID');

        const userObj = await query.first({ useMasterKey: true });

        userObj.set('character', modelId);
        userObj.save({ useMasterKey: true });
    }

    onEntityUpdate(sessionId: string, updatedStates: [{ name: string, value: any }]) {
        let playerState = this.state.players.get(sessionId) as any;
        updatedStates.forEach(updatedState => {
            const prevState = playerState[updatedState.name];

            playerState[updatedState.name] = updatedState.value;

            if (prevState.characterModelID !== updatedState.value.characterModelID) {
                this.changePlayerCharacterModel(updatedState.value.characterModelID, prevState.username);
            }
            // if characterModelBerubah pake perbandingan
            // jalanin function changePlayerCharacter
        });

        // playerState = this.state.players.get("dummy") as any;
        // updatedStates.forEach(updatedState => {
        //     playerState[updatedState.name] = updatedState.value;
        // });
    }
}
