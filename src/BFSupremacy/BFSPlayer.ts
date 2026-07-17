import { PlayerVariables, ObjectiveVariables } from "./BFSVariables.ts";
import { UIconfig } from "./BFSVariables.ts";

export class BFSupremacyPlayer {
    public static createPlayerUI(player: mod.Player): void {
        mod.AddUIContainer("player_" + mod.GetObjId(player), mod.CreateVector(0, 0, 0), mod.CreateVector(300, 50, 0), mod.UIAnchor.TopCenter, mod.GetUIRoot(), true, 0, mod.CreateVector(1, 1, 1), 0.5, mod.UIBgFill.None, mod.UIDepth.AboveGameUI);
        let playerUIContainer = mod.FindUIWidgetWithName("player_" + mod.GetObjId(player));
        let data = PlayerVariables.getPlayerData(player);
        data.containerWidget = playerUIContainer;
        PlayerVariables.setPlayerData(player, data);
        mod.AddUIText("objText", mod.CreateVector(0, 170, 0), mod.CreateVector(220, 40, 0), mod.UIAnchor.TopCenter, playerUIContainer, false, 1, mod.CreateVector(0, 0, 0), 0.8, mod.UIBgFill.Blur, mod.Message(mod.stringkeys.captureProgress.none), 36, mod.CreateVector(1, 1, 1), 1, mod.UIAnchor.Center, player);
        mod.AddUIText("objCounter", mod.CreateVector(0, 230, 0), mod.CreateVector(220, 40, 0), mod.UIAnchor.TopCenter, playerUIContainer, false, 1, mod.CreateVector(0, 0, 0), 1, mod.UIBgFill.None, mod.Message(mod.stringkeys.captureProgress.none), 28, mod.CreateVector(1, 1, 1), 1, mod.UIAnchor.Center, player);
        mod.AddUIContainer("objProgressBG", mod.CreateVector(0, 220, 0), mod.CreateVector(220, 7, 0), mod.UIAnchor.TopCenter, playerUIContainer, false, 1, mod.CreateVector(0, 0, 0), 0.8, mod.UIBgFill.Blur, player);
        mod.AddUIContainer("objProgress", mod.CreateVector(0, 220, 0), mod.CreateVector(220, 7, 0), mod.UIAnchor.TopCenter, playerUIContainer, false, 1, mod.CreateVector(0, 0, 0), 1, mod.UIBgFill.Solid, player);

        mod.AddUIContainer("player_aim" + mod.GetObjId(player), mod.CreateVector(-10, 20, 0), mod.CreateVector(3, 3, 0), mod.UIAnchor.Center, mod.GetUIRoot(), false, 0, mod.CreateVector(1, 1, 1), 0.9, mod.UIBgFill.Solid, mod.UIDepth.AboveGameUI, player);

        mod.AddUIContainer('OOBBackground' + mod.GetObjId(player), mod.CreateVector(0, 0, 0), mod.CreateVector(10000, 10000, 0), mod.UIAnchor.TopCenter, playerUIContainer, false, 1, mod.CreateVector(0, 0, 0), 0.9, mod.UIBgFill.Blur, player);
        mod.AddUIText('OOBText' + mod.GetObjId(player), mod.CreateVector(0, 470, 0), mod.CreateVector(450, 150, 0), mod.UIAnchor.TopCenter, playerUIContainer, false, 1, mod.CreateVector(0.6, 0.1, 0.1), 0.8, mod.UIBgFill.Blur, mod.Message(mod.stringkeys.returnToCombat), 56, mod.CreateVector(1, 0.2, 0.2), 1, mod.UIAnchor.TopCenter, player);
        mod.AddUIText('Countdown' + mod.GetObjId(player), mod.CreateVector(0, 470, 0), mod.CreateVector(450, 150, 0), mod.UIAnchor.TopCenter, playerUIContainer, false, 1, mod.CreateVector(0, 0, 0), 1, mod.UIBgFill.None, mod.Message(mod.stringkeys.value, 10), 72, mod.CreateVector(1, 0.2, 0.2), 1, mod.UIAnchor.BottomCenter, player);
    }

    public static updatePlayerCaptureUI(player: mod.Player, capturePoint: mod.CapturePoint): void {
        let data = ObjectiveVariables.getObjectiveVariables(capturePoint);
        let playerTeam = mod.GetTeam(player);
        let playerUI = mod.FindUIWidgetWithName("player_" + mod.GetObjId(player));

        let message: mod.Message;
        let textColour: mod.Vector;
        let bgColour: mod.Vector;
        let players: number;
        let enemyPlayers: number;

        if (mod.Equals(playerTeam, mod.GetTeam(1))) {
            message = data.uiMessage1;
            textColour = data.uiTextColour1;
            bgColour = data.uiBackgroundColour1;
            players = data.team1Players;
            enemyPlayers = data.team2Players;
        } else {
            message = data.uiMessage2;
            textColour = data.uiTextColour2;
            bgColour = data.uiBackgroundColour2;
            players = data.team2Players;
            enemyPlayers = data.team1Players;
        }

        mod.SetUITextLabel(mod.FindUIWidgetWithName("objText", playerUI), message);
        mod.SetUITextColor(mod.FindUIWidgetWithName("objText", playerUI), textColour);
        mod.SetUIWidgetBgColor(mod.FindUIWidgetWithName("objText", playerUI), bgColour);
        mod.SetUIWidgetSize(mod.FindUIWidgetWithName("objProgress", playerUI), data.progressSize);
        mod.SetUIWidgetPosition(mod.FindUIWidgetWithName("objProgress", playerUI), data.position);
        mod.SetUIWidgetBgColor(mod.FindUIWidgetWithName("objProgressBG", playerUI), bgColour);

        if (mod.Equals(playerTeam, mod.GetOwnerProgressTeam(capturePoint))) {
            mod.SetUIWidgetBgColor(mod.FindUIWidgetWithName("objProgress", playerUI), UIconfig.uiConfig.friendlyColour);
        } else {
            mod.SetUIWidgetBgColor(mod.FindUIWidgetWithName("objProgress", playerUI), UIconfig.uiConfig.enemyColour);
        }

        if (players > enemyPlayers) {
            mod.SetUITextColor(mod.FindUIWidgetWithName("objCounter", playerUI), mod.CreateVector(1, 1, 1));
        } else {
            mod.SetUITextColor(mod.FindUIWidgetWithName("objCounter", playerUI), UIconfig.uiConfig.enemyColour);
        }

        mod.SetUITextLabel(mod.FindUIWidgetWithName("objCounter", playerUI), mod.Message(mod.stringkeys.captureProgress.counter, players, enemyPlayers));
    }

    public static enableCaptureUI(player: mod.Player, enable: boolean) {
        let playerUI = mod.FindUIWidgetWithName("player_" + mod.GetObjId(player));
        mod.SetUIWidgetVisible(mod.FindUIWidgetWithName("objText", playerUI), enable);
        mod.SetUIWidgetVisible(mod.FindUIWidgetWithName("objCounter", playerUI), enable);
        mod.SetUIWidgetVisible(mod.FindUIWidgetWithName("objProgressBG", playerUI), enable);
        mod.SetUIWidgetVisible(mod.FindUIWidgetWithName("objProgress", playerUI), enable);
    }
}