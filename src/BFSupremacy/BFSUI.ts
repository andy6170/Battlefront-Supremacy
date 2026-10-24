import { GameConfig } from "./BFSVariables.ts";
import { TeamVariables, PlayerVariables, UIconfig, MCOMVariables, ObjectiveVariables } from "./BFSVariables.ts";
import { BFSAudio } from "./MFSAudio.ts";

//Top UI position
let timerheight = 0;
let conquestheight = 0;   //Old =  75      New = 0



export class BFSupremacyUI {
    private static flashId = 0;
    private static cq = new Map<string, mod.UIWidget>();
    private static fa = new Map<string, mod.UIWidget>();
    public static UI_Setup() {
        mod.AddUIContainer("MainUI", mod.CreateVector(0, -35, 0), mod.CreateVector(10000, 10000, 0), mod.UIAnchor.TopCenter);
        mod.SetUIWidgetBgFill(mod.FindUIWidgetWithName("MainUI"), mod.UIBgFill.None);
        mod.SetUIWidgetDepth(mod.FindUIWidgetWithName("MainUI"), mod.UIDepth.AboveGameUI);
        mod.AddUIContainer("MainUICenter", mod.CreateVector(0, 0, 0), mod.CreateVector(10000, 10000, 0), mod.UIAnchor.Center);
        mod.SetUIWidgetBgFill(mod.FindUIWidgetWithName("MainUICenter"), mod.UIBgFill.None);
        mod.SetUIWidgetDepth(mod.FindUIWidgetWithName("MainUICenter"), mod.UIDepth.AboveGameUI);
        mod.AddUIContainer("MainAnimationUI", mod.CreateVector(0, 0, 0), mod.CreateVector(10000, 10000, 0), mod.UIAnchor.TopCenter);
        mod.SetUIWidgetBgFill(mod.FindUIWidgetWithName("MainAnimationUI"), mod.UIBgFill.None);
        mod.SetUIWidgetDepth(mod.FindUIWidgetWithName("MainAnimationUI"), mod.UIDepth.AboveGameUI);
        BFSupremacyUI.conquest_UI_Setup();
        BFSupremacyUI.regroup_UI_Setup();
        BFSupremacyUI.finalAssault_UI_Setup();
        BFSupremacyUI.changingSector_UI_Setup();
        mod.AddUIText("credits", mod.CreateVector(10, 2, 0), mod.CreateVector(300, 30, 0), mod.UIAnchor.BottomLeft, mod.GetUIRoot(), true, 0, mod.CreateVector(0, 0, 0), 0.8, mod.UIBgFill.None, mod.Message(mod.stringkeys.credits), 14, UIconfig.uiConfig.whiteColour, 0.6, mod.UIAnchor.Center, mod.UIDepth.AboveGameUI);
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
            BFSupremacyUI.regroup_UIMessage_Enable(false);
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

        const c = BFSupremacyUI.cq;
        c.set("LeftProgress1_Conquest", mod.FindUIWidgetWithName("LeftProgress1_Conquest"));
        c.set("LeftProgress2_Conquest", mod.FindUIWidgetWithName("LeftProgress2_Conquest"));
        c.set("RightProgress1_Conquest", mod.FindUIWidgetWithName("RightProgress1_Conquest"));
        c.set("RightProgress2_Conquest", mod.FindUIWidgetWithName("RightProgress2_Conquest"));
        c.set("LeftText1_Conquest", mod.FindUIWidgetWithName("LeftText1_Conquest"));
        c.set("LeftText2_Conquest", mod.FindUIWidgetWithName("LeftText2_Conquest"));
        c.set("RightText1_Conquest", mod.FindUIWidgetWithName("RightText1_Conquest"));
        c.set("RightText2_Conquest", mod.FindUIWidgetWithName("RightText2_Conquest"));
        c.set("LeftProgress1_Underline_Conquest", mod.FindUIWidgetWithName("LeftProgress1_Underline_Conquest"));
        c.set("LeftProgress2_Underline_Conquest", mod.FindUIWidgetWithName("LeftProgress2_Underline_Conquest"));
        c.set("RightProgress1_Underline_Conquest", mod.FindUIWidgetWithName("RightProgress1_Underline_Conquest"));
        c.set("RightProgress2_Underline_Conquest", mod.FindUIWidgetWithName("RightProgress2_Underline_Conquest"));
        c.set("conquest_container", UIconfig.uiConfig.conquestUI);
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
        const w = BFSupremacyUI.cq;

        mod.SetUIWidgetSize(w.get("LeftProgress1_Conquest")!, team1Progress);
        mod.SetUIWidgetSize(w.get("LeftProgress2_Conquest")!, team2Progress);
        mod.SetUIWidgetSize(w.get("RightProgress1_Conquest")!, team2Progress);
        mod.SetUIWidgetSize(w.get("RightProgress2_Conquest")!, team1Progress);
        mod.SetUITextLabel(w.get("LeftText1_Conquest")!, mod.Message(mod.stringkeys.supremacy.conquest.percentage, team1score));
        mod.SetUITextLabel(w.get("LeftText2_Conquest")!, mod.Message(mod.stringkeys.supremacy.conquest.percentage, team2score));
        mod.SetUITextLabel(w.get("RightText1_Conquest")!, mod.Message(mod.stringkeys.supremacy.conquest.percentage, team2score));
        mod.SetUITextLabel(w.get("RightText2_Conquest")!, mod.Message(mod.stringkeys.supremacy.conquest.percentage, team1score));
    }

    public static conquest_UI_Change(enable: boolean) {
        const w = BFSupremacyUI.cq;
        mod.SetUIWidgetVisible(w.get("conquest_container")!, enable);
    }

    public static conquest_UI_Flash() {
        let alpha = UIconfig.uiConfig.uiAlpha
        const w = BFSupremacyUI.cq;

        if (UIconfig.uiConfig.ProgressFlashT1) {
            mod.SetUIWidgetBgAlpha(w.get("LeftProgress1_Conquest")!, alpha);
            mod.SetUIWidgetBgAlpha(w.get("RightProgress2_Conquest")!, alpha);
            mod.SetUIWidgetBgAlpha(w.get("LeftProgress1_Underline_Conquest")!, alpha);
            mod.SetUIWidgetBgAlpha(w.get("RightProgress2_Underline_Conquest")!, alpha);
            mod.SetUIWidgetBgAlpha(w.get("LeftProgress2_Conquest")!, 1);
            mod.SetUIWidgetBgAlpha(w.get("RightProgress1_Conquest")!, 1);
            mod.SetUIWidgetBgAlpha(w.get("LeftProgress2_Underline_Conquest")!, 1);
            mod.SetUIWidgetBgAlpha(w.get("RightProgress1_Underline_Conquest")!, 1);
        }
        if (UIconfig.uiConfig.ProgressFlashT2) {
            mod.SetUIWidgetBgAlpha(w.get("LeftProgress2_Conquest")!, alpha);
            mod.SetUIWidgetBgAlpha(w.get("RightProgress1_Conquest")!, alpha);
            mod.SetUIWidgetBgAlpha(w.get("LeftProgress2_Underline_Conquest")!, alpha);
            mod.SetUIWidgetBgAlpha(w.get("RightProgress1_Underline_Conquest")!, alpha);
            mod.SetUIWidgetBgAlpha(w.get("LeftProgress1_Conquest")!, 1);
            mod.SetUIWidgetBgAlpha(w.get("RightProgress2_Conquest")!, 1);
            mod.SetUIWidgetBgAlpha(w.get("LeftProgress1_Underline_Conquest")!, 1);
            mod.SetUIWidgetBgAlpha(w.get("RightProgress2_Underline_Conquest")!, 1);
        }
    }

    public static async conquest_End_UI() {
        let t1score = TeamVariables.getTeamData(1).score;
        let t2score = TeamVariables.getTeamData(2).score;
        let t1message = mod.Message(mod.stringkeys.blank);
        let t2message = mod.Message(mod.stringkeys.blank);

        if (GameConfig.gameConfig.stage == 1) {
            t1message = mod.Message(mod.stringkeys.supremacy.regroup.secured)
            t2message = mod.Message(mod.stringkeys.supremacy.regroup.lost)
        }
        else if (GameConfig.gameConfig.stage == 2) {
            t1message = mod.Message(mod.stringkeys.supremacy.finalassault.secured)
            t2message = mod.Message(mod.stringkeys.supremacy.finalassault.lost)
        }

        if (TeamVariables.getTeamData(GameConfig.gameConfig.attacker).attempts < 3) {
            BFSAudio.conquestCompleteVO();
        } else {
            BFSAudio.lastAttemptVO();
        }

        await BFSupremacyUI.notificationAnimation(t1message, t2message);
    }

    public static async MCOMNotification(): Promise<void> {
        let t1message = mod.Message(mod.stringkeys.supremacy.finalassault.attackMCOM);
        let t2message = mod.Message(mod.stringkeys.supremacy.finalassault.defendMCOM);
        await BFSupremacyUI.notificationAnimation(t1message, t2message);
    }

    public static async extractNotification(): Promise<void> {
        let t1message = mod.Message(mod.stringkeys.supremacy.regroup.extractAttacker)
        let t2message = mod.Message(mod.stringkeys.supremacy.regroup.extractDefender);
        await BFSupremacyUI.notificationAnimation(t1message, t2message);
    }

    public static async notificationAnimation(message1: mod.Message, message2: mod.Message) {
        let width = 380
        let height = 50
        let font = 42
        let animationTime = 15
        let animationWidth = width / animationTime

        mod.AddUIContainer("notification_container", mod.CreateVector(0, 300, 0), mod.CreateVector(width, height, 0), mod.UIAnchor.TopCenter, mod.FindUIWidgetWithName("MainUI"), true, 0, mod.CreateVector(0.5, 0.5, 0.5), 1, mod.UIBgFill.None, mod.UIDepth.AboveGameUI);
        let container = mod.FindUIWidgetWithName("notification_container");

        let t1score = TeamVariables.getTeamData(1).score;
        let t2score = TeamVariables.getTeamData(2).score;
        let t1colour = UIconfig.uiConfig.friendlyColour
        let t2colour = UIconfig.uiConfig.enemyColour
        let t1message = message1
        let t2message = message2

        if (t1score < t2score) {
            t1message = message2;
            t2message = message1;
            t1colour = UIconfig.uiConfig.enemyColour
            t2colour = UIconfig.uiConfig.friendlyColour
        }

        BFSAudio.playConquestEnd();

        mod.AddUIText("notification_t1", mod.CreateVector(0, 0, 0), mod.CreateVector(width, height, 0), mod.UIAnchor.Center, container, true, 0, UIconfig.uiConfig.whiteColour, 1, mod.UIBgFill.Blur, mod.Message(mod.stringkeys.blank), font, t1colour, 1, mod.UIAnchor.Center, mod.GetTeam(1));
        mod.AddUIText("notification_t2", mod.CreateVector(0, 0, 0), mod.CreateVector(width, height, 0), mod.UIAnchor.Center, container, true, 0, UIconfig.uiConfig.whiteColour, 1, mod.UIBgFill.Blur, mod.Message(mod.stringkeys.blank), font, t2colour, 1, mod.UIAnchor.Center, mod.GetTeam(2));
        mod.AddUIContainer("notification_top_bar1", mod.CreateVector(0, 0, 0), mod.CreateVector(width, 3, 0), mod.UIAnchor.TopCenter, container, true, 0, t1colour, 1, mod.UIBgFill.Solid, mod.GetTeam(1));
        mod.AddUIContainer("notification_top_bar2", mod.CreateVector(0, 0, 0), mod.CreateVector(width, 3, 0), mod.UIAnchor.TopCenter, container, true, 0, t2colour, 1, mod.UIBgFill.Solid, mod.GetTeam(2));
        mod.AddUIContainer("notification_bottom_bar1", mod.CreateVector(0, 0, 0), mod.CreateVector(width, 3, 0), mod.UIAnchor.BottomCenter, container, true, 0, t1colour, 1, mod.UIBgFill.Solid, mod.GetTeam(1));
        mod.AddUIContainer("notification_bottom_bar2", mod.CreateVector(0, 0, 0), mod.CreateVector(width, 3, 0), mod.UIAnchor.BottomCenter, container, true, 0, t2colour, 1, mod.UIBgFill.Solid, mod.GetTeam(2));

        // Cache widget references once — avoids global string-search inside every animation tick
        const notif_t1 = mod.FindUIWidgetWithName("notification_t1")!;
        const notif_t2 = mod.FindUIWidgetWithName("notification_t2")!;
        const notif_topBar1 = mod.FindUIWidgetWithName("notification_top_bar1")!;
        const notif_topBar2 = mod.FindUIWidgetWithName("notification_top_bar2")!;
        const notif_botBar1 = mod.FindUIWidgetWithName("notification_bottom_bar1")!;
        const notif_botBar2 = mod.FindUIWidgetWithName("notification_bottom_bar2")!;


        for (let i = 1; i < animationTime; i++) {
            mod.SetUIWidgetSize(notif_t1, mod.CreateVector(i * animationWidth, height, 0));
            mod.SetUIWidgetSize(notif_t2, mod.CreateVector(i * animationWidth, height, 0));
            mod.SetUIWidgetSize(notif_topBar1, mod.CreateVector(i * animationWidth, 2, 0));
            mod.SetUIWidgetSize(notif_topBar2, mod.CreateVector(i * animationWidth, 2, 0));
            mod.SetUIWidgetSize(notif_botBar1, mod.CreateVector(i * animationWidth, 2, 0));
            mod.SetUIWidgetSize(notif_botBar2, mod.CreateVector(i * animationWidth, 2, 0));
            await mod.Wait(0.033);
        }

        mod.SetUIWidgetSize(notif_t1, mod.CreateVector(width, height, 0));
        mod.SetUIWidgetSize(notif_t2, mod.CreateVector(width, height, 0));
        mod.SetUIWidgetSize(notif_topBar1, mod.CreateVector(width, 2, 0));
        mod.SetUIWidgetSize(notif_topBar2, mod.CreateVector(width, 2, 0));
        mod.SetUIWidgetSize(notif_botBar1, mod.CreateVector(width, 2, 0));
        mod.SetUIWidgetSize(notif_botBar2, mod.CreateVector(width, 2, 0));

        await mod.Wait(0.1);


        mod.AddUIContainer("notification_flash", mod.CreateVector(0, 0, 0), mod.CreateVector(width, height, 0), mod.UIAnchor.Center, container, true, 0, mod.CreateVector(1, 1, 1), 0.1, mod.UIBgFill.Solid, mod.UIDepth.AboveGameUI);
        let flash = mod.FindUIWidgetWithName("notification_flash");
        for (let i = 1; i < 10; i++) {
            mod.SetUIWidgetBgAlpha(flash, 0.1 * i);
            await mod.Wait(0.033);
        }

        mod.SetUITextLabel(notif_t1, t1message);
        mod.SetUITextLabel(notif_t2, t2message);

        for (let i = 9; i > 0; i--) {
            mod.SetUIWidgetBgAlpha(flash, 0.1 * i);
            await mod.Wait(0.033);
        }

        mod.DeleteUIWidget(flash);

        await mod.Wait(3);

        BFSAudio.playConquestEnd2();


        mod.SetUITextLabel(notif_t1, mod.Message(mod.stringkeys.blank));
        mod.SetUITextLabel(notif_t2, mod.Message(mod.stringkeys.blank));

        for (let i = animationTime; i > 1; i--) {
            mod.SetUIWidgetSize(notif_t1, mod.CreateVector(i * animationWidth, height, 0));
            mod.SetUIWidgetSize(notif_t2, mod.CreateVector(i * animationWidth, height, 0));
            mod.SetUIWidgetSize(notif_topBar1, mod.CreateVector(i * animationWidth, 2, 0));
            mod.SetUIWidgetSize(notif_topBar2, mod.CreateVector(i * animationWidth, 2, 0));
            mod.SetUIWidgetSize(notif_botBar1, mod.CreateVector(i * animationWidth, 2, 0));
            mod.SetUIWidgetSize(notif_botBar2, mod.CreateVector(i * animationWidth, 2, 0));
            await mod.Wait(0.033);
        }

        mod.SetUIWidgetSize(notif_t1, mod.CreateVector(animationWidth, height, 0));
        mod.SetUIWidgetSize(notif_t2, mod.CreateVector(animationWidth, height, 0));
        mod.SetUIWidgetSize(notif_topBar1, mod.CreateVector(animationWidth, 2, 0));
        mod.SetUIWidgetSize(notif_topBar2, mod.CreateVector(animationWidth, 2, 0));
        mod.SetUIWidgetSize(notif_botBar1, mod.CreateVector(animationWidth, 2, 0));
        mod.SetUIWidgetSize(notif_botBar2, mod.CreateVector(animationWidth, 2, 0));

        await mod.Wait(0.033);

        mod.DeleteUIWidget(container);
    }


    //-------------------------------------------------------------------------
    //Objective UI
    //-------------------------------------------------------------------------

    public static ObjectiveUI_Enable(enable: boolean) {
        mod.SetAllObjectivesUIEnabled(enable);
    }

    //-------------------------------------------------------------------------
    //Regroup UI
    //-------------------------------------------------------------------------

    public static regroup_UI_Setup() {
        //Old height mod.CreateVector(0, 55, 0)
        mod.AddUIContainer("regroup_container", mod.CreateVector(0, 40, 0), mod.CreateVector(250, 70, 0), mod.UIAnchor.TopCenter, mod.FindUIWidgetWithName("MainUI"), false, 0, mod.CreateVector(0.5, 0.5, 0.5), 0.5, mod.UIBgFill.None, mod.UIDepth.AboveGameUI);
        UIconfig.uiConfig.regroupUI = mod.FindUIWidgetWithName("regroup_container");
        mod.AddUIContainer("bonustime_background1", mod.CreateVector(0, 0, 0), mod.CreateVector(180, 40, 0), mod.UIAnchor.TopCenter, UIconfig.uiConfig.regroupUI, true, 0, UIconfig.uiConfig.friendlyBGColour, 0.9, mod.UIBgFill.Blur, mod.GetTeam(1));
        mod.AddUIContainer("bonustime_background2", mod.CreateVector(0, 0, 0), mod.CreateVector(180, 40, 0), mod.UIAnchor.TopCenter, UIconfig.uiConfig.regroupUI, true, 0, UIconfig.uiConfig.enemyBGColour, 0.9, mod.UIBgFill.Blur, mod.GetTeam(2));
        mod.AddUIContainer("bonustime_bar1", mod.CreateVector(0, 0, 0), mod.CreateVector(180, 40, 0), mod.UIAnchor.TopCenter, UIconfig.uiConfig.regroupUI, true, 0, UIconfig.uiConfig.friendlyColour, 1, mod.UIBgFill.Solid, mod.GetTeam(1));
        mod.AddUIContainer("bonustime_bar2", mod.CreateVector(0, 0, 0), mod.CreateVector(180, 40, 0), mod.UIAnchor.TopCenter, UIconfig.uiConfig.regroupUI, true, 0, UIconfig.uiConfig.enemyColour, 1, mod.UIBgFill.Solid, mod.GetTeam(2));
        mod.AddUIText("bonustime_regroup_Text", mod.CreateVector(0, 0, 0), mod.CreateVector(180, 40, 0), mod.UIAnchor.TopCenter, UIconfig.uiConfig.regroupUI, true, 0, UIconfig.uiConfig.friendlyColour, 1, mod.UIBgFill.None, mod.Message(mod.stringkeys.supremacy.regroup.bonustime, 0, 0, 0), 36, UIconfig.uiConfig.whiteColour, 1, mod.UIAnchor.Center);
        mod.AddUIText("regoup_message1", mod.CreateVector(0, 0, 0), mod.CreateVector(300, 30, 0), mod.UIAnchor.BottomCenter, UIconfig.uiConfig.regroupUI, false, 0, mod.CreateVector(1, 1, 1), 1, mod.UIBgFill.None, mod.Message(mod.stringkeys.supremacy.regroup.attackerMessage), 18, UIconfig.uiConfig.whiteColour, 1, mod.UIAnchor.Center, mod.GetTeam(1));
        mod.AddUIText("regoup_message2", mod.CreateVector(0, 0, 0), mod.CreateVector(300, 30, 0), mod.UIAnchor.BottomCenter, UIconfig.uiConfig.regroupUI, false, 0, mod.CreateVector(1, 1, 1), 1, mod.UIBgFill.None, mod.Message(mod.stringkeys.supremacy.regroup.defenderMessage), 18, UIconfig.uiConfig.whiteColour, 1, mod.UIAnchor.Center, mod.GetTeam(2));
        mod.AddUIText("regoup_landing_message", mod.CreateVector(0, 0, 0), mod.CreateVector(300, 30, 0), mod.UIAnchor.BottomCenter, UIconfig.uiConfig.regroupUI, true, 0, mod.CreateVector(1, 1, 1), 1, mod.UIBgFill.None, mod.Message(mod.stringkeys.supremacy.regroup.landing), 18, UIconfig.uiConfig.whiteColour, 1, mod.UIAnchor.Center);
    }

    public static regroup_UI_Text_Update() {
        let totalSeconds = GameConfig.gameConfig.bonusTime;
        let seconds = totalSeconds % 10;
        let tenseconds = Math.floor((totalSeconds % 60) / 10);
        let minutes = Math.floor(totalSeconds / 60);
        mod.SetUITextLabel(mod.FindUIWidgetWithName("bonustime_regroup_Text"), mod.Message(mod.stringkeys.supremacy.regroup.bonustime, minutes, tenseconds, seconds));
    }

    public static async regroup_UI_Text_Flash() {
        this.flashId++;
        const currentId = this.flashId;
        const textWidget = mod.FindUIWidgetWithName("bonustime_regroup_Text");
        const white = UIconfig.uiConfig.whiteColour;
        const black = mod.CreateVector(0, 0, 0);
        const steps = 10;
        const waitTime = 0.033;

        for (let i = 0; i < 2; i++) {
            // Fade to black
            for (let s = 1; s <= steps; s++) {
                if (this.flashId !== currentId) return;
                let t = s / steps;
                let color = mod.Add(white, mod.Multiply(mod.Subtract(black, white), t));
                mod.SetUITextColor(textWidget, color);
                await mod.Wait(waitTime);
            }
            // Fade to white
            for (let s = 1; s <= steps; s++) {
                if (this.flashId !== currentId) return;
                let t = s / steps;
                let color = mod.Add(black, mod.Multiply(mod.Subtract(white, black), t));
                mod.SetUITextColor(textWidget, color);
                await mod.Wait(waitTime);
            }
        }
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
            mod.SetUITextLabel(mod.FindUIWidgetWithName("regoup_message1"), mod.Message(mod.stringkeys.supremacy.regroup.attackerMessage));
            mod.SetUITextLabel(mod.FindUIWidgetWithName("regoup_message2"), mod.Message(mod.stringkeys.supremacy.regroup.defenderMessage));
        } else {
            mod.SetUIWidgetBgColor(mod.FindUIWidgetWithName("bonustime_background1"), UIconfig.uiConfig.enemyBGColour);
            mod.SetUIWidgetBgColor(mod.FindUIWidgetWithName("bonustime_background2"), UIconfig.uiConfig.friendlyBGColour);
            mod.SetUIWidgetBgColor(mod.FindUIWidgetWithName("bonustime_bar1"), UIconfig.uiConfig.enemyColour);
            mod.SetUIWidgetBgColor(mod.FindUIWidgetWithName("bonustime_bar2"), UIconfig.uiConfig.friendlyColour);
            mod.SetUITextLabel(mod.FindUIWidgetWithName("regoup_message1"), mod.Message(mod.stringkeys.supremacy.regroup.defenderMessage));
            mod.SetUITextLabel(mod.FindUIWidgetWithName("regoup_message2"), mod.Message(mod.stringkeys.supremacy.regroup.attackerMessage));
        }
    }

    public static regroup_UIMessage_Enable(enable: boolean) {
        mod.SetUIWidgetVisible(mod.FindUIWidgetWithName("regoup_message1"), enable);
        mod.SetUIWidgetVisible(mod.FindUIWidgetWithName("regoup_message2"), enable);
        mod.SetUIWidgetVisible(mod.FindUIWidgetWithName("regoup_landing_message"), !enable)
    }

    //-------------------------------------------------------------------------
    //Final Assault UI
    //-------------------------------------------------------------------------

    //Old height mod.CreateVector(0, 55, 0)
    public static finalAssault_UI_Setup() {
        mod.AddUIContainer("finalAssault_container", mod.CreateVector(0, 40, 0), mod.CreateVector(250, 70, 0), mod.UIAnchor.TopCenter, mod.FindUIWidgetWithName("MainUI"), false, 0, mod.CreateVector(0.5, 0.5, 0.5), 0.5, mod.UIBgFill.None, mod.UIDepth.AboveGameUI);
        UIconfig.uiConfig.finalAssaultUI = mod.FindUIWidgetWithName("finalAssault_container");
        mod.AddUIText("timer_text1", mod.CreateVector(0, 0, 0), mod.CreateVector(180, 40, 0), mod.UIAnchor.TopCenter, UIconfig.uiConfig.finalAssaultUI, true, 0, UIconfig.uiConfig.friendlyColour, 1, mod.UIBgFill.Solid, mod.Message(mod.stringkeys.supremacy.regroup.bonustime, 0, 0, 0), 36, UIconfig.uiConfig.whiteColour, 1, mod.UIAnchor.Center, mod.GetTeam(1));
        mod.AddUIText("timer_text2", mod.CreateVector(0, 0, 0), mod.CreateVector(180, 40, 0), mod.UIAnchor.TopCenter, UIconfig.uiConfig.finalAssaultUI, true, 0, UIconfig.uiConfig.enemyColour, 1, mod.UIBgFill.Solid, mod.Message(mod.stringkeys.supremacy.regroup.bonustime, 0, 0, 0), 36, UIconfig.uiConfig.whiteColour, 1, mod.UIAnchor.Center, mod.GetTeam(2));
        mod.AddUIText("finalAssault_message1", mod.CreateVector(0, -45, 0), mod.CreateVector(250, 30, 0), mod.UIAnchor.BottomCenter, UIconfig.uiConfig.finalAssaultUI, true, 0, mod.CreateVector(1, 1, 1), 1, mod.UIBgFill.None, mod.Message(mod.stringkeys.supremacy.finalassault.attackerMessage1), 18, UIconfig.uiConfig.whiteColour, 1, mod.UIAnchor.Center, mod.GetTeam(1));
        mod.AddUIText("finalAssault_message2", mod.CreateVector(0, -45, 0), mod.CreateVector(250, 30, 0), mod.UIAnchor.BottomCenter, UIconfig.uiConfig.finalAssaultUI, true, 0, mod.CreateVector(1, 1, 1), 1, mod.UIBgFill.None, mod.Message(mod.stringkeys.supremacy.finalassault.attackerMessage1), 18, UIconfig.uiConfig.whiteColour, 1, mod.UIAnchor.Center, mod.GetTeam(2));

        const c = BFSupremacyUI.fa;
        c.set("timer_text1", mod.FindUIWidgetWithName("timer_text1"));
        c.set("timer_text2", mod.FindUIWidgetWithName("timer_text2"));
        c.set("finalAssault_message1", mod.FindUIWidgetWithName("finalAssault_message1"));
        c.set("finalAssault_message2", mod.FindUIWidgetWithName("finalAssault_message2"));
        c.set("finalAssault_container", UIconfig.uiConfig.finalAssaultUI);
    }

    public static finalAssault_UI_Update() {
        const w = BFSupremacyUI.fa;
        if (GameConfig.gameConfig.overtime > 0 && GameConfig.gameConfig.remainingTime == 0) {
            mod.SetUITextLabel(w.get("timer_text1")!, mod.Message(mod.stringkeys.supremacy.finalassault.overtime));
            mod.SetUITextLabel(w.get("timer_text2")!, mod.Message(mod.stringkeys.supremacy.finalassault.overtime));
            return;
        }
        let totalSeconds = GameConfig.gameConfig.remainingTime;
        let seconds = totalSeconds % 10;
        let tenseconds = Math.floor((totalSeconds % 60) / 10);
        let minutes = Math.floor(totalSeconds / 60);
        mod.SetUITextLabel(w.get("timer_text1")!, mod.Message(mod.stringkeys.supremacy.regroup.bonustime, minutes, tenseconds, seconds));
        mod.SetUITextLabel(w.get("timer_text2")!, mod.Message(mod.stringkeys.supremacy.regroup.bonustime, minutes, tenseconds, seconds));
    }

    public static finalAssault_UI_Team_Update() {
        const w = BFSupremacyUI.fa;
        const attacker = GameConfig.gameConfig.attacker;
        const attackerData = TeamVariables.getTeamData(attacker);
        let attackerMessage: string;
        let defenderMessage: string;

        if (attackerData.finalSectorBreached == 1) {
            attackerMessage = mod.stringkeys.supremacy.finalassault.attackerMessage1;
            defenderMessage = mod.stringkeys.supremacy.finalassault.defenderMessage1;
        } else {
            attackerMessage = mod.stringkeys.supremacy.finalassault.attackerMessage2;
            defenderMessage = mod.stringkeys.supremacy.finalassault.defenderMessage2;
        }

        if (mod.Equals(GameConfig.gameConfig.attacker, mod.GetTeam(1))) {
            mod.SetUIWidgetBgColor(w.get("timer_text1")!, UIconfig.uiConfig.enemyColour);
            mod.SetUIWidgetBgColor(w.get("timer_text2")!, UIconfig.uiConfig.friendlyColour);
            mod.SetUITextLabel(w.get("finalAssault_message1")!, mod.Message(attackerMessage));
            mod.SetUITextLabel(w.get("finalAssault_message2")!, mod.Message(defenderMessage));
        } else {
            mod.SetUIWidgetBgColor(w.get("timer_text1")!, UIconfig.uiConfig.friendlyColour);
            mod.SetUIWidgetBgColor(w.get("timer_text2")!, UIconfig.uiConfig.enemyColour);
            mod.SetUITextLabel(w.get("finalAssault_message1")!, mod.Message(defenderMessage));
            mod.SetUITextLabel(w.get("finalAssault_message2")!, mod.Message(attackerMessage));
        }
    }

    public static finalAssault_UI_message_Enable(enable: boolean) {
        const w = BFSupremacyUI.fa;
        mod.SetUIWidgetVisible(w.get("finalAssault_message1")!, enable);
        mod.SetUIWidgetVisible(w.get("finalAssault_message2")!, enable);
    }

    public static finalAssault_UI_Change(enable: boolean) {
        mod.SetUIWidgetVisible(BFSupremacyUI.fa.get("finalAssault_container")!, enable);
        this.finalAssault_UI_message_Enable(enable);
    }


    //-------------------------------------------------------------------------
    //Changing Sector UI
    //-------------------------------------------------------------------------
    public static changingSector_UI_Setup() {
        mod.AddUIContainer("changingSector_container", mod.CreateVector(0, 0, 0), mod.CreateVector(250, 70, 0), mod.UIAnchor.TopCenter, mod.FindUIWidgetWithName("MainUI"), false, 0, mod.CreateVector(0.5, 0.5, 0.5), 0.5, mod.UIBgFill.None, mod.UIDepth.AboveGameUI);
        UIconfig.uiConfig.changingSectorUI = mod.FindUIWidgetWithName("changingSector_container");
        mod.AddUIText("changingSector_header1", mod.CreateVector(0, 0, 0), mod.CreateVector(180, 40, 0), mod.UIAnchor.TopCenter, UIconfig.uiConfig.changingSectorUI, true, 0, UIconfig.uiConfig.friendlyColour, 1, mod.UIBgFill.Solid, mod.Message(mod.stringkeys.supremacy.regroup.name), 36, UIconfig.uiConfig.whiteColour, 1, mod.UIAnchor.Center, mod.GetTeam(1));
        mod.AddUIText("changingSector_header2", mod.CreateVector(0, 0, 0), mod.CreateVector(180, 40, 0), mod.UIAnchor.TopCenter, UIconfig.uiConfig.changingSectorUI, true, 0, UIconfig.uiConfig.enemyColour, 1, mod.UIBgFill.Solid, mod.Message(mod.stringkeys.supremacy.regroup.name), 36, UIconfig.uiConfig.whiteColour, 1, mod.UIAnchor.Center, mod.GetTeam(2));
        mod.AddUIText("changingSector_counter1", mod.CreateVector(0, 0, 0), mod.CreateVector(250, 30, 0), mod.UIAnchor.BottomCenter, UIconfig.uiConfig.changingSectorUI, true, 0, mod.CreateVector(1, 1, 1), 1, mod.UIBgFill.None, mod.Message(mod.stringkeys.supremacy.finalassault.attackerMessage), 18, UIconfig.uiConfig.whiteColour, 1, mod.UIAnchor.Center, mod.GetTeam(1));
        mod.AddUIText("changingSector_counter2", mod.CreateVector(0, 0, 0), mod.CreateVector(250, 30, 0), mod.UIAnchor.BottomCenter, UIconfig.uiConfig.changingSectorUI, true, 0, mod.CreateVector(1, 1, 1), 1, mod.UIBgFill.None, mod.Message(mod.stringkeys.supremacy.finalassault.attackerMessage), 18, UIconfig.uiConfig.whiteColour, 1, mod.UIAnchor.Center, mod.GetTeam(2));
    }

    public static changingSector_UI_Update(seconds: number) {
        mod.SetUITextLabel(mod.FindUIWidgetWithName("changingSector_counter1"), mod.Message(mod.stringkeys.value, seconds));
        mod.SetUITextLabel(mod.FindUIWidgetWithName("changingSector_counter2"), mod.Message(mod.stringkeys.value, seconds));
    }

    public static changingSector_UI_Team_Update() {
        let attackermessage: mod.Message;
        let defendermessage: mod.Message;
        let attackercolour: mod.Vector;
        let defendercolour: mod.Vector;

        if (GameConfig.gameConfig.attacker == mod.GetTeam(1)) {
            attackermessage = mod.Message(mod.stringkeys.supremacy.conquest.attacker);
            defendermessage = mod.Message(mod.stringkeys.supremacy.conquest.defender);
            attackercolour = UIconfig.uiConfig.friendlyColour;
            defendercolour = UIconfig.uiConfig.enemyColour;
        } else {
            attackermessage = mod.Message(mod.stringkeys.supremacy.finalassault.defender);
            defendermessage = mod.Message(mod.stringkeys.supremacy.finalassault.attacker);
            attackercolour = UIconfig.uiConfig.enemyColour;
            defendercolour = UIconfig.uiConfig.friendlyColour;
        }

        mod.SetUIWidgetBgColor(mod.FindUIWidgetWithName("changingSector_header1"), attackercolour);
        mod.SetUIWidgetBgColor(mod.FindUIWidgetWithName("changingSector_header2"), defendercolour);
        mod.SetUITextLabel(mod.FindUIWidgetWithName("changingSector_counter1"), attackermessage);
        mod.SetUITextLabel(mod.FindUIWidgetWithName("changingSector_counter2"), defendermessage);
    }







    public static changingSector_UI_Change(enable: boolean) {
        mod.SetUIWidgetVisible(mod.FindUIWidgetWithName("changingSector_container"), enable);
    }

    public static async changingLocation(isToConquest: boolean = false): Promise<void> {
        //mod.UndeployAllPlayers();
        //mod.EnableAllPlayerDeploy(false);
        mod.PauseGameModeTime(true);

        let t1message: mod.Message;
        let t2message: mod.Message;
        let t1colour: mod.Vector;
        let t2colour: mod.Vector;
        let root = mod.FindUIWidgetWithName("MainUICenter")

        if (GameConfig.gameConfig.stage == 0) {
            t1message = mod.Message(mod.stringkeys.supremacy.conquest.name);
            t2message = mod.Message(mod.stringkeys.supremacy.conquest.name);
            if (mod.Equals(GameConfig.gameConfig.attacker, mod.GetTeam(1))) {
                t1colour = UIconfig.uiConfig.enemyColour;
                t2colour = UIconfig.uiConfig.friendlyColour;
            } else {
                t1colour = UIconfig.uiConfig.friendlyColour;
                t2colour = UIconfig.uiConfig.enemyColour;
            }
        } else {
            if (mod.Equals(GameConfig.gameConfig.attacker, mod.GetTeam(1))) {
                t1colour = UIconfig.uiConfig.friendlyColour;
                t2colour = UIconfig.uiConfig.enemyColour;
                t1message = mod.Message(mod.stringkeys.supremacy.finalassault.attacker);
                t2message = mod.Message(mod.stringkeys.supremacy.finalassault.defender);
            } else {
                t1colour = UIconfig.uiConfig.enemyColour;
                t2colour = UIconfig.uiConfig.friendlyColour;
                t1message = mod.Message(mod.stringkeys.supremacy.finalassault.defender);
                t2message = mod.Message(mod.stringkeys.supremacy.finalassault.attacker);
            }
        }

        // 2. Spawn team-specific countdown widgets
        const countdownName1 = "countdown_1";
        const countdownName2 = "countdown_2";
        const titleName1 = "countdown_title_1";
        const titleName2 = "countdown_title_2";

        // Clean up any old widgets just in case
        const oldWidget1 = mod.FindUIWidgetWithName(countdownName1);
        if (oldWidget1) mod.DeleteUIWidget(oldWidget1);
        const oldWidget2 = mod.FindUIWidgetWithName(countdownName2);
        if (oldWidget2) mod.DeleteUIWidget(oldWidget2);
        const oldTitle1 = mod.FindUIWidgetWithName(titleName1);
        if (oldTitle1) mod.DeleteUIWidget(oldTitle1);
        const oldTitle2 = mod.FindUIWidgetWithName(titleName2);
        if (oldTitle2) mod.DeleteUIWidget(oldTitle2);

        mod.AddUIText(
            countdownName1,
            mod.CreateVector(0, 150, 0),
            mod.CreateVector(10000, 10000, 0),
            mod.UIAnchor.Center,
            root,
            true,
            0,
            mod.CreateVector(0, 0, 0),
            1,
            mod.UIBgFill.Solid,
            mod.Message(mod.stringkeys.value, 10),
            256,
            t1colour,
            1,
            mod.UIAnchor.Center,
            mod.UIDepth.AboveGameUI,
            mod.GetTeam(1)
        );
        const widget1 = mod.FindUIWidgetWithName(countdownName1)!;

        mod.AddUIText(
            countdownName2,
            mod.CreateVector(0, 150, 0),
            mod.CreateVector(10000, 10000, 0),
            mod.UIAnchor.Center,
            root,
            true,
            0,
            mod.CreateVector(0, 0, 0),
            1,
            mod.UIBgFill.Solid,
            mod.Message(mod.stringkeys.value, 10),
            256,
            t2colour,
            1,
            mod.UIAnchor.Center,
            mod.UIDepth.AboveGameUI,
            mod.GetTeam(2)
        );
        const widget2 = mod.FindUIWidgetWithName(countdownName2)!;

        const titleMsg = isToConquest
            ? mod.Message(mod.stringkeys.supremacy.conquest.name)
            : mod.Message(mod.stringkeys.supremacy.finalassault.name);

        mod.AddUIText(
            titleName1,
            mod.CreateVector(0, -150, 0),
            mod.CreateVector(10000, 150, 0),
            mod.UIAnchor.Center,
            root,
            true,
            0,
            t1colour,
            0.05,
            mod.UIBgFill.Solid,
            t1message,
            156,
            t1colour,
            1,
            mod.UIAnchor.Center,
            mod.UIDepth.AboveGameUI,
            mod.GetTeam(1)
        );
        const titleWidget1 = mod.FindUIWidgetWithName(titleName1)!;

        mod.AddUIText(
            titleName2,
            mod.CreateVector(0, -150, 0),
            mod.CreateVector(10000, 150, 0),
            mod.UIAnchor.Center,
            root,
            true,
            0,
            t2colour,
            0.05,
            mod.UIBgFill.Solid,
            t2message,
            156,
            t2colour,
            1,
            mod.UIAnchor.Center,
            mod.UIDepth.AboveGameUI,
            mod.GetTeam(2)
        );

        const titleWidget2 = mod.FindUIWidgetWithName(titleName2)!;


        // 3. 10-second countdown loop
        for (let secondsLeft = 10; secondsLeft >= 1; secondsLeft--) {
            mod.SetUITextLabel(widget1, mod.Message(mod.stringkeys.value, secondsLeft));
            mod.SetUITextLabel(widget2, mod.Message(mod.stringkeys.value, secondsLeft));
            if (secondsLeft <= 3) {
                BFSAudio.playTimerLongTick();
            } else {
                BFSAudio.playTimerShortTick();
            }

            // Wait 1 second
            await mod.Wait(1);
        }
        BFSAudio.playTimerEnd();

        // --- SWIPE TRANSITION ---
        await BFSupremacyUI.playSwipeTransition(async () => {
            // Clean up countdown UI while screen is covered
            mod.DeleteUIWidget(widget1);
            mod.DeleteUIWidget(widget2);
            mod.DeleteUIWidget(titleWidget1);
            mod.DeleteUIWidget(titleWidget2);

            mod.PauseGameModeTime(false);
            mod.EnableAllPlayerDeploy(true);
        });
    }

    public static async playSwipeTransition(onCovered?: () => void | Promise<void>): Promise<void> {
        let t1colour: mod.Vector;
        let t2colour: mod.Vector;
        let position: number = -1100;
        let height: number = 1100;
        if (GameConfig.gameConfig.stage == 0) {
            if (mod.Equals(GameConfig.gameConfig.attacker, mod.GetTeam(1))) {
                t1colour = UIconfig.uiConfig.enemyColour;
                t2colour = UIconfig.uiConfig.friendlyColour;
            } else {
                t1colour = UIconfig.uiConfig.friendlyColour;
                t2colour = UIconfig.uiConfig.enemyColour;
            }
        } else {
            if (mod.Equals(GameConfig.gameConfig.attacker, mod.GetTeam(1))) {
                t1colour = UIconfig.uiConfig.friendlyColour;
                t2colour = UIconfig.uiConfig.enemyColour;
            } else {
                t1colour = UIconfig.uiConfig.enemyColour;
                t2colour = UIconfig.uiConfig.friendlyColour;
            }
        }

        const swipeOverlayName1 = "swipe_overlay_1";
        const swipeOverlayName2 = "swipe_overlay_2";

        const oldSwipe1 = mod.FindUIWidgetWithName(swipeOverlayName1);
        if (oldSwipe1) mod.DeleteUIWidget(oldSwipe1);
        const oldSwipe2 = mod.FindUIWidgetWithName(swipeOverlayName2);
        if (oldSwipe2) mod.DeleteUIWidget(oldSwipe2);

        // Spawn swipe overlay container at the top (fully off-screen) for Team 1
        mod.AddUIContainer(
            swipeOverlayName1,
            mod.CreateVector(0, position, 0),
            mod.CreateVector(10000, height, 0),
            mod.UIAnchor.TopCenter,
            mod.FindUIWidgetWithName("MainAnimationUI"),
            true,
            0,
            t1colour,
            1.0,
            mod.UIBgFill.Solid,
            mod.UIDepth.AboveGameUI,
            mod.GetTeam(1)
        );
        const swipeWidget1 = mod.FindUIWidgetWithName(swipeOverlayName1)!;

        // Spawn swipe overlay container at the top (fully off-screen) for Team 2
        mod.AddUIContainer(
            swipeOverlayName2,
            mod.CreateVector(0, position, 0),
            mod.CreateVector(10000, height, 0),
            mod.UIAnchor.TopCenter,
            mod.FindUIWidgetWithName("MainAnimationUI"),
            true,
            0,
            t2colour,
            1.0,
            mod.UIBgFill.Solid,
            mod.UIDepth.AboveGameUI,
            mod.GetTeam(2)
        );
        const swipeWidget2 = mod.FindUIWidgetWithName(swipeOverlayName2)!;

        // Animate Swipe-in (fill from top)
        const swipeSteps = 15;
        const swipeStepDuration = 0.03; // 30ms per step = 600ms total swipe
        for (let i = 1; i <= swipeSteps; i++) {
            const progress = i / swipeSteps;
            const easedProgress = progress * (2 - progress); // Ease-out quad
            const yPos = position + (height * easedProgress);
            const pos = mod.CreateVector(0, yPos, 0);
            mod.SetUIWidgetPosition(swipeWidget1, pos);
            mod.SetUIWidgetPosition(swipeWidget2, pos);
            await mod.Wait(swipeStepDuration);
        }

        // TODO: Play sound placeholder

        if (onCovered) {
            await onCovered();
        }

        // Animate Swipe-out (exit down)
        for (let i = 1; i <= swipeSteps; i++) {
            const progress = i / swipeSteps;
            const easedProgress = progress * progress; // Ease-in quad
            const yPos = height * easedProgress;
            const pos = mod.CreateVector(0, yPos, 0);
            mod.SetUIWidgetPosition(swipeWidget1, pos);
            mod.SetUIWidgetPosition(swipeWidget2, pos);
            await mod.Wait(swipeStepDuration);
        }

        // Clean up swipe containers
        mod.DeleteUIWidget(swipeWidget1);
        mod.DeleteUIWidget(swipeWidget2);
    }


    // PLAYER OOB UI
    public static async outOfBoundsUI(eventPlayer: mod.Player): Promise<void> {
        await mod.Wait(0.066);
        //return;
        if (!GameConfig.gameConfig.roundOngoing || !mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsAlive) || PlayerVariables.getPlayerData(eventPlayer).ingoreOOB) return;
        const playerData = PlayerVariables.getPlayerData(eventPlayer);
        playerData.outOfBounds = true;
        if (playerData.oobTimer > 0) return;

        playerData.outOfBounds = true;
        playerData.oobTimer = 10;
        mod.SkipManDown(eventPlayer, true);
        mod.SetUIWidgetVisible(mod.FindUIWidgetWithName('OOBBackground' + mod.GetObjId(eventPlayer)), true);
        mod.SetUIWidgetVisible(mod.FindUIWidgetWithName('OOBText' + mod.GetObjId(eventPlayer)), true);
        mod.SetUIWidgetVisible(mod.FindUIWidgetWithName('Countdown' + mod.GetObjId(eventPlayer)), true);

        for (let i = playerData.oobTimer; i > 0; i--) {
            mod.SetUITextLabel(mod.FindUIWidgetWithName('Countdown' + mod.GetObjId(eventPlayer)), mod.Message(mod.stringkeys.value, i));
            BFSAudio.playOutOfBounds(eventPlayer);
            await mod.Wait(0.5);
            if (!GameConfig.gameConfig.roundOngoing || !playerData.outOfBounds || !mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsAlive) || playerData.ingoreOOB) {
                playerData.outOfBounds = false;
                break;
            }
            await mod.Wait(0.5);
            if (!GameConfig.gameConfig.roundOngoing || !playerData.outOfBounds || !mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsAlive) || playerData.ingoreOOB) {
                playerData.outOfBounds = false;
                break;
            }
        }

        playerData.oobTimer = 0;
        if (playerData.outOfBounds) {
            mod.DealDamage(eventPlayer, 10000);
        } else {
            mod.SkipManDown(eventPlayer, false);
        }

        mod.SetUIWidgetVisible(mod.FindUIWidgetWithName('OOBBackground' + mod.GetObjId(eventPlayer)), false);
        mod.SetUIWidgetVisible(mod.FindUIWidgetWithName('OOBText' + mod.GetObjId(eventPlayer)), false);
        mod.SetUIWidgetVisible(mod.FindUIWidgetWithName('Countdown' + mod.GetObjId(eventPlayer)), false);
        playerData.outOfBounds = false;
    }
}