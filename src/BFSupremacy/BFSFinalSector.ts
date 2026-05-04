import { GameConfig, TeamVariables } from "./BFSVariables.ts";

export class BFSupremacyFinalSector {
    public static init(): void {
        mod.EnableGameModeObjective(mod.GetSector(150), false);
        GameConfig.gameConfig.remainingTime = GameConfig.gameConfig.baseAttackTime + GameConfig.gameConfig.bonusTime;
        for (let i = 1; i < 10; i++) {
            mod.EnableHQ(mod.GetHQ(i), false);
        }

        const attacker = GameConfig.gameConfig.attacker;
        const attackerData = TeamVariables.getTeamData(attacker);

        if (mod.Equals(attacker, mod.GetTeam(1))) {
            if (attackerData.finalSectorBreached == 1) {
                BFSupremacyFinalSector.team1FinalSectorLevel1();
            } else if (attackerData.finalSectorBreached == 2) {
                BFSupremacyFinalSector.team1FinalSectorLevel2();
            }
        } else if (mod.Equals(attacker, mod.GetTeam(2))) {
            if (attackerData.finalSectorBreached == 1) {
                BFSupremacyFinalSector.team2FinalSectorLevel1();
            } else if (attackerData.finalSectorBreached == 2) {
                BFSupremacyFinalSector.team2FinalSectorLevel2();
            }
        }
    }

    public static team1FinalSectorLevel1(): void {
        mod.EnableGameModeObjective(mod.GetCapturePoint(250), true);
        mod.EnableGameModeObjective(mod.GetCapturePoint(251), true);
        mod.EnableGameModeObjective(mod.GetSector(100), true);
        GameConfig.gameConfig.flagStart = 250;
        GameConfig.gameConfig.flagEnd = 251;
        mod.EnableHQ(mod.GetHQ(300), true);
        mod.EnableHQ(mod.GetHQ(400), true);
    }

    public static team1FinalSectorLevel2(): void {
        mod.EnableGameModeObjective(mod.GetMCOM(260), true);
        mod.EnableGameModeObjective(mod.GetMCOM(261), true);
        mod.EnableGameModeObjective(mod.GetSector(101), true);
        GameConfig.gameConfig.flagStart = 0;
        GameConfig.gameConfig.flagEnd = 0;
        mod.SetMCOMOwner(mod.GetMCOM(260), mod.GetTeam(2));
        mod.SetMCOMOwner(mod.GetMCOM(261), mod.GetTeam(2));
        mod.EnableHQ(mod.GetHQ(301), true);
        mod.EnableHQ(mod.GetHQ(401), true);
    }

    public static team2FinalSectorLevel1(): void {
        mod.EnableGameModeObjective(mod.GetCapturePoint(252), true);
        mod.EnableGameModeObjective(mod.GetCapturePoint(253), true);
        mod.EnableGameModeObjective(mod.GetSector(102), true);
        GameConfig.gameConfig.flagStart = 252;
        GameConfig.gameConfig.flagEnd = 253;
        mod.EnableHQ(mod.GetHQ(302), true);
        mod.EnableHQ(mod.GetHQ(402), true);
    }

    public static team2FinalSectorLevel2(): void {
        mod.EnableGameModeObjective(mod.GetMCOM(262), true);
        mod.EnableGameModeObjective(mod.GetMCOM(263), true);
        mod.EnableGameModeObjective(mod.GetSector(103), true);
        GameConfig.gameConfig.flagStart = 0;
        GameConfig.gameConfig.flagEnd = 0;
        mod.SetMCOMOwner(mod.GetMCOM(262), mod.GetTeam(1));
        mod.SetMCOMOwner(mod.GetMCOM(263), mod.GetTeam(1));
        mod.EnableHQ(mod.GetHQ(303), true);
        mod.EnableHQ(mod.GetHQ(403), true);
    }

    public static ongoingFinalAssault(): void {


    }

}