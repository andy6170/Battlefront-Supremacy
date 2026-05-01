import { GameConfig } from "./BFSupremacyVariables.ts";
import { TeamVariables } from "./BFSupremacyVariables.ts";
import { UIconfig } from "./BFSupremacyVariables.ts";


export class BFSupremacyUI {
    public static UI_Setup() {
        BFSupremacyUI.conquest_UI_Setup();
        BFSupremacyUI.regroup_UI_Setup();
        BFSupremacyUI.finalassault_UI_Setup();
    }

    public static UI_Update() {
        if (GameConfig.gameConfig.stage == 0) {
            BFSupremacyUI.conquest_UI_Update();
        } else if (GameConfig.gameConfig.stage == 1) {
            BFSupremacyUI.regroup_UI_Update();
        } else if (GameConfig.gameConfig.stage == 2) {
            BFSupremacyUI.finalassault_UI_Update();
        }

    }

    public static UI_Change() {
        if (GameConfig.gameConfig.stage == 0) {
            BFSupremacyUI.conquest_UI_Change(true);
        } else if (GameConfig.gameConfig.stage == 1) {
            BFSupremacyUI.conquest_UI_Change(false);
            BFSupremacyUI.regroup_UI_Change(true);
        } else if (GameConfig.gameConfig.stage == 2) {
            BFSupremacyUI.regroup_UI_Change(false);
        } else if (GameConfig.gameConfig.stage == 3) {
            BFSupremacyUI.conquest_UI_Change(false);
        }


    }

    public static UI_AlphaUpdate() {
        if (UIconfig.uiConfig.uiAlphaUp) {
            UIconfig.uiConfig.uiAlpha += 0.033;
        } else {
            UIconfig.uiConfig.uiAlpha -= 0.033;
        }
        if (UIconfig.uiConfig.uiAlpha > 1) {
            UIconfig.uiConfig.uiAlpha = 1;
            UIconfig.uiConfig.uiAlphaUp = false;
        }
        if (UIconfig.uiConfig.uiAlpha < 0) {
            UIconfig.uiConfig.uiAlpha = 0.01; // 0 has a bug deleting the UI
            UIconfig.uiConfig.uiAlphaUp = true;
        }
    }

    //-------------------------------------------------------------------------
    //Conquest UI
    //-------------------------------------------------------------------------

    public static conquest_UI_Setup() {
        mod.AddUIContainer("conquest_container", UIconfig.uiConfig.defaultPosition, mod.CreateVector(380, 80, 0), mod.UIAnchor.TopCenter, mod.GetUIRoot(), true, 0, mod.CreateVector(1, 1, 1), 0.5, mod.UIBgFill.None, mod.UIDepth.AboveGameUI);
        UIconfig.uiConfig.conquestUI = mod.FindUIWidgetWithName("conquest_container");
        mod.AddUIImage("Image_Conquest", UIconfig.uiConfig.defaultPosition, mod.CreateVector(40, 40, 0), mod.UIAnchor.BottomCenter, UIconfig.uiConfig.conquestUI, true, 0, mod.CreateVector(1, 1, 1), 0.5, mod.UIBgFill.None, mod.UIImageType.CrownSolid, mod.CreateVector(1, 1, 1), 1);
        mod.AddUIContainer("LeftBG_Conquest", UIconfig.uiConfig.defaultPosition, mod.CreateVector(160, 40, 0), mod.UIAnchor.BottomLeft, UIconfig.uiConfig.conquestUI, true, 0, UIconfig.uiConfig.friendlyBGColour, 0.9, mod.UIBgFill.Blur);
        mod.AddUIContainer("RightBG_Conquest", UIconfig.uiConfig.defaultPosition, mod.CreateVector(160, 40, 0), mod.UIAnchor.BottomRight, UIconfig.uiConfig.conquestUI, true, 0, UIconfig.uiConfig.enemyBGColour, 0.9, mod.UIBgFill.Blur);
        mod.AddUIContainer("LeftProgress1_Conquest", UIconfig.uiConfig.defaultPosition, UIconfig.uiConfig.defaultPosition, mod.UIAnchor.BottomLeft, UIconfig.uiConfig.conquestUI, true, 1, UIconfig.uiConfig.friendlyColour, 1, mod.UIBgFill.Solid, mod.GetTeam(1));
        mod.AddUIContainer("LeftProgress2_Conquest", UIconfig.uiConfig.defaultPosition, UIconfig.uiConfig.defaultPosition, mod.UIAnchor.BottomLeft, UIconfig.uiConfig.conquestUI, true, 1, UIconfig.uiConfig.friendlyColour, 1, mod.UIBgFill.Solid, mod.GetTeam(2));
        mod.AddUIContainer("RightProgress1_Conquest", UIconfig.uiConfig.defaultPosition, UIconfig.uiConfig.defaultPosition, mod.UIAnchor.BottomRight, UIconfig.uiConfig.conquestUI, true, 1, UIconfig.uiConfig.enemyColour, 1, mod.UIBgFill.Solid, mod.GetTeam(1));
        mod.AddUIContainer("RightProgress2_Conquest", UIconfig.uiConfig.defaultPosition, UIconfig.uiConfig.defaultPosition, mod.UIAnchor.BottomRight, UIconfig.uiConfig.conquestUI, true, 1, UIconfig.uiConfig.enemyColour, 1, mod.UIBgFill.Solid, mod.GetTeam(2));
        mod.AddUIText("LeftText1_Conquest", UIconfig.uiConfig.defaultPosition, mod.CreateVector(150, 40, 0), mod.UIAnchor.BottomLeft, UIconfig.uiConfig.conquestUI, true, 1, UIconfig.uiConfig.whiteColour, 1, mod.UIBgFill.None, mod.Message(mod.stringkeys.supremacy.conquest.percentage, 0), 28, UIconfig.uiConfig.whiteColour, 1, mod.UIAnchor.CenterLeft, mod.GetTeam(1));
        mod.AddUIText("LeftText2_Conquest", UIconfig.uiConfig.defaultPosition, mod.CreateVector(150, 40, 0), mod.UIAnchor.BottomLeft, UIconfig.uiConfig.conquestUI, true, 1, UIconfig.uiConfig.whiteColour, 1, mod.UIBgFill.None, mod.Message(mod.stringkeys.supremacy.conquest.percentage, 0), 28, UIconfig.uiConfig.whiteColour, 1, mod.UIAnchor.CenterLeft, mod.GetTeam(2));
        mod.AddUIText("RightText1_Conquest", UIconfig.uiConfig.defaultPosition, mod.CreateVector(150, 40, 0), mod.UIAnchor.BottomRight, UIconfig.uiConfig.conquestUI, true, 1, UIconfig.uiConfig.whiteColour, 1, mod.UIBgFill.None, mod.Message(mod.stringkeys.supremacy.conquest.percentage, 0), 28, UIconfig.uiConfig.whiteColour, 1, mod.UIAnchor.CenterRight, mod.GetTeam(1));
        mod.AddUIText("RightText2_Conquest", UIconfig.uiConfig.defaultPosition, mod.CreateVector(150, 40, 0), mod.UIAnchor.BottomRight, UIconfig.uiConfig.conquestUI, true, 1, UIconfig.uiConfig.whiteColour, 1, mod.UIBgFill.None, mod.Message(mod.stringkeys.supremacy.conquest.percentage, 0), 28, UIconfig.uiConfig.whiteColour, 1, mod.UIAnchor.CenterRight, mod.GetTeam(2));
        mod.AddUIContainer("LeftProgress1_Underline_Conquest", mod.CreateVector(0, -2, 0), mod.CreateVector(160, 4, 0), mod.UIAnchor.BottomLeft, UIconfig.uiConfig.conquestUI, true, 2, UIconfig.uiConfig.friendlyColour, 1, mod.UIBgFill.Solid, mod.UIDepth.AboveGameUI, mod.GetTeam(1));
        mod.AddUIContainer("LeftProgress2_Underline_Conquest", mod.CreateVector(0, -2, 0), mod.CreateVector(160, 4, 0), mod.UIAnchor.BottomLeft, UIconfig.uiConfig.conquestUI, true, 2, UIconfig.uiConfig.friendlyColour, 1, mod.UIBgFill.Solid, mod.UIDepth.AboveGameUI, mod.GetTeam(2));
        mod.AddUIContainer("RightProgress1_Underline_Conquest", mod.CreateVector(0, -2, 0), mod.CreateVector(160, 4, 0), mod.UIAnchor.BottomRight, UIconfig.uiConfig.conquestUI, true, 2, UIconfig.uiConfig.enemyColour, 1, mod.UIBgFill.Solid, mod.UIDepth.AboveGameUI, mod.GetTeam(1));
        mod.AddUIContainer("RightProgress2_Underline_Conquest", mod.CreateVector(0, -2, 0), mod.CreateVector(160, 4, 0), mod.UIAnchor.BottomRight, UIconfig.uiConfig.conquestUI, true, 2, UIconfig.uiConfig.enemyColour, 1, mod.UIBgFill.Solid, mod.UIDepth.AboveGameUI, mod.GetTeam(2));
    }

    public static conquest_UI_Update() {
        let team1score = TeamVariables.getTeamData(1).score;
        let team2score = TeamVariables.getTeamData(2).score;
        if (team1score >= 100) {
            team1score = 100;
        }
        if (team2score >= 100) {
            team2score = 100;
        }
        const team1Progress = mod.CreateVector(mod.RoundToInteger((160 / 100) * team1score), 40, 0);
        const team2Progress = mod.CreateVector(mod.RoundToInteger((160 / 100) * team2score), 40, 0);

        mod.SetUIWidgetSize(mod.FindUIWidgetWithName("LeftProgress1_Conquest"), team1Progress);
        mod.SetUIWidgetSize(mod.FindUIWidgetWithName("LeftProgress2_Conquest"), team2Progress);
        mod.SetUIWidgetSize(mod.FindUIWidgetWithName("RightProgress1_Conquest"), team2Progress);
        mod.SetUIWidgetSize(mod.FindUIWidgetWithName("RightProgress2_Conquest"), team1Progress);
        mod.SetUITextLabel(mod.FindUIWidgetWithName("LeftText1_Conquest"), mod.Message(mod.stringkeys.supremacy.conquest.percentage, team1score));
        mod.SetUITextLabel(mod.FindUIWidgetWithName("LeftText2_Conquest"), mod.Message(mod.stringkeys.supremacy.conquest.percentage, team2score));
        mod.SetUITextLabel(mod.FindUIWidgetWithName("RightText1_Conquest"), mod.Message(mod.stringkeys.supremacy.conquest.percentage, team2score));
        mod.SetUITextLabel(mod.FindUIWidgetWithName("RightText2_Conquest"), mod.Message(mod.stringkeys.supremacy.conquest.percentage, team1score));
    }

    public static conquest_UI_Change(enable: boolean) {
        mod.SetUIWidgetVisible(mod.FindUIWidgetWithName("conquest_container"), enable);
    }

    //-------------------------------------------------------------------------
    //Regroup UI
    //-------------------------------------------------------------------------

    public static regroup_UI_Setup() {
        mod.AddUIContainer("regroup_container", mod.CreateVector(0, 20, 0), mod.CreateVector(380, 70, 0), mod.UIAnchor.TopCenter, mod.GetUIRoot(), false, 0, mod.CreateVector(0.5, 0.5, 0.5), 0.5, mod.UIBgFill.None, mod.UIDepth.AboveGameUI);
        UIconfig.uiConfig.regroupUI = mod.FindUIWidgetWithName("regroup_container");
        mod.AddUIText("bonustime_regroup_T1", mod.CreateVector(0, 0, 0), mod.CreateVector(180, 60, 0), mod.UIAnchor.BottomCenter, UIconfig.uiConfig.regroupUI, true, 0, UIconfig.uiConfig.friendlyColour, 1, mod.UIBgFill.Solid, mod.Message(mod.stringkeys.supremacy.regroup.bonustime, 0, 0, 0), 36, UIconfig.uiConfig.whiteColour, 1, mod.UIAnchor.Center, mod.GetTeam(1));
        mod.AddUIText("bonustime_regroup_T2", mod.CreateVector(0, 0, 0), mod.CreateVector(180, 60, 0), mod.UIAnchor.BottomCenter, UIconfig.uiConfig.regroupUI, true, 0, UIconfig.uiConfig.enemyColour, 1, mod.UIBgFill.Solid, mod.Message(mod.stringkeys.supremacy.regroup.bonustime, 0, 0, 0), 36, UIconfig.uiConfig.whiteColour, 1, mod.UIAnchor.Center, mod.GetTeam(2));
    }

    public static regroup_UI_Update() {
        let seconds = GameConfig.gameConfig.bonusTime;
        let tenseconds = Math.floor(seconds / 10);
        let minutes = Math.floor(seconds / 60);
        mod.SetUITextLabel(mod.FindUIWidgetWithName("bonustime_regroup_T1"), mod.Message(mod.stringkeys.supremacy.regroup.bonustime, minutes, tenseconds, seconds));
        mod.SetUITextLabel(mod.FindUIWidgetWithName("bonustime_regroup_T2"), mod.Message(mod.stringkeys.supremacy.regroup.bonustime, minutes, tenseconds, seconds));
    }

    public static regroup_UI_Change(enable: boolean) {
        GameConfig.gameConfig.bonusTime = 0;
        mod.SetUIWidgetVisible(mod.FindUIWidgetWithName("regroup_container"), enable);
    }

    //-------------------------------------------------------------------------
    //Final Assault UI
    //-------------------------------------------------------------------------

    public static finalassault_UI_Setup() {
        mod.AddUIContainer("finalassault_container", mod.CreateVector(0, 0, 0), mod.CreateVector(380, 80, 0), mod.UIAnchor.TopCenter, mod.GetUIRoot(), false, 0, mod.CreateVector(0.5, 0.5, 0.5), 0.5, mod.UIBgFill.None, mod.UIDepth.AboveGameUI);
    }

    public static finalassault_UI_Update() {

    }

    public static finalassault_UI_Change(enable: boolean) {
        mod.SetUIWidgetVisible(mod.FindUIWidgetWithName("finalassault_container"), enable);
    }
}