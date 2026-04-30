import { GameConfig } from "./BFSupremacyVariables.ts";
import { BFSupremacyUI } from "./BFSupremacyUI.ts";
import { TeamVariables } from "./BFSupremacyVariables.ts";

export class BFSupremacyConquest {
    public static init(): void {
        for (let i = 200; i < 220; i++) {
            let capturePoint = mod.GetCapturePoint(i);
            mod.EnableGameModeObjective(capturePoint, true);
            mod.SetCapturePointOwner(capturePoint, mod.GetTeam(0));
            mod.SetCapturePointNeutralizationTime(capturePoint, GameConfig.gameConfig.capturePointNeutralizationTime);
            mod.SetCapturePointCapturingTime(capturePoint, GameConfig.gameConfig.capturePointCapturingTime);
        }
    }

    public static ongoingSecondsCheck(): void {
        if (mod.RoundToInteger(mod.GetMatchTimeElapsed()) % 2 == 0) {
            if (GameConfig.gameConfig.timeEven) {
                return;
            }
            GameConfig.gameConfig.timeEven = true;
            GameConfig.gameConfig.timeOdd = false;
        }
        else if (mod.RoundToInteger(mod.GetMatchTimeElapsed()) % 2 != 0) {
            if (GameConfig.gameConfig.timeOdd) {
                return;
            }
            GameConfig.gameConfig.timeEven = false;
            GameConfig.gameConfig.timeOdd = true;
        }
        if (mod.RoundToInteger(mod.GetMatchTimeElapsed()) % GameConfig.gameConfig.ticketSpeed == 0 && !GameConfig.gameConfig.ticketDrained) {
            GameConfig.gameConfig.ticketDrained = true

            this.scoreUpdate();
        } else if (mod.RoundToInteger(mod.GetMatchTimeElapsed()) % GameConfig.gameConfig.ticketSpeed != 0 && GameConfig.gameConfig.ticketDrained) {
            GameConfig.gameConfig.ticketDrained = false
        }
    }

    public static scoreUpdate(): void {
        var t1Control = 0;
        var t2Control = 0;
        for (let i = 200; i < 220; i++) {
            let capturePoint = mod.GetCapturePoint(i);
            let owner = mod.GetCurrentOwnerTeam(capturePoint);
            if (owner == mod.GetTeam(1)) {
                t1Control++;
            } else if (owner == mod.GetTeam(2)) {
                t2Control++;
            }
        }
        if (t1Control > t2Control) {
            TeamVariables.getTeamData(1).score += t1Control - t2Control;
        } else if (t2Control > t1Control) {
            TeamVariables.getTeamData(2).score += t2Control - t1Control;
        }
        BFSupremacyUI.conquest_UI_Update();
    }

    public static resetConquest(): void {
        for (let i = 200; i < 220; i++) {
            let capturePoint = mod.GetCapturePoint(i);
            mod.SetCapturePointOwner(capturePoint, mod.GetTeam(0));
        }
        TeamVariables.getTeamData(1).score = 0;
        TeamVariables.getTeamData(2).score = 0;
        GameConfig.gameConfig.ticketSpeed = 3;
    }

    public static endConquest(): void {
        for (let i = 200; i < 220; i++) {
            let capturePoint = mod.GetCapturePoint(i);
            mod.EnableGameModeObjective(capturePoint, false);
        }
    }

}

