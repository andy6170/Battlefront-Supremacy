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

        Events.OngoingPlayer.subscribe(async (eventPlayer: mod.Player) => {
            if (GameConfig.gameConfig.gameStarted as boolean && PlayerVariables.getPlayerData(eventPlayer).cameraEnabled) {
                if (mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsAlive) && !GameConfig.gameConfig.cutscene) {
                    const pd = PlayerVariables.getPlayerData(eventPlayer);
                    if (pd.interacting) return;
                    const aimWidget = pd.aimWidget;
                    if (mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsInteracting)) {
                        pd.interacting = true;
                        await mod.Wait(0.1);
                        if (mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsReloading) && !pd.reloading) {
                            pd.interacting = false;
                            pd.reloading = true;
                            await mod.Wait(3);
                            pd.reloading = false;
                            return;
                        } else if (!mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsReviving) && !mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsInVehicle) && pd.stance != "ADS") {
                            //pd.interacting = true;
                            pd.stance = "changing";
                            pd.thirdPerson = false;
                            if (pd.shoulder === "left") {
                                pd.shoulder = "right";
                                if (aimWidget) {
                                    mod.SetUIWidgetPosition(aimWidget, GameConfig.gameConfig.shoulderRightUI);
                                }
                            } else if (pd.shoulder === "right") {
                                pd.shoulder = "left";
                                if (aimWidget) {
                                    mod.SetUIWidgetPosition(aimWidget, GameConfig.gameConfig.shoulderLeftUI);
                                }
                            }
                        }
                    }

                    const isZooming = mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsZooming);
                    const specialWeaponActive = (pd.hasSniper && mod.IsInventorySlotActive(eventPlayer, mod.InventorySlots.PrimaryWeapon)) || (pd.hasLauncher && (mod.IsInventorySlotActive(eventPlayer, mod.InventorySlots.GadgetOne) || mod.IsInventorySlotActive(eventPlayer, mod.InventorySlots.GadgetTwo)));
                    const cameraPos = pd.shoulder === "left" ? GameConfig.gameConfig.shoulderLeftCam : GameConfig.gameConfig.shoulderRightCam;
                    const cameraZoom = pd.shoulder === "left" ? GameConfig.gameConfig.shoulderLeftCamZoom : GameConfig.gameConfig.shoulderRightCamZoom;

                    if (isZooming) {
                        if (!pd.firstPerson && specialWeaponActive) {
                            if (aimWidget) mod.SetUIWidgetVisible(aimWidget, false)
                            mod.SetCameraTypeForPlayer(eventPlayer, mod.Cameras.FirstPerson);
                            pd.firstPerson = true;
                            pd.stance = "ADS"
                        } else if (!specialWeaponActive) {
                            if (pd.stance == "ADS") {
                                mod.SetCameraTypeForPlayer(eventPlayer, mod.Cameras.ThirdPerson)
                            }
                            if (mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsStanding) && (pd.stance != "standing" || pd.interacting)) {
                                mod.SetThirdPersonCameraPositionForPlayer(eventPlayer, 1, 0, cameraZoom)
                                pd.stance = "standing"
                                if (aimWidget) mod.SetUIWidgetVisible(aimWidget, true)
                            } else if (mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsCrouching) && (pd.stance != "crouching" || pd.interacting)) {
                                mod.SetThirdPersonCameraPositionForPlayer(eventPlayer, 0.9, -0.15, cameraZoom)
                                pd.stance = "crouching"
                                if (aimWidget) mod.SetUIWidgetVisible(aimWidget, true)
                            } else if (mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsProne) && (pd.stance != "prone" || pd.interacting)) {
                                mod.SetThirdPersonCameraPositionForPlayer(eventPlayer, 0.8, -0.25, cameraZoom)
                                pd.stance = "prone"
                                if (aimWidget) mod.SetUIWidgetVisible(aimWidget, true)
                            }
                        }
                        pd.firstPerson = true;
                        pd.thirdPerson = false;

                    } else if (!isZooming) {
                        const isSprinting = mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsSprinting);
                        pd.firstPerson = false;
                        pd.thirdPerson = true;

                        if (isSprinting) {
                            if (pd.stance !== "sprinting" || pd.interacting) {
                                if (pd.stance === "ADS") {
                                    mod.SetCameraTypeForPlayer(eventPlayer, mod.Cameras.ThirdPerson);
                                }
                                pd.sprinting = true;
                                pd.stance = "sprinting";
                                mod.SetThirdPersonCameraPositionForPlayer(eventPlayer, 2.2, 0, cameraPos);
                                if (aimWidget) mod.SetUIWidgetVisible(aimWidget, false);
                            }
                        } else {
                            if (pd.stance !== "3rdperson" || pd.interacting) {
                                if (pd.stance === "ADS") {
                                    mod.SetCameraTypeForPlayer(eventPlayer, mod.Cameras.ThirdPerson);
                                }
                                pd.sprinting = false;
                                pd.stance = "3rdperson";
                                mod.SetThirdPersonCameraPositionForPlayer(eventPlayer, 2.5, 0, cameraPos);
                                if (aimWidget) mod.SetUIWidgetVisible(aimWidget, false);
                            }
                        }
                    }

                    if (pd.interacting) {
                        await mod.Wait(0.033);
                        pd.interacting = false;
                    }
                }
            }
        });

        Events.OnPlayerInteract.subscribe((eventPlayer: mod.Player, interactPoint: mod.InteractPoint) => {

        });




        Events.OnPlayerExitCapturePoint.subscribe((eventPlayer: mod.Player, eventCapturePoint: mod.CapturePoint) => {
            PlayerVariables.getPlayerData(eventPlayer).onPoint = false;
        });

        Events.OnCapturePointCaptured.subscribe(async (eventCapturePoint: mod.CapturePoint) => {
            await mod.Wait(0.1)
            BFSAudio.plagFlagCapturedVO(eventCapturePoint);
            let flagID = mod.GetObjId(eventCapturePoint);
            mod.SetMaxCaptureMultiplier(eventCapturePoint, 1);
            if (GameConfig.gameConfig.gameStarted) {

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

            if (!mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsInVehicle)) {
                PlayerVariables.getPlayerData(eventPlayer).cameraEnabled = true;
            }

            if (!GameConfig.gameConfig.cutscene && !mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsInVehicle)) {
                //Force Reset the Camera as height can bug out
                await mod.Wait(0.4);
                mod.SetCameraTypeForPlayer(eventPlayer, mod.Cameras.FirstPerson)
                await mod.Wait(0.1);
                if (!GameConfig.gameConfig.cutscene && !mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsInVehicle)) {
                    mod.SetCameraTypeForPlayer(eventPlayer, mod.Cameras.ThirdPerson)
                }
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
            mod.SetCameraTypeForPlayer(eventPlayer, mod.Cameras.ThirdPerson);
            PlayerVariables.getPlayerData(eventPlayer).cameraEnabled = true;
        });

        Events.OnPlayerUndeploy.subscribe(async (eventPlayer: mod.Player) => {
            if (GameConfig.gameConfig.roundOngoing) {
                PlayerVariables.getPlayerData(eventPlayer).deaths++;
                BFSupremacyCore.scoreboardUpdate(eventPlayer);
            }
            await mod.Wait(1);
            const widget = PlayerVariables.getPlayerData(eventPlayer).aimWidget
            if (widget) {
                mod.SetUIWidgetVisible(widget, false);
            }
            PlayerVariables.getPlayerData(eventPlayer).onPoint = false;
            PlayerVariables.getPlayerData(eventPlayer).area = 0;
            PlayerVariables.getPlayerData(eventPlayer).ingoreOOB = false;
        });

        Events.OnPlayerDied.subscribe((eventPlayer: mod.Player, eventOtherPlayer: mod.Player) => {
            if (GameConfig.gameConfig.cutscene) return;

            mod.SetCameraTypeForPlayer(eventPlayer, mod.Cameras.FirstPerson);
            PlayerVariables.getPlayerData(eventPlayer).cameraEnabled = false;
        });

        Events.OnPlayerLeaveGame.subscribe((playerId: number) => {
            const pd = PlayerVariables.playerData.get(playerId);
            if (pd && pd.uiCreated) {
                mod.DeleteUIWidget(pd.containerWidget);
            }
            PlayerVariables.playerData.delete(playerId);
        });

        Events.OnPlayerEnterAreaTrigger.subscribe(async (eventPlayer: mod.Player, eventAreaTrigger: mod.AreaTrigger) => {
            const pd = PlayerVariables.getPlayerData(eventPlayer);
            await mod.Wait(0.033);

            pd.area++;
            if (!mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsAlive)) {
                return;
            }

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
        });

        Events.OnPlayerExitAreaTrigger.subscribe(async (eventPlayer: mod.Player, eventAreaTrigger: mod.AreaTrigger) => {
            await mod.Wait(0.066);
            PlayerVariables.getPlayerData(eventPlayer).area--;
            let areaID = mod.GetObjId(eventAreaTrigger);
            const pd = PlayerVariables.getPlayerData(eventPlayer);

            if (areaID == 1400) {
                pd.inAirspace = false;
                BFSupremacyUI.outOfBoundsUI(eventPlayer);
            }

            if (pd.area == 1 && pd.inAirspace) {
                if (mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsInVehicle)) {
                    if (GameConfig.gameConfig.airVehicles.some(vehicle => mod.CompareVehicleName(mod.GetVehicleFromPlayer(eventPlayer), vehicle))) {
                        pd.outOfBounds = false;
                    } else {
                        BFSupremacyUI.outOfBoundsUI(eventPlayer);
                    }
                } else {
                    BFSupremacyUI.outOfBoundsUI(eventPlayer);
                }
            } else if (pd.area < 1) {
                BFSupremacyUI.outOfBoundsUI(eventPlayer);
            }
        });

        Events.OnSpawnerSpawned.subscribe((eventPlayer: mod.Player, eventSpawner: mod.Spawner) => {
            BFSupremacyRegroup.onBotSpawned(eventPlayer, eventSpawner);
        });

        Events.OnVehicleSpawned.subscribe((eventVehicle: mod.Vehicle) => {
            BFSupremacyRegroup.onVehicleSpawned(eventVehicle);
        });

        Events.OnPlayerEnterVehicle.subscribe(async (eventPlayer: mod.Player, eventVehicle: mod.Vehicle) => {
            await mod.Wait(0.1);
            PlayerVariables.getPlayerData(eventPlayer).cameraEnabled = false;

            if (PlayerVariables.getPlayerData(eventPlayer).area > 0) {
                if (GameConfig.gameConfig.airVehicles.some(vehicle => mod.CompareVehicleName(mod.GetVehicleFromPlayer(eventPlayer), vehicle))) {
                    PlayerVariables.getPlayerData(eventPlayer).outOfBounds = false;
                }
            }

            if (GameConfig.gameConfig.stage === 1) {
                if (mod.Equals(eventVehicle as mod.Vehicle, GameConfig.gameConfig.regroupVehicle as mod.Vehicle)) {
                    if (!mod.Equals(eventPlayer as mod.Player, GameConfig.gameConfig.regroupBot as mod.Player)) {
                        if (GameConfig.gameConfig.extractReady && !PlayerVariables.getPlayerData(eventPlayer).spawned && !PlayerVariables.getPlayerData(eventPlayer).boarded) {
                            PlayerVariables.getPlayerData(eventPlayer).ingoreOOB = true;
                            PlayerVariables.getPlayerData(eventPlayer).boarded = true;
                            BFSupremacyRegroup.playerBoarding(eventPlayer, eventVehicle);
                        } else if (PlayerVariables.getPlayerData(eventPlayer).spawned || PlayerVariables.getPlayerData(eventPlayer).boarded) {
                            mod.UndeployPlayer(eventPlayer);
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
                if (!mod.Equals(eventVehicle as mod.Vehicle, GameConfig.gameConfig.regroupVehicle as mod.Vehicle)) {
                    mod.SetCameraTypeForPlayer(eventPlayer, mod.Cameras.FirstPerson)
                    mod.SetCameraTypeForPlayer(eventPlayer, mod.Cameras.FirstPerson)
                    mod.SetCameraTypeForPlayer(eventPlayer, mod.Cameras.ThirdPerson)
                    PlayerVariables.getPlayerData(eventPlayer).cameraEnabled = true;
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
            BFSAudio.MCOMDestroyedVO(eventMCOM);
            let player = MCOMVariables.getMCOMData(eventMCOM).armedBy
            if (player) {
                BFSupremacyPlayer.MCOMScoring(player);
            }
        });

        Events.OnMCOMDefused.subscribe((eventMCOM: mod.MCOM) => {
            GameConfig.gameConfig.overtime -= 1;
            MCOMVariables.getMCOMData(eventMCOM).isArmed = false;
            BFSAudio.MCOMDefuseVO(eventMCOM);
            let player = mod.ClosestPlayerTo(mod.GetObjectPosition(eventMCOM), GameConfig.gameConfig.defender)
            BFSupremacyPlayer.MCOMScoring(player);
        });

        BFSupremacy.subscribed = true;
    }

}