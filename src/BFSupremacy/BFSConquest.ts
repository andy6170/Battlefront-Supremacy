import { GameConfig } from "./BFSVariables.ts";
import { BFSupremacyUI } from "./BFSUI.ts";
import { TeamVariables } from "./BFSVariables.ts";
import { BFSupremacyCore } from "./BFSCore.ts";
import { UIconfig } from "./BFSVariables.ts";
import { BFSAudio } from "./MFSAudio.ts";

export class BFSupremacyConquest {
    public static init(): void {
        if (GameConfig.gameConfig.nightMap) {
            GameConfig.gameConfig.night = true;
        } else {
            GameConfig.gameConfig.night = false;
        }

        for (let i = 200; i < 220; i++) {
            let capturePoint = mod.GetCapturePoint(i);
            if (capturePoint) {
                mod.EnableGameModeObjective(capturePoint, true);
                mod.SetCapturePointNeutralizationTime(capturePoint, GameConfig.gameConfig.capturePointNeutralizationTime);
                mod.SetCapturePointCapturingTime(capturePoint, GameConfig.gameConfig.capturePointCapturingTime);
            }
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
            let capturePoint = mod.GetCapturePoint(i);
            if (capturePoint) {
                mod.EnableGameModeObjective(capturePoint, false);
            }
        }
        for (let i = 260; i < 270; i++) {
            let mcom = mod.GetMCOM(i);
            if (mcom) {
                mod.EnableGameModeObjective(mcom, false);
                mod.SetMCOMFuseTime(mcom, 30);
            }
        }

        for (let i = 1; i < 10; i++) {
            //let hq = mod.GetHQ(i);
            //if (hq) mod.EnableHQ(hq, true);
        }
        for (let i = 300; i < 310; i++) {
            let hq = mod.GetHQ(i);
            if (hq) {
                mod.EnableHQ(hq, false);
            }
        }
        for (let i = 400; i < 410; i++) {
            let hq = mod.GetHQ(i);
            if (hq) {
                mod.EnableHQ(hq, false);
            }
        }

        for (let i = 2000; i < 2500; i++) {
            let vfx = mod.GetVFX(i);
            if (vfx) {
                mod.EnableVFX(vfx, true);
            }
        }

        for (let i = 3000; i < 3100; i++) {
            let sfx = mod.GetSFX(i);
            if (sfx) {
                mod.PlaySound(sfx, 1, mod.GetObjectPosition(sfx), 100);
            }
        }

        for (let i = 1001; i < 1020; i++) {
            let areaTrigger = mod.GetAreaTrigger(i);
            if (areaTrigger) {
                mod.EnableAreaTrigger(areaTrigger, false);
            }
        }

        for (let i = 1101; i < 1120; i++) {
            let areaTrigger = mod.GetAreaTrigger(i);
            if (areaTrigger) {
                mod.EnableAreaTrigger(areaTrigger, false);
            }
        }

        for (let i = 1201; i < 1220; i++) {
            let areaTrigger = mod.GetAreaTrigger(i);
            if (areaTrigger) {
                mod.EnableAreaTrigger(areaTrigger, false);
            }
        }


        let s150 = mod.GetSector(150);
        if (s150) mod.EnableGameModeObjective(s150, true);
        let s151 = mod.GetSector(151);
        if (s151) mod.EnableGameModeObjective(s151, true);
        let s152 = mod.GetSector(152);
        if (s152) mod.EnableGameModeObjective(s152, true);
        let cp910 = mod.GetCapturePoint(910);
        if (cp910) mod.EnableGameModeObjective(cp910, false);
        for (let i = 100; i < 110; i++) {
            let sector = mod.GetSector(i);
            if (sector) {
                mod.EnableGameModeObjective(sector, false);
            }
        }
        for (let i = 310; i < 330; i++) {
            let sector = mod.GetSector(i);
            if (sector) {
                mod.EnableGameModeObjective(sector, false);
            }
        }
        for (let i = 410; i < 430; i++) {
            let sector = mod.GetSector(i);
            if (sector) {
                mod.EnableGameModeObjective(sector, false);
            }
        }
    }

    public static ongoingConquest(): void {
        if (!GameConfig.gameConfig.roundOngoing) return;

        const elapsed = mod.GetMatchTimeElapsed();
        BFSupremacyUI.conquest_UI_Flash();
        if (mod.RoundToInteger(elapsed) % 2 == 0) {
            if (GameConfig.gameConfig.timeEven) {
                return;
            }
            GameConfig.gameConfig.timeEven = true;
            GameConfig.gameConfig.timeOdd = false;
            UIconfig.uiConfig.flashStart = true;
        }
        else if (mod.RoundToInteger(elapsed) % 2 != 0) {
            if (GameConfig.gameConfig.timeOdd) {
                return;
            }
            GameConfig.gameConfig.timeEven = false;
            GameConfig.gameConfig.timeOdd = true;
            UIconfig.uiConfig.flashStart = true;
        }

        if (mod.RoundToInteger(elapsed) % GameConfig.gameConfig.ticketSpeed == 0 && !GameConfig.gameConfig.ticketDrained) {
            GameConfig.gameConfig.ticketDrained = true
            this.scoreUpdate();

        } else if (mod.RoundToInteger(elapsed) % GameConfig.gameConfig.ticketSpeed != 0 && GameConfig.gameConfig.ticketDrained) {
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

        if (TeamVariables.getTeamData(1).score > TeamVariables.getTeamData(2).score && (GameConfig.gameConfig.winning != 1)) {
            GameConfig.gameConfig.winning = 1;
            BFSAudio.winningVO(mod.GetTeam(1));
        } else if (TeamVariables.getTeamData(1).score < TeamVariables.getTeamData(2).score && (GameConfig.gameConfig.winning != 2)) {
            GameConfig.gameConfig.winning = 2;
            BFSAudio.winningVO(mod.GetTeam(2));
        }

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

    public static async resetConquest(): Promise<void> {
        GameConfig.gameConfig.winning = 0;
        let s150 = mod.GetSector(150);
        if (s150) mod.EnableGameModeObjective(s150, true);
        let s151 = mod.GetSector(151);
        if (s151) mod.EnableGameModeObjective(s151, true);
        let s152 = mod.GetSector(152);
        if (s152) mod.EnableGameModeObjective(s152, true);
        for (let i = 1; i < 10; i++) {
            let hq = mod.GetHQ(i);
            if (hq) mod.EnableHQ(hq, true);
        }
        for (let i = 200; i < 220; i++) {
            let capturePoint = mod.GetCapturePoint(i);
            if (capturePoint) {
                mod.EnableGameModeObjective(capturePoint, true);
                mod.SetCapturePointOwner(capturePoint, mod.GetTeam(3));
                mod.SetCapturePointNeutralizationTime(capturePoint, GameConfig.gameConfig.capturePointNeutralizationTime);
                mod.SetCapturePointCapturingTime(capturePoint, GameConfig.gameConfig.capturePointCapturingTime);
            }
        }

        await mod.Wait(1)

        for (let i = 200; i < 220; i++) {
            let capturePoint = mod.GetCapturePoint(i);
            if (capturePoint) {
                mod.SetCapturePointNeutralizationTime(capturePoint, GameConfig.gameConfig.capturePointNeutralizationTime);
                mod.SetCapturePointCapturingTime(capturePoint, GameConfig.gameConfig.capturePointCapturingTime);
            }
        }
        TeamVariables.getTeamData(1).score = 0;
        TeamVariables.getTeamData(2).score = 0;
        GameConfig.gameConfig.ticketSpeed = 3;
        GameConfig.gameConfig.roundOngoing = true;
        //mod.EnableAllPlayerDeploy(true);
    }

    public static endConquest(): void {
        for (let i = 200; i < 220; i++) {
            let capturePoint = mod.GetCapturePoint(i);
            if (capturePoint) {
                mod.EnableGameModeObjective(capturePoint, false);
            }
        }
    }

}

