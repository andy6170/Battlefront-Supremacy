import { GameConfig } from "./BFSupremacyConfig.ts";

export class BFSupremacyUI {
    public static UI_Setup() {

    }

    public static UI_Update() {

    }

    public static UI_Change() {
        if (GameConfig.gameConfig.stage == 0) {
            BFSupremacyUI.conquest_UI_Change(true);
        } else if (GameConfig.gameConfig.stage == 1) {
            BFSupremacyUI.conquest_UI_Change(false);
        }


    }

    public static conquest_UI_Setup() {
        mod.AddUIContainer("conquest_container", mod.CreateVector(0, 0, 0), mod.CreateVector(380, 80, 0), mod.UIAnchor.TopCenter), mod.GetUIRoot(), true, 0, mod.CreateVector(0.5, 0.5, 0.5), 0.5, mod.UIBgFill.None, mod.UIDepth.AboveGameUI;

    }

    public static conquest_UI_Update() {

    }

    public static conquest_UI_Change(enable: boolean) {

    }
}