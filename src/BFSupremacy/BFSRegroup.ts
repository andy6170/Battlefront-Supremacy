import { GameConfig, PlayerVariables } from "./BFSVariables.ts";
import { BFSupremacyUI } from "./BFSUI.ts";
import { BFSupremacyCore } from "./BFSCore.ts";
import { BFSWeather } from "./BFSWeather.ts";
import { BFSAudio } from "./MFSAudio.ts";
import { BFSHeliAnimations } from "./BFSHeliAnimations.ts";

export class BFSupremacyRegroup {
    public static spawnHeli(): void {
        GameConfig.gameConfig.extractReady = false;
        GameConfig.gameConfig.regroupVehicleSelected = false;
        GameConfig.gameConfig.regroupBot = undefined;
        GameConfig.gameConfig.regroupVehicle = undefined;
        BFSAudio.regroupMusic();
        mod.SpawnAIFromAISpawner(mod.GetSpawner(900), mod.Message(mod.stringkeys.supremacy.regroup.extract), GameConfig.gameConfig.attacker);
        mod.ForceVehicleSpawnerSpawn(mod.GetVehicleSpawner(901));
    }

    public static onBotSpawned(player: mod.Player, spawner: mod.Spawner): void {
        if (GameConfig.gameConfig.regroupVehicleSelected) return;
        if (mod.GetObjId(spawner) === 900) {
            GameConfig.gameConfig.regroupBot = player;
            this.checkAndSetup();
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
            mod.EnableAllInputRestrictions(bot, true);
            mod.ForcePlayerToSeat(bot, heli, -1);
            //mod.SetPlayerMaxHealth(bot, 500);
            //mod.Heal(bot, 500);
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
        mod.EnableGameModeObjective(mod.GetCapturePoint(904), true);
        mod.SetCapturePointOwner(mod.GetCapturePoint(904), GameConfig.gameConfig.attacker);
        mod.EnableCapturePointDeploying(mod.GetCapturePoint(904), false);
        BFSAudio.regoupVO();
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
        mod.EnableGameModeObjective(mod.GetCapturePoint(904), false);
        const heli = GameConfig.gameConfig.regroupVehicle;
        if (!heli) return;

        await BFSHeliAnimations.animateHeliTakeOff(
            heli,
            51,
            903,
            () => GameConfig.gameConfig.stage === 1,
            () => this.pilotReset()
        );

        BFSupremacyUI.playSwipeTransition();

        mod.UndeployAllPlayers();
        mod.EnableAllPlayerDeploy(false);
        await mod.Wait(0.2);
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
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Ongoing Rule
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    public static ongoingRegroup(): void {
        if (!GameConfig.gameConfig.heliTakeOff && GameConfig.gameConfig.extractionRemainingTime <= 0) {
            if (mod.RoundToInteger(mod.GetMatchTimeElapsed()) % 2 == 0) {
                this.pilotReset();
            }
            return;
        }
        if (mod.RoundToInteger(mod.GetMatchTimeElapsed()) % 2 == 0) {
            if (GameConfig.gameConfig.timeEven) {
                return;
            }
            GameConfig.gameConfig.timeEven = true;
            GameConfig.gameConfig.timeOdd = false;
            GameConfig.gameConfig.extractionRemainingTime -= 1;
            this.endRegroupCheck();
            this.pilotReset();
        }
        else if (mod.RoundToInteger(mod.GetMatchTimeElapsed()) % 2 != 0) {
            if (GameConfig.gameConfig.timeOdd) {
                return;
            }
            GameConfig.gameConfig.timeEven = false;
            GameConfig.gameConfig.timeOdd = true;
            GameConfig.gameConfig.extractionRemainingTime -= 1;
            this.endRegroupCheck();
        }
        BFSupremacyUI.regroup_UI_Progress_Update();
    }

    public static async pilotReset(): Promise<void> {
        if (GameConfig.gameConfig.heliTakeOff) return;
        if (GameConfig.gameConfig.regroupBot && GameConfig.gameConfig.regroupVehicle) {
            mod.ForcePlayerExitVehicle(GameConfig.gameConfig.regroupBot, GameConfig.gameConfig.regroupVehicle);
            await mod.Wait(0.1);
            mod.ForcePlayerToSeat(GameConfig.gameConfig.regroupBot, GameConfig.gameConfig.regroupVehicle, -1);
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
