import { GameConfig } from "./BFSVariables.ts";
import { BFSupremacyUI } from "./BFSUI.ts";
import { BFSupremacyCore } from "./BFSCore.ts";

export class BFSupremacyRegroup {
    public static spawnHeli(): void {
    }

    public static animateHeliLanding(): void {
    }

    public static animateHeliLiftOff(): void {
    }

    public static animateHeli(): void {
    }

    public static playerBoarding(player: mod.Player): void {
        GameConfig.gameConfig.bonusTime += GameConfig.gameConfig.bonusTimeAddition;
        BFSupremacyCore.waitingArea(player);
        mod.EnableAllInputRestrictions(player, true);
        mod.SetCameraTypeForPlayer(player, mod.Cameras.Fixed, 50);
    }





}   
