import { GameConfig } from "./BFSVariables.ts";
import { BFSupremacyUI } from "./BFSUI.ts";
import { BFSupremacyCore } from "./BFSCore.ts";

export class BFSupremacyRegroup {
    public static spawnHeli(): void {
        GameConfig.gameConfig.regroupVehicleSelected = false;
        mod.SpawnAIFromAISpawner(mod.GetSpawner(900), mod.Message(mod.stringkeys.supremacy.regroup.extract), GameConfig.gameConfig.attacker);
        mod.ForceVehicleSpawnerSpawn(mod.GetVehicleSpawner(901));
    }

    public static onBotSpawned(player: mod.Player, spawner: mod.Spawner): void {
        if (mod.GetObjId(spawner) === 900) {
            GameConfig.gameConfig.regroupBot = player;
            this.checkAndSetup();
        }
    }

    public static onVehicleSpawned(vehicle: mod.Vehicle): void {
        if (GameConfig.gameConfig.regroupVehicleSelected) {
            return;
        }
        GameConfig.gameConfig.regroupVehicle = vehicle;
        this.checkAndSetup();
    }

    private static async checkAndSetup(): Promise<void> {
        const bot = GameConfig.gameConfig.regroupBot;
        const heli = GameConfig.gameConfig.regroupVehicle;

        if (bot && heli) {
            GameConfig.gameConfig.regroupVehicleSelected = true;
            await mod.Wait(0.033);
            mod.EnableAllInputRestrictions(bot, true);
            mod.ForcePlayerToSeat(bot, heli, -1);
            mod.SetPlayerMaxHealth(bot, 500);
            mod.Heal(bot, 500);
            mod.SetVehicleMaxHealthMultiplier(heli, 4);
            mod.Heal(heli, 10000);
            this.animateHeli();
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Heli Landing
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    public static async animateHeli(): Promise<void> {
        const heli = GameConfig.gameConfig.regroupVehicle;
        if (!heli) return;

        const target = mod.GetSpatialObject(902);
        const targetPos = mod.GetObjectPosition(target);
        const startPos = mod.GetVehicleState(heli, mod.VehicleStateVector.VehiclePosition);
        if (!startPos) return;

        // Stage 1: Horizontal move to a point above the target
        const hoverPos = mod.CreateVector(mod.XComponentOf(targetPos), mod.YComponentOf(startPos), mod.ZComponentOf(targetPos));

        while (mod.GetVehicleState(heli, mod.VehicleStateVector.VehiclePosition)) {
            const currentPos = mod.GetVehicleState(heli, mod.VehicleStateVector.VehiclePosition);
            const distHorizontal = mod.DistanceBetween(
                mod.CreateVector(mod.XComponentOf(currentPos), 0, mod.ZComponentOf(currentPos)),
                mod.CreateVector(mod.XComponentOf(targetPos), 0, mod.ZComponentOf(targetPos))
            );

            if (distHorizontal < 5) break;

            const direction = mod.DirectionTowards(currentPos, hoverPos);
            mod.Teleport(heli, mod.Add(currentPos, mod.Multiply(direction, 0.99)), 0);
            await mod.Wait(0.033);
        }

        // Stage 2: Landing (Vertical drop)
        while (mod.GetVehicleState(heli, mod.VehicleStateVector.VehiclePosition)) {
            const currentPos = mod.GetVehicleState(heli, mod.VehicleStateVector.VehiclePosition);
            const dist = mod.DistanceBetween(currentPos, targetPos);

            if (dist < 1) break;

            const direction = mod.DirectionTowards(currentPos, targetPos);
            mod.Teleport(heli, mod.Add(currentPos, mod.Multiply(direction, 0.33)), 0); // Slower descent
            await mod.Wait(0.033);
        }
        GameConfig.gameConfig.roundOngoing = true;
        GameConfig.gameConfig.extractReady = true;
        GameConfig.gameConfig.heliTakeOff = false;
        while (GameConfig.gameConfig.stage === 1 && GameConfig.gameConfig.extractionRemainingTime > 0) {
            mod.Teleport(heli, targetPos, 0);
            mod.Heal(heli, 10000);
            if (GameConfig.gameConfig.regroupBot) {
                mod.Heal(GameConfig.gameConfig.regroupBot, 500);
            }
            await mod.Wait(0.1);
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Heli Take Off
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    public static async animateHeliTakeOff(): Promise<void> {
        //GameConfig.gameConfig.roundOngoing = false;
        const heli = GameConfig.gameConfig.regroupVehicle;
        if (!heli) return;

        const departureTarget = mod.GetSpatialObject(903);
        const departurePos = mod.Add(mod.GetObjectPosition(departureTarget), mod.CreateVector(0, 0.3, 0));
        const startPos = mod.GetVehicleState(heli, mod.VehicleStateVector.VehiclePosition);
        if (!startPos) return;



        // Stage 1: Vertical Lift
        const liftTargetY = mod.YComponentOf(startPos) + 40;
        const cameraObject = mod.GetFixedCamera(51);
        const cameraPos = mod.GetObjectPosition(cameraObject);

        const liftPos = mod.Add(startPos, mod.CreateVector(0, 40, 0));
        const time1 = (40 / 0.5) * 0.066;
        const liftRot = this.getLookAtRotation(cameraPos, liftPos);
        mod.SetObjectTransformOverTime(cameraObject, mod.CreateTransform(cameraPos, liftRot), time1, false, false);

        while (true) {
            const currentPos = mod.GetVehicleState(heli, mod.VehicleStateVector.VehiclePosition);
            if (mod.YComponentOf(currentPos) >= liftTargetY) break;

            const nextPos = mod.Add(currentPos, mod.CreateVector(0, 0.5, 0));
            mod.Teleport(heli, nextPos, 0);

            await mod.Wait(0.033);
        }

        // Stage 2: Fly to Target
        const time2 = (mod.DistanceBetween(liftPos, departurePos) / 1.2) * 0.066;
        const finalRot = this.getLookAtRotation(cameraPos, departurePos);
        mod.SetObjectTransformOverTime(cameraObject, mod.CreateTransform(cameraPos, finalRot), time2, false, false);

        while (GameConfig.gameConfig.stage == 1) {
            const currentPos = mod.GetVehicleState(heli, mod.VehicleStateVector.VehiclePosition);
            const dist = mod.DistanceBetween(currentPos, departurePos);
            if (dist < 5) break;

            const direction = mod.DirectionTowards(currentPos, departurePos);
            const movePos = mod.Add(currentPos, mod.Multiply(direction, 1.2));
            mod.Teleport(heli, movePos, 0);

            await mod.Wait(0.033);
        }
        mod.SetCameraTypeForAll(mod.Cameras.FirstPerson, 0);

        const players = mod.AllPlayers();
        for (let i = 1; i < mod.CountOf(players); i++) {
            mod.EnableAllInputRestrictions(mod.ValueInArray(players, i), false);
        }

        mod.UndeployAllPlayers();
        mod.Kill(heli);
        BFSupremacyCore.changeStage();
    }

    private static getLookAtRotation(origin: mod.Vector, target: mod.Vector): mod.Vector {
        const dx = mod.XComponentOf(target) - mod.XComponentOf(origin);
        const dy = mod.YComponentOf(target) - mod.YComponentOf(origin);
        const dz = mod.ZComponentOf(target) - mod.ZComponentOf(origin);

        const distanceXZ = Math.sqrt(dx * dx + dz * dz);
        const pitch = -Math.atan2(dy, distanceXZ);
        const yaw = Math.atan2(dx, dz);

        return mod.CreateVector(pitch, yaw, 0);
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Player Boarding Logic
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    public static playerBoarding(player: mod.Player, vehicle: mod.Vehicle): void {
        GameConfig.gameConfig.bonusTime += GameConfig.gameConfig.bonusTimeAddition;
        BFSupremacyUI.regroup_UI_Text_Update();
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
            mod.SetCameraTypeForAll(mod.Cameras.Fixed, 51);
            this.animateHeliTakeOff();
        }
    }

}   
