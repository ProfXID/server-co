import { Player } from './Player';
import { Schema, MapSchema, Context, type } from "@colyseus/schema";

export class RoomState extends Schema {

    @type({ map: Player }) players: MapSchema<Player> = new MapSchema<Player>();
}
