import { Events } from 'bf6-portal-utils/events';
import { BFSupremacyConquest } from './BFSConquest';
import { GameConfig, ObjectiveVariables, PlayerVariables, UIconfig } from './BFSVariables';
import { BFSupremacyUI } from './BFSUI';
import { BFSupremacyCore } from './BFSCore';
import { BFSupremacyPlayer } from './BFSPlayer';
import { BFSupremacyRegroup } from './BFSRegroup';
import { BFSupremacyFinalAssault } from './BFSFinalAssault';
import { BFSMusic } from './MFSMusic';
import { BFSWeather } from './BFSWeather';



export class BFSupremacy {
    private static subscribed = false;

    public static init(): void {
        if (BFSupremacy.subscribed) {
            return;
        }

        Events.OngoingGlobal.subscribe(() => {
            if (GameConfig.gameConfig.gameStarted && GameConfig.gameConfig.roundOngoing) {
                if (GameConfig.gameConfig.stage == 0) {
                    BFSupremacyUI.UI_AlphaUpdate();
                    BFSupremacyConquest.ongoingConquest();
                } else if (GameConfig.gameConfig.stage == 1) {
                    BFSupremacyRegroup.ongoingRegroup();
                } else if (GameConfig.gameConfig.stage == 2) {
                    BFSupremacyUI.UI_AlphaUpdate();
                    BFSupremacyFinalAssault.ongoingFinalAssault();
                }
            }
        });

        Events.OngoingPlayer.subscribe((eventPlayer: mod.Player) => {
            if (mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsAlive) && !GameConfig.gameConfig.cutscene) {
                if (mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsZooming) && !PlayerVariables.getPlayerData(eventPlayer).firstPerson) {
                    PlayerVariables.getPlayerData(eventPlayer).firstPerson = true;
                    PlayerVariables.getPlayerData(eventPlayer).thirdPerson = false;
                    mod.SetCameraTypeForPlayer(eventPlayer, mod.Cameras.FirstPerson);
                } else if (!mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsZooming) && !PlayerVariables.getPlayerData(eventPlayer).thirdPerson) {
                    PlayerVariables.getPlayerData(eventPlayer).firstPerson = false;
                    PlayerVariables.getPlayerData(eventPlayer).thirdPerson = true;
                    mod.SetCameraTypeForPlayer(eventPlayer, mod.Cameras.ThirdPerson);
                }
            }
        });

        Events.OnGameModeStarted.subscribe(() => {
            mod.SetGameModeTimeLimit(99999);
            BFSupremacyConquest.init();
            BFSWeather.initWeather();
            BFSupremacyUI.UI_Setup();
            BFSMusic.init();
            BFSMusic.testMusic();
            mod.SetCameraTypeForAll(mod.Cameras.ThirdPerson);
            GameConfig.gameConfig.extractionIcon = mod.SpawnObject(mod.RuntimeSpawn_Common.FX_Gadget_DeployableMortar_Target_Area, mod.Subtract(mod.GetObjectPosition(mod.GetSpatialObject(902)), mod.CreateVector(0, 20, 0)), mod.CreateVector(0, 0, 0))
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

            BFSupremacyCore.capturePointPlayers(eventCapturePoint);

            while (PlayerVariables.getPlayerData(eventPlayer).onPoint && GameConfig.gameConfig.roundOngoing) {
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
            BFSupremacyCore.capturePointPlayers(eventCapturePoint);
        });

        Events.OnCapturePointCaptured.subscribe(async (eventCapturePoint: mod.CapturePoint) => {
            await mod.Wait(0.1)
            if (GameConfig.gameConfig.gameStarted) {
                BFSupremacyUI.capturePoint_UI_Colour_Update(eventCapturePoint);
                BFSupremacyCore.updateFlagData(eventCapturePoint);
                BFSupremacyUI.capturePoint_UI_Alpha_Update(eventCapturePoint);
                if (mod.Equals(GameConfig.gameConfig.stage, 2)) {
                    if (mod.Equals(mod.GetCurrentOwnerTeam(eventCapturePoint), GameConfig.gameConfig.attacker)) {
                        BFSupremacyFinalAssault.moveToFinalSectorLevel2();
                    }
                } else {
                    mod.SetCapturePointCapturingTime(eventCapturePoint, 0)
                }
                let t1Control = 0;
                let t2Control = 0;

                for (let i = 200; i < 220; i++) {
                    let capturePoint = mod.GetCapturePoint(i);
                    let owner = mod.GetCurrentOwnerTeam(capturePoint);
                    if (mod.Equals(owner, mod.GetTeam(1))) {
                        t1Control++;
                    } else if (mod.Equals(owner, mod.GetTeam(2))) {
                        t2Control++;
                    }
                }
                if (t1Control > t2Control) {
                    UIconfig.uiConfig.ProgressFlashT1 = true;
                    UIconfig.uiConfig.ProgressFlashT2 = false;
                } else if (t2Control > t1Control) {
                    UIconfig.uiConfig.ProgressFlashT2 = true;
                    UIconfig.uiConfig.ProgressFlashT1 = false;
                } else {
                    UIconfig.uiConfig.ProgressFlashT1 = false;
                    UIconfig.uiConfig.ProgressFlashT2 = false;
                }
            }

        });

        Events.OnCapturePointLost.subscribe(async (eventCapturePoint: mod.CapturePoint) => {
            if (mod.Equals(GameConfig.gameConfig.stage, 0)) {
                mod.SetCapturePointCapturingTime(eventCapturePoint, 0);
            }
            await mod.Wait(0.1)
            BFSupremacyUI.capturePoint_UI_Colour_Update(eventCapturePoint);
            BFSupremacyCore.updateFlagData(eventCapturePoint);
        });

        Events.OnCapturePointCaptured.subscribe(async (eventCapturePoint: mod.CapturePoint) => {
            await mod.Wait(0.1)
            mod.SetMaxCaptureMultiplier(eventCapturePoint, 0);
            if (mod.Equals(GameConfig.gameConfig.stage, 0)) {
                mod.SetCapturePointCapturingTime(eventCapturePoint, GameConfig.gameConfig.capturePointCapturingTime);
            }
        });

        Events.OngoingCapturePoint.subscribe((eventCapturePoint: mod.CapturePoint) => {
            if (!GameConfig.gameConfig.gameStarted) {
                return;
            }
            if (mod.GetObjId(eventCapturePoint) >= GameConfig.gameConfig.flagStart && mod.GetObjId(eventCapturePoint) <= GameConfig.gameConfig.flagEnd) {
                BFSupremacyCore.ongoingFlagData(eventCapturePoint);
                BFSupremacyUI.capturePoint_UI_Alpha_Update(eventCapturePoint);
            }
        });

        Events.OnPlayerJoinGame.subscribe((eventPlayer: mod.Player) => {
            BFSWeather.checkNight(eventPlayer);
        });

        Events.OnPlayerDeployed.subscribe(async (eventPlayer: mod.Player) => {
            PlayerVariables.getPlayerData(eventPlayer).spawned = true;
            if (!GameConfig.gameConfig.cutscene) {
                //Force Reset the Camera as height can bug out
                mod.SetCameraTypeForPlayer(eventPlayer, mod.Cameras.FirstPerson)
                await mod.Wait(0.6);
                mod.SetCameraTypeForPlayer(eventPlayer, mod.Cameras.ThirdPerson)
            }
            BFSWeather.checkNight(eventPlayer);

            if (PlayerVariables.getPlayerData(eventPlayer).firstDeploy) {
                BFSupremacyPlayer.createPlayerUI(eventPlayer);
                PlayerVariables.getPlayerData(eventPlayer).firstDeploy = false;
            }
            if (GameConfig.gameConfig.roundOngoing) {
                mod.EnableAllInputRestrictions(eventPlayer, false);
                //mod.SetCameraTypeForPlayer(eventPlayer, mod.Cameras.ThirdPerson, mod.RandomReal(0, 1000));
            }
            await mod.Wait(1);
            if (mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsInVehicle)) {
                if (mod.Equals(mod.GetVehicleFromPlayer(eventPlayer), GameConfig.gameConfig.regroupVehicle)) {
                    if (mod.Not(mod.Equals(eventPlayer, GameConfig.gameConfig.regroupBot))) {
                        mod.UndeployPlayer(eventPlayer);
                        mod.DisplayNotificationMessage(mod.Message(mod.stringkeys.regroup.undeploy), eventPlayer);
                    }
                }
            }
            PlayerVariables.getPlayerData(eventPlayer).spawned = false;
        });

        Events.OnPlayerEarnedKill.subscribe((eventPlayer: mod.Player, eventOtherPlayer: mod.Player, eventDeathType: mod.DeathType, eventWeaponUnlock: mod.WeaponUnlock) => {
        });

        Events.OnPlayerEarnedKillAssist.subscribe((eventPlayer: mod.Player, eventOtherPlayer: mod.Player) => {
        });

        Events.OnRevived.subscribe((eventPlayer: mod.Player, eventOtherPlayer: mod.Player) => {
            if (PlayerVariables.getPlayerData(eventPlayer).onPoint) {
                BFSupremacyCore.capturePointPlayers(PlayerVariables.getPlayerData(eventPlayer).currentObjective);
            }
        });

        Events.OnPlayerUndeploy.subscribe((eventPlayer: mod.Player) => {
            if (PlayerVariables.getPlayerData(eventPlayer).onPoint) {
                BFSupremacyCore.capturePointPlayers(PlayerVariables.getPlayerData(eventPlayer).currentObjective);
                PlayerVariables.getPlayerData(eventPlayer).onPoint = false;
            }
        });

        Events.OnPlayerDied.subscribe((eventPlayer: mod.Player, eventOtherPlayer: mod.Player) => {
            if (PlayerVariables.getPlayerData(eventPlayer).onPoint) {
                BFSupremacyCore.capturePointPlayers(PlayerVariables.getPlayerData(eventPlayer).currentObjective);
            }
        });

        Events.OnPlayerLeaveGame.subscribe((playerId: number) => {
        });

        Events.OnPlayerEnterAreaTrigger.subscribe((eventPlayer: mod.Player, eventAreaTrigger: mod.AreaTrigger) => {
        });

        Events.OnPlayerExitAreaTrigger.subscribe((eventPlayer: mod.Player, eventAreaTrigger: mod.AreaTrigger) => {
        });

        Events.OnSpawnerSpawned.subscribe((eventPlayer: mod.Player, eventSpawner: mod.Spawner) => {
            mod.EnableAllInputRestrictions(eventPlayer, true);
            BFSupremacyRegroup.onBotSpawned(eventPlayer, eventSpawner);
        });

        Events.OnVehicleSpawned.subscribe((eventVehicle: mod.Vehicle) => {
            BFSupremacyRegroup.onVehicleSpawned(eventVehicle);
        });

        Events.OnPlayerEnterVehicle.subscribe((eventPlayer: mod.Player, eventVehicle: mod.Vehicle) => {
            let vehicle = mod.GetVehicleFromPlayer(eventPlayer);
            if (GameConfig.gameConfig.stage === 1) {
                if (mod.Equals(vehicle, GameConfig.gameConfig.regroupVehicle)) {
                    if (mod.Not(mod.Equals(eventPlayer, GameConfig.gameConfig.regroupBot))) {
                        if (PlayerVariables.getPlayerData(eventPlayer).spawned) {
                            mod.UndeployPlayer(eventPlayer);
                            mod.DisplayNotificationMessage(mod.Message(mod.stringkeys.regroup.undeploy), eventPlayer);
                        } else if (GameConfig.gameConfig.roundOngoing) {
                            BFSupremacyRegroup.playerBoarding(eventPlayer, eventVehicle);
                        }
                    }
                }
            }
        });

        Events.OnMCOMArmed.subscribe((eventMCOM: mod.MCOM) => {
            GameConfig.gameConfig.overtime += 1;
        });

        Events.OnMCOMDestroyed.subscribe((eventMCOM: mod.MCOM) => {
            BFSupremacyFinalAssault.MCOMDestroyed();
            GameConfig.gameConfig.overtime -= 1;
        });

        Events.OnMCOMDefused.subscribe((eventMCOM: mod.MCOM) => {
            GameConfig.gameConfig.overtime -= 1;
        });

        BFSupremacy.subscribed = true;
    }

}