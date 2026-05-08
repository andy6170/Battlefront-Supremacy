import { GameConfig } from "./BFSVariables.ts";
import { TeamVariables } from "./BFSVariables.ts";
import { UIconfig } from "./BFSVariables.ts";


export class BFSupremacyUI {
    public static UI_Setup() {
        mod.AddUIContainer("MainUI", mod.CreateVector(0, 0, 0), mod.CreateVector(10000, 10000, 0), mod.UIAnchor.TopCenter);
        mod.SetUIWidgetBgFill(mod.FindUIWidgetWithName("MainUI"), mod.UIBgFill.None);
        mod.SetUIWidgetDepth(mod.FindUIWidgetWithName("MainUI"), mod.UIDepth.AboveGameUI);
        BFSupremacyUI.conquest_UI_Setup();
        BFSupremacyUI.capturePoint_UI_Setup_Conquest();
        BFSupremacyUI.regroup_UI_Setup();
        BFSupremacyUI.finalAssault_UI_Setup();
        BFSupremacyUI.capturePoint_UI_Setup_FinalAssault();
    }

    public static UI_Update() {
        if (GameConfig.gameConfig.stage == 0) {
            BFSupremacyUI.conquest_UI_Update();
        } else if (GameConfig.gameConfig.stage == 1) {
            BFSupremacyUI.regroup_UI_Text_Update();
        } else if (GameConfig.gameConfig.stage == 2) {
            BFSupremacyUI.finalAssault_UI_Update();
        }

    }

    public static UI_Change() {
        if (GameConfig.gameConfig.stage == 0) {
            BFSupremacyUI.conquest_UI_Change(true);
            BFSupremacyUI.finalAssault_UI_Change(false);
        } else if (GameConfig.gameConfig.stage == 1) {
            BFSupremacyUI.conquest_UI_Change(false);
            BFSupremacyUI.regroup_UI_Change(true);
            BFSupremacyUI.regroup_UI_Team_Update();
        } else if (GameConfig.gameConfig.stage == 2) {
            BFSupremacyUI.regroup_UI_Change(false);
            BFSupremacyUI.finalAssault_UI_Change(true);
            BFSupremacyUI.finalAssault_UI_Team_Update();
            BFSupremacyUI.finalAssault_UI_Update();
        }


    }

    public static UI_AlphaUpdate() {
        if (UIconfig.uiConfig.uiAlphaUp) {
            UIconfig.uiConfig.uiAlpha += 0.099;
        } else {
            UIconfig.uiConfig.uiAlpha -= 0.099;
        }
        if (UIconfig.uiConfig.uiAlpha > 1) {
            UIconfig.uiConfig.uiAlpha = 1;
            if (UIconfig.uiConfig.flashStart) {
                UIconfig.uiConfig.flashStart = false;
                UIconfig.uiConfig.uiAlphaUp = false;
            }
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
        mod.AddUIContainer("conquest_container", UIconfig.uiConfig.defaultPosition, mod.CreateVector(380, 75, 0), mod.UIAnchor.TopCenter, mod.FindUIWidgetWithName("MainUI"), true, 0, mod.CreateVector(1, 1, 1), 0.5, mod.UIBgFill.None, mod.UIDepth.AboveGameUI);
        UIconfig.uiConfig.conquestUI = mod.FindUIWidgetWithName("conquest_container");
        mod.AddUIImage("Image_Conquest", UIconfig.uiConfig.defaultPosition, mod.CreateVector(40, 32, 0), mod.UIAnchor.BottomCenter, UIconfig.uiConfig.conquestUI, true, 0, mod.CreateVector(1, 1, 1), 0.5, mod.UIBgFill.None, mod.UIImageType.CrownSolid, mod.CreateVector(1, 1, 1), 1, mod.UIDepth.AboveGameUI);
        mod.AddUIContainer("LeftBG_Conquest", mod.CreateVector(0, -2, 0), mod.CreateVector(160, 32, 0), mod.UIAnchor.BottomLeft, UIconfig.uiConfig.conquestUI, true, 0, UIconfig.uiConfig.friendlyBGColour, 0.8, mod.UIBgFill.Blur, mod.UIDepth.AboveGameUI);
        mod.AddUIContainer("RightBG_Conquest", mod.CreateVector(0, -2, 0), mod.CreateVector(160, 32, 0), mod.UIAnchor.BottomRight, UIconfig.uiConfig.conquestUI, true, 0, UIconfig.uiConfig.enemyBGColour, 0.8, mod.UIBgFill.Blur, mod.UIDepth.AboveGameUI);
        mod.AddUIContainer("LeftProgress1_Conquest", UIconfig.uiConfig.defaultPosition, UIconfig.uiConfig.defaultPosition, mod.UIAnchor.BottomLeft, UIconfig.uiConfig.conquestUI, true, 1, UIconfig.uiConfig.friendlyColour, 1, mod.UIBgFill.Solid, mod.UIDepth.AboveGameUI, mod.GetTeam(1));
        mod.AddUIContainer("LeftProgress2_Conquest", UIconfig.uiConfig.defaultPosition, UIconfig.uiConfig.defaultPosition, mod.UIAnchor.BottomLeft, UIconfig.uiConfig.conquestUI, true, 1, UIconfig.uiConfig.friendlyColour, 1, mod.UIBgFill.Solid, mod.UIDepth.AboveGameUI, mod.GetTeam(2));
        mod.AddUIContainer("RightProgress1_Conquest", UIconfig.uiConfig.defaultPosition, UIconfig.uiConfig.defaultPosition, mod.UIAnchor.BottomRight, UIconfig.uiConfig.conquestUI, true, 1, UIconfig.uiConfig.enemyColour, 1, mod.UIBgFill.Solid, mod.UIDepth.AboveGameUI, mod.GetTeam(1));
        mod.AddUIContainer("RightProgress2_Conquest", UIconfig.uiConfig.defaultPosition, UIconfig.uiConfig.defaultPosition, mod.UIAnchor.BottomRight, UIconfig.uiConfig.conquestUI, true, 1, UIconfig.uiConfig.enemyColour, 1, mod.UIBgFill.Solid, mod.UIDepth.AboveGameUI, mod.GetTeam(2));
        mod.AddUIText("LeftText1_Conquest", UIconfig.uiConfig.defaultPosition, mod.CreateVector(150, 30, 0), mod.UIAnchor.BottomLeft, UIconfig.uiConfig.conquestUI, true, 1, UIconfig.uiConfig.whiteColour, 1, mod.UIBgFill.None, mod.Message(mod.stringkeys.supremacy.conquest.percentage, 0), 28, UIconfig.uiConfig.whiteColour, 1, mod.UIAnchor.CenterLeft, mod.UIDepth.AboveGameUI, mod.GetTeam(1));
        mod.AddUIText("LeftText2_Conquest", UIconfig.uiConfig.defaultPosition, mod.CreateVector(150, 30, 0), mod.UIAnchor.BottomLeft, UIconfig.uiConfig.conquestUI, true, 1, UIconfig.uiConfig.whiteColour, 1, mod.UIBgFill.None, mod.Message(mod.stringkeys.supremacy.conquest.percentage, 0), 28, UIconfig.uiConfig.whiteColour, 1, mod.UIAnchor.CenterLeft, mod.UIDepth.AboveGameUI, mod.GetTeam(2));
        mod.AddUIText("RightText1_Conquest", UIconfig.uiConfig.defaultPosition, mod.CreateVector(150, 30, 0), mod.UIAnchor.BottomRight, UIconfig.uiConfig.conquestUI, true, 1, UIconfig.uiConfig.whiteColour, 1, mod.UIBgFill.None, mod.Message(mod.stringkeys.supremacy.conquest.percentage, 0), 28, UIconfig.uiConfig.whiteColour, 1, mod.UIAnchor.CenterRight, mod.UIDepth.AboveGameUI, mod.GetTeam(1));
        mod.AddUIText("RightText2_Conquest", UIconfig.uiConfig.defaultPosition, mod.CreateVector(150, 30, 0), mod.UIAnchor.BottomRight, UIconfig.uiConfig.conquestUI, true, 1, UIconfig.uiConfig.whiteColour, 1, mod.UIBgFill.None, mod.Message(mod.stringkeys.supremacy.conquest.percentage, 0), 28, UIconfig.uiConfig.whiteColour, 1, mod.UIAnchor.CenterRight, mod.UIDepth.AboveGameUI, mod.GetTeam(2));
        mod.AddUIContainer("LeftProgress1_Underline_Conquest", mod.CreateVector(0, -2, 0), mod.CreateVector(160, 2, 0), mod.UIAnchor.BottomLeft, UIconfig.uiConfig.conquestUI, true, 2, UIconfig.uiConfig.friendlyColour, 1, mod.UIBgFill.Solid, mod.UIDepth.AboveGameUI, mod.GetTeam(1));
        mod.AddUIContainer("LeftProgress2_Underline_Conquest", mod.CreateVector(0, -2, 0), mod.CreateVector(160, 2, 0), mod.UIAnchor.BottomLeft, UIconfig.uiConfig.conquestUI, true, 2, UIconfig.uiConfig.friendlyColour, 1, mod.UIBgFill.Solid, mod.UIDepth.AboveGameUI, mod.GetTeam(2));
        mod.AddUIContainer("RightProgress1_Underline_Conquest", mod.CreateVector(0, -2, 0), mod.CreateVector(160, 2, 0), mod.UIAnchor.BottomRight, UIconfig.uiConfig.conquestUI, true, 2, UIconfig.uiConfig.enemyColour, 1, mod.UIBgFill.Solid, mod.UIDepth.AboveGameUI, mod.GetTeam(1));
        mod.AddUIContainer("RightProgress2_Underline_Conquest", mod.CreateVector(0, -2, 0), mod.CreateVector(160, 2, 0), mod.UIAnchor.BottomRight, UIconfig.uiConfig.conquestUI, true, 2, UIconfig.uiConfig.enemyColour, 1, mod.UIBgFill.Solid, mod.UIDepth.AboveGameUI, mod.GetTeam(2));
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
        const team1Progress = mod.CreateVector(mod.RoundToInteger((160 / 100) * team1score), 30, 0);
        const team2Progress = mod.CreateVector(mod.RoundToInteger((160 / 100) * team2score), 30, 0);

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
        mod.SetUIWidgetVisible(mod.FindUIWidgetWithName("capturepoint_container_conquest"), enable);
    }

    public static conquest_UI_Flash() {
        let alpha = UIconfig.uiConfig.uiAlpha

        if (UIconfig.uiConfig.ProgressFlashT1) {
            mod.SetUIWidgetBgAlpha(mod.FindUIWidgetWithName("LeftProgress1_Conquest"), alpha);
            mod.SetUIWidgetBgAlpha(mod.FindUIWidgetWithName("RightProgress2_Conquest"), alpha);
            mod.SetUIWidgetBgAlpha(mod.FindUIWidgetWithName("LeftProgress1_Underline_Conquest"), alpha);
            mod.SetUIWidgetBgAlpha(mod.FindUIWidgetWithName("RightProgress2_Underline_Conquest"), alpha);
            mod.SetUIWidgetBgAlpha(mod.FindUIWidgetWithName("LeftProgress2_Conquest"), 1);
            mod.SetUIWidgetBgAlpha(mod.FindUIWidgetWithName("RightProgress1_Conquest"), 1);
            mod.SetUIWidgetBgAlpha(mod.FindUIWidgetWithName("LeftProgress2_Underline_Conquest"), 1);
            mod.SetUIWidgetBgAlpha(mod.FindUIWidgetWithName("RightProgress1_Underline_Conquest"), 1);
        }
        if (UIconfig.uiConfig.ProgressFlashT2) {
            mod.SetUIWidgetBgAlpha(mod.FindUIWidgetWithName("LeftProgress2_Conquest"), alpha);
            mod.SetUIWidgetBgAlpha(mod.FindUIWidgetWithName("RightProgress1_Conquest"), alpha);
            mod.SetUIWidgetBgAlpha(mod.FindUIWidgetWithName("LeftProgress2_Underline_Conquest"), alpha);
            mod.SetUIWidgetBgAlpha(mod.FindUIWidgetWithName("RightProgress1_Underline_Conquest"), alpha);
            mod.SetUIWidgetBgAlpha(mod.FindUIWidgetWithName("LeftProgress1_Conquest"), 1);
            mod.SetUIWidgetBgAlpha(mod.FindUIWidgetWithName("RightProgress2_Conquest"), 1);
            mod.SetUIWidgetBgAlpha(mod.FindUIWidgetWithName("LeftProgress1_Underline_Conquest"), 1);
            mod.SetUIWidgetBgAlpha(mod.FindUIWidgetWithName("RightProgress2_Underline_Conquest"), 1);
        }
    }

    //-------------------------------------------------------------------------
    //Capture Point UI
    //-------------------------------------------------------------------------

    public static capturePoint_UI_Setup_Conquest() {
        mod.AddUIContainer("capturepoint_container_conquest", mod.CreateVector(0, 95, 0), mod.CreateVector(900, 30, 0), mod.UIAnchor.TopCenter, mod.FindUIWidgetWithName("MainUI"), true, 0, mod.CreateVector(0.5, 0.5, 0.5), 0.5, mod.UIBgFill.None, mod.UIDepth.AboveGameUI);
        UIconfig.uiConfig.capturePointUI = mod.FindUIWidgetWithName("capturepoint_container_conquest");
        for (let i = 0; i < GameConfig.gameConfig.conquestCapturePoints; i++) {
            mod.AddUIContainer("flag_bg1_" + i, mod.CreateVector(((i - (GameConfig.gameConfig.conquestCapturePoints - 1) / 2) * 60), 0, 0), mod.CreateVector(35, 35, 0), mod.UIAnchor.TopCenter, UIconfig.uiConfig.capturePointUI, true, 0, mod.CreateVector(0, 0, 0), 0.8, mod.UIBgFill.Blur, mod.UIDepth.AboveGameUI, mod.GetTeam(1));
            mod.AddUIContainer("flag_bg2_" + i, mod.CreateVector(((i - (GameConfig.gameConfig.conquestCapturePoints - 1) / 2) * 60), 0, 0), mod.CreateVector(35, 35, 0), mod.UIAnchor.TopCenter, UIconfig.uiConfig.capturePointUI, true, 0, mod.CreateVector(0, 0, 0), 0.8, mod.UIBgFill.Blur, mod.UIDepth.AboveGameUI, mod.GetTeam(2));
            mod.AddUIText("flag_text1_" + i, mod.CreateVector(0, 0, 0), mod.CreateVector(35, 35, 0), mod.UIAnchor.Center, mod.FindUIWidgetWithName("flag_bg1_" + i), true, 0, mod.CreateVector(1, 1, 1), 1, mod.UIBgFill.OutlineThin, mod.Message(mod.stringkeys.value, UIconfig.uiConfig.flagLetters[i]), 28, mod.CreateVector(1, 1, 1), 1, mod.UIAnchor.Center, mod.GetTeam(1));
            mod.AddUIText("flag_text2_" + i, mod.CreateVector(0, 0, 0), mod.CreateVector(35, 35, 0), mod.UIAnchor.Center, mod.FindUIWidgetWithName("flag_bg2_" + i), true, 0, mod.CreateVector(1, 1, 1), 1, mod.UIBgFill.OutlineThin, mod.Message(mod.stringkeys.value, UIconfig.uiConfig.flagLetters[i]), 28, mod.CreateVector(1, 1, 1), 1, mod.UIAnchor.Center, mod.GetTeam(2));
        }
    }

    public static capturePoint_UI_Setup_FinalAssault() {
        mod.AddUIContainer("capturepoint_container_finalAssault", mod.CreateVector(0, 115, 0), mod.CreateVector(900, 30, 0), mod.UIAnchor.TopCenter, mod.FindUIWidgetWithName("MainUI"), false, 0, mod.CreateVector(0.5, 0.5, 0.5), 0.5, mod.UIBgFill.None, mod.UIDepth.AboveGameUI);
        UIconfig.uiConfig.capturepointUIFinalAssault = mod.FindUIWidgetWithName("capturepoint_container_finalAssault");
        for (let i = 0; i < 2; i++) {
            mod.AddUIContainer("finalflag_bg1_" + i, mod.CreateVector(((i - (2 - 1) / 2) * 60), 0, 0), mod.CreateVector(35, 35, 0), mod.UIAnchor.TopCenter, UIconfig.uiConfig.capturepointUIFinalAssault, true, 0, mod.CreateVector(0, 0, 0), 0.8, mod.UIBgFill.Blur, mod.UIDepth.AboveGameUI, mod.GetTeam(1));
            mod.AddUIContainer("finalflag_bg2_" + i, mod.CreateVector(((i - (2 - 1) / 2) * 60), 0, 0), mod.CreateVector(35, 35, 0), mod.UIAnchor.TopCenter, UIconfig.uiConfig.capturepointUIFinalAssault, true, 0, mod.CreateVector(0, 0, 0), 0.8, mod.UIBgFill.Blur, mod.UIDepth.AboveGameUI, mod.GetTeam(2));
            mod.AddUIText("finalflag_text1_" + i, mod.CreateVector(0, 0, 0), mod.CreateVector(35, 35, 0), mod.UIAnchor.Center, mod.FindUIWidgetWithName("finalflag_bg1_" + i), true, 0, mod.CreateVector(1, 1, 1), 1, mod.UIBgFill.OutlineThin, mod.Message(mod.stringkeys.value, UIconfig.uiConfig.flagLetters[i]), 28, mod.CreateVector(1, 1, 1), 1, mod.UIAnchor.Center, mod.GetTeam(1));
            mod.AddUIText("finalflag_text2_" + i, mod.CreateVector(0, 0, 0), mod.CreateVector(35, 35, 0), mod.UIAnchor.Center, mod.FindUIWidgetWithName("finalflag_bg2_" + i), true, 0, mod.CreateVector(1, 1, 1), 1, mod.UIBgFill.OutlineThin, mod.Message(mod.stringkeys.value, UIconfig.uiConfig.flagLetters[i]), 28, mod.CreateVector(1, 1, 1), 1, mod.UIAnchor.Center, mod.GetTeam(2));
        }
    }

    public static capturePoint_UI_Colour_Update(eventCapturePoint: mod.CapturePoint) {
        let id = mod.Subtract(mod.GetObjId(eventCapturePoint), GameConfig.gameConfig.flagStart);
        let owner = mod.GetCurrentOwnerTeam(eventCapturePoint);
        let prefix = "";

        if (GameConfig.gameConfig.stage == 0) {
            prefix = "flag_";
        }
        else if (GameConfig.gameConfig.stage == 2) {
            prefix = "finalflag_";
        }

        if (mod.Equals(owner, mod.GetTeam(1))) {
            mod.SetUIWidgetBgColor(mod.FindUIWidgetWithName(prefix + "bg1_" + id), UIconfig.uiConfig.friendlyBGColour);
            mod.SetUIWidgetBgColor(mod.FindUIWidgetWithName(prefix + "bg2_" + id), UIconfig.uiConfig.enemyBGColour);
            mod.SetUIWidgetBgColor(mod.FindUIWidgetWithName(prefix + "text1_" + id), UIconfig.uiConfig.friendlyColour);
            mod.SetUIWidgetBgColor(mod.FindUIWidgetWithName(prefix + "text2_" + id), UIconfig.uiConfig.enemyColour);
            mod.SetUITextColor(mod.FindUIWidgetWithName(prefix + "text1_" + id), UIconfig.uiConfig.friendlyColour);
            mod.SetUITextColor(mod.FindUIWidgetWithName(prefix + "text2_" + id), UIconfig.uiConfig.enemyColour);
        }
        else if (mod.Equals(owner, mod.GetTeam(2))) {
            mod.SetUIWidgetBgColor(mod.FindUIWidgetWithName(prefix + "bg1_" + id), UIconfig.uiConfig.enemyBGColour);
            mod.SetUIWidgetBgColor(mod.FindUIWidgetWithName(prefix + "bg2_" + id), UIconfig.uiConfig.friendlyBGColour);
            mod.SetUIWidgetBgColor(mod.FindUIWidgetWithName(prefix + "text1_" + id), UIconfig.uiConfig.enemyColour);
            mod.SetUIWidgetBgColor(mod.FindUIWidgetWithName(prefix + "text2_" + id), UIconfig.uiConfig.friendlyColour);
            mod.SetUITextColor(mod.FindUIWidgetWithName(prefix + "text1_" + id), UIconfig.uiConfig.enemyColour);
            mod.SetUITextColor(mod.FindUIWidgetWithName(prefix + "text2_" + id), UIconfig.uiConfig.friendlyColour);
        }
        else {
            mod.SetUIWidgetBgColor(mod.FindUIWidgetWithName(prefix + "bg1_" + id), mod.CreateVector(0, 0, 0));
            mod.SetUIWidgetBgColor(mod.FindUIWidgetWithName(prefix + "bg2_" + id), mod.CreateVector(0, 0, 0));
            mod.SetUIWidgetBgColor(mod.FindUIWidgetWithName(prefix + "text1_" + id), mod.CreateVector(1, 1, 1));
            mod.SetUIWidgetBgColor(mod.FindUIWidgetWithName(prefix + "text2_" + id), mod.CreateVector(1, 1, 1));
            mod.SetUITextColor(mod.FindUIWidgetWithName(prefix + "text1_" + id), mod.CreateVector(1, 1, 1));
            mod.SetUITextColor(mod.FindUIWidgetWithName(prefix + "text2_" + id), mod.CreateVector(1, 1, 1));
        }

    }

    public static capturePoint_UI_Alpha_Update(eventCapturePoint: mod.CapturePoint) {
        let id = mod.Subtract(mod.GetObjId(eventCapturePoint), GameConfig.gameConfig.flagStart);
        let alpha = 1
        let alpha2 = 0.8

        let prefix = "";

        if (GameConfig.gameConfig.stage == 0) {
            prefix = "flag_";
        }
        else if (GameConfig.gameConfig.stage == 2) {
            prefix = "finalflag_";
        }

        if (id > 20 || id < 0)
            return;

        if (mod.LessThan(mod.GetCaptureProgress(eventCapturePoint), 0.9) && mod.GreaterThan(mod.GetCaptureProgress(eventCapturePoint), 0.1)) {
            alpha = UIconfig.uiConfig.uiAlpha
            if (alpha < 0.8) {
                alpha2 = alpha
            }
        }

        mod.SetUIWidgetBgAlpha(mod.FindUIWidgetWithName(prefix + "bg1_" + id), alpha2);
        mod.SetUIWidgetBgAlpha(mod.FindUIWidgetWithName(prefix + "bg2_" + id), alpha2);
        mod.SetUIWidgetBgAlpha(mod.FindUIWidgetWithName(prefix + "text1_" + id), alpha);
        mod.SetUIWidgetBgAlpha(mod.FindUIWidgetWithName(prefix + "text2_" + id), alpha);
        mod.SetUITextAlpha(mod.FindUIWidgetWithName(prefix + "text1_" + id), alpha);
        mod.SetUITextAlpha(mod.FindUIWidgetWithName(prefix + "text2_" + id), alpha);
    }

    //-------------------------------------------------------------------------
    //Regroup UI
    //-------------------------------------------------------------------------

    public static regroup_UI_Setup() {
        mod.AddUIContainer("regroup_container", mod.CreateVector(0, 55, 0), mod.CreateVector(250, 70, 0), mod.UIAnchor.TopCenter, mod.FindUIWidgetWithName("MainUI"), false, 0, mod.CreateVector(0.5, 0.5, 0.5), 0.5, mod.UIBgFill.None, mod.UIDepth.AboveGameUI);
        UIconfig.uiConfig.regroupUI = mod.FindUIWidgetWithName("regroup_container");
        mod.AddUIContainer("bonustime_background1", mod.CreateVector(0, 0, 0), mod.CreateVector(180, 40, 0), mod.UIAnchor.TopCenter, UIconfig.uiConfig.regroupUI, true, 0, UIconfig.uiConfig.friendlyBGColour, 0.9, mod.UIBgFill.Blur, mod.GetTeam(1));
        mod.AddUIContainer("bonustime_background2", mod.CreateVector(0, 0, 0), mod.CreateVector(180, 40, 0), mod.UIAnchor.TopCenter, UIconfig.uiConfig.regroupUI, true, 0, UIconfig.uiConfig.enemyBGColour, 0.9, mod.UIBgFill.Blur, mod.GetTeam(2));
        mod.AddUIContainer("bonustime_bar1", mod.CreateVector(0, 0, 0), mod.CreateVector(180, 40, 0), mod.UIAnchor.TopCenter, UIconfig.uiConfig.regroupUI, true, 0, UIconfig.uiConfig.friendlyColour, 1, mod.UIBgFill.Solid, mod.GetTeam(1));
        mod.AddUIContainer("bonustime_bar2", mod.CreateVector(0, 0, 0), mod.CreateVector(180, 40, 0), mod.UIAnchor.TopCenter, UIconfig.uiConfig.regroupUI, true, 0, UIconfig.uiConfig.enemyColour, 1, mod.UIBgFill.Solid, mod.GetTeam(2));
        mod.AddUIText("bonustime_regroup_Text", mod.CreateVector(0, 0, 0), mod.CreateVector(180, 40, 0), mod.UIAnchor.TopCenter, UIconfig.uiConfig.regroupUI, true, 0, UIconfig.uiConfig.friendlyColour, 1, mod.UIBgFill.None, mod.Message(mod.stringkeys.supremacy.regroup.bonustime, 0, 0, 0), 36, UIconfig.uiConfig.whiteColour, 1, mod.UIAnchor.Center);
        mod.AddUIText("regoup_message1", mod.CreateVector(0, 0, 0), mod.CreateVector(180, 30, 0), mod.UIAnchor.BottomCenter, UIconfig.uiConfig.regroupUI, true, 0, mod.CreateVector(1, 1, 1), 1, mod.UIBgFill.None, mod.Message(mod.stringkeys.supremacy.regroup.attackerMessage), 18, UIconfig.uiConfig.whiteColour, 1, mod.UIAnchor.Center, mod.GetTeam(1));
        mod.AddUIText("regoup_message2", mod.CreateVector(0, 0, 0), mod.CreateVector(180, 30, 0), mod.UIAnchor.BottomCenter, UIconfig.uiConfig.regroupUI, true, 0, mod.CreateVector(1, 1, 1), 1, mod.UIBgFill.None, mod.Message(mod.stringkeys.supremacy.regroup.defenderMessage), 18, UIconfig.uiConfig.whiteColour, 1, mod.UIAnchor.Center, mod.GetTeam(2));
    }

    public static regroup_UI_Text_Update() {
        let totalSeconds = GameConfig.gameConfig.bonusTime;
        let seconds = totalSeconds % 10;
        let tenseconds = Math.floor((totalSeconds % 60) / 10);
        let minutes = Math.floor(totalSeconds / 60);
        mod.SetUITextLabel(mod.FindUIWidgetWithName("bonustime_regroup_Text"), mod.Message(mod.stringkeys.supremacy.regroup.bonustime, minutes, tenseconds, seconds));
    }

    public static regroup_UI_Progress_Update() {
        let progressSize = GameConfig.gameConfig.extractionRemainingTime / GameConfig.gameConfig.extractionTime * 180;
        let position = -90 + (progressSize / 2);
        mod.SetUIWidgetSize(mod.FindUIWidgetWithName("bonustime_bar1"), mod.CreateVector(progressSize, 40, 0));
        mod.SetUIWidgetPosition(mod.FindUIWidgetWithName("bonustime_bar1"), mod.CreateVector(position, 0, 0));
        mod.SetUIWidgetSize(mod.FindUIWidgetWithName("bonustime_bar2"), mod.CreateVector(progressSize, 40, 0));
        mod.SetUIWidgetPosition(mod.FindUIWidgetWithName("bonustime_bar2"), mod.CreateVector(position, 0, 0));

    }

    public static regroup_UI_Change(enable: boolean) {
        mod.SetUIWidgetVisible(mod.FindUIWidgetWithName("regroup_container"), enable);
    }

    public static regroup_UI_Team_Update() {
        if (mod.Equals(GameConfig.gameConfig.attacker, mod.GetTeam(1))) {
            mod.SetUIWidgetBgColor(mod.FindUIWidgetWithName("bonustime_background1"), UIconfig.uiConfig.friendlyBGColour);
            mod.SetUIWidgetBgColor(mod.FindUIWidgetWithName("bonustime_background2"), UIconfig.uiConfig.enemyBGColour);
            mod.SetUIWidgetBgColor(mod.FindUIWidgetWithName("bonustime_bar1"), UIconfig.uiConfig.friendlyColour);
            mod.SetUIWidgetBgColor(mod.FindUIWidgetWithName("bonustime_bar2"), UIconfig.uiConfig.enemyColour);
            mod.SetUITextLabel(mod.FindUIWidgetWithName("regoup_message1"), mod.Message(mod.stringkeys.supremacy.regroup.attackerextract));
            mod.SetUITextLabel(mod.FindUIWidgetWithName("regoup_message2"), mod.Message(mod.stringkeys.supremacy.regroup.defenderextract));
        } else {
            mod.SetUIWidgetBgColor(mod.FindUIWidgetWithName("bonustime_background1"), UIconfig.uiConfig.enemyBGColour);
            mod.SetUIWidgetBgColor(mod.FindUIWidgetWithName("bonustime_background2"), UIconfig.uiConfig.friendlyBGColour);
            mod.SetUIWidgetBgColor(mod.FindUIWidgetWithName("bonustime_bar1"), UIconfig.uiConfig.enemyColour);
            mod.SetUIWidgetBgColor(mod.FindUIWidgetWithName("bonustime_bar2"), UIconfig.uiConfig.friendlyColour);
            mod.SetUITextLabel(mod.FindUIWidgetWithName("regoup_message1"), mod.Message(mod.stringkeys.supremacy.regroup.defenderextract));
            mod.SetUITextLabel(mod.FindUIWidgetWithName("regoup_message2"), mod.Message(mod.stringkeys.supremacy.regroup.attackerextract));
        }
    }

    //-------------------------------------------------------------------------
    //Final Assault UI
    //-------------------------------------------------------------------------

    public static finalAssault_UI_Setup() {
        mod.AddUIContainer("finalAssault_container", mod.CreateVector(0, 55, 0), mod.CreateVector(250, 70, 0), mod.UIAnchor.TopCenter, mod.FindUIWidgetWithName("MainUI"), false, 0, mod.CreateVector(0.5, 0.5, 0.5), 0.5, mod.UIBgFill.None, mod.UIDepth.AboveGameUI);
        UIconfig.uiConfig.finalAssaultUI = mod.FindUIWidgetWithName("finalAssault_container");
        mod.AddUIText("timer_text1", mod.CreateVector(0, 0, 0), mod.CreateVector(180, 40, 0), mod.UIAnchor.TopCenter, UIconfig.uiConfig.finalAssaultUI, true, 0, UIconfig.uiConfig.friendlyColour, 1, mod.UIBgFill.Solid, mod.Message(mod.stringkeys.supremacy.regroup.bonustime, 0, 0, 0), 36, UIconfig.uiConfig.whiteColour, 1, mod.UIAnchor.Center, mod.GetTeam(1));
        mod.AddUIText("timer_text2", mod.CreateVector(0, 0, 0), mod.CreateVector(180, 40, 0), mod.UIAnchor.TopCenter, UIconfig.uiConfig.finalAssaultUI, true, 0, UIconfig.uiConfig.enemyColour, 1, mod.UIBgFill.Solid, mod.Message(mod.stringkeys.supremacy.regroup.bonustime, 0, 0, 0), 36, UIconfig.uiConfig.whiteColour, 1, mod.UIAnchor.Center, mod.GetTeam(2));
        mod.AddUIText("finalAssault_message1", mod.CreateVector(0, 0, 0), mod.CreateVector(250, 30, 0), mod.UIAnchor.BottomCenter, UIconfig.uiConfig.finalAssaultUI, true, 0, mod.CreateVector(1, 1, 1), 1, mod.UIBgFill.None, mod.Message(mod.stringkeys.supremacy.finalassault.attackerMessage), 18, UIconfig.uiConfig.whiteColour, 1, mod.UIAnchor.Center, mod.GetTeam(1));
        mod.AddUIText("finalAssault_message2", mod.CreateVector(0, 0, 0), mod.CreateVector(250, 30, 0), mod.UIAnchor.BottomCenter, UIconfig.uiConfig.finalAssaultUI, true, 0, mod.CreateVector(1, 1, 1), 1, mod.UIBgFill.None, mod.Message(mod.stringkeys.supremacy.finalassault.attackerMessage), 18, UIconfig.uiConfig.whiteColour, 1, mod.UIAnchor.Center, mod.GetTeam(2));
    }

    public static finalAssault_UI_Update() {
        let totalSeconds = GameConfig.gameConfig.remainingTime;
        let seconds = totalSeconds % 10;
        let tenseconds = Math.floor((totalSeconds % 60) / 10);
        let minutes = Math.floor(totalSeconds / 60);
        mod.SetUITextLabel(mod.FindUIWidgetWithName("timer_text1"), mod.Message(mod.stringkeys.supremacy.regroup.bonustime, minutes, tenseconds, seconds));
        mod.SetUITextLabel(mod.FindUIWidgetWithName("timer_text2"), mod.Message(mod.stringkeys.supremacy.regroup.bonustime, minutes, tenseconds, seconds));
    }

    public static finalAssault_UI_Team_Update() {
        if (mod.Equals(GameConfig.gameConfig.attacker, mod.GetTeam(1))) {
            mod.SetUIWidgetBgColor(mod.FindUIWidgetWithName("timer_text1"), UIconfig.uiConfig.enemyColour);
            mod.SetUIWidgetBgColor(mod.FindUIWidgetWithName("timer_text2"), UIconfig.uiConfig.friendlyColour);
            mod.SetUITextLabel(mod.FindUIWidgetWithName("finalAssault_message1"), mod.Message(mod.stringkeys.supremacy.finalassault.attacker));
            mod.SetUITextLabel(mod.FindUIWidgetWithName("finalAssault_message2"), mod.Message(mod.stringkeys.supremacy.finalassault.defender));
        } else {
            mod.SetUIWidgetBgColor(mod.FindUIWidgetWithName("timer_text1"), UIconfig.uiConfig.friendlyColour);
            mod.SetUIWidgetBgColor(mod.FindUIWidgetWithName("timer_text2"), UIconfig.uiConfig.enemyColour);
            mod.SetUITextLabel(mod.FindUIWidgetWithName("finalAssault_message1"), mod.Message(mod.stringkeys.supremacy.finalassault.defender));
            mod.SetUITextLabel(mod.FindUIWidgetWithName("finalAssault_message2"), mod.Message(mod.stringkeys.supremacy.finalassault.attacker));
        }
    }

    public static finalAssault_UI_Change(enable: boolean) {
        mod.SetUIWidgetVisible(mod.FindUIWidgetWithName("finalAssault_container"), enable);
    }
}