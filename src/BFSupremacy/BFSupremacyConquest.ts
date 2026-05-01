import { GameConfig } from "./BFSupremacyVariables.ts";
import { BFSupremacyUI } from "./BFSupremacyUI.ts";
import { TeamVariables } from "./BFSupremacyVariables.ts";
import { BFSupremacyCore } from "./BFSupremacyCore.ts";

export class BFSupremacyConquest {
    public static init(): void {
        for (let i = 200; i < 220; i++) {
            let capturePoint = mod.GetCapturePoint(i);
            mod.EnableGameModeObjective(capturePoint, true);
            //mod.SetCapturePointOwner(capturePoint, mod.GetTeam(0));
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
        let t1Control = 0;
        let t2Control = 0;
        let multiplier = 1;

        if (GameConfig.gameConfig.debug) {
            multiplier = 5;
        }

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
            TeamVariables.getTeamData(1).score += (t1Control - t2Control) * multiplier;
        } else if (t2Control > t1Control) {
            TeamVariables.getTeamData(2).score += (t2Control - t1Control) * multiplier;
        }
        mod.SendErrorReport(mod.Message(mod.stringkeys.debug1, TeamVariables.getTeamData(1).score));
        mod.SendErrorReport(mod.Message(mod.stringkeys.debug2, TeamVariables.getTeamData(2).score));
        BFSupremacyUI.conquest_UI_Update();

        if (TeamVariables.getTeamData(1).score >= 100) {
            GameConfig.gameConfig.attacker = mod.GetTeam(1);
            GameConfig.gameConfig.defender = mod.GetTeam(2);
            BFSupremacyCore.changeStage();
        } else if (TeamVariables.getTeamData(2).score >= 100) {
            GameConfig.gameConfig.attacker = mod.GetTeam(2);
            GameConfig.gameConfig.defender = mod.GetTeam(1);
            BFSupremacyCore.changeStage();
        }
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

