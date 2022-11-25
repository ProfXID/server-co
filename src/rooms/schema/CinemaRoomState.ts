import { Player } from './Player';
import { Schema, MapSchema, Context, type } from "@colyseus/schema";

export class CinemaRoomState extends Schema {

    @type("string") roomMasterSessionId: string = null;
    @type("string") youtubeVideoUrl: string = null;
    @type("boolean") isYoutubePaused: boolean = true;
    @type("float32") youtubeVideoCurrentTime: number = 0.0;
    @type("float32") youtubeVideoTotalTime: number = 0.0;
    @type("float32") youtubePlaybackSpeed: number = 0.0;
    @type("float32") youtubeVolume: number = 0.0;
    @type({ map: Player }) players: MapSchema<Player> = new MapSchema<Player>();
}
