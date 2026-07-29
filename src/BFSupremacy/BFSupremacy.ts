import { Events } from 'bf6-portal-utils/events';
import { BFSupremacyConquest } from './BFSConquest';
import { GameConfig, ObjectiveVariables, PlayerVariables, UIconfig, MCOMVariables } from './BFSVariables';
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
            if (GameConfig.gameConfig.gameStarted as boolean && PlayerVariables.getPlayerData(eventPlayer).cameraEnabled) {
                if (mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsAlive) && !GameConfig.gameConfig.cutscene) {
                    if (mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsZooming)) {
                        if ((PlayerVariables.getPlayerData(eventPlayer).hasSniper && mod.IsInventorySlotActive(eventPlayer, mod.InventorySlots.PrimaryWeapon)) || (PlayerVariables.getPlayerData(eventPlayer).hasLauncher && (mod.IsInventorySlotActive(eventPlayer, mod.InventorySlots.GadgetOne) || mod.IsInventorySlotActive(eventPlayer, mod.InventorySlots.GadgetTwo)) && !PlayerVariables.getPlayerData(eventPlayer).firstPerson)) {
                            mod.SetCameraTypeForPlayer(eventPlayer, mod.Cameras.FirstPerson);
                            PlayerVariables.getPlayerData(eventPlayer).firstPerson = true;
                        } else {
                            let aimWidget = mod.FindUIWidgetWithName("player_aim" + mod.GetObjId(eventPlayer));
                            if (!(PlayerVariables.getPlayerData(eventPlayer).stance == "standing") && mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsStanding)) {
                                mod.SetThirdPersonCameraPositionForPlayer(eventPlayer, 1, 0, 0.25)
                                PlayerVariables.getPlayerData(eventPlayer).stance = "standing"
                                if (aimWidget) mod.SetUIWidgetVisible(aimWidget, true)
                            } else if (!(PlayerVariables.getPlayerData(eventPlayer).stance == "crouching") && mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsCrouching)) {
                                mod.SetThirdPersonCameraPositionForPlayer(eventPlayer, 0.9, -0.15, 0.25)
                                PlayerVariables.getPlayerData(eventPlayer).stance = "crouching"
                                if (aimWidget) mod.SetUIWidgetVisible(aimWidget, true)
                            } else if (!(PlayerVariables.getPlayerData(eventPlayer).stance == "prone") && mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsProne)) {
                                mod.SetThirdPersonCameraPositionForPlayer(eventPlayer, 0.8, -0.25, 0.25)
                                PlayerVariables.getPlayerData(eventPlayer).stance = "prone"
                                if (aimWidget) mod.SetUIWidgetVisible(aimWidget, true)
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
                        mod.SetThirdPersonCameraPositionForPlayer(eventPlayer, 2.5, 0, 0.4)
                        let aimWidget = mod.FindUIWidgetWithName("player_aim" + mod.GetObjId(eventPlayer));
                        if (aimWidget) mod.SetUIWidgetVisible(aimWidget, false)
                    }
                }
            }
        });

        Events.OnGameModeStarted.subscribe(() => {
            mod.SetGameModeTimeLimit(99999);
            if (GameConfig.gameConfig.debug) {
                GameConfig.gameConfig.ticketSpeed = 2;
                GameConfig.gameConfig.capturePointCapturingTime = 4;
                GameConfig.gameConfig.finalCaptureTime = 4;
                GameConfig.gameConfig.finalNeutralizeTime = 4;
            }
            BFSWeather.initWeather();
            BFSupremacyConquest.init();
            BFSupremacyUI.UI_Setup();
            BFSAudio.init();
            //BFSAudio.testMusic();
            BFSupremacyCore.scoreboardInit()
            //mod.SetCameraTypeForAll(mod.Cameras.ThirdPerson);
            GameConfig.gameConfig.extractionIcon = mod.SpawnObject(mod.RuntimeSpawn_Common.FX_Gadget_DeployableMortar_Target_Area, mod.Subtract(mod.GetObjectPosition(mod.GetSpatialObject(902)), mod.CreateVector(0, 20, 0)), mod.CreateVector(0, 0, 0))
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
            BFSAudio.plagFlagCapturedVO(eventCapturePoint);
            let flagID = mod.GetObjId(eventCapturePoint);
            mod.SetMaxCaptureMultiplier(eventCapturePoint, 1);
            if (GameConfig.gameConfig.gameStarted) {
                BFSupremacyUI.capturePoint_UI_Colour_Update(eventCapturePoint);
                BFSupremacyCore.updateFlagData(eventCapturePoint);
                BFSupremacyUI.capturePoint_UI_Alpha_Update(eventCapturePoint);

                let ownerTeam = mod.GetCurrentOwnerTeam(eventCapturePoint);
                let playersOnPoint = mod.GetPlayersOnPoint(eventCapturePoint) as mod.Array;
                for (let i = 0; i < mod.CountOf(playersOnPoint); i++) {
                    let p = mod.ValueInArray(playersOnPoint, i) as mod.Player;
                    if (mod.Equals(mod.GetTeam(p), ownerTeam)) {
                        PlayerVariables.getPlayerData(p).score += 200;
                        PlayerVariables.getPlayerData(p).captures++;
                        BFSupremacyCore.scoreboardUpdate(p);
                        BFSAudio.playCapturedSound(p);
                    }
                }

                if (mod.Equals(GameConfig.gameConfig.stage, 2)) {
                    if (mod.Equals(ownerTeam, GameConfig.gameConfig.attacker) && (flagID >= GameConfig.gameConfig.flagStart && flagID <= GameConfig.gameConfig.flagEnd)) {
                        await BFSupremacyFinalAssault.moveToFinalSectorLevel2();
                    }
                } else {
                    mod.SetCapturePointCapturingTime(eventCapturePoint, GameConfig.gameConfig.capturePointCapturingTime);
                }
                let t1Control = 0;
                let t2Control = 0;

                for (let i = 200; i < 220; i++) {
                    let capturePoint = mod.GetCapturePoint(i);
                    if (mod.IsValid(capturePoint)) {
                        let owner = mod.GetCurrentOwnerTeam(capturePoint);
                        if (mod.Equals(owner, mod.GetTeam(1))) {
                            t1Control++;
                        } else if (mod.Equals(owner, mod.GetTeam(2))) {
                            t2Control++;
                        }
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
            let ownerTeam = mod.GetOwnerProgressTeam(eventCapturePoint);
            let playersOnPoint = mod.GetPlayersOnPoint(eventCapturePoint) as mod.Array;
            for (let i = 0; i < mod.CountOf(playersOnPoint); i++) {
                let p = mod.ValueInArray(playersOnPoint, i) as mod.Player;
                if (mod.Equals(mod.GetTeam(p), ownerTeam)) {
                    PlayerVariables.getPlayerData(p).score += 200;
                    PlayerVariables.getPlayerData(p).captures++;
                    BFSupremacyCore.scoreboardUpdate(p);
                }
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

        Events.OnPlayerEarnedKill.subscribe((eventPlayer: mod.Player, eventOtherPlayer: mod.Player, eventDeathType: mod.DeathType) => {
            PlayerVariables.getPlayerData(eventPlayer).kills++;
            PlayerVariables.getPlayerData(eventPlayer).score += 100;
            if (mod.EventDeathTypeCompare(eventDeathType, mod.PlayerDeathTypes.Headshot)) {
                PlayerVariables.getPlayerData(eventPlayer).score += 10;
            }
            if (PlayerVariables.getPlayerData(eventPlayer).onPoint) {
                PlayerVariables.getPlayerData(eventPlayer).score += 50;
            }
            BFSupremacyCore.scoreboardUpdate(eventPlayer);
        });

        Events.OnPlayerEarnedKillAssist.subscribe((eventPlayer: mod.Player, eventOtherPlayer: mod.Player) => {
            PlayerVariables.getPlayerData(eventPlayer).assists++;
            PlayerVariables.getPlayerData(eventPlayer).score += 50;
            BFSupremacyCore.scoreboardUpdate(eventPlayer);
        });

        Events.OnRevived.subscribe((eventPlayer: mod.Player, eventOtherPlayer: mod.Player) => {
            if (PlayerVariables.getPlayerData(eventPlayer).onPoint) {
                BFSupremacyCore.capturePointPlayers(PlayerVariables.getPlayerData(eventPlayer).currentObjective);
            }
        });

        Events.OnPlayerUndeploy.subscribe(async (eventPlayer: mod.Player) => {
            if (PlayerVariables.getPlayerData(eventPlayer).onPoint) {
                BFSupremacyCore.capturePointPlayers(PlayerVariables.getPlayerData(eventPlayer).currentObjective);
            }
            if (GameConfig.gameConfig.roundOngoing) {
                PlayerVariables.getPlayerData(eventPlayer).deaths++;
                BFSupremacyCore.scoreboardUpdate(eventPlayer);
            }
            await mod.Wait(1);
            PlayerVariables.getPlayerData(eventPlayer).onPoint = false;
            PlayerVariables.getPlayerData(eventPlayer).area = 0;
            PlayerVariables.getPlayerData(eventPlayer).ingoreOOB = false;
        });

        Events.OnPlayerDied.subscribe((eventPlayer: mod.Player, eventOtherPlayer: mod.Player) => {
            if (PlayerVariables.getPlayerData(eventPlayer).onPoint) {
                BFSupremacyCore.capturePointPlayers(PlayerVariables.getPlayerData(eventPlayer).currentObjective);
            }
        });

        Events.OnPlayerLeaveGame.subscribe((playerId: number) => {
        });

        Events.OnPlayerEnterAreaTrigger.subscribe(async (eventPlayer: mod.Player, eventAreaTrigger: mod.AreaTrigger) => {
            PlayerVariables.getPlayerData(eventPlayer).area++;
            if (!mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsAlive)) {
                return;
            }
            PlayerVariables.getPlayerData(eventPlayer).area++;
            let areaID = mod.GetObjId(eventAreaTrigger);
            let team = mod.GetTeam(eventPlayer);

            if (areaID == 1400) {
                PlayerVariables.getPlayerData(eventPlayer).inAirspace = true;
                if (mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsInVehicle)) {
                    if (GameConfig.gameConfig.airVehicles.some(vehicle => mod.CompareVehicleName(mod.GetVehicleFromPlayer(eventPlayer), vehicle))) {
                        PlayerVariables.getPlayerData(eventPlayer).outOfBounds = false;
                    }
                }
            } else if (mod.Equals(team, mod.GetTeam(1))) {
                if (areaID >= 1200 && areaID <= 1299) {
                    BFSupremacyUI.outOfBoundsUI(eventPlayer);
                } else {
                    PlayerVariables.getPlayerData(eventPlayer).outOfBounds = false;
                }
            } else if (mod.Equals(team, mod.GetTeam(2))) {
                if (areaID >= 1100 && areaID <= 1199) {
                    BFSupremacyUI.outOfBoundsUI(eventPlayer);
                } else {
                    PlayerVariables.getPlayerData(eventPlayer).outOfBounds = false;
                }
            }

            //mod.DisplayHighlightedWorldLogMessage(mod.Message(mod.stringkeys.playerTracking, PlayerVariables.getPlayerData(eventPlayer).area))
        });

        Events.OnPlayerExitAreaTrigger.subscribe((eventPlayer: mod.Player, eventAreaTrigger: mod.AreaTrigger) => {
            PlayerVariables.getPlayerData(eventPlayer).area--;
            let areaID = mod.GetObjId(eventAreaTrigger);


            if (areaID == 1400) {
                PlayerVariables.getPlayerData(eventPlayer).inAirspace = false;
                BFSupremacyUI.outOfBoundsUI(eventPlayer);
            }

            if (PlayerVariables.getPlayerData(eventPlayer).inAirspace) {
                if (PlayerVariables.getPlayerData(eventPlayer).area == 1) {
                    if (mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsInVehicle)) {
                        if (GameConfig.gameConfig.airVehicles.some(vehicle => mod.CompareVehicleName(mod.GetVehicleFromPlayer(eventPlayer), vehicle))) {
                            PlayerVariables.getPlayerData(eventPlayer).outOfBounds = false;
                        } else {
                            BFSupremacyUI.outOfBoundsUI(eventPlayer);
                        }
                    } else {
                        BFSupremacyUI.outOfBoundsUI(eventPlayer);
                    }
                }
            } else if (!PlayerVariables.getPlayerData(eventPlayer).inAirspace && PlayerVariables.getPlayerData(eventPlayer).area < 1) {
                BFSupremacyUI.outOfBoundsUI(eventPlayer);
            }

            //mod.DisplayHighlightedWorldLogMessage(mod.Message(mod.stringkeys.playerTracking, PlayerVariables.getPlayerData(eventPlayer).area))
        });

        Events.OnSpawnerSpawned.subscribe((eventPlayer: mod.Player, eventSpawner: mod.Spawner) => {
            BFSupremacyRegroup.onBotSpawned(eventPlayer, eventSpawner);
        });

        Events.OnVehicleSpawned.subscribe((eventVehicle: mod.Vehicle) => {
            BFSupremacyRegroup.onVehicleSpawned(eventVehicle);
        });

        Events.OnPlayerEnterVehicle.subscribe((eventPlayer: mod.Player, eventVehicle: mod.Vehicle) => {
            //mod.SendErrorReport(mod.Message(mod.stringkeys.value, eventPlayer));
            //mod.SendErrorReport(mod.Message(mod.stringkeys.selectedPlayer, GameConfig.gameConfig.regroupBot as mod.Player));

            if (PlayerVariables.getPlayerData(eventPlayer).area > 0) {
                if (GameConfig.gameConfig.airVehicles.some(vehicle => mod.CompareVehicleName(mod.GetVehicleFromPlayer(eventPlayer), vehicle))) {
                    PlayerVariables.getPlayerData(eventPlayer).outOfBounds = false;
                }
            }

            let vehicle = mod.GetVehicleFromPlayer(eventPlayer);

            if (mod.Equals(eventVehicle as mod.Vehicle, GameConfig.gameConfig.regroupVehicle as mod.Vehicle)) {
                //mod.SendErrorReport(mod.Message(mod.stringkeys.eventVehicleMatchesRegroupVehicle));
            } else {
                //mod.SendErrorReport(mod.Message(mod.stringkeys.eventVehicleDoesNotMatch));
            }

            if (mod.Equals(vehicle as mod.Vehicle, GameConfig.gameConfig.regroupVehicle as mod.Vehicle)) {
                //mod.SendErrorReport(mod.Message(mod.stringkeys.playerVehicleIsRegroupVehicle));
            } else {
                //mod.SendErrorReport(mod.Message(mod.stringkeys.playerVehicleIsNotRegroupVehicle));
            }



            if (GameConfig.gameConfig.stage === 1) {
                //mod.SendErrorReport(mod.Message(mod.stringkeys.debugEnterVehicle));
                if (mod.Equals(eventVehicle as mod.Vehicle, GameConfig.gameConfig.regroupVehicle as mod.Vehicle)) {
                    //mod.SendErrorReport(mod.Message(mod.stringkeys.debugRegroupVehicleConfirmed));
                    if (!mod.Equals(eventPlayer as mod.Player, GameConfig.gameConfig.regroupBot as mod.Player)) {
                        //mod.SendErrorReport(mod.Message(mod.stringkeys.debugNotPilot));
                        if (GameConfig.gameConfig.extractReady && !PlayerVariables.getPlayerData(eventPlayer).spawned && !PlayerVariables.getPlayerData(eventPlayer).boarded) {
                            PlayerVariables.getPlayerData(eventPlayer).ingoreOOB = true;
                            PlayerVariables.getPlayerData(eventPlayer).boarded = true;
                            BFSupremacyRegroup.playerBoarding(eventPlayer, eventVehicle);
                        } else if (PlayerVariables.getPlayerData(eventPlayer).spawned || PlayerVariables.getPlayerData(eventPlayer).boarded) {
                            //mod.SendErrorReport(mod.Message(mod.stringkeys.debugFreshSpawn));
                            mod.UndeployPlayer(eventPlayer);
                            //mod.DisplayNotificationMessage(mod.Message(mod.stringkeys.regroup.undeploy), eventPlayer);
                        } else {
                            mod.ForcePlayerExitVehicle(eventPlayer, eventVehicle);
                            //mod.SendErrorReport(mod.Message(mod.stringkeys.debugPlayerRejected));
                        }
                    }
                }
            }
        });

        Events.OnPlayerExitVehicle.subscribe(async (eventPlayer: mod.Player, eventVehicle: mod.Vehicle) => {
            if (!GameConfig.gameConfig.cutscene) {
                //Force Reset the Camera as height can bug out
                if (!mod.Equals(eventVehicle as mod.Vehicle, GameConfig.gameConfig.regroupVehicle as mod.Vehicle)) {
                    mod.SetCameraTypeForPlayer(eventPlayer, mod.Cameras.FirstPerson)
                    mod.SetCameraTypeForPlayer(eventPlayer, mod.Cameras.FirstPerson)
                    mod.SetCameraTypeForPlayer(eventPlayer, mod.Cameras.ThirdPerson)
                }
            }

            if (PlayerVariables.getPlayerData(eventPlayer).inAirspace) {
                if (PlayerVariables.getPlayerData(eventPlayer).area == 1) {
                    BFSupremacyUI.outOfBoundsUI(eventPlayer);
                }
            } else if (!PlayerVariables.getPlayerData(eventPlayer).inAirspace && PlayerVariables.getPlayerData(eventPlayer).area < 1) {
                BFSupremacyUI.outOfBoundsUI(eventPlayer);
            }
        });

        Events.OnMCOMArmed.subscribe((eventMCOM: mod.MCOM) => {
            GameConfig.gameConfig.overtime += 1;
            MCOMVariables.getMCOMData(eventMCOM).isArmed = true;
            BFSupremacyUI.MCOM_UI_Update();
            BFSAudio.MCOMArmedVO(eventMCOM);
            let player = mod.ClosestPlayerTo(mod.GetObjectPosition(eventMCOM), GameConfig.gameConfig.attacker)
            MCOMVariables.getMCOMData(eventMCOM).armedBy = player;
            BFSupremacyPlayer.MCOMScoring(player);
        });

        Events.OnMCOMDestroyed.subscribe((eventMCOM: mod.MCOM) => {
            BFSupremacyFinalAssault.MCOMDestroyed();
            GameConfig.gameConfig.overtime -= 1;
            const data = MCOMVariables.getMCOMData(eventMCOM);
            data.isDestroyed = true;
            data.isArmed = false;
            BFSupremacyUI.MCOM_UI_Update();
            BFSAudio.MCOMDestroyedVO(eventMCOM);
            let player = MCOMVariables.getMCOMData(eventMCOM).armedBy
            if (player) {
                BFSupremacyPlayer.MCOMScoring(player);
            }
        });

        Events.OnMCOMDefused.subscribe((eventMCOM: mod.MCOM) => {
            GameConfig.gameConfig.overtime -= 1;
            MCOMVariables.getMCOMData(eventMCOM).isArmed = false;
            BFSupremacyUI.MCOM_UI_Update();
            BFSAudio.MCOMDefuseVO(eventMCOM);
            let player = mod.ClosestPlayerTo(mod.GetObjectPosition(eventMCOM), GameConfig.gameConfig.defender)
            BFSupremacyPlayer.MCOMScoring(player);
        });

        BFSupremacy.subscribed = true;
    }

}