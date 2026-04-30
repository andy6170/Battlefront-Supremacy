import { Events } from 'bf6-portal-utils/events';
import { BFSupremacyUI } from './BFSupremacyUI';
import { BFSupremacyConquest } from './BFSupremacyConquest';
import { GameConfig } from './BFSupremacyVariables';

export class BFSupremacy {
    private static subscribed = false;

    public static init(): void {
        if (BFSupremacy.subscribed) {
            return;
        }

        Events.OngoingGlobal.subscribe(() => {
            if (GameConfig.gameConfig.gameStarted) {
                if (GameConfig.gameConfig.stage == 0) {
                    BFSupremacyConquest.ongoingSecondsCheck();
                }
            }
        });

        Events.OnGameModeStarted.subscribe(() => {
            BFSupremacyUI.UI_Setup();
            BFSupremacyConquest.init();
            GameConfig.gameConfig.roundOngoing = true;
            GameConfig.gameConfig.gameStarted = true;
        });

        Events.OnPlayerEnterCapturePoint.subscribe((eventPlayer: mod.Player, eventCapturePoint: mod.CapturePoint) => {
        });

        Events.OnPlayerExitCapturePoint.subscribe((eventPlayer: mod.Player, eventCapturePoint: mod.CapturePoint) => {
        });

        Events.OnCapturePointCaptured.subscribe((eventCapturePoint: mod.CapturePoint) => {
        });

        Events.OnCapturePointLost.subscribe((eventCapturePoint: mod.CapturePoint) => {
        });

        Events.OnPlayerJoinGame.subscribe((eventPlayer: mod.Player) => {
        });

        Events.OnPlayerDeployed.subscribe((eventPlayer: mod.Player) => {
        });

        Events.OnPlayerEarnedKill.subscribe((eventPlayer: mod.Player, eventOtherPlayer: mod.Player, eventDeathType: mod.DeathType, eventWeaponUnlock: mod.WeaponUnlock) => {
        });

        Events.OnPlayerEarnedKillAssist.subscribe((eventPlayer: mod.Player, eventOtherPlayer: mod.Player) => {
        });

        Events.OnRevived.subscribe((eventPlayer: mod.Player, eventOtherPlayer: mod.Player) => {
        });

        Events.OnPlayerUndeploy.subscribe((eventPlayer: mod.Player) => {
        });

        Events.OnPlayerDied.subscribe((eventPlayer: mod.Player, eventOtherPlayer: mod.Player) => {
        });

        Events.OnPlayerLeaveGame.subscribe((playerId: number) => {
        });

        Events.OnPlayerEnterAreaTrigger.subscribe((eventPlayer: mod.Player, eventAreaTrigger: mod.AreaTrigger) => {
        });

        Events.OnPlayerExitAreaTrigger.subscribe((eventPlayer: mod.Player, eventAreaTrigger: mod.AreaTrigger) => {
        });

        BFSupremacy.subscribed = true;
    }

}