import { GameConfig } from "./BFSupremacyConfig.ts";

export class BFSupremacyConquest {
    public static init(): void {
        for (let i = 200; i < 220; i++) {
            let capturePoint = mod.GetCapturePoint(i);
            mod.EnableGameModeObjective(capturePoint, true);
            mod.SetCapturePointOwner(capturePoint, mod.GetTeam(3));
            mod.SetCapturePointNeutralizationTime(capturePoint, 0);
            mod.SetCapturePointCapturingTime(capturePoint, 0);
        }
    }
}