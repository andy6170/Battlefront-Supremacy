import { PlayerVariables, ObjectiveVariables } from "./BFSVariables.ts";
import { UIconfig } from "./BFSVariables.ts";
import { BFSupremacyCore } from "./BFSCore.ts";

export class BFSupremacyPlayer {
    public static createPlayerUI(player: mod.Player): void {
        const playerId = mod.GetObjId(player);
        mod.AddUIContainer("player_" + playerId, mod.CreateVector(0, 0, 0), mod.CreateVector(300, 50, 0), mod.UIAnchor.TopCenter, mod.GetUIRoot(), true, 0, mod.CreateVector(1, 1, 1), 0.5, mod.UIBgFill.None, mod.UIDepth.AboveGameUI);
        let playerUIContainer = mod.FindUIWidgetWithName("player_" + playerId);
        mod.AddUIText("objText_" + playerId, mod.CreateVector(0, 170, 0), mod.CreateVector(220, 40, 0), mod.UIAnchor.TopCenter, playerUIContainer, false, 1, mod.CreateVector(0, 0, 0), 0.8, mod.UIBgFill.Blur, mod.Message(mod.stringkeys.captureProgress.none), 36, mod.CreateVector(1, 1, 1), 1, mod.UIAnchor.Center, player);
        mod.AddUIText("objCounter_" + playerId, mod.CreateVector(0, 230, 0), mod.CreateVector(220, 40, 0), mod.UIAnchor.TopCenter, playerUIContainer, false, 1, mod.CreateVector(0, 0, 0), 1, mod.UIBgFill.None, mod.Message(mod.stringkeys.captureProgress.none), 28, mod.CreateVector(1, 1, 1), 1, mod.UIAnchor.Center, player);
        mod.AddUIContainer("objProgressBG_" + playerId, mod.CreateVector(0, 220, 0), mod.CreateVector(220, 7, 0), mod.UIAnchor.TopCenter, playerUIContainer, false, 1, mod.CreateVector(0, 0, 0), 0.8, mod.UIBgFill.Blur, player);
        mod.AddUIContainer("objProgress_" + playerId, mod.CreateVector(0, 220, 0), mod.CreateVector(220, 7, 0), mod.UIAnchor.TopCenter, playerUIContainer, false, 1, mod.CreateVector(0, 0, 0), 1, mod.UIBgFill.Solid, player);

        const aimName = "player_aim" + playerId;
        mod.AddUIContainer(aimName, mod.CreateVector(-12, 5, 0), mod.CreateVector(3, 3, 0), mod.UIAnchor.Center, mod.GetUIRoot(), false, 0, mod.CreateVector(1, 1, 1), 0.9, mod.UIBgFill.Solid, mod.UIDepth.AboveGameUI, player);

        mod.AddUIContainer('OOBBackground' + playerId, mod.CreateVector(0, 0, 0), mod.CreateVector(10000, 10000, 0), mod.UIAnchor.TopCenter, playerUIContainer, false, 1, mod.CreateVector(0, 0, 0), 0.9, mod.UIBgFill.Blur, player);
        mod.AddUIText('OOBText' + playerId, mod.CreateVector(0, 470, 0), mod.CreateVector(450, 150, 0), mod.UIAnchor.TopCenter, playerUIContainer, false, 1, mod.CreateVector(0.6, 0.1, 0.1), 0.8, mod.UIBgFill.Blur, mod.Message(mod.stringkeys.returnToCombat), 56, mod.CreateVector(1, 0.2, 0.2), 1, mod.UIAnchor.TopCenter, player);
        mod.AddUIText('Countdown' + playerId, mod.CreateVector(0, 470, 0), mod.CreateVector(450, 150, 0), mod.UIAnchor.TopCenter, playerUIContainer, false, 1, mod.CreateVector(0, 0, 0), 1, mod.UIBgFill.None, mod.Message(mod.stringkeys.value, 10), 72, mod.CreateVector(1, 0.2, 0.2), 1, mod.UIAnchor.BottomCenter, player);

        const pd = PlayerVariables.getPlayerData(player);
        pd.containerWidget = playerUIContainer;
        pd.aimWidget = mod.FindUIWidgetWithName(aimName);
        pd.objTextWidget = mod.FindUIWidgetWithName("objText_" + playerId, playerUIContainer);
        pd.objCounterWidget = mod.FindUIWidgetWithName("objCounter_" + playerId, playerUIContainer);
        pd.objProgressBGWidget = mod.FindUIWidgetWithName("objProgressBG_" + playerId, playerUIContainer);
        pd.objProgressWidget = mod.FindUIWidgetWithName("objProgress_" + playerId, playerUIContainer);
        pd.uiCreated = true;
    }

    public static updatePlayerCaptureUI(player: mod.Player, capturePoint: mod.CapturePoint): void {
        let data = ObjectiveVariables.getObjectiveVariables(capturePoint);
        let playerTeam = mod.GetTeam(player);
        const pd = PlayerVariables.getPlayerData(player);
        if (!pd.uiCreated) return;

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

        mod.SetUITextLabel(pd.objTextWidget!, message);
        mod.SetUITextColor(pd.objTextWidget!, textColour);
        mod.SetUIWidgetBgColor(pd.objTextWidget!, bgColour);
        mod.SetUIWidgetSize(pd.objProgressWidget!, data.progressSize);
        mod.SetUIWidgetPosition(pd.objProgressWidget!, data.position);
        mod.SetUIWidgetBgColor(pd.objProgressBGWidget!, bgColour);

        if (mod.Equals(playerTeam, mod.GetOwnerProgressTeam(capturePoint))) {
            mod.SetUIWidgetBgColor(pd.objProgressWidget!, UIconfig.uiConfig.friendlyColour);
        } else {
            mod.SetUIWidgetBgColor(pd.objProgressWidget!, UIconfig.uiConfig.enemyColour);
        }

        if (players > enemyPlayers) {
            mod.SetUITextColor(pd.objCounterWidget!, mod.CreateVector(1, 1, 1));
        } else {
            mod.SetUITextColor(pd.objCounterWidget!, UIconfig.uiConfig.enemyColour);
        }

        mod.SetUITextLabel(pd.objCounterWidget!, mod.Message(mod.stringkeys.captureProgress.counter, players, enemyPlayers));
    }

    public static enableCaptureUI(player: mod.Player, enable: boolean) {
        const pd = PlayerVariables.getPlayerData(player);
        if (!pd.uiCreated) return;
        mod.SetUIWidgetVisible(pd.objTextWidget!, enable);
        mod.SetUIWidgetVisible(pd.objCounterWidget!, enable);
        mod.SetUIWidgetVisible(pd.objProgressBGWidget!, enable);
        mod.SetUIWidgetVisible(pd.objProgressWidget!, enable);
    }

    public static destroyPlayerUI(player: mod.Player) {
        const pd = PlayerVariables.getPlayerData(player);
        if (!pd.uiCreated) return;
        mod.DeleteUIWidget(pd.containerWidget);
        pd.containerWidget = mod.GetUIRoot();
        pd.aimWidget = undefined;
        pd.objTextWidget = undefined;
        pd.objCounterWidget = undefined;
        pd.objProgressBGWidget = undefined;
        pd.objProgressWidget = undefined;
        pd.uiCreated = false;
    }

    public static MCOMScoring(eventPlayer: mod.Player) {
        PlayerVariables.getPlayerData(eventPlayer).score += 200;
        PlayerVariables.getPlayerData(eventPlayer).captures++;
        BFSupremacyCore.scoreboardUpdate(eventPlayer);
    }
}