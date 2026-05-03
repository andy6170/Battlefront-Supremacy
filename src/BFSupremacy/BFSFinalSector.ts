
export class BFSupremacyFinalSector {
    public static init(): void {
        //Change HQs to Final Sectors  


        //Disable all other sectors


        // Team 1 Final Sector



        // Team 2 Final Sector



    }

    public static team1FinalSectorLevel1(): void {
        mod.EnableGameModeObjective(mod.GetCapturePoint(250), true);
        mod.EnableGameModeObjective(mod.GetCapturePoint(251), true);
    }

    public static team1FinalSectorLevel2(): void {

    }

    public static team2FinalSectorLevel1(): void {
        mod.EnableGameModeObjective(mod.GetCapturePoint(252), true);
        mod.EnableGameModeObjective(mod.GetCapturePoint(253), true);
    }

    public static team2FinalSectorLevel2(): void {

    }
}