import { GameConfig, TeamVariables, PlayerVariables } from "./BFSVariables.ts";
import { UIconfig } from "./BFSVariables.ts";
import { BFSupremacyUI } from "./BFSUI.ts";
import { BFSupremacyCore } from "./BFSCore.ts";
import { BFSHeliAnimations } from "./BFSHeliAnimations.ts";
import { BFSAudio } from "./MFSAudio.ts";

export class BFSupremacyFinalAssault {
    public static async init(): Promise<void> {
        let s150 = mod.GetSector(150);
        if (s150) mod.EnableGameModeObjective(s150, false);
        let s151 = mod.GetSector(151);
        if (s151) mod.EnableGameModeObjective(s151, false);
        let s152 = mod.GetSector(152);
        if (s152) mod.EnableGameModeObjective(s152, false);
        GameConfig.gameConfig.remainingTime = GameConfig.gameConfig.baseAttackTime + GameConfig.gameConfig.bonusTime;
        if (GameConfig.gameConfig.debug) {
            GameConfig.gameConfig.remainingTime = 300;
        }
        for (let i = 1; i < 10; i++) {
            let hq = mod.GetHQ(i);
            if (hq) mod.EnableHQ(hq, false);
        }

        BFSupremacyFinalAssault.manageFinalSector(true);
        BFSupremacyFinalAssault.flagSetup(GameConfig.gameConfig.flagStart);
        BFSupremacyFinalAssault.flagSetup(GameConfig.gameConfig.flagEnd);

        for (let i = 250; i <= 260; i++) {
            let flag = mod.GetCapturePoint(GameConfig.gameConfig.flagStart + i);
            if (flag) {
                mod.SetCapturePointCapturingTime(flag, GameConfig.gameConfig.finalCaptureTime);
                mod.SetCapturePointNeutralizationTime(flag, GameConfig.gameConfig.finalNeutralizeTime);
                mod.SetMaxCaptureMultiplier(flag, GameConfig.gameConfig.finalCaptureMultiplier);
            }
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
        if (flag) {
            mod.SetCapturePointCapturingTime(flag, GameConfig.gameConfig.finalCaptureTime);
            mod.SetCapturePointNeutralizationTime(flag, GameConfig.gameConfig.finalNeutralizeTime);
            mod.SetMaxCaptureMultiplier(flag, GameConfig.gameConfig.finalCaptureMultiplier);
            mod.EnableCapturePointDeploying(flag, false);
        }
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
        let cp250 = mod.GetCapturePoint(250);
        if (cp250) mod.EnableGameModeObjective(cp250, enable);
        let cp251 = mod.GetCapturePoint(251);
        if (cp251) mod.EnableGameModeObjective(cp251, enable);
        let s100 = mod.GetSector(100);
        if (s100) mod.EnableGameModeObjective(s100, enable);
        let s310 = mod.GetSector(310);
        if (s310) mod.EnableGameModeObjective(s310, enable);
        let s410 = mod.GetSector(410);
        if (s410) mod.EnableGameModeObjective(s410, enable);
        GameConfig.gameConfig.flagStart = 250;
        GameConfig.gameConfig.flagEnd = 251;
        let hq300 = mod.GetHQ(300);
        if (hq300) mod.EnableHQ(hq300, enable);
        let hq400 = mod.GetHQ(400);
        if (hq400) mod.EnableHQ(hq400, enable);
        if (cp250) BFSupremacyUI.capturePoint_UI_Colour_Update(cp250);
        if (cp251) BFSupremacyUI.capturePoint_UI_Colour_Update(cp251);
        mod.EnableAreaTrigger(mod.GetAreaTrigger(1001), enable);
        mod.EnableAreaTrigger(mod.GetAreaTrigger(1101), enable);
        mod.EnableAreaTrigger(mod.GetAreaTrigger(1201), enable);
    }

    public static team1FinalSectorLevel2(enable: boolean): void {
        mod.SetUIWidgetVisible(mod.FindUIWidgetWithName("mcom_container"), enable);
        if (enable) {
            BFSupremacyUI.MCOM_UI_Update();
        }

        GameConfig.gameConfig.MCOMStart = 260;

        for (let i = 0; i < 3; i++) {
            let mcom = mod.GetMCOM(GameConfig.gameConfig.MCOMStart + i);
            if (mcom) {
                mod.EnableGameModeObjective(mcom, enable);
                mod.SetMCOMOwner(mcom, mod.GetTeam(2));
            }
        }
        let s101 = mod.GetSector(101);
        if (s101) mod.EnableGameModeObjective(s101, enable);
        let s311 = mod.GetSector(311);
        if (s311) mod.EnableGameModeObjective(s311, enable);
        let s411 = mod.GetSector(411);
        if (s411) mod.EnableGameModeObjective(s411, enable);
        GameConfig.gameConfig.flagStart = 0;
        GameConfig.gameConfig.flagEnd = 0;
        let hq301 = mod.GetHQ(301);
        if (hq301) mod.EnableHQ(hq301, enable);
        let hq401 = mod.GetHQ(401);
        if (hq401) mod.EnableHQ(hq401, enable);
        let cp0 = mod.GetCapturePoint(0);
        if (cp0) BFSupremacyUI.capturePoint_UI_Colour_Update(cp0);
        let cp1 = mod.GetCapturePoint(1);
        if (cp1) BFSupremacyUI.capturePoint_UI_Colour_Update(cp1);
        mod.EnableAreaTrigger(mod.GetAreaTrigger(1002), enable);
        mod.EnableAreaTrigger(mod.GetAreaTrigger(1102), enable);
        mod.EnableAreaTrigger(mod.GetAreaTrigger(1202), enable);
    }

    public static team2FinalSectorLevel1(enable: boolean): void {
        mod.SetUIWidgetVisible(mod.FindUIWidgetWithName("capturepoint_container_finalAssault"), enable)
        let cp252 = mod.GetCapturePoint(252);
        if (cp252) mod.EnableGameModeObjective(cp252, enable);
        let cp253 = mod.GetCapturePoint(253);
        if (cp253) mod.EnableGameModeObjective(cp253, enable);
        let s102 = mod.GetSector(102);
        if (s102) mod.EnableGameModeObjective(s102, enable);
        let s312 = mod.GetSector(312);
        if (s312) mod.EnableGameModeObjective(s312, enable);
        let s412 = mod.GetSector(412);
        if (s412) mod.EnableGameModeObjective(s412, enable);
        GameConfig.gameConfig.flagStart = 252;
        GameConfig.gameConfig.flagEnd = 253;
        let hq302 = mod.GetHQ(302);
        if (hq302) mod.EnableHQ(hq302, enable);
        let hq402 = mod.GetHQ(402);
        if (hq402) mod.EnableHQ(hq402, enable);
        if (cp252) BFSupremacyUI.capturePoint_UI_Colour_Update(cp252);
        if (cp253) BFSupremacyUI.capturePoint_UI_Colour_Update(cp253);
        mod.EnableAreaTrigger(mod.GetAreaTrigger(1003), enable);
        mod.EnableAreaTrigger(mod.GetAreaTrigger(1103), enable);
        mod.EnableAreaTrigger(mod.GetAreaTrigger(1203), enable);
    }

    public static team2FinalSectorLevel2(enable: boolean): void {
        mod.SetUIWidgetVisible(mod.FindUIWidgetWithName("mcom_container"), enable);
        if (enable) {
            BFSupremacyUI.MCOM_UI_Update();
        }

        GameConfig.gameConfig.MCOMStart = 263;

        for (let i = 0; i < 3; i++) {
            let mcom = mod.GetMCOM(GameConfig.gameConfig.MCOMStart + i);
            if (mcom) {
                mod.EnableGameModeObjective(mcom, enable);
                mod.SetMCOMOwner(mcom, mod.GetTeam(1));
            }
        }
        let s103 = mod.GetSector(103);
        if (s103) mod.EnableGameModeObjective(s103, enable);
        let s313 = mod.GetSector(313);
        if (s313) mod.EnableGameModeObjective(s313, enable);
        let s413 = mod.GetSector(413);
        if (s413) mod.EnableGameModeObjective(s413, enable);
        GameConfig.gameConfig.flagStart = 0;
        GameConfig.gameConfig.flagEnd = 0;
        let hq303 = mod.GetHQ(303);
        if (hq303) mod.EnableHQ(hq303, enable);
        let hq403 = mod.GetHQ(403);
        if (hq403) mod.EnableHQ(hq403, enable);
        let cp0 = mod.GetCapturePoint(0);
        if (cp0) BFSupremacyUI.capturePoint_UI_Colour_Update(cp0);
        let cp1 = mod.GetCapturePoint(1);
        if (cp1) BFSupremacyUI.capturePoint_UI_Colour_Update(cp1);
        mod.EnableAreaTrigger(mod.GetAreaTrigger(1004), enable);
        mod.EnableAreaTrigger(mod.GetAreaTrigger(1104), enable);
        mod.EnableAreaTrigger(mod.GetAreaTrigger(1204), enable);
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Ongoing final sector
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    public static ongoingFinalAssault(): void {
        if (!GameConfig.gameConfig.roundOngoing) return;

        const elapsed = mod.GetMatchTimeElapsed();
        const rounded = mod.RoundToInteger(elapsed);
        if (rounded % 2 == 0) {
            if (GameConfig.gameConfig.timeEven) {
                return;
            }
            GameConfig.gameConfig.timeEven = true;
            GameConfig.gameConfig.timeOdd = false;
            UIconfig.uiConfig.flashStart = true;
            BFSupremacyFinalAssault.updateRemainingTime();
            BFSupremacyUI.finalAssault_UI_Update();

        } else if (rounded % 2 != 0) {
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

        if (TeamVariables.getTeamData(GameConfig.gameConfig.attacker).attempts == 3) {
            if (TeamVariables.getTeamData(mod.GetTeam(1)).mcomCount > TeamVariables.getTeamData(mod.GetTeam(2)).mcomCount) {
                mod.EndGameMode(mod.GetTeam(1))
            }
            else if (TeamVariables.getTeamData(mod.GetTeam(1)).mcomCount < TeamVariables.getTeamData(mod.GetTeam(2)).mcomCount) {
                mod.EndGameMode(mod.GetTeam(2))
            }
            else {
                mod.EndGameMode(mod.GetTeam(0))
            }
        }

        GameConfig.gameConfig.roundOngoing = false;
        GameConfig.gameConfig.cutscene = true;
        BFSupremacyFinalAssault.manageFinalSector(false);
        BFSAudio.returnMusic();
        BFSAudio.returnToConquestVO();
        BFSupremacyUI.finalAssault_UI_Change(false);

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

    public static async moveToFinalSectorLevel2(): Promise<void> {
        //GameConfig.gameConfig.roundOngoing = false;
        let cpStart = mod.GetCapturePoint(GameConfig.gameConfig.flagStart);
        if (cpStart) mod.EnableGameModeObjective(cpStart, false);
        let cpEnd = mod.GetCapturePoint(GameConfig.gameConfig.flagEnd);
        if (cpEnd) mod.EnableGameModeObjective(cpEnd, false);
        GameConfig.gameConfig.flagStart = 0;
        GameConfig.gameConfig.flagEnd = 0;

        mod.PauseGameModeTime(true);
        mod.SetUIWidgetVisible(mod.FindUIWidgetWithName("capturepoint_container_finalAssault"), false);
        BFSupremacyFinalAssault.additionalTimeAnimation()
        BFSAudio.finalAssaultMusic();
        await BFSupremacyUI.conquest_End_UI()

        BFSAudio.defencesBreachedVO()

        await mod.Wait(4)

        mod.PauseGameModeTime(false);

        BFSupremacyFinalAssault.manageFinalSector(false);

        TeamVariables.getTeamData(GameConfig.gameConfig.attacker).finalSectorBreached += 1;

        const players = mod.AllPlayers() as mod.Array;
        for (let i = 0; i < mod.CountOf(players); i++) {
            const player = mod.ValueInArray(players, i);
            PlayerVariables.getPlayerData(player).area = 0;
        }
        BFSupremacyFinalAssault.manageFinalSector(true);
        BFSupremacyUI.MCOMNotification();

        BFSAudio.playNextObjective();
        //GameConfig.gameConfig.roundOngoing = true;
    }


    public static async additionalTimeAnimation(): Promise<void> {
        for (let i = 0; i < 180; i += 2) {
            BFSAudio.playCounter();
            GameConfig.gameConfig.remainingTime += 2;
            if (GameConfig.gameConfig.remainingTime > GameConfig.gameConfig.baseAttackTime) {
                GameConfig.gameConfig.remainingTime = GameConfig.gameConfig.baseAttackTime;
            }
            BFSupremacyUI.finalAssault_UI_Update()
            await mod.Wait(0.033);
            if (GameConfig.gameConfig.remainingTime == GameConfig.gameConfig.baseAttackTime) {
                break;
            }
        }

    }





    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // MCOM destroyed
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    public static MCOMDestroyed(): void {
        TeamVariables.getTeamData(GameConfig.gameConfig.defender).mcomCount -= 1
        if (TeamVariables.getTeamData(GameConfig.gameConfig.defender).mcomCount == 0) {
            if (mod.Equals(GameConfig.gameConfig.attacker, mod.GetTeam(1))) {
                this.endGame(mod.GetTeam(1), 60, 800);
            } else {
                this.endGame(mod.GetTeam(2), 61, 810);
            }
        }
    }



    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End game
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    public static async endGame(winningTeam: mod.Team, camera: number, vfxId: number): Promise<void> {
        BFSAudio.endMusic();
        for (let i = 3000; i < 3100; i++) {
            let sfx = mod.GetSFX(i);
            if (sfx) {
                mod.StopSound(sfx);
            }
        }
        GameConfig.gameConfig.roundOngoing = false;
        await mod.Wait(2)
        GameConfig.gameConfig.cutscene = true;
        mod.SetCameraTypeForAll(mod.Cameras.Fixed, camera);
        mod.SetObjectTransformOverTime(mod.GetFixedCamera(camera), mod.CreateTransform(mod.GetObjectPosition(mod.GetSpatialObject(camera + 5)), mod.GetObjectRotation(mod.GetFixedCamera(camera))), 15, false, false);
        await mod.Wait(1);
        mod.EnableVFX(mod.GetVFX(vfxId), true);
        await mod.Wait(1);
        mod.EnableVFX(mod.GetVFX(vfxId + 1), true);
        await mod.Wait(1);
        mod.EnableVFX(mod.GetVFX(vfxId + 2), true);
        await mod.Wait(2);
        mod.EnableVFX(mod.GetVFX(vfxId + 3), true);
        mod.EndGameMode(winningTeam);
    }



}