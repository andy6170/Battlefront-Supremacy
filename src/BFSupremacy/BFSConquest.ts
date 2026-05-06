import { GameConfig } from "./BFSVariables.ts";
import { BFSupremacyUI } from "./BFSUI.ts";
import { TeamVariables } from "./BFSVariables.ts";
import { BFSupremacyCore } from "./BFSCore.ts";
import { UIconfig } from "./BFSVariables.ts";

export class BFSupremacyConquest {
    public static init(): void {
        for (let i = 200; i < 220; i++) {
            let capturePoint = mod.GetCapturePoint(i);
            mod.EnableGameModeObjective(capturePoint, true);
            //mod.SetCapturePointOwner(capturePoint, mod.GetTeam(0));
            mod.SetCapturePointNeutralizationTime(capturePoint, GameConfig.gameConfig.capturePointNeutralizationTime);
            mod.SetCapturePointCapturingTime(capturePoint, GameConfig.gameConfig.capturePointCapturingTime);
        }
        let count = 0;
        let allPoints = mod.AllCapturePoints();
        for (let i = 0; i < mod.CountOf(allPoints); i++) {
            let p = mod.ValueInArray(allPoints, i) as mod.Object;
            let id = mod.GetObjId(p);
            if (id >= 200 && id < 220) {
                count++;
            }
        }
        GameConfig.gameConfig.conquestCapturePoints = count;
        for (let i = 250; i < 260; i++) {
            mod.EnableGameModeObjective(mod.GetCapturePoint(i), false);
        }
        for (let i = 260; i < 270; i++) {
            mod.EnableGameModeObjective(mod.GetMCOM(i), false);
        }

        for (let i = 1; i < 10; i++) {
            mod.EnableHQ(mod.GetHQ(i), true);
        }
        for (let i = 300; i < 310; i++) {
            mod.EnableHQ(mod.GetHQ(i), false);
        }
        for (let i = 400; i < 410; i++) {
            mod.EnableHQ(mod.GetHQ(i), false);
        }

        mod.EnableGameModeObjective(mod.GetSector(150), true);
        for (let i = 100; i < 110; i++) {
            mod.EnableGameModeObjective(mod.GetSector(i), false);
        }
    }

    public static ongoingConquest(): void {
        if (!GameConfig.gameConfig.roundOngoing) return;

        BFSupremacyUI.conquest_UI_Flash();
        if (mod.RoundToInteger(mod.GetMatchTimeElapsed()) % 2 == 0) {
            if (GameConfig.gameConfig.timeEven) {
                return;
            }
            GameConfig.gameConfig.timeEven = true;
            GameConfig.gameConfig.timeOdd = false;
            UIconfig.uiConfig.flashStart = true;
        }
        else if (mod.RoundToInteger(mod.GetMatchTimeElapsed()) % 2 != 0) {
            if (GameConfig.gameConfig.timeOdd) {
                return;
            }
            GameConfig.gameConfig.timeEven = false;
            GameConfig.gameConfig.timeOdd = true;
            UIconfig.uiConfig.flashStart = true;
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
            UIconfig.uiConfig.ProgressFlashT1 = true;
            UIconfig.uiConfig.ProgressFlashT2 = false;
        } else if (t2Control > t1Control) {
            TeamVariables.getTeamData(2).score += (t2Control - t1Control) * multiplier;
            UIconfig.uiConfig.ProgressFlashT2 = true;
            UIconfig.uiConfig.ProgressFlashT1 = false;
        } else {
            UIconfig.uiConfig.ProgressFlashT1 = false;
            UIconfig.uiConfig.ProgressFlashT2 = false;
        }
        BFSupremacyUI.conquest_UI_Update();

        if (TeamVariables.getTeamData(1).score >= 100) {
            GameConfig.gameConfig.roundOngoing = false;
            GameConfig.gameConfig.attacker = mod.GetTeam(1);
            GameConfig.gameConfig.defender = mod.GetTeam(2);
            BFSupremacyCore.changeStage();
        } else if (TeamVariables.getTeamData(2).score >= 100) {
            GameConfig.gameConfig.roundOngoing = false;
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

