import { GameConfig, ObjectiveVariables, UIconfig } from "./BFSVariables.ts";
import { BFSupremacyUI } from "./BFSUI.ts";
import { BFSupremacyConquest } from "./BFSConquest.ts";
import { BFSupremacyRegroup } from "./BFSRegroup.ts";
import { BFSupremacyFinalSector } from "./BFSFinalSector.ts";


export class BFSupremacyCore {
    public static init(): void {

    }

    public static async changeStage(): Promise<void> {
        GameConfig.gameConfig.roundOngoing = false;
        GameConfig.gameConfig.stage++;
        if (GameConfig.gameConfig.stage >= 3) {
            GameConfig.gameConfig.stage = 0;
        }

        let stage = GameConfig.gameConfig.stage;

        if (stage == 0) {
            BFSupremacyConquest.resetConquest();
            GameConfig.gameConfig.flagStart = 200;
            GameConfig.gameConfig.flagEnd = 220;
            GameConfig.gameConfig.bonusTime = 0;

        } else if (stage == 1) {
            await mod.Wait(3);
            GameConfig.gameConfig.extractionRemainingTime = GameConfig.gameConfig.extractionTime;
            if (GameConfig.gameConfig.debug) {
                GameConfig.gameConfig.extractionRemainingTime = 20;
            }
            GameConfig.gameConfig.extractReady = false;
            BFSupremacyConquest.endConquest();
            GameConfig.gameConfig.flagStart = 0;
            GameConfig.gameConfig.flagEnd = 0;
            BFSupremacyRegroup.spawnHeli();

        } else if (stage == 2) {
            GameConfig.gameConfig.remainingTime = GameConfig.gameConfig.baseAttackTime + GameConfig.gameConfig.bonusTime;
            BFSupremacyFinalSector.init();
        }
        BFSupremacyUI.UI_Change();
        BFSupremacyUI.UI_Update();
    }

    public static ongoingFlagData(eventCapturePoint: mod.CapturePoint): void {
        if (!GameConfig.gameConfig.gameStarted) return;

        let progress = mod.GetCaptureProgress(eventCapturePoint);
        let data = ObjectiveVariables.getObjectiveVariables(eventCapturePoint);
        let previousProgress = data.progress;

        if (!mod.Equals(progress, previousProgress)) {
            BFSupremacyCore.updateFlagData(eventCapturePoint);
        }
    }


    public static updateFlagData(eventCapturePoint: mod.CapturePoint) {

        let progress = mod.GetCaptureProgress(eventCapturePoint);
        let data = ObjectiveVariables.getObjectiveVariables(eventCapturePoint);
        let previousProgress = data.progress;
        let owner = mod.GetCurrentOwnerTeam(eventCapturePoint);

        let colour1 = data.uiTextColour1;
        let colour2 = data.uiTextColour2;
        let bgcolour1 = data.uiBackgroundColour1;
        let bgcolour2 = data.uiBackgroundColour2;
        let message1 = mod.stringkeys.captureProgress.none;
        let message2 = mod.stringkeys.captureProgress.none;
        if (mod.Equals(owner, mod.GetTeam(1))) {
            colour1 = UIconfig.uiConfig.friendlyColour;
            colour2 = UIconfig.uiConfig.enemyColour;
            bgcolour1 = UIconfig.uiConfig.friendlyBGColour;
            bgcolour2 = UIconfig.uiConfig.enemyBGColour;
        } else if (mod.Equals(owner, mod.GetTeam(2))) {
            colour1 = UIconfig.uiConfig.enemyColour;
            colour2 = UIconfig.uiConfig.friendlyColour;
            bgcolour1 = UIconfig.uiConfig.enemyBGColour;
            bgcolour2 = UIconfig.uiConfig.friendlyBGColour;
        } else {
            colour1 = mod.CreateVector(1, 1, 1);
            colour2 = mod.CreateVector(1, 1, 1);
            bgcolour1 = mod.CreateVector(0, 0, 0);
            bgcolour2 = mod.CreateVector(0, 0, 0);
        }

        if (mod.LessThan(progress, 1)) {
            if (mod.Equals(mod.GetOwnerProgressTeam(eventCapturePoint), mod.GetTeam(1))) {
                if (mod.GreaterThan(progress, previousProgress)) {
                    message1 = mod.stringkeys.captureProgress.capturing;
                    message2 = mod.stringkeys.captureProgress.losing;
                } else if (mod.LessThan(progress, previousProgress)) {
                    message1 = mod.stringkeys.captureProgress.losing;
                    message2 = mod.stringkeys.captureProgress.capturing;
                } else {
                    message1 = mod.stringkeys.captureProgress.contested;
                    message2 = mod.stringkeys.captureProgress.contested;
                }
            } else {
                if (mod.GreaterThan(progress, previousProgress)) {
                    message1 = mod.stringkeys.captureProgress.losing;
                    message2 = mod.stringkeys.captureProgress.capturing;
                } else if (mod.LessThan(progress, previousProgress)) {
                    message1 = mod.stringkeys.captureProgress.capturing;
                    message2 = mod.stringkeys.captureProgress.losing;
                } else {
                    message1 = mod.stringkeys.captureProgress.contested;
                    message2 = mod.stringkeys.captureProgress.contested;
                }
            }
        } else {
            if (mod.Equals(owner, mod.GetTeam(1))) {
                message1 = mod.stringkeys.captureProgress.secured;
                message2 = mod.stringkeys.captureProgress.losing;
            } else {
                message1 = mod.stringkeys.captureProgress.losing;
                message2 = mod.stringkeys.captureProgress.secured;
            }
        }

        ObjectiveVariables.setObjectiveVariables(eventCapturePoint, {
            uiTextColour1: colour1,
            uiTextColour2: colour2,
            uiBackgroundColour1: bgcolour1,
            uiBackgroundColour2: bgcolour2,
            uiMessage1: mod.Message(message1),
            uiMessage2: mod.Message(message2),
            previousProgress: previousProgress,
            progress: progress,
            progressSize: mod.CreateVector(220 * progress, 7, 0),
            position: mod.CreateVector(-110 + ((220 * progress) / 2), 200, 0),
            ownerTeam: owner,
            team1Players: data.team1Players,
            team2Players: data.team2Players,
        });
    }

    public static waitingArea(player: mod.Player): void {
        let position = mod.CreateVector(0, 0, 0);
        if (mod.Equals(mod.GetTeam(player), mod.GetTeam(1))) {
            position = mod.GetObjectPosition(mod.GetSpatialObject(950));
        } else if (mod.Equals(mod.GetTeam(player), mod.GetTeam(2))) {
            position = mod.GetObjectPosition(mod.GetSpatialObject(951));
        }
        mod.Teleport(player, position, 0);
    }
}