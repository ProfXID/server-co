import { Schema, Context, type } from "@colyseus/schema";

export class Player extends Schema {

    @type("string") username: string = "";
    @type("int32") agoraID: number = 0;
    @type("int32") characterModelID: number = 0;

    @type("string") msg: string = "";

    @type("float32") targetRotation: number = 0.0;
    @type("boolean") jump: boolean = false;

    @type("boolean") interact: boolean = false;
    @type("float32") xSitPos: number = 0;
    @type("float32") ySitPos: number = 0;
    @type("float32") zSitPos: number = 0;
    @type("float32") ySitRot: number = 0;

    @type("boolean") dance: boolean = false;
    @type("boolean") mode: boolean = false;
    @type("int32") danceMove: number = 0;

    @type("float32") xMov: number = 0.0;
    @type("float32") yMov: number = 0.0;

    @type("float32") xPos: number = 0.0;
    @type("float32") yPos: number = 0.0;
    @type("float32") zPos: number = 0.0;
    
    @type("float32") xRot: number = 0.0;
    @type("float32") yRot: number = 0.0;
    @type("float32") zRot: number = 0.0;
    @type("float32") wRot: number = 0.0;
}
