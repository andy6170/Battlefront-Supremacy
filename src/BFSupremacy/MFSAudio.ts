import { ObjectiveVariables, GameConfig, TeamVariables } from "./BFSVariables";

export class BFSAudio {
    private static capturetickSoundTaking: mod.SFX;
    private static capturetickSoundLosing: mod.SFX;
    private static capturedSound: mod.SFX;
    private static neutraliseSound: mod.SFX;
    private static eventSound: mod.SFX;
    private static VO1: mod.VO;
    private static VO2: mod.VO;
    private static VO3: mod.VO;
    private static VO4: mod.VO;
    private static timerShortTick: mod.SFX;
    private static timerLongTick: mod.SFX;
    private static timerEnd: mod.SFX;
    private static counter: mod.SFX
    private static conquestEnd: mod.SFX
    private static conquestEnd2: mod.SFX
    private static nextObjective: mod.SFX
    private static outOfBounds: mod.SFX



    public static async init(): Promise<void> {
        await mod.Wait(2);
        BFSAudio.capturetickSoundTaking = mod.SpawnObject(mod.RuntimeSpawn_Common.SFX_UI_Gamemode_Shared_CaptureObjectives_CapturingTickIcon_IsFriendly_OneShot2D, mod.CreateVector(0, 0, 0), mod.CreateVector(0, 0, 0))
        BFSAudio.capturetickSoundLosing = mod.SpawnObject(mod.RuntimeSpawn_Common.SFX_UI_Gamemode_Shared_CaptureObjectives_CapturingTickEnemy_OneShot2D, mod.CreateVector(0, 0, 0), mod.CreateVector(0, 0, 0))
        BFSAudio.neutraliseSound = mod.SpawnObject(mod.RuntimeSpawn_Common.SFX_UI_Gauntlet_Circuit_TerminalFriendlyCapturing_OneShot2D, mod.CreateVector(0, 0, 0), mod.CreateVector(0, 0, 0))
        BFSAudio.capturedSound = mod.SpawnObject(mod.RuntimeSpawn_Common.SFX_UI_Gamemode_Shared_CaptureObjectives_OnCapturedByFriendly_OneShot2D, mod.CreateVector(0, 0, 0), mod.CreateVector(0, 0, 0))
        BFSAudio.eventSound = mod.SpawnObject(mod.RuntimeSpawn_Common.SFX_UI_Gamemode_Shared_CaptureObjectives_AreaUnlock_OneShot2D, mod.CreateVector(0, 0, 0), mod.CreateVector(0, 0, 0))
        BFSAudio.VO1 = mod.SpawnObject(mod.RuntimeSpawn_Common.SFX_VOModule_OneShot2D, mod.CreateVector(0, 0, 0), mod.CreateVector(0, 0, 0));
        BFSAudio.VO2 = mod.SpawnObject(mod.RuntimeSpawn_Common.SFX_VOModule_OneShot2D, mod.CreateVector(0, 0, 0), mod.CreateVector(0, 0, 0));
        BFSAudio.VO3 = mod.SpawnObject(mod.RuntimeSpawn_Common.SFX_VOModule_OneShot2D, mod.CreateVector(0, 0, 0), mod.CreateVector(0, 0, 0));
        BFSAudio.VO4 = mod.SpawnObject(mod.RuntimeSpawn_Common.SFX_VOModule_OneShot2D, mod.CreateVector(0, 0, 0), mod.CreateVector(0, 0, 0));
        BFSAudio.timerShortTick = mod.SpawnObject(mod.RuntimeSpawn_Common.SFX_UI_Gauntlet_EOM_CountdownTick_OneShot2D, mod.CreateVector(0, 0, 0), mod.CreateVector(0, 0, 0))
        BFSAudio.timerLongTick = mod.SpawnObject(mod.RuntimeSpawn_Common.SFX_UI_Gamemode_Shared_Intro_Countdown_Final_OneShot2D, mod.CreateVector(0, 0, 0), mod.CreateVector(0, 0, 0))
        BFSAudio.timerEnd = mod.SpawnObject(mod.RuntimeSpawn_Common.SFX_UI_Gamemode_Shared_Intro_FinalImpact_OneShot2D, mod.CreateVector(0, 0, 0), mod.CreateVector(0, 0, 0))
        BFSAudio.counter = mod.SpawnObject(mod.RuntimeSpawn_Common.SFX_UI_Gauntlet_Beacons_CalibrationTick_OneShot2D, mod.CreateVector(0, 0, 0), mod.CreateVector(0, 0, 0))
        BFSAudio.conquestEnd = mod.SpawnObject(mod.RuntimeSpawn_Common.SFX_UI_Gauntlet_Standoff_ZoneCaptured_OneShot2D, mod.CreateVector(0, 0, 0), mod.CreateVector(0, 0, 0))
        BFSAudio.conquestEnd2 = mod.SpawnObject(mod.RuntimeSpawn_Common.SFX_UI_Notification_ObjectiveSecured_FillIn_Positive_OneShot2D, mod.CreateVector(0, 0, 0), mod.CreateVector(0, 0, 0))
        BFSAudio.nextObjective = mod.SpawnObject(mod.RuntimeSpawn_Common.SFX_UI_Notification_SectorTaken_Counter_Positive_OneShot2D, mod.CreateVector(0, 0, 0), mod.CreateVector(0, 0, 0))
        BFSAudio.outOfBounds = mod.SpawnObject(mod.RuntimeSpawn_Common.SFX_UI_Gamemode_Shared_OutOfBounds_Countdown_OneShot2D, mod.CreateVector(0, 0, 0), mod.CreateVector(0, 0, 0))

        // SFX_UI_Gauntlet_Standoff_ZoneCaptured_OneShot2D - original used
        // SFX_UI_Notification_Primary_G_2D - BF theme included.
        // SFX_UI_Notification_Primary_J_2D - interesting sounding
        // SFX_UI_Notification_ObjectiveSecured_FillIn_Positive_OneShot2D - Fade dout



        mod.LoadMusic(mod.MusicPackages.Radio)
        mod.SetMusicParam(mod.MusicParams.Radio_Channel, 2);
        mod.SetMusicParam(mod.MusicParams.Radio_ContinueQueueOnTrackEnd, 0);
        mod.SetMusicParam(mod.MusicParams.Radio_Amplitude, 3);
        mod.SetMusicParam(mod.MusicParams.Radio_QueueTrackNumber, 7);
        mod.LoadMusic(mod.MusicPackages.Core)
        mod.PlayMusic(mod.MusicEvents.Core_LastPhaseBegin)
        //BFSAudio.testMusic();
    }

    //Clasical
    // 10 and 11
    // 26 



    public static async regroupMusic(): Promise<void> {
        //this.stopRegroupMusic();
        //await mod.Wait(1);
        mod.LoadMusic(mod.MusicPackages.Radio);
        mod.SetMusicParam(mod.MusicParams.Radio_Channel, 2); //2 BF Themes 1 Rock
        mod.SetMusicParam(mod.MusicParams.Radio_QueueTrackNumber, 7); //7 for BF themse or 17 (rock cinematic) and 15 for rock intense
        await mod.Wait(1);
        mod.PlayMusic(mod.MusicEvents.Radio_Play);
    }

    public static async stopRegroupMusic(): Promise<void> {
        mod.PlayMusic(mod.MusicEvents.Radio_Stop);
        //mod.PlayMusic(mod.MusicEvents.Radio_NextQueuedTrack);
        mod.PlayMusic(mod.MusicEvents.Radio_ClearQueue);
    }

    public static async finalAssaultMusic(): Promise<void> {
        this.stopRegroupMusic();
        await mod.Wait(1);
        mod.LoadMusic(mod.MusicPackages.Radio);
        mod.SetMusicParam(mod.MusicParams.Radio_Channel, 2);
        mod.SetMusicParam(mod.MusicParams.Radio_QueueTrackNumber, 4);
        await mod.Wait(1);
        mod.PlayMusic(mod.MusicEvents.Radio_Play);
    }

    public static victoryMusic(): void {
    }

    public static async testMusic(): Promise<void> {
        this.stopRegroupMusic();
        await mod.Wait(1);
        mod.LoadMusic(mod.MusicPackages.Radio);
        mod.SetMusicParam(mod.MusicParams.Radio_Channel, 1);
        mod.SetMusicParam(mod.MusicParams.Radio_QueueTrackNumber, 1);
        mod.PlayMusic(mod.MusicEvents.Radio_Play);
        await mod.Wait(30);
        this.stopRegroupMusic();
    }

    public static async returnMusic(): Promise<void> {
        //this.stopRegroupMusic();
        mod.PlayMusic(mod.MusicEvents.Radio_Stop);
        await mod.Wait(1);
        mod.LoadMusic(mod.MusicPackages.Core);
        mod.SetMusicParam(mod.MusicParams.Core_IsWinning, 1);
        mod.SetMusicParam(mod.MusicParams.Core_Sector, 3);
        mod.PlayMusic(mod.MusicEvents.Core_PhaseEnded);
    }

    public static async endMusic(): Promise<void> {
        //this.stopRegroupMusic();
        mod.PlayMusic(mod.MusicEvents.Radio_Stop);
        await mod.Wait(1);
        mod.LoadMusic(mod.MusicPackages.Core);
        mod.SetMusicParam(mod.MusicParams.Core_IsWinning, 1);
        mod.PlayMusic(mod.MusicEvents.Core_EndOfRound_Loop);
        await mod.Wait(4);
        this.finalAssaultMusic();
    }

    public static playTickSound(eventPlayer: mod.Player, flagID: number, team: mod.Team): void {
        let data = ObjectiveVariables.getObjectiveVariables(flagID);
        let friendly: number;
        let enemy: number;
        let captureProgress = data.progress;

        if ((captureProgress == 1) || (captureProgress == 0)) return;

        if (mod.Equals(team, mod.GetTeam(1))) {
            friendly = data.team1Players;
            enemy = data.team2Players;
        } else {
            friendly = data.team2Players;
            enemy = data.team1Players;
        }

        if (friendly > enemy) {
            mod.PlaySound(BFSAudio.capturetickSoundTaking, 0.5, eventPlayer);
        }
        else if (friendly < enemy) {
            mod.PlaySound(BFSAudio.capturetickSoundLosing, 0.5, eventPlayer);
        }
    }

    public static playTimerShortTick(): void {
        mod.PlaySound(BFSAudio.timerShortTick, 0.6);
    }

    public static playTimerLongTick(): void {
        mod.PlaySound(BFSAudio.timerLongTick, 0.5);
    }

    public static playTimerEnd(): void {
        mod.PlaySound(BFSAudio.timerEnd, 0.5);
    }

    public static playCounter(): void {
        mod.PlaySound(BFSAudio.counter, 0.7);
    }

    public static playConquestEnd(): void {
        mod.PlaySound(BFSAudio.conquestEnd, 0.6);
    }

    public static playConquestEnd2(): void {
        mod.PlaySound(BFSAudio.conquestEnd2, 0.6);
    }

    public static playNextObjective(): void {
        mod.PlaySound(BFSAudio.nextObjective, 0.6);
    }

    public static playOutOfBounds(eventPlayer: mod.Player): void {
        mod.PlaySound(BFSAudio.outOfBounds, 0.5, eventPlayer);
    }

    public static playCapturedSound(eventPlayer: mod.Player): void {
        mod.PlaySound(BFSAudio.capturedSound, 0.7, eventPlayer);
    }
    public static playNeutraliseSound(eventPlayer: mod.Player): void {
        mod.PlaySound(BFSAudio.neutraliseSound, 0.7, eventPlayer);
    }


    /////////////////////////////////////////////////////////////////////////////
    // VO Events
    /////////////////////////////////////////////////////////////////////////////

    public static plagFlagCapturedVO(eventCapturePoint: mod.CapturePoint): void {
        if (GameConfig.gameConfig.stage == 2 || !GameConfig.gameConfig.roundOngoing) return;

        let team = mod.GetCurrentOwnerTeam(eventCapturePoint);
        let otherTeam: mod.Team
        let id = mod.Subtract(mod.GetObjId(eventCapturePoint), GameConfig.gameConfig.flagStart);

        if (mod.Equals(team, mod.GetTeam(1))) {
            otherTeam = mod.GetTeam(2);
        }
        else {
            otherTeam = mod.GetTeam(1);
        }
        mod.PlayVO(BFSAudio.VO1, mod.VoiceOverEvents2D.ObjectiveCaptured, GameConfig.gameConfig.flagsVO[id], team);
        mod.PlayVO(BFSAudio.VO2, mod.VoiceOverEvents2D.ObjectiveCapturedEnemy, GameConfig.gameConfig.flagsVO[id], otherTeam);
    }

    public static winningVO(winningTeam: mod.Team): void {
        let team: mod.Team
        let otherTeam: mod.Team

        if (mod.Equals(winningTeam, mod.GetTeam(1))) {
            team = mod.GetTeam(1)
            otherTeam = mod.GetTeam(2)
        }
        else {
            team = mod.GetTeam(2)
            otherTeam = mod.GetTeam(1)
        }

        mod.PlayVO(BFSAudio.VO3, mod.VoiceOverEvents2D.ProgressMidWinning, mod.VoiceOverFlags.Alpha, team);
        mod.PlayVO(BFSAudio.VO4, mod.VoiceOverEvents2D.ProgressMidLosing, mod.VoiceOverFlags.Alpha, otherTeam);
    }

    public static defencesBreachedVO() {
        let team: mod.Team
        let otherTeam: mod.Team

        if (TeamVariables.getTeamData(1).score > TeamVariables.getTeamData(2).score) {
            team = mod.GetTeam(1)
            otherTeam = mod.GetTeam(2)
        }
        else {
            team = mod.GetTeam(2)
            otherTeam = mod.GetTeam(1)
        }

        mod.PlayVO(BFSAudio.VO3, mod.VoiceOverEvents2D.ProgressLateWinning, mod.VoiceOverFlags.Alpha, team);
        mod.PlayVO(BFSAudio.VO4, mod.VoiceOverEvents2D.ProgressLateLosing, mod.VoiceOverFlags.Alpha, otherTeam);
    }

    public static conquestCompleteVO() {
        let team: mod.Team
        let otherTeam: mod.Team

        if (TeamVariables.getTeamData(1).score > TeamVariables.getTeamData(2).score) {
            team = mod.GetTeam(1)
            otherTeam = mod.GetTeam(2)
        }
        else {
            team = mod.GetTeam(2)
            otherTeam = mod.GetTeam(1)
        }

        mod.PlayVO(BFSAudio.VO3, mod.VoiceOverEvents2D.RoundEndFriendlyCapture, mod.VoiceOverFlags.Alpha, team);
        mod.PlayVO(BFSAudio.VO4, mod.VoiceOverEvents2D.RoundEndEnemyCapture, mod.VoiceOverFlags.Alpha, otherTeam);
    }

    public static regoupVO() {
        mod.PlayVO(BFSAudio.VO1, mod.VoiceOverEvents2D.Time60Left, mod.VoiceOverFlags.Alpha, mod.GetTeam(1));
        mod.PlayVO(BFSAudio.VO2, mod.VoiceOverEvents2D.Time60Left, mod.VoiceOverFlags.Alpha, mod.GetTeam(2));
    }

    public static lastAttemptVO() {
        mod.PlayVO(BFSAudio.VO1, mod.VoiceOverEvents2D.RoundLastRound, mod.VoiceOverFlags.Alpha, mod.GetTeam(1));
        mod.PlayVO(BFSAudio.VO2, mod.VoiceOverEvents2D.RoundLastRound, mod.VoiceOverFlags.Alpha, mod.GetTeam(2));
    }

    public static returnToConquestVO() {
        let team: mod.Team
        let otherTeam: mod.Team

        if (TeamVariables.getTeamData(1).score > TeamVariables.getTeamData(2).score) {
            team = mod.GetTeam(1)
            otherTeam = mod.GetTeam(2)
        }
        else {
            team = mod.GetTeam(2)
            otherTeam = mod.GetTeam(1)
        }
        mod.PlayVO(BFSAudio.VO3, mod.VoiceOverEvents2D.RoundEndEnemyKills, mod.VoiceOverFlags.Alpha, team);
        mod.PlayVO(BFSAudio.VO4, mod.VoiceOverEvents2D.RoundEndFriendlyKills, mod.VoiceOverFlags.Alpha, otherTeam);
    }

    public static MCOMArmedVO(mcom: mod.MCOM): void {
        let id = mod.Subtract(mod.GetObjId(mcom), GameConfig.gameConfig.MCOMStart);

        let team: mod.Team
        let otherTeam: mod.Team

        if (TeamVariables.getTeamData(1).score > TeamVariables.getTeamData(2).score) {
            team = mod.GetTeam(1)
            otherTeam = mod.GetTeam(2)
        }
        else {
            team = mod.GetTeam(2)
            otherTeam = mod.GetTeam(1)
        }
        mod.PlayVO(BFSAudio.VO1, mod.VoiceOverEvents2D.MComArmFriendly, GameConfig.gameConfig.flagsVO[id], team);
        mod.PlayVO(BFSAudio.VO2, mod.VoiceOverEvents2D.MComArmEnemy, GameConfig.gameConfig.flagsVO[id], otherTeam);
    }

    public static MCOMDefuseVO(mcom: mod.MCOM): void {
        let id = mod.Subtract(mod.GetObjId(mcom), GameConfig.gameConfig.MCOMStart);

        let team: mod.Team
        let otherTeam: mod.Team

        if (TeamVariables.getTeamData(1).score > TeamVariables.getTeamData(2).score) {
            team = mod.GetTeam(1)
            otherTeam = mod.GetTeam(2)
        }
        else {
            team = mod.GetTeam(2)
            otherTeam = mod.GetTeam(1)
        }
        mod.PlayVO(BFSAudio.VO1, mod.VoiceOverEvents2D.MComDefuseEnemy, GameConfig.gameConfig.flagsVO[id], team);
        mod.PlayVO(BFSAudio.VO2, mod.VoiceOverEvents2D.MComDefuseFriendly, GameConfig.gameConfig.flagsVO[id], otherTeam);
    }

    public static MCOMDestroyedVO(mcom: mod.MCOM): void {
        let id = mod.Subtract(mod.GetObjId(mcom), GameConfig.gameConfig.MCOMStart);

        let team: mod.Team
        let otherTeam: mod.Team

        if (TeamVariables.getTeamData(1).score > TeamVariables.getTeamData(2).score) {
            team = mod.GetTeam(1)
            otherTeam = mod.GetTeam(2)
        }
        else {
            team = mod.GetTeam(2)
            otherTeam = mod.GetTeam(1)
        }
        mod.PlayVO(BFSAudio.VO1, mod.VoiceOverEvents2D.MComDestroyedFriendly, GameConfig.gameConfig.flagsVO[id], team);
        mod.PlayVO(BFSAudio.VO2, mod.VoiceOverEvents2D.MComDestroyedEnemy, GameConfig.gameConfig.flagsVO[id], otherTeam);
    }
}