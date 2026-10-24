import { PlayerVariables, ObjectiveVariables } from "./BFSVariables.ts";
import { UIconfig } from "./BFSVariables.ts";
import { BFSupremacyCore } from "./BFSCore.ts";

export class BFSupremacyPlayer {
    public static createPlayerUI(player: mod.Player): void {
        const playerId = mod.GetObjId(player);
        mod.AddUIContainer("player_" + playerId, mod.CreateVector(0, 0, 0), mod.CreateVector(300, 50, 0), mod.UIAnchor.TopCenter, mod.GetUIRoot(), true, 0, mod.CreateVector(1, 1, 1), 0.5, mod.UIBgFill.None, mod.UIDepth.AboveGameUI);
        let playerUIContainer = mod.FindUIWidgetWithName("player_" + playerId);

        const aimName = "player_aim" + playerId;
        mod.AddUIContainer(aimName, mod.CreateVector(-12, 5, 0), mod.CreateVector(3, 3, 0), mod.UIAnchor.Center, mod.GetUIRoot(), false, 0, mod.CreateVector(1, 1, 1), 0.9, mod.UIBgFill.Solid, mod.UIDepth.AboveGameUI, player);

        mod.AddUIContainer('OOBBackground' + playerId, mod.CreateVector(0, 0, 0), mod.CreateVector(10000, 10000, 0), mod.UIAnchor.TopCenter, playerUIContainer, false, 1, mod.CreateVector(0, 0, 0), 0.9, mod.UIBgFill.Blur, player);
        mod.AddUIText('OOBText' + playerId, mod.CreateVector(0, 470, 0), mod.CreateVector(450, 150, 0), mod.UIAnchor.TopCenter, playerUIContainer, false, 1, mod.CreateVector(0.6, 0.1, 0.1), 0.8, mod.UIBgFill.Blur, mod.Message(mod.stringkeys.returnToCombat), 56, mod.CreateVector(1, 0.2, 0.2), 1, mod.UIAnchor.TopCenter, player);
        mod.AddUIText('Countdown' + playerId, mod.CreateVector(0, 470, 0), mod.CreateVector(450, 150, 0), mod.UIAnchor.TopCenter, playerUIContainer, false, 1, mod.CreateVector(0, 0, 0), 1, mod.UIBgFill.None, mod.Message(mod.stringkeys.value, 10), 72, mod.CreateVector(1, 0.2, 0.2), 1, mod.UIAnchor.BottomCenter, player);

        const pd = PlayerVariables.getPlayerData(player);
        pd.containerWidget = playerUIContainer;
        pd.aimWidget = mod.FindUIWidgetWithName(aimName);
        pd.uiCreated = true;
        pd.dotHoldUntil = 0;
    }

    public static destroyPlayerUI(player: mod.Player) {
        const pd = PlayerVariables.getPlayerData(player);
        if (!pd.uiCreated) return;
        mod.DeleteUIWidget(pd.containerWidget);
        if (pd.aimWidget) mod.DeleteUIWidget(pd.aimWidget);
        pd.containerWidget = mod.GetUIRoot();
        pd.aimWidget = undefined;
        pd.uiCreated = false;
    }

    public static MCOMScoring(eventPlayer: mod.Player) {
        PlayerVariables.getPlayerData(eventPlayer).score += 200;
        PlayerVariables.getPlayerData(eventPlayer).captures++;
        BFSupremacyCore.scoreboardUpdate(eventPlayer);
    }
}