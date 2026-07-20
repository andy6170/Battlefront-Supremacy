import { GameConfig } from "./BFSVariables";
import { BFSupremacyCore } from "./BFSCore";

export class BFSWeather {

    public static initWeather(): void {
        if (BFSupremacyCore.isSpatialValid(990)) {
            GameConfig.gameConfig.nightMap = true;
        }
        if (BFSupremacyCore.isSpatialValid(991)) {
            GameConfig.gameConfig.nightFinalArea = true;
        }
        if (BFSupremacyCore.isSpatialValid(995)) {
            GameConfig.gameConfig.snow = true;
        }
    }

    public static checkNight(eventPlayer: mod.Player): void {
        mod.EnableScreenEffect(eventPlayer, mod.ScreenEffects.Night, GameConfig.gameConfig.night);
    }
}