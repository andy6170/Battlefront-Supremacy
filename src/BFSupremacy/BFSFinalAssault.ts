import { GameConfig, TeamVariables } from "./BFSVariables.ts";
import { UIconfig } from "./BFSVariables.ts";
import { BFSupremacyUI } from "./BFSUI.ts";
import { BFSupremacyCore } from "./BFSCore.ts";
import { BFSHeliAnimations } from "./BFSHeliAnimations.ts";

export class BFSupremacyFinalAssault {
    public static async init(): Promise<void> {
        mod.EnableGameModeObjective(mod.GetSector(150), false);
        mod.EnableGameModeObjective(mod.GetSector(151), false);
        mod.EnableGameModeObjective(mod.GetSector(152), false);
        GameConfig.gameConfig.remainingTime = GameConfig.gameConfig.baseAttackTime + GameConfig.gameConfig.bonusTime;
        if (GameConfig.gameConfig.debug) {
            GameConfig.gameConfig.remainingTime = 60;
        }
        for (let i = 1; i < 10; i++) {
            mod.EnableHQ(mod.GetHQ(i), false);
        }

        BFSupremacyFinalAssault.manageFinalSector(true);
        BFSupremacyFinalAssault.flagSetup(GameConfig.gameConfig.flagStart);
        BFSupremacyFinalAssault.flagSetup(GameConfig.gameConfig.flagEnd);

        for (let i = 250; i <= 260; i++) {
            let flag = mod.GetCapturePoint(GameConfig.gameConfig.flagStart + i);
            mod.SetCapturePointCapturingTime(flag, GameConfig.gameConfig.finalCaptureTime);
            mod.SetCapturePointNeutralizationTime(flag, GameConfig.gameConfig.finalNeutralizeTime);
            mod.SetMaxCaptureMultiplier(flag, GameConfig.gameConfig.finalCaptureMultiplier);
        }

        let vehicles = mod.AllVehicles();
        for (let i = 0; i < mod.CountOf(vehicles); i++) {
            mod.Kill(mod.ValueInArray(vehicles, i));
        }

        await BFSupremacyUI.changingLocation();


        GameConfig.gameConfig.roundOngoing = true;


    }

    public static flagSetup(id: number): void {
        let flag = mod.GetCapturePoint(id);
        mod.SetCapturePointCapturingTime(flag, GameConfig.gameConfig.finalCaptureTime);
        mod.SetCapturePointNeutralizationTime(flag, GameConfig.gameConfig.finalNeutralizeTime);
        mod.SetMaxCaptureMultiplier(flag, GameConfig.gameConfig.finalCaptureMultiplier);
        mod.EnableCapturePointDeploying(flag, false);

    }

    public static manageFinalSector(enable: boolean): void {
        const attacker = GameConfig.gameConfig.attacker;
        const attackerData = TeamVariables.getTeamData(attacker);
        if (mod.Equals(attacker, mod.GetTeam(1))) {
            if (attackerData.finalSectorBreached == 1) {
                BFSupremacyFinalAssault.team1FinalSectorLevel1(enable);
            } else if (attackerData.finalSectorBreached == 2) {
                BFSupremacyFinalAssault.team1FinalSectorLevel2(enable);
            }
        } else if (mod.Equals(attacker, mod.GetTeam(2))) {
            if (attackerData.finalSectorBreached == 1) {
                BFSupremacyFinalAssault.team2FinalSectorLevel1(enable);
            } else if (attackerData.finalSectorBreached == 2) {
                BFSupremacyFinalAssault.team2FinalSectorLevel2(enable);
            }
        } else {
            mod.SendErrorReport(mod.Message(mod.stringkeys.error_generic))
        }
        BFSupremacyUI.finalAssault_UI_Update();

    }

    public static team1FinalSectorLevel1(enable: boolean): void {
        mod.SetUIWidgetVisible(mod.FindUIWidgetWithName("capturepoint_container_finalAssault"), enable)
        mod.EnableGameModeObjective(mod.GetCapturePoint(250), enable);
        mod.EnableGameModeObjective(mod.GetCapturePoint(251), enable);
        mod.EnableGameModeObjective(mod.GetSector(100), enable);
        mod.EnableGameModeObjective(mod.GetSector(310), enable);
        mod.EnableGameModeObjective(mod.GetSector(410), enable);
        GameConfig.gameConfig.flagStart = 250;
        GameConfig.gameConfig.flagEnd = 251;
        mod.EnableHQ(mod.GetHQ(300), enable);
        mod.EnableHQ(mod.GetHQ(400), enable);
        BFSupremacyUI.capturePoint_UI_Colour_Update(mod.GetCapturePoint(250));
        BFSupremacyUI.capturePoint_UI_Colour_Update(mod.GetCapturePoint(251));
    }

    public static team1FinalSectorLevel2(enable: boolean): void {
        mod.EnableGameModeObjective(mod.GetMCOM(260), enable);
        mod.EnableGameModeObjective(mod.GetMCOM(261), enable);
        mod.EnableGameModeObjective(mod.GetMCOM(262), enable);
        mod.EnableGameModeObjective(mod.GetSector(101), enable);
        mod.EnableGameModeObjective(mod.GetSector(311), enable);
        mod.EnableGameModeObjective(mod.GetSector(411), enable);
        GameConfig.gameConfig.flagStart = 0;
        GameConfig.gameConfig.flagEnd = 0;
        mod.SetMCOMOwner(mod.GetMCOM(260), mod.GetTeam(2));
        mod.SetMCOMOwner(mod.GetMCOM(261), mod.GetTeam(2));
        mod.SetMCOMOwner(mod.GetMCOM(262), mod.GetTeam(2));
        mod.EnableHQ(mod.GetHQ(301), enable);
        mod.EnableHQ(mod.GetHQ(401), enable);
        BFSupremacyUI.capturePoint_UI_Colour_Update(mod.GetCapturePoint(0));
        BFSupremacyUI.capturePoint_UI_Colour_Update(mod.GetCapturePoint(1));
    }

    public static team2FinalSectorLevel1(enable: boolean): void {
        mod.SetUIWidgetVisible(mod.FindUIWidgetWithName("capturepoint_container_finalAssault"), enable)
        mod.EnableGameModeObjective(mod.GetCapturePoint(252), enable);
        mod.EnableGameModeObjective(mod.GetCapturePoint(253), enable);
        mod.EnableGameModeObjective(mod.GetSector(102), enable);
        mod.EnableGameModeObjective(mod.GetSector(312), enable);
        mod.EnableGameModeObjective(mod.GetSector(412), enable);
        GameConfig.gameConfig.flagStart = 252;
        GameConfig.gameConfig.flagEnd = 253;
        mod.EnableHQ(mod.GetHQ(302), enable);
        mod.EnableHQ(mod.GetHQ(402), enable);
        BFSupremacyUI.capturePoint_UI_Colour_Update(mod.GetCapturePoint(252));
        BFSupremacyUI.capturePoint_UI_Colour_Update(mod.GetCapturePoint(253));
    }

    public static team2FinalSectorLevel2(enable: boolean): void {
        mod.EnableGameModeObjective(mod.GetMCOM(263), enable);
        mod.EnableGameModeObjective(mod.GetMCOM(264), enable);
        mod.EnableGameModeObjective(mod.GetMCOM(265), enable);
        mod.EnableGameModeObjective(mod.GetSector(103), enable);
        mod.EnableGameModeObjective(mod.GetSector(313), enable);
        mod.EnableGameModeObjective(mod.GetSector(413), enable);
        GameConfig.gameConfig.flagStart = 0;
        GameConfig.gameConfig.flagEnd = 0;
        mod.SetMCOMOwner(mod.GetMCOM(263), mod.GetTeam(1));
        mod.SetMCOMOwner(mod.GetMCOM(264), mod.GetTeam(1));
        mod.SetMCOMOwner(mod.GetMCOM(265), mod.GetTeam(1));
        mod.EnableHQ(mod.GetHQ(303), enable);
        mod.EnableHQ(mod.GetHQ(403), enable);
        BFSupremacyUI.capturePoint_UI_Colour_Update(mod.GetCapturePoint(0));
        BFSupremacyUI.capturePoint_UI_Colour_Update(mod.GetCapturePoint(1));
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Ongoing final sector
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    public static ongoingFinalAssault(): void {
        if (!GameConfig.gameConfig.roundOngoing) return;

        if (mod.RoundToInteger(mod.GetMatchTimeElapsed()) % 2 == 0) {
            if (GameConfig.gameConfig.timeEven) {
                return;
            }
            GameConfig.gameConfig.timeEven = true;
            GameConfig.gameConfig.timeOdd = false;
            UIconfig.uiConfig.flashStart = true;
            BFSupremacyFinalAssault.updateRemainingTime();
            BFSupremacyUI.finalAssault_UI_Update();

        } else if (mod.RoundToInteger(mod.GetMatchTimeElapsed()) % 2 != 0) {
            if (GameConfig.gameConfig.timeOdd) {
                return;
            }
            GameConfig.gameConfig.timeEven = false;
            GameConfig.gameConfig.timeOdd = true;
            UIconfig.uiConfig.flashStart = true;
            BFSupremacyFinalAssault.updateRemainingTime();
            BFSupremacyUI.finalAssault_UI_Update();
        }

        if (GameConfig.gameConfig.remainingTime <= 0 && GameConfig.gameConfig.overtime == 0) {
            BFSupremacyFinalAssault.returnToConquest();
        }
    }

    public static updateRemainingTime(): void {
        GameConfig.gameConfig.remainingTime -= 1;
        if (GameConfig.gameConfig.remainingTime < 0) {
            GameConfig.gameConfig.remainingTime = 0;
        }
    }

    public static async returnToConquest(): Promise<void> {
        GameConfig.gameConfig.roundOngoing = false;
        GameConfig.gameConfig.cutscene = true;
        BFSupremacyFinalAssault.manageFinalSector(false);

        // Determine ObjIDs based on attacker team
        const isTeam1Attacking = mod.Equals(GameConfig.gameConfig.attacker, mod.GetTeam(1));
        const cameraId = isTeam1Attacking ? 70 : 71;
        const takeoffFromId = isTeam1Attacking ? 904 : 906;
        const takeoffTargetId = isTeam1Attacking ? 905 : 907;

        // Switch all players to the fixed camera
        mod.SetCameraTypeForAll(mod.Cameras.Fixed, cameraId);

        // Spawn heli and pilot using the same spawner IDs as regroup
        GameConfig.gameConfig.regroupVehicleSelected = false;
        GameConfig.gameConfig.regroupBot = undefined;
        GameConfig.gameConfig.regroupVehicle = undefined;
        mod.SpawnAIFromAISpawner(mod.GetSpawner(900), mod.Message(mod.stringkeys.supremacy.regroup.extract), GameConfig.gameConfig.attacker);
        mod.ForceVehicleSpawnerSpawn(mod.GetVehicleSpawner(901));

        // Wait for both bot and vehicle to be set up by BFSRegroup handlers
        while (!GameConfig.gameConfig.regroupVehicleSelected) {
            await mod.Wait(0.1);
        }

        const heli = GameConfig.gameConfig.regroupVehicle;
        if (!heli) return;

        // Teleport heli to the takeoff start position
        const startPos = mod.GetObjectPosition(mod.GetSpatialObject(takeoffFromId));
        const targetPos = mod.GetObjectPosition(mod.GetSpatialObject(takeoffTargetId));
        const dx = mod.XComponentOf(targetPos) - mod.XComponentOf(startPos);
        const dz = mod.ZComponentOf(targetPos) - mod.ZComponentOf(startPos);
        const yaw = Math.atan2(dx, dz);
        mod.Teleport(heli, startPos, yaw);
        await mod.Wait(0.5);

        // Run the takeoff animation
        await BFSHeliAnimations.animateHeliTakeOff(
            heli,
            cameraId,
            takeoffTargetId,
            () => GameConfig.gameConfig.stage === 2
        );

        // Clean up heli
        mod.EnableAllPlayerDeploy(false);
        mod.UndeployAllPlayers();
        BFSupremacyUI.playSwipeTransition();

        await mod.Wait(0.2);
        //mod.SetCameraTypeForAll(mod.Cameras.ThirdPerson);
        GameConfig.gameConfig.cutscene = false;

        // Show 10s countdown then transition to Conquest
        BFSupremacyCore.changeStage();

        mod.Kill(heli);
        GameConfig.gameConfig.regroupBot = undefined;
        GameConfig.gameConfig.regroupVehicle = undefined;
        GameConfig.gameConfig.regroupVehicleSelected = false;
    }



    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Move to final sector level 2
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    public static moveToFinalSectorLevel2(): void {
        GameConfig.gameConfig.roundOngoing = false;
        mod.EnableGameModeObjective(mod.GetCapturePoint(GameConfig.gameConfig.flagStart), false);
        mod.EnableGameModeObjective(mod.GetCapturePoint(GameConfig.gameConfig.flagEnd), false);
        BFSupremacyFinalAssault.manageFinalSector(false);
        if (mod.Equals(GameConfig.gameConfig.attacker, mod.GetTeam(1))) {
            TeamVariables.getTeamData(GameConfig.gameConfig.attacker).finalSectorBreached += 1;
        } else {
            TeamVariables.getTeamData(GameConfig.gameConfig.attacker).finalSectorBreached += 1;
        }
        BFSupremacyFinalAssault.manageFinalSector(true);
        GameConfig.gameConfig.roundOngoing = true;
    }





    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // MCOM destroyed
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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



    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End game
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    public static endGame(winningTeam: mod.Team, camera: number): void {
        GameConfig.gameConfig.roundOngoing = false;
        //mod.SetCameraTypeForAll(mod.Cameras.Fixed, camera);
        mod.EndGameMode(winningTeam);
    }



}