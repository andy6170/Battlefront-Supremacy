export class BFSHeliAnimations {
    public static getLookAtRotation(origin: mod.Vector, target: mod.Vector): mod.Vector {
        const dx = mod.XComponentOf(target) - mod.XComponentOf(origin);
        const dy = mod.YComponentOf(target) - mod.YComponentOf(origin);
        const dz = mod.ZComponentOf(target) - mod.ZComponentOf(origin);

        const distanceXZ = Math.sqrt(dx * dx + dz * dz);

        const yaw = Math.atan2(dx, dz);          // left/right
        const pitch = -Math.atan2(dy, distanceXZ); // up/down
        const roll = 0;

        return mod.CreateVector(pitch, yaw, roll);
    }
    public static async animateHeliLanding(
        heli: mod.Vehicle,
        targetSpatialObjId: number,
        isActive: () => boolean,
        cameraObjId?: number,
        startSpatialObjId?: number
    ): Promise<void> {
        const target = mod.GetSpatialObject(targetSpatialObjId);
        const targetPos = mod.GetObjectPosition(target);
        const startPos = startSpatialObjId !== undefined
            ? mod.GetObjectPosition(mod.GetSpatialObject(startSpatialObjId))
            : mod.GetVehicleState(heli, mod.VehicleStateVector.VehiclePosition);
        if (!startPos) return;

        // Calculate direction to target horizontally
        const dx = mod.XComponentOf(targetPos) - mod.XComponentOf(startPos);
        const dz = mod.ZComponentOf(targetPos) - mod.ZComponentOf(startPos);
        const yaw = Math.atan2(dx, dz);

        // Stage 1: Horizontal move to a point above the target
        const hoverPos = mod.CreateVector(mod.XComponentOf(targetPos), mod.YComponentOf(startPos), mod.ZComponentOf(targetPos));

        if (cameraObjId !== undefined) {
            const cameraObject = mod.GetFixedCamera(cameraObjId);
            const cameraPos = mod.GetObjectPosition(cameraObject);

            const startRot = this.getLookAtRotation(cameraPos, startPos);
            mod.SetObjectTransform(cameraObject, mod.CreateTransform(cameraPos, startRot));
            await mod.Wait(1);

            const dist1 = mod.DistanceBetween(startPos, hoverPos);
            const time1 = (dist1 / 0.99) * 0.066;
            const hoverRot = this.getLookAtRotation(cameraPos, hoverPos);
            mod.SetObjectTransformOverTime(cameraObject, mod.CreateTransform(cameraPos, hoverRot), time1, false, false);
        }

        while (mod.GetVehicleState(heli, mod.VehicleStateVector.VehiclePosition) && isActive()) {
            const currentPos = mod.GetVehicleState(heli, mod.VehicleStateVector.VehiclePosition);
            if (!currentPos) break;
            mod.Heal(heli, 10000);
            const distHorizontal = mod.DistanceBetween(
                mod.CreateVector(mod.XComponentOf(currentPos), 0, mod.ZComponentOf(currentPos)),
                mod.CreateVector(mod.XComponentOf(targetPos), 0, mod.ZComponentOf(targetPos))
            );

            if (distHorizontal < 5) break;

            const direction = mod.DirectionTowards(currentPos, hoverPos);
            mod.Teleport(heli, mod.Add(currentPos, mod.Multiply(direction, 0.99)), yaw);
            await mod.Wait(0.033);
        }

        // Stage 2: Landing (Vertical drop)
        if (cameraObjId !== undefined) {
            const cameraObject = mod.GetFixedCamera(cameraObjId);
            const cameraPos = mod.GetObjectPosition(cameraObject);

            const dist2 = mod.DistanceBetween(hoverPos, targetPos);
            const time2 = (dist2 / 0.33) * 0.066;
            const targetRot = this.getLookAtRotation(cameraPos, targetPos);
            mod.SetObjectTransformOverTime(cameraObject, mod.CreateTransform(cameraPos, targetRot), time2, false, false);
        }

        while (mod.GetVehicleState(heli, mod.VehicleStateVector.VehiclePosition) && isActive()) {
            const currentPos = mod.GetVehicleState(heli, mod.VehicleStateVector.VehiclePosition);
            if (!currentPos) break;
            mod.Heal(heli, 10000);
            const dist = mod.DistanceBetween(currentPos, targetPos);

            if (dist < 1) break;

            const direction = mod.DirectionTowards(currentPos, targetPos);
            mod.Teleport(heli, mod.Add(currentPos, mod.Multiply(direction, 0.33)), yaw); // Slower descent
            await mod.Wait(0.033);
        }
    }

    public static async animateHeliTakeOff(
        heli: mod.Vehicle,
        cameraObjId: number,
        departureTargetObjId: number,
        isActive: () => boolean,
        onPilotReset?: () => void
    ): Promise<void> {
        const departureTarget = mod.Add(mod.GetObjectPosition(mod.GetSpatialObject(departureTargetObjId)), mod.CreateVector(0, 1, 0));
        const departurePos = mod.Add(departureTarget, mod.CreateVector(0, 0.3, 0));
        const startPos = mod.GetVehicleState(heli, mod.VehicleStateVector.VehiclePosition);
        const height = mod.Subtract(mod.YComponentOf(departureTarget), mod.YComponentOf(startPos));
        if (!startPos) return;

        // Calculate direction to departure target horizontally
        const dx = mod.XComponentOf(departurePos) - mod.XComponentOf(startPos);
        const dz = mod.ZComponentOf(departurePos) - mod.ZComponentOf(startPos);
        const takeoffYaw = Math.atan2(dx, dz);

        // Stage 1: Vertical Lift
        const liftTargetY = mod.YComponentOf(startPos) + height;
        const cameraObject = mod.GetFixedCamera(cameraObjId);
        const cameraPos = mod.GetObjectPosition(cameraObject);

        const startRot = this.getLookAtRotation(cameraPos, startPos);
        mod.SetObjectTransform(cameraObject, mod.CreateTransform(cameraPos, startRot));

        await mod.Wait(1);
        if (onPilotReset) {
            onPilotReset();
        }

        const liftPos = mod.Add(startPos, mod.CreateVector(0, height, 0));
        const time1 = (height / 0.5) * 0.066;
        const liftRot = this.getLookAtRotation(cameraPos, liftPos);
        mod.SetObjectTransformOverTime(cameraObject, mod.CreateTransform(cameraPos, liftRot), time1, false, false);

        while (mod.GetVehicleState(heli, mod.VehicleStateVector.VehiclePosition)) {
            const currentPos = mod.GetVehicleState(heli, mod.VehicleStateVector.VehiclePosition);
            if (!currentPos || mod.YComponentOf(currentPos) >= liftTargetY) break;

            const nextPos = mod.Add(currentPos, mod.CreateVector(0, 0.5, 0));
            mod.Teleport(heli, nextPos, takeoffYaw);

            await mod.Wait(0.033);
        }

        // Stage 2: Fly to Target
        const time2 = (mod.DistanceBetween(liftPos, departurePos) / 1.2) * 0.066;
        const finalRot = this.getLookAtRotation(cameraPos, departurePos);
        mod.SetObjectTransformOverTime(cameraObject, mod.CreateTransform(cameraPos, finalRot), time2, false, false);

        while (isActive() && mod.GetVehicleState(heli, mod.VehicleStateVector.VehiclePosition)) {
            const currentPos = mod.GetVehicleState(heli, mod.VehicleStateVector.VehiclePosition);
            if (!currentPos) break;
            const dist = mod.DistanceBetween(currentPos, departurePos);
            if (dist < 5) break;

            const direction = mod.DirectionTowards(currentPos, departurePos);
            const movePos = mod.Add(currentPos, mod.Multiply(direction, 1.2));
            mod.Teleport(heli, movePos, takeoffYaw);

            await mod.Wait(0.033);
        }
    }
}
