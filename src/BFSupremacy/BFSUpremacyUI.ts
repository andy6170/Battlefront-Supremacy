import { GameConfig } from "./BFSupremacyConfig.ts";

export class BFSupremacyUI {
    public static UI_Setup() {
        BFSupremacyUI.conquest_UI_Setup();
        BFSupremacyUI.regroup_UI_Setup();
        BFSupremacyUI.finalassault_UI_Setup();
    }

    public static UI_Update() {

    }

    public static UI_Change() {
        if (GameConfig.gameConfig.stage == 0) {
            BFSupremacyUI.conquest_UI_Change(true);
        } else if (GameConfig.gameConfig.stage == 1) {
            BFSupremacyUI.conquest_UI_Change(false);
        } else if (GameConfig.gameConfig.stage == 2) {
            BFSupremacyUI.conquest_UI_Change(true);
        } else if (GameConfig.gameConfig.stage == 3) {
            BFSupremacyUI.conquest_UI_Change(false);
        }


    }

    public static conquest_UI_Setup() {
        mod.AddUIContainer("conquest_container", mod.CreateVector(0, 0, 0), mod.CreateVector(380, 80, 0), mod.UIAnchor.TopCenter), mod.GetUIRoot(), false, 0, mod.CreateVector(0.5, 0.5, 0.5), 0.5, mod.UIBgFill.None, mod.UIDepth.AboveGameUI;

    }

    public static conquest_UI_Update() {

    }

    public static conquest_UI_Change(enable: boolean) {
        mod.SetUIWidgetVisible(mod.FindUIWidgetWithName("conquest_container"), enable);
    }

    public static regroup_UI_Setup() {
        mod.AddUIContainer("regroup_container", mod.CreateVector(0, 0, 0), mod.CreateVector(380, 80, 0), mod.UIAnchor.TopCenter), mod.GetUIRoot(), false, 0, mod.CreateVector(0.5, 0.5, 0.5), 0.5, mod.UIBgFill.None, mod.UIDepth.AboveGameUI;
    }

    public static regroup_UI_Update() {

    }

    public static regroup_UI_Change(enable: boolean) {
        mod.SetUIWidgetVisible(mod.FindUIWidgetWithName("regroup_container"), enable);
    }

    public static finalassault_UI_Setup() {
        mod.AddUIContainer("finalassault_container", mod.CreateVector(0, 0, 0), mod.CreateVector(380, 80, 0), mod.UIAnchor.TopCenter), mod.GetUIRoot(), false, 0, mod.CreateVector(0.5, 0.5, 0.5), 0.5, mod.UIBgFill.None, mod.UIDepth.AboveGameUI;
    }

    public static finalassault_UI_Update() {

    }

    public static finalassault_UI_Change(enable: boolean) {
        mod.SetUIWidgetVisible(mod.FindUIWidgetWithName("finalassault_container"), enable);
    }
}