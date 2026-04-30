import { GameConfig } from "./BFSupremacyVariables.ts";
import { BFSupremacyUI } from "./BFSupremacyUI.ts";
import { BFSupremacyConquest } from "./BFSupremacyConquest.ts";

export class BFSupremacyCore {
    public static init(): void {

    }

    public static async changeStage(): Promise<void> {
        GameConfig.gameConfig.roundOngoing = false;
        await mod.Wait(3);
        if (GameConfig.gameConfig.stage == 0) {
            GameConfig.gameConfig.stage = 1;
            BFSupremacyConquest.endConquest();

        } else if (GameConfig.gameConfig.stage == 1) {
            GameConfig.gameConfig.stage = 2;

        } else if (GameConfig.gameConfig.stage == 2) {
            GameConfig.gameConfig.stage = 0;
        }
        BFSupremacyUI.UI_Change();
        GameConfig.gameConfig.roundOngoing = true;
    }
}