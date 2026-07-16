import { Events } from 'bf6-portal-utils/events';
import { BFSupremacyConquest } from './BFSConquest';
import { GameConfig, ObjectiveVariables, PlayerVariables, UIconfig } from './BFSVariables';
import { BFSupremacyUI } from './BFSUI';
import { BFSupremacyCore } from './BFSCore';
import { BFSupremacyPlayer } from './BFSPlayer';
import { BFSupremacyRegroup } from './BFSRegroup';
import { BFSupremacyFinalAssault } from './BFSFinalAssault';
import { BFSAudio } from './MFSAudio';
import { BFSWeather } from './BFSWeather';



export class BFSupremacy {
    private static subscribed = false;

    public static init(): void {
        if (BFSupremacy.subscribed) {
            return;
        }

        Events.OngoingGlobal.subscribe(() => {
            if (GameConfig.gameConfig.gameStarted as boolean)
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
            if (GameConfig.gameConfig.gameStarted as boolean) {
                if (mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsAlive) && !GameConfig.gameConfig.cutscene) {
                    if (mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsZooming)) {
                        if ((PlayerVariables.getPlayerData(eventPlayer).hasSniper && mod.IsInventorySlotActive(eventPlayer, mod.InventorySlots.PrimaryWeapon)) || (PlayerVariables.getPlayerData(eventPlayer).hasLauncher && (mod.IsInventorySlotActive(eventPlayer, mod.InventorySlots.GadgetOne) || mod.IsInventorySlotActive(eventPlayer, mod.InventorySlots.GadgetTwo)) && !PlayerVariables.getPlayerData(eventPlayer).firstPerson)) {
                            mod.SetCameraTypeForPlayer(eventPlayer, mod.Cameras.FirstPerson);
                            PlayerVariables.getPlayerData(eventPlayer).firstPerson = true;
                        } else {
                            if (!(PlayerVariables.getPlayerData(eventPlayer).stance == "standing") && mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsStanding)) {
                                mod.SetThirdPersonCameraPositionForPlayer(eventPlayer, 1, 0, 0.25)
                                PlayerVariables.getPlayerData(eventPlayer).stance = "standing"
                                mod.SetUIWidgetVisible(mod.FindUIWidgetWithName("player_aim" + mod.GetObjId(eventPlayer)), true)
                            } else if (!(PlayerVariables.getPlayerData(eventPlayer).stance == "crouching") && mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsCrouching)) {
                                mod.SetThirdPersonCameraPositionForPlayer(eventPlayer, 0.9, -0.1, 0.25)
                                PlayerVariables.getPlayerData(eventPlayer).stance = "crouching"
                                mod.SetUIWidgetVisible(mod.FindUIWidgetWithName("player_aim" + mod.GetObjId(eventPlayer)), true)
                            } else if (!(PlayerVariables.getPlayerData(eventPlayer).stance == "prone") && mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsProne)) {
                                mod.SetThirdPersonCameraPositionForPlayer(eventPlayer, 0.8, -0.2, 0.25)
                                PlayerVariables.getPlayerData(eventPlayer).stance = "prone"
                                mod.SetUIWidgetVisible(mod.FindUIWidgetWithName("player_aim" + mod.GetObjId(eventPlayer)), true)
                            }
                        }
                        PlayerVariables.getPlayerData(eventPlayer).firstPerson = true;
                        PlayerVariables.getPlayerData(eventPlayer).thirdPerson = false;

                    } else if (!mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsZooming) && !PlayerVariables.getPlayerData(eventPlayer).thirdPerson) {
                        PlayerVariables.getPlayerData(eventPlayer).firstPerson = false;
                        PlayerVariables.getPlayerData(eventPlayer).thirdPerson = true;
                        PlayerVariables.getPlayerData(eventPlayer).stance = "3rdperson";
                        //mod.SetCameraTypeForPlayer(eventPlayer, mod.Cameras.ThirdPerson);
                        if ((PlayerVariables.getPlayerData(eventPlayer).hasSniper && mod.IsInventorySlotActive(eventPlayer, mod.InventorySlots.PrimaryWeapon)) || (PlayerVariables.getPlayerData(eventPlayer).hasLauncher && (mod.IsInventorySlotActive(eventPlayer, mod.InventorySlots.GadgetOne) || mod.IsInventorySlotActive(eventPlayer, mod.InventorySlots.GadgetTwo)))) {
                            mod.SetCameraTypeForPlayer(eventPlayer, mod.Cameras.ThirdPerson);
                        }
                        mod.SetThirdPersonCameraPositionForPlayer(eventPlayer, 2, 0, 0.4)
                        mod.SetUIWidgetVisible(mod.FindUIWidgetWithName("player_aim" + mod.GetObjId(eventPlayer)), false)
                    }
                }
            }
        });

        Events.OnGameModeStarted.subscribe(() => {
            mod.SetGameModeTimeLimit(99999);
            BFSupremacyConquest.init();
            BFSWeather.initWeather();
            BFSupremacyUI.UI_Setup();
            BFSAudio.init();
            BFSAudio.testMusic();
            BFSupremacyCore.scoreboardInit()
            //mod.SetCameraTypeForAll(mod.Cameras.ThirdPerson);
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
            PlayerVariables.getPlayerData(eventPlayer).onPoint = true;
            await mod.Wait(0.05);

            BFSupremacyCore.capturePointPlayers(eventCapturePoint);

            PlayerVariables.getPlayerData(eventPlayer).flagTick = 10;

            await BFSupremacyCore.updateFlagData(eventCapturePoint);

            while (PlayerVariables.getPlayerData(eventPlayer).onPoint && GameConfig.gameConfig.roundOngoing) {
                if (mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsAlive) && (flagID >= GameConfig.gameConfig.flagStart && flagID <= GameConfig.gameConfig.flagEnd)) {
                    BFSupremacyPlayer.updatePlayerCaptureUI(eventPlayer, eventCapturePoint);
                    BFSupremacyPlayer.enableCaptureUI(eventPlayer, true);
                    if (PlayerVariables.getPlayerData(eventPlayer).flagTick == 10) {
                        BFSAudio.playTickSound(eventPlayer, flagID, mod.GetTeam(eventPlayer));
                        PlayerVariables.getPlayerData(eventPlayer).flagTick = 0;
                    }
                } else {
                    BFSupremacyPlayer.enableCaptureUI(eventPlayer, false);
                }
                await mod.Wait(0.1);
                PlayerVariables.getPlayerData(eventPlayer).flagTick++;
            }
            BFSupremacyPlayer.enableCaptureUI(eventPlayer, false);
        });

        Events.OnPlayerExitCapturePoint.subscribe((eventPlayer: mod.Player, eventCapturePoint: mod.CapturePoint) => {
            PlayerVariables.getPlayerData(eventPlayer).onPoint = false;
            BFSupremacyCore.capturePointPlayers(eventCapturePoint);
            BFSupremacyCore.updateFlagData(eventCapturePoint);
        });

        Events.OnCapturePointCaptured.subscribe(async (eventCapturePoint: mod.CapturePoint) => {
            await mod.Wait(0.1)
            if (GameConfig.gameConfig.gameStarted) {
                BFSupremacyUI.capturePoint_UI_Colour_Update(eventCapturePoint);
                BFSupremacyCore.updateFlagData(eventCapturePoint);
                BFSupremacyUI.capturePoint_UI_Alpha_Update(eventCapturePoint);

                let ownerTeam = mod.GetCurrentOwnerTeam(eventCapturePoint);
                let playersOnPoint = mod.GetPlayersOnPoint(eventCapturePoint) as mod.Array;
                for (let i = 0; i < mod.CountOf(playersOnPoint); i++) {
                    let p = mod.ValueInArray(playersOnPoint, i) as mod.Player;
                    if (mod.Equals(mod.GetTeam(p), ownerTeam)) {
                        PlayerVariables.getPlayerData(p).score += 300;
                        PlayerVariables.getPlayerData(p).captures++;
                        BFSupremacyCore.scoreboardUpdate(p);
                    }
                }

                if (mod.Equals(GameConfig.gameConfig.stage, 2)) {
                    if (mod.Equals(ownerTeam, GameConfig.gameConfig.attacker)) {
                        await BFSupremacyFinalAssault.moveToFinalSectorLevel2();
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
            if (mod.GetMatchTimeElapsed() < 5) {
                return;
            }
            if (!GameConfig.gameConfig.gameStarted || !GameConfig.gameConfig.roundOngoing) {
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

            if (UIconfig.uiConfig.launchers.some(weapon => mod.HasEquipment(eventPlayer, weapon))) {
                PlayerVariables.getPlayerData(eventPlayer).hasLauncher = true;
            } else {
                PlayerVariables.getPlayerData(eventPlayer).hasLauncher = false;
            }

            if (UIconfig.uiConfig.snipers.some(weapon => mod.HasEquipment(eventPlayer, weapon))) {
                PlayerVariables.getPlayerData(eventPlayer).hasSniper = true;
            } else {
                PlayerVariables.getPlayerData(eventPlayer).hasSniper = false;
            }

            if (!GameConfig.gameConfig.cutscene) {
                //Force Reset the Camera as height can bug out
                mod.SetCameraTypeForPlayer(eventPlayer, mod.Cameras.FirstPerson)
                await mod.Wait(0.8);
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
            PlayerVariables.getPlayerData(eventPlayer).kills++;
            PlayerVariables.getPlayerData(eventPlayer).score += 100;
            if (mod.Equals(eventDeathType, mod.PlayerDamageTypes.Headshot)) {
                PlayerVariables.getPlayerData(eventPlayer).score += 10;
            }
            if (PlayerVariables.getPlayerData(eventPlayer).onPoint) {
                PlayerVariables.getPlayerData(eventPlayer).score += 50;
            }
            BFSupremacyCore.scoreboardUpdate(eventPlayer);
        });

        Events.OnPlayerEarnedKillAssist.subscribe((eventPlayer: mod.Player, eventOtherPlayer: mod.Player) => {
            //PlayerVariables.getPlayerData(eventPlayer).assists++;
            //PlayerVariables.getPlayerData(eventPlayer).score += 50;
            BFSupremacyCore.scoreboardUpdate(eventPlayer);
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
            if (GameConfig.gameConfig.roundOngoing) {
                PlayerVariables.getPlayerData(eventPlayer).deaths++;
                BFSupremacyCore.scoreboardUpdate(eventPlayer);
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
                if (vehicle == GameConfig.gameConfig.regroupVehicle) {
                    if (!(eventPlayer == GameConfig.gameConfig.regroupBot)) {
                        if (PlayerVariables.getPlayerData(eventPlayer).spawned) {
                            mod.UndeployPlayer(eventPlayer);
                            mod.DisplayNotificationMessage(mod.Message(mod.stringkeys.regroup.undeploy), eventPlayer);
                        } else if (GameConfig.gameConfig.extractReady) {
                            BFSupremacyRegroup.playerBoarding(eventPlayer, eventVehicle);
                        } else {
                            mod.ForcePlayerExitVehicle(eventPlayer, eventVehicle);
                        }
                    }
                }
            }
        });

        Events.OnPlayerExitVehicle.subscribe(async (eventPlayer: mod.Player, eventVehicle: mod.Vehicle) => {
            if (!GameConfig.gameConfig.cutscene) {
                //Force Reset the Camera as height can bug out
                if (!(eventVehicle == GameConfig.gameConfig.regroupVehicle)) {
                    mod.SetCameraTypeForPlayer(eventPlayer, mod.Cameras.FirstPerson)
                    mod.SetCameraTypeForPlayer(eventPlayer, mod.Cameras.FirstPerson)
                    mod.SetCameraTypeForPlayer(eventPlayer, mod.Cameras.ThirdPerson)
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