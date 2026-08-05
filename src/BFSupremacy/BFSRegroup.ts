import { GameConfig, PlayerVariables } from "./BFSVariables.ts";
import { BFSupremacyUI } from "./BFSUI.ts";
import { BFSupremacyCore } from "./BFSCore.ts";
import { BFSWeather } from "./BFSWeather.ts";
import { BFSAudio } from "./MFSAudio.ts";
import { BFSHeliAnimations } from "./BFSHeliAnimations.ts";

export class BFSupremacyRegroup {
    private static lastPilotReset: number = -2;

    public static spawnHeli(): void {
        GameConfig.gameConfig.extractReady = false;
        GameConfig.gameConfig.regroupVehicleSelected = false;
        GameConfig.gameConfig.regroupBot = undefined;
        GameConfig.gameConfig.regroupVehicle = undefined;
        BFSAudio.regroupMusic();
        mod.SpawnAIFromAISpawner(mod.GetSpawner(900), mod.Message(mod.stringkeys.supremacy.regroup.extract), GameConfig.gameConfig.attacker);
        mod.ForceVehicleSpawnerSpawn(mod.GetVehicleSpawner(901));
    }

    public static async onBotSpawned(player: mod.Player, spawner: mod.Spawner): Promise<void> {
        if (mod.GetObjId(spawner) === 900) {
            GameConfig.gameConfig.regroupBot = player;
            await mod.Wait(0.1);
            if (!GameConfig.gameConfig.regroupVehicleSelected) {
                this.checkAndSetup();
                mod.SetPlayerIncomingDamageFactor(player, 0);
                mod.SetPlayerMaxHealth(player, 500);
                mod.EnableAllInputRestrictions(player, true);
            } else {
                const heli = GameConfig.gameConfig.regroupVehicle;
                if (heli) {
                    mod.ForcePlayerToSeat(player, heli, -1);
                    mod.SetPlayerIncomingDamageFactor(player, 0);
                    mod.SetPlayerMaxHealth(player, 500);
                    mod.EnableAllInputRestrictions(player, true);
                }
            }
        }
    }

    public static onVehicleSpawned(vehicle: mod.Vehicle): void {
        if (GameConfig.gameConfig.regroupVehicleSelected) return;
        GameConfig.gameConfig.regroupVehicle = vehicle;
        this.checkAndSetup();
    }

    private static async checkAndSetup(): Promise<void> {
        const bot = GameConfig.gameConfig.regroupBot;
        const heli = GameConfig.gameConfig.regroupVehicle;

        if (bot && heli && !GameConfig.gameConfig.regroupVehicleSelected) {
            GameConfig.gameConfig.regroupVehicleSelected = true;
            await mod.Wait(0.033);
            mod.ForcePlayerToSeat(bot, heli, -1);
            mod.SetVehicleMaxHealthMultiplier(heli, 4);
            mod.Heal(heli, 10000);
            if (GameConfig.gameConfig.stage === 1) {
                this.animateHeli();
            }
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Heli Landing
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    public static async animateHeli(): Promise<void> {
        const heli = GameConfig.gameConfig.regroupVehicle;
        if (!heli) return;

        await BFSHeliAnimations.animateHeliLanding(
            heli,
            902,
            () => GameConfig.gameConfig.stage === 1
        );

        if (!mod.GetVehicleState(heli, mod.VehicleStateVector.VehiclePosition)) return;

        const target = mod.GetSpatialObject(902);
        const targetPos = mod.GetObjectPosition(target);
        const startPos = mod.GetVehicleState(heli, mod.VehicleStateVector.VehiclePosition);
        if (!startPos) return;

        // Calculate direction to target horizontally
        const dx = mod.XComponentOf(targetPos) - mod.XComponentOf(startPos);
        const dz = mod.ZComponentOf(targetPos) - mod.ZComponentOf(startPos);
        const yaw = Math.atan2(dx, dz);

        GameConfig.gameConfig.roundOngoing = true;
        GameConfig.gameConfig.extractReady = true;
        GameConfig.gameConfig.heliTakeOff = false;
        mod.EnableVFX(GameConfig.gameConfig.extractionIcon, true);
        mod.EnableGameModeObjective(mod.GetCapturePoint(910), true);
        mod.SetCapturePointOwner(mod.GetCapturePoint(910), GameConfig.gameConfig.attacker);
        mod.EnableCapturePointDeploying(mod.GetCapturePoint(910), false);
        BFSAudio.oneMinuteVO();
        BFSupremacyUI.extractNotification();
        BFSupremacyUI.regroup_UIMessage_Enable(true);
        while (GameConfig.gameConfig.stage === 1 && GameConfig.gameConfig.extractionRemainingTime > 0 && mod.GetVehicleState(heli, mod.VehicleStateVector.VehiclePosition)) {
            const currentPos = mod.GetVehicleState(heli, mod.VehicleStateVector.VehiclePosition);
            if (currentPos && mod.DistanceBetween(currentPos, targetPos) > 0.5) {
                mod.Teleport(heli, targetPos, yaw);
            }
            mod.Heal(heli, 10000);
            //if (GameConfig.gameConfig.regroupBot) {
            //    mod.Heal(GameConfig.gameConfig.regroupBot, 500);
            //}
            await mod.Wait(0.2);
        }
        const bot = GameConfig.gameConfig.regroupBot;
        if (bot) {
            mod.SetPlayerIncomingDamageFactor(bot, 0);
            mod.SetPlayerMaxHealth(bot, 500);
            mod.EnableAllInputRestrictions(bot, true);
        }
        this.pilotReset();
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Heli Take Off
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    public static async animateHeliTakeOff(): Promise<void> {
        if (GameConfig.gameConfig.heliTakeOff) return;
        GameConfig.gameConfig.heliTakeOff = true;
        GameConfig.gameConfig.roundOngoing = false;
        GameConfig.gameConfig.extractReady = false;
        mod.EnableVFX(GameConfig.gameConfig.extractionIcon, false);
        mod.EnableGameModeObjective(mod.GetCapturePoint(910), false);
        const heli = GameConfig.gameConfig.regroupVehicle;
        if (!heli) return;

        await BFSHeliAnimations.animateHeliTakeOff(
            heli,
            51,
            903,
            () => GameConfig.gameConfig.stage === 1,
            //() => this.pilotReset()
        );

        if (GameConfig.gameConfig.nightFinalArea) {
            GameConfig.gameConfig.night = true;
        } else {
            GameConfig.gameConfig.night = false;
        }

        const players = mod.AllPlayers() as mod.Array;
        for (let i = 0; i < mod.CountOf(players); i++) {
            const player = mod.ValueInArray(players, i);
            BFSWeather.checkNight(player);
        }

        // Determine destination camera and landing points based on attacker team
        const isTeam1Attacking = mod.Equals(GameConfig.gameConfig.attacker, mod.GetTeam(1));
        const landingCameraId = isTeam1Attacking ? 70 : 71;
        const landingTargetId = isTeam1Attacking ? 904 : 906;
        const landingStartId = isTeam1Attacking ? 905 : 907;

        // Switch camera to landing view
        mod.SetCameraTypeForAll(mod.Cameras.Fixed, landingCameraId);

        // Teleport heli to sky position above landing location
        const landingStartPos = mod.GetObjectPosition(mod.GetSpatialObject(landingStartId));
        const landingTargetPos = mod.GetObjectPosition(mod.GetSpatialObject(landingTargetId));
        const dx = mod.XComponentOf(landingTargetPos) - mod.XComponentOf(landingStartPos);
        const dz = mod.ZComponentOf(landingTargetPos) - mod.ZComponentOf(landingStartPos);
        const landingYaw = Math.atan2(dx, dz);

        mod.Teleport(heli, landingStartPos, landingYaw);
        await mod.Wait(0.033);
        mod.Teleport(heli, landingStartPos, landingYaw);

        // Run landing animation at destination (reversed takeoff / landing)
        await BFSHeliAnimations.animateHeliLanding(
            heli,
            landingTargetId,
            () => GameConfig.gameConfig.stage === 1,
            landingCameraId,
            landingStartId
        );

        BFSupremacyUI.playSwipeTransition();

        mod.UndeployAllPlayers();
        mod.EnableAllPlayerDeploy(false);
        await mod.Wait(0.2);
        mod.Teleport(heli, mod.CreateVector(0, 0, 0), landingYaw);
        BFSupremacyCore.changeStage();
        await mod.Wait(1);
        mod.Kill(heli);

        mod.SetCameraTypeForAll(mod.Cameras.ThirdPerson);
        GameConfig.gameConfig.cutscene = false;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Player Boarding Logic
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    public static playerBoarding(player: mod.Player, vehicle: mod.Vehicle): void {
        PlayerVariables.getPlayerData(player).cameraEnabled = false;
        GameConfig.gameConfig.bonusTime += GameConfig.gameConfig.bonusTimeAddition;
        BFSupremacyUI.regroup_UI_Text_Update();
        BFSupremacyUI.regroup_UI_Text_Flash();
        mod.ForcePlayerExitVehicle(player, vehicle);
        BFSupremacyCore.waitingArea(player);
        mod.EnableAllInputRestrictions(player, true);
        mod.SetCameraTypeForPlayer(player, mod.Cameras.Fixed, 50);
        this.pilotReset();
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Ongoing Rule
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    public static ongoingRegroup(): void {
        const elapsed = mod.GetMatchTimeElapsed();
        if (!GameConfig.gameConfig.heliTakeOff && GameConfig.gameConfig.extractionRemainingTime <= 0) {
            if (mod.RoundToInteger(elapsed) % 2 == 0) {
                //this.pilotReset();
            }
            return;
        }
        if (mod.RoundToInteger(elapsed) % 2 == 0) {
            if (GameConfig.gameConfig.timeEven) {
                return;
            }
            GameConfig.gameConfig.timeEven = true;
            GameConfig.gameConfig.timeOdd = false;
            GameConfig.gameConfig.extractionRemainingTime -= 1;
            this.endRegroupCheck();
            //this.pilotReset();
            if (GameConfig.gameConfig.extractionRemainingTime === 30) {
                BFSAudio.thirtySecondsVO();
            }
        }
        else if (mod.RoundToInteger(elapsed) % 2 != 0) {
            if (GameConfig.gameConfig.timeOdd) {
                return;
            }
            GameConfig.gameConfig.timeEven = false;
            GameConfig.gameConfig.timeOdd = true;
            GameConfig.gameConfig.extractionRemainingTime -= 1;
            this.endRegroupCheck();
            if (GameConfig.gameConfig.extractionRemainingTime === 30) {
                BFSAudio.thirtySecondsVO();
            }
        }
        BFSupremacyUI.regroup_UI_Progress_Update();
    }

    public static async pilotReset(): Promise<void> {
        const now = mod.GetMatchTimeElapsed();
        if (now - BFSupremacyRegroup.lastPilotReset < 2) return;
        BFSupremacyRegroup.lastPilotReset = now;

        const heli = GameConfig.gameConfig.regroupVehicle;
        if (!heli) return;

        const bot = GameConfig.gameConfig.regroupBot as mod.Player;

        if (!mod.IsPlayerValid(bot)) {
            GameConfig.gameConfig.regroupBot = undefined;
            mod.SpawnAIFromAISpawner(
                mod.GetSpawner(900),
                mod.Message(mod.stringkeys.supremacy.regroup.extract),
                GameConfig.gameConfig.attacker
            );
            return;
        }

        if (bot && heli) {
            if (mod.IsPlayerValid(bot)) {
                if (mod.GetSoldierState(bot, mod.SoldierStateBool.IsInVehicle)) {
                    mod.ForcePlayerExitVehicle(bot, heli);
                    await mod.Wait(0.1);
                    if (mod.IsPlayerValid(bot)) {
                        mod.ForcePlayerToSeat(bot, heli, -1);
                    }
                }
            }
        }
    }

    public static endRegroupCheck(): void {
        if (GameConfig.gameConfig.extractionRemainingTime <= 0) {
            GameConfig.gameConfig.roundOngoing = false;
            GameConfig.gameConfig.cutscene = true;
            mod.SetCameraTypeForAll(mod.Cameras.Fixed, 51);
            this.animateHeliTakeOff();
        }
    }

}   
