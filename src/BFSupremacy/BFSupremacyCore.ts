import { GameConfig } from "./BFSupremacyConfig.ts";
import { BFSupremacyUI } from "./BFSUpremacyUI.ts";

export class BFSupremacyCore {
    public static init(): void {

    }

    public static changeStage(): void {
        BFSupremacyUI.UI_Change();
    }
}