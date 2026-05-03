import { Events } from 'bf6-portal-utils/events';
import { BFSupremacyConquest } from './BFSConquest';
import { GameConfig, ObjectiveVariables, PlayerVariables } from './BFSVariables';
import { BFSupremacyUI } from './BFSUI';
import { BFSupremacyCore } from './BFSCore';
import { BFSupremacyPlayer } from './BFSPlayer';
import { BFSupremacyRegroup } from './BFSRegroup';


export class BFSupremacy {
    private static subscribed = false;

    public static init(): void {
        if (BFSupremacy.subscribed) {
            return;
        }

        Events.OngoingGlobal.subscribe(() => {
            BFSupremacyUI.UI_AlphaUpdate();
            if (GameConfig.gameConfig.gameStarted && GameConfig.gameConfig.roundOngoing) {
                if (GameConfig.gameConfig.stage == 0) {
                    BFSupremacyConquest.ongoingConquest();
                } else if (GameConfig.gameConfig.stage == 1) {
                    BFSupremacyRegroup.ongoingRegroup();
                }
            }
        });

        Events.OnGameModeStarted.subscribe(() => {
            BFSupremacyConquest.init();
            BFSupremacyUI.UI_Setup();
            mod.SetCameraTypeForAll(mod.Cameras.ThirdPerson);
            if (GameConfig.gameConfig.debug) {
                GameConfig.gameConfig.ticketSpeed = 2;
            }
            GameConfig.gameConfig.roundOngoing = true;
            GameConfig.gameConfig.gameStarted = true;
        });

        Events.OnPlayerEnterCapturePoint.subscribe(async (eventPlayer: mod.Player, eventCapturePoint: mod.CapturePoint) => {
            PlayerVariables.getPlayerData(eventPlayer).currentObjective = eventCapturePoint;
            let flagID = mod.GetObjId(eventCapturePoint);
            if (PlayerVariables.getPlayerData(eventPlayer).onPoint) {
                return;
            }
            await mod.Wait(0.05);
            PlayerVariables.getPlayerData(eventPlayer).onPoint = true;

            let allPlayers = mod.GetPlayersOnPoint(eventCapturePoint);
            let team1Count = 0;
            let team2Count = 0;
            for (let i = 0; i < mod.CountOf(allPlayers); i++) {
                let p = mod.ValueInArray(allPlayers, i) as mod.Player;
                if (mod.Equals(mod.GetTeam(p), mod.GetTeam(1)) && mod.GetSoldierState(p, mod.SoldierStateBool.IsAlive)) {
                    team1Count++;
                } else if (mod.Equals(mod.GetTeam(p), mod.GetTeam(2)) && mod.GetSoldierState(p, mod.SoldierStateBool.IsAlive)) {
                    team2Count++;
                }
            }
            ObjectiveVariables.objectiveVariables.get(mod.GetObjId(eventCapturePoint))!.team1Players = team1Count;
            ObjectiveVariables.objectiveVariables.get(mod.GetObjId(eventCapturePoint))!.team2Players = team2Count;
            while (PlayerVariables.getPlayerData(eventPlayer).onPoint) {
                if (mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsAlive) && (flagID >= GameConfig.gameConfig.flagStart && flagID <= GameConfig.gameConfig.flagEnd)) {
                    BFSupremacyPlayer.enableCaptureUI(eventPlayer, true);
                    BFSupremacyPlayer.updatePlayerCaptureUI(eventPlayer, eventCapturePoint);
                } else {
                    BFSupremacyPlayer.enableCaptureUI(eventPlayer, false);
                }
                await mod.Wait(0.1);
            }
            BFSupremacyPlayer.enableCaptureUI(eventPlayer, false);


        });

        Events.OnPlayerExitCapturePoint.subscribe((eventPlayer: mod.Player, eventCapturePoint: mod.CapturePoint) => {
            PlayerVariables.getPlayerData(eventPlayer).onPoint = false;

            let allPlayers = mod.GetPlayersOnPoint(eventCapturePoint);
            let team1Count = 0;
            let team2Count = 0;
            for (let i = 0; i < mod.CountOf(allPlayers); i++) {
                let p = mod.ValueInArray(allPlayers, i) as mod.Player;
                if (mod.Equals(mod.GetTeam(p), mod.GetTeam(1)) && mod.GetSoldierState(p, mod.SoldierStateBool.IsAlive)) {
                    team1Count++;
                } else if (mod.Equals(mod.GetTeam(p), mod.GetTeam(2)) && mod.GetSoldierState(p, mod.SoldierStateBool.IsAlive)) {
                    team2Count++;
                }
            }
            ObjectiveVariables.objectiveVariables.get(mod.GetObjId(eventCapturePoint))!.team1Players = team1Count;
            ObjectiveVariables.objectiveVariables.get(mod.GetObjId(eventCapturePoint))!.team2Players = team2Count;
        });

        Events.OnCapturePointCaptured.subscribe(async (eventCapturePoint: mod.CapturePoint) => {
            await mod.Wait(0.1)
            if (GameConfig.gameConfig.gameStarted) {
                BFSupremacyUI.capturePoint_UI_Colour_Update(eventCapturePoint);
                BFSupremacyCore.updateFlagData(eventCapturePoint);
                BFSupremacyUI.capturePoint_UI_Alpha_Update(eventCapturePoint);
            }
        });

        Events.OnCapturePointLost.subscribe(async (eventCapturePoint: mod.CapturePoint) => {
            await mod.Wait(0.1)
            BFSupremacyUI.capturePoint_UI_Colour_Update(eventCapturePoint);
            BFSupremacyCore.updateFlagData(eventCapturePoint);
        });

        Events.OngoingCapturePoint.subscribe((eventCapturePoint: mod.CapturePoint) => {
            if (!GameConfig.gameConfig.gameStarted) {
                return;
            }
            BFSupremacyCore.ongoingFlagData(eventCapturePoint);
            BFSupremacyUI.capturePoint_UI_Alpha_Update(eventCapturePoint);
        });

        Events.OnPlayerJoinGame.subscribe((eventPlayer: mod.Player) => {
        });

        Events.OnPlayerDeployed.subscribe((eventPlayer: mod.Player) => {
            if (PlayerVariables.getPlayerData(eventPlayer).firstDeploy) {
                BFSupremacyPlayer.createPlayerUI(eventPlayer);
                PlayerVariables.getPlayerData(eventPlayer).firstDeploy = false;
            }
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

        Events.OnSpawnerSpawned.subscribe((eventPlayer: mod.Player, eventSpawner: mod.Spawner) => {
            BFSupremacyRegroup.onBotSpawned(eventPlayer, eventSpawner);
        });

        Events.OnVehicleSpawned.subscribe((eventVehicle: mod.Vehicle) => {
            BFSupremacyRegroup.onVehicleSpawned(eventVehicle);
        });

        Events.OnPlayerEnterVehicle.subscribe((eventPlayer: mod.Player, eventVehicle: mod.Vehicle) => {
            let vehicle = mod.GetVehicleFromPlayer(eventPlayer);
            if (GameConfig.gameConfig.stage === 1) {
                if (mod.And(mod.Equals(vehicle, GameConfig.gameConfig.regroupVehicle), mod.Not(mod.Equals(eventPlayer, GameConfig.gameConfig.regroupBot)))) {
                    BFSupremacyRegroup.playerBoarding(eventPlayer, eventVehicle);
                }
            }
        });


        BFSupremacy.subscribed = true;
    }

}