import { GameConfig, ObjectiveVariables, PlayerVariables, UIconfig, TeamVariables } from "./BFSVariables.ts";
import { BFSupremacyUI } from "./BFSUI.ts";
import { BFSupremacyConquest } from "./BFSConquest.ts";
import { BFSupremacyRegroup } from "./BFSRegroup.ts";
import { BFSupremacyFinalAssault } from "./BFSFinalAssault.ts";
import { BFSAudio } from "./MFSAudio.ts";
import { BFSWeather } from "./BFSWeather.ts";


export class BFSupremacyCore {
    public static init(): void {

    }

    public static async GameModeStarted(): Promise<void> {
        mod.SetGameModeTimeLimit(99999);
        if (GameConfig.gameConfig.debug) {
            GameConfig.gameConfig.ticketSpeed = 2;
            GameConfig.gameConfig.capturePointCapturingTime = 4;
            GameConfig.gameConfig.finalCaptureTime = 4;
            GameConfig.gameConfig.finalNeutralizeTime = 4;
        }
        BFSWeather.initWeather();
        await mod.Wait(0.1);
        await BFSupremacyConquest.init();
        await mod.Wait(0.1);
        BFSupremacyUI.UI_Setup();
        await mod.Wait(0.1);
        BFSAudio.init();
        await mod.Wait(0.1);
        BFSupremacyCore.scoreboardInit()
        await mod.Wait(0.1);
        GameConfig.gameConfig.extractionIcon = mod.SpawnObject(mod.RuntimeSpawn_Common.FX_Gadget_DeployableMortar_Target_Area, mod.Subtract(mod.GetObjectPosition(mod.GetSpatialObject(902)), mod.CreateVector(0, 20, 0)), mod.CreateVector(0, 0, 0))
        await mod.Wait(0.1);
        GameConfig.gameConfig.roundOngoing = true;
        GameConfig.gameConfig.gameStarted = true;
        await mod.Wait(10);
        BFSupremacyUI.ObjectiveUI_Enable(true);
    };

    public static async changeStage(): Promise<void> {
        GameConfig.gameConfig.roundOngoing = false;
        BFSupremacyUI.ObjectiveUI_Enable(false);
        const previousStage = GameConfig.gameConfig.stage;
        GameConfig.gameConfig.stage++;
        if (GameConfig.gameConfig.stage >= 3) {
            GameConfig.gameConfig.stage = 0;
        }

        let stage = GameConfig.gameConfig.stage;

        if (stage == 0) {
            if (GameConfig.gameConfig.nightMap) {
                GameConfig.gameConfig.night = true;
            } else {
                GameConfig.gameConfig.night = false;
            }
            BFSupremacyConquest.resetConquest();
            BFSupremacyConquest.endConquest(true);
            GameConfig.gameConfig.flagStart = 200;
            GameConfig.gameConfig.flagEnd = 220;
            GameConfig.gameConfig.bonusTime = 0;
            if (previousStage === 2) {
                await BFSupremacyUI.changingLocation(true);
            }

        } else if (stage == 1) {
            BFSupremacyConquest.endConquest(false);
            GameConfig.gameConfig.flagStart = 0;
            GameConfig.gameConfig.flagEnd = 0;
            TeamVariables.getTeamData(GameConfig.gameConfig.attacker).attempts++;
            await BFSupremacyUI.conquest_End_UI();
            GameConfig.gameConfig.extractionRemainingTime = GameConfig.gameConfig.extractionTime;
            if (GameConfig.gameConfig.debug) {
                GameConfig.gameConfig.extractionRemainingTime = 20;
            }
            GameConfig.gameConfig.extractReady = false;
            BFSupremacyUI.regroup_UI_Progress_Update();
            BFSupremacyRegroup.spawnHeli();

        } else if (stage == 2) {
            BFSupremacyUI.UI_Update();
            BFSupremacyUI.UI_Change();
            BFSAudio.finalAssaultMusic();
            const players = mod.GetAllPlayers() as mod.Array;
            GameConfig.gameConfig.remainingTime = GameConfig.gameConfig.baseAttackTime + GameConfig.gameConfig.bonusTime;
            BFSupremacyFinalAssault.init();
            if (GameConfig.gameConfig.nightFinalArea) {
                GameConfig.gameConfig.night = true;
            } else {
                GameConfig.gameConfig.night = false;
            }
            for (let i = 0; i < mod.CountOf(players); i++) {
                const player = mod.ValueInArray(players, i);
                BFSWeather.checkNight(player);
                mod.EnableAllInputRestrictions(player, false);
                PlayerVariables.getPlayerData(player).cameraEnabled = true;
                PlayerVariables.getPlayerData(player).onPoint = false;
                PlayerVariables.getPlayerData(player).boarded = false;
                //The conquest area triggers are disabled for the final assault, so no exit events fire for them.
                PlayerVariables.getPlayerData(player).area = 0;
                PlayerVariables.getPlayerData(player).inAirspace = false;
                PlayerVariables.getPlayerData(player).inEnemyHQ = false;
                await mod.Wait(0.033)
            }
        }
        BFSupremacyUI.UI_Update();
        BFSupremacyUI.UI_Change()
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

    public static isSpatialValid(spatial: number | mod.SpatialObject): boolean {
        const obj = typeof spatial === 'number' ? mod.GetSpatialObject(spatial) : spatial;
        if (!obj) return false;
        const pos = mod.GetObjectPosition(obj);
        return !(
            Math.abs(mod.XComponentOf(pos)) < 1 ||
            Math.abs(mod.YComponentOf(pos)) < 1 ||
            Math.abs(mod.ZComponentOf(pos)) < 1
        );
    }

    public static scoreboardInit() {
        mod.SetScoreboardType(mod.ScoreboardType.CustomTwoTeams);
        mod.SetScoreboardColumnNames(mod.Message(mod.stringkeys.scoreboard.score), mod.Message(mod.stringkeys.scoreboard.kills), mod.Message(mod.stringkeys.scoreboard.deaths), mod.Message(mod.stringkeys.scoreboard.assists), mod.Message(mod.stringkeys.scoreboard.captures));
        mod.SetScoreboardColumnWidths(1, 0.5, 0.5, 0.5, 0.7)

    }

    public static scoreboardUpdate(eventPlayer: mod.Player) {
        let score = PlayerVariables.getPlayerData(eventPlayer).score;
        let kills = PlayerVariables.getPlayerData(eventPlayer).kills;
        let deaths = PlayerVariables.getPlayerData(eventPlayer).deaths;
        let assists = PlayerVariables.getPlayerData(eventPlayer).assists;
        let captures = PlayerVariables.getPlayerData(eventPlayer).captures;
        mod.SetScoreboardPlayerValues(eventPlayer, score, kills, deaths, assists, captures);

    }

}