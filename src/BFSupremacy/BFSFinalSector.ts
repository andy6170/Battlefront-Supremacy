import { GameConfig, TeamVariables } from "./BFSVariables.ts";
import { UIconfig } from "./BFSVariables.ts";
import { BFSupremacyUI } from "./BFSUI.ts";
import { BFSupremacyCore } from "./BFSCore.ts";

export class BFSupremacyFinalSector {
    public static async init(): Promise<void> {
        mod.EnableGameModeObjective(mod.GetSector(150), false);
        GameConfig.gameConfig.remainingTime = GameConfig.gameConfig.baseAttackTime + GameConfig.gameConfig.bonusTime;
        for (let i = 1; i < 10; i++) {
            mod.EnableHQ(mod.GetHQ(i), false);
        }

        BFSupremacyFinalSector.manageFinalSector(true);

        for (let i = 250; i <= 260; i++) {
            let flag = mod.GetCapturePoint(GameConfig.gameConfig.flagStart + i);
            mod.SetCapturePointCapturingTime(flag, GameConfig.gameConfig.finalCaptureTime);
            mod.SetCapturePointNeutralizationTime(flag, GameConfig.gameConfig.finalNeutralizeTime);
            mod.SetMaxCaptureMultiplier(flag, GameConfig.gameConfig.finalCaptureMultiplier);
        }

        await mod.Wait(5);
        GameConfig.gameConfig.roundOngoing = true;


    }

    public static manageFinalSector(enable: boolean): void {
        const attacker = GameConfig.gameConfig.attacker;
        const attackerData = TeamVariables.getTeamData(attacker);
        if (mod.Equals(attacker, mod.GetTeam(1))) {
            if (attackerData.finalSectorBreached == 1) {
                BFSupremacyFinalSector.team1FinalSectorLevel1(enable);
            } else if (attackerData.finalSectorBreached == 2) {
                BFSupremacyFinalSector.team1FinalSectorLevel2(enable);
            }
        } else if (mod.Equals(attacker, mod.GetTeam(2))) {
            if (attackerData.finalSectorBreached == 1) {
                BFSupremacyFinalSector.team2FinalSectorLevel1(enable);
            } else if (attackerData.finalSectorBreached == 2) {
                BFSupremacyFinalSector.team2FinalSectorLevel2(enable);
            }
        }

    }

    public static team1FinalSectorLevel1(enable: boolean): void {
        mod.EnableGameModeObjective(mod.GetCapturePoint(250), enable);
        mod.EnableGameModeObjective(mod.GetCapturePoint(251), enable);
        mod.EnableGameModeObjective(mod.GetSector(100), enable);
        GameConfig.gameConfig.flagStart = 250;
        GameConfig.gameConfig.flagEnd = 251;
        mod.EnableHQ(mod.GetHQ(300), enable);
        mod.EnableHQ(mod.GetHQ(400), enable);
    }

    public static team1FinalSectorLevel2(enable: boolean): void {
        mod.EnableGameModeObjective(mod.GetMCOM(260), enable);
        mod.EnableGameModeObjective(mod.GetMCOM(261), enable);
        mod.EnableGameModeObjective(mod.GetSector(101), enable);
        GameConfig.gameConfig.flagStart = 0;
        GameConfig.gameConfig.flagEnd = 0;
        mod.SetMCOMOwner(mod.GetMCOM(260), mod.GetTeam(2));
        mod.SetMCOMOwner(mod.GetMCOM(261), mod.GetTeam(2));
        mod.EnableHQ(mod.GetHQ(301), enable);
        mod.EnableHQ(mod.GetHQ(401), enable);
    }

    public static team2FinalSectorLevel1(enable: boolean): void {
        mod.EnableGameModeObjective(mod.GetCapturePoint(252), enable);
        mod.EnableGameModeObjective(mod.GetCapturePoint(253), enable);
        mod.EnableGameModeObjective(mod.GetSector(102), enable);
        GameConfig.gameConfig.flagStart = 252;
        GameConfig.gameConfig.flagEnd = 253;
        mod.EnableHQ(mod.GetHQ(302), enable);
        mod.EnableHQ(mod.GetHQ(402), enable);
    }

    public static team2FinalSectorLevel2(enable: boolean): void {
        mod.EnableGameModeObjective(mod.GetMCOM(262), enable);
        mod.EnableGameModeObjective(mod.GetMCOM(263), enable);
        mod.EnableGameModeObjective(mod.GetSector(103), enable);
        GameConfig.gameConfig.flagStart = 0;
        GameConfig.gameConfig.flagEnd = 0;
        mod.SetMCOMOwner(mod.GetMCOM(262), mod.GetTeam(1));
        mod.SetMCOMOwner(mod.GetMCOM(263), mod.GetTeam(1));
        mod.EnableHQ(mod.GetHQ(303), enable);
        mod.EnableHQ(mod.GetHQ(403), enable);
    }

    public static ongoingFinalAssault(): void {
        if (!GameConfig.gameConfig.roundOngoing) return;

        if (mod.RoundToInteger(mod.GetMatchTimeElapsed()) % 2 == 0) {
            if (GameConfig.gameConfig.timeEven) {
                return;
            }
            GameConfig.gameConfig.timeEven = true;
            GameConfig.gameConfig.timeOdd = false;
            UIconfig.uiConfig.flashStart = true;
            GameConfig.gameConfig.remainingTime -= 1;
            BFSupremacyUI.finalAssault_UI_Update();

        } else if (mod.RoundToInteger(mod.GetMatchTimeElapsed()) % 2 != 0) {
            if (GameConfig.gameConfig.timeOdd) {
                return;
            }
            GameConfig.gameConfig.timeEven = false;
            GameConfig.gameConfig.timeOdd = true;
            UIconfig.uiConfig.flashStart = true;
            GameConfig.gameConfig.remainingTime -= 1;
            BFSupremacyUI.finalAssault_UI_Update();
        }

        if (GameConfig.gameConfig.remainingTime <= 0) {
            BFSupremacyFinalSector.returnToConquest();
        }
    }

    public static returnToConquest(): void {
        GameConfig.gameConfig.roundOngoing = false;

        BFSupremacyCore.changeStage()
    }

    public static moveToFinalSectorLevel2(): void {
        GameConfig.gameConfig.roundOngoing = false;
        mod.EnableGameModeObjective(mod.GetCapturePoint(GameConfig.gameConfig.flagStart), false);
        mod.EnableGameModeObjective(mod.GetCapturePoint(GameConfig.gameConfig.flagEnd), false);
        BFSupremacyFinalSector.manageFinalSector(false);
        if (mod.Equals(GameConfig.gameConfig.attacker, mod.GetTeam(1))) {
            TeamVariables.getTeamData(GameConfig.gameConfig.attacker).finalSectorBreached += 1;
        } else {
            TeamVariables.getTeamData(GameConfig.gameConfig.attacker).finalSectorBreached += 1;
        }
        BFSupremacyFinalSector.manageFinalSector(true);
    }

    public static MCOMDestroyed(): void {
        if (mod.Equals(GameConfig.gameConfig.attacker, mod.GetTeam(1))) {
            TeamVariables.getTeamData(GameConfig.gameConfig.attacker).mcomCount -= 1;
            if (TeamVariables.getTeamData(GameConfig.gameConfig.attacker).mcomCount == 0) {
                this.endGame(mod.GetTeam(1), 60);
            }
        } else {
            TeamVariables.getTeamData(GameConfig.gameConfig.defender).mcomCount -= 1;
            if (TeamVariables.getTeamData(GameConfig.gameConfig.defender).mcomCount == 0) {
                this.endGame(mod.GetTeam(2), 61);
            }
        }
    }

    public static endGame(winningTeam: mod.Team, camera: number): void {
        GameConfig.gameConfig.roundOngoing = false;
        mod.SetCameraTypeForAll(mod.Cameras.Fixed, camera);
        mod.EndGameMode(winningTeam);
    }



}