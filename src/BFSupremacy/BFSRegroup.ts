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
            mod.Teleport(heli, mod.Add(currentPos, mod.Multiply(direction, 0.66)), 0);
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
        GameConfig.gameConfig.extractReady = true;
        while (GameConfig.gameConfig.stage === 1 && GameConfig.gameConfig.extractionRemainingTime > 0) {
            mod.Teleport(heli, targetPos, 0);
            mod.Heal(heli, 10000);
            if (GameConfig.gameConfig.regroupBot) {
                mod.Heal(GameConfig.gameConfig.regroupBot, 500);
            }
            await mod.Wait(0.2);
        }
    }

    public static async animateHeliTakeOff(): Promise<void> {
        const heli = GameConfig.gameConfig.regroupVehicle;
        if (!heli) return;

        const departureTarget = mod.GetSpatialObject(903);
        const departurePos = mod.GetObjectPosition(departureTarget);
        const startPos = mod.GetVehicleState(heli, mod.VehicleStateVector.VehiclePosition);
        if (!startPos) return;



        // Stage 1: Vertical Lift
        const liftTargetY = mod.YComponentOf(startPos) + 40;
        const cameraObject = mod.GetFixedCamera(51);
        const cameraPos = mod.GetObjectPosition(cameraObject);

        while (true) {
            const currentPos = mod.GetVehicleState(heli, mod.VehicleStateVector.VehiclePosition);
            if (mod.YComponentOf(currentPos) >= liftTargetY) break;

            const liftPos = mod.Add(currentPos, mod.CreateVector(0, 0.5, 0));
            mod.Teleport(heli, liftPos, 0);

            let cameraTargetRot = this.getLookAtRotation(cameraPos, currentPos);


            mod.SetObjectTransform(cameraObject, mod.CreateTransform(cameraPos, cameraTargetRot));

            await mod.Wait(0.033);
        }

        // Stage 2: Fly to Target
        while (GameConfig.gameConfig.stage == 1) {
            const currentPos = mod.GetVehicleState(heli, mod.VehicleStateVector.VehiclePosition);
            const dist = mod.DistanceBetween(currentPos, departurePos);
            if (dist < 5) break;

            const direction = mod.DirectionTowards(currentPos, departurePos);
            const movePos = mod.Add(currentPos, mod.Multiply(direction, 1.2));
            mod.Teleport(heli, movePos, 0);

            let cameraTargetRot = this.getLookAtRotation(cameraPos, currentPos);

            mod.SetObjectTransform(cameraObject, mod.CreateTransform(cameraPos, cameraTargetRot));

            await mod.Wait(0.033);
        }
        mod.SetCameraTypeForAll(mod.Cameras.FirstPerson, 0);
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



    public static playerBoarding(player: mod.Player, vehicle: mod.Vehicle): void {
        GameConfig.gameConfig.bonusTime += GameConfig.gameConfig.bonusTimeAddition;
        BFSupremacyUI.regroup_UI_Text_Update();
        mod.ForcePlayerExitVehicle(player, vehicle);
        BFSupremacyCore.waitingArea(player);
        mod.EnableAllInputRestrictions(player, true);
        mod.SetCameraTypeForPlayer(player, mod.Cameras.Fixed, 50);
    }


    public static async ongoingRegroup(): Promise<void> {
        if (!GameConfig.gameConfig.extractReady || GameConfig.gameConfig.heliTakeOff) {
            return
        }
        if (mod.RoundToInteger(mod.GetMatchTimeElapsed()) % 2 == 0) {
            if (GameConfig.gameConfig.timeEven) {
                return;
            }
            GameConfig.gameConfig.timeEven = true;
            GameConfig.gameConfig.timeOdd = false;
            GameConfig.gameConfig.extractionRemainingTime -= 1;
            this.pilotReset();
        }
        else if (mod.RoundToInteger(mod.GetMatchTimeElapsed()) % 2 != 0) {
            if (GameConfig.gameConfig.timeOdd) {
                return;
            }
            GameConfig.gameConfig.timeEven = false;
            GameConfig.gameConfig.timeOdd = true;
            GameConfig.gameConfig.extractionRemainingTime -= 1;
        }
        BFSupremacyUI.regroup_UI_Progress_Update();
        if (GameConfig.gameConfig.extractionRemainingTime <= 0) {
            if (GameConfig.gameConfig.heliTakeOff) return;
            GameConfig.gameConfig.heliTakeOff = true;
            mod.SetCameraTypeForAll(mod.Cameras.Fixed, 51);
            this.animateHeliTakeOff();
        }
    }

    public static async pilotReset(): Promise<void> {
        if (GameConfig.gameConfig.heliTakeOff) return;
        if (GameConfig.gameConfig.regroupBot && GameConfig.gameConfig.regroupVehicle) {
            mod.ForcePlayerExitVehicle(GameConfig.gameConfig.regroupBot, GameConfig.gameConfig.regroupVehicle);
            await mod.Wait(0.1);
            mod.ForcePlayerToSeat(GameConfig.gameConfig.regroupBot, GameConfig.gameConfig.regroupVehicle, -1);
        }
    }

}   
