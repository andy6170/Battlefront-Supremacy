import { ObjectiveVariables } from "./BFSVariables";

export class BFSAudio {
    private static capturetickSoundTaking: mod.SFX;
    private static capturetickSoundLosing: mod.SFX;
    private static capturedSound: mod.SFX;
    private static neutraliseSound: mod.SFX;
    private static eventSound: mod.SFX;
    private static VO1: mod.SFX;
    private static VO2: mod.SFX;
    private static VO3: mod.SFX;
    private static VO4: mod.SFX;



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


        mod.LoadMusic(mod.MusicPackages.Radio)
        mod.SetMusicParam(mod.MusicParams.Radio_Channel, 2);
        mod.SetMusicParam(mod.MusicParams.Radio_ContinueQueueOnTrackEnd, 0);
        mod.SetMusicParam(mod.MusicParams.Radio_Amplitude, 3);
        mod.SetMusicParam(mod.MusicParams.Radio_QueueTrackNumber, 7);
    }



    public static async regroupMusic(): Promise<void> {
        this.stopRegroupMusic();
        await mod.Wait(1);
        mod.SetMusicParam(mod.MusicParams.Radio_Channel, 1);
        mod.SetMusicParam(mod.MusicParams.Radio_QueueTrackNumber, 17); //7
        await mod.Wait(1);
        mod.PlayMusic(mod.MusicEvents.Radio_Play)
    }

    public static async stopRegroupMusic(): Promise<void> {
        mod.PlayMusic(mod.MusicEvents.Radio_NextQueuedTrack)
        mod.PlayMusic(mod.MusicEvents.Radio_Stop)
        mod.PlayMusic(mod.MusicEvents.Radio_ClearQueue)
    }

    public static async finalAssaultMusic(): Promise<void> {
        this.stopRegroupMusic();
        await mod.Wait(1);
        mod.SetMusicParam(mod.MusicParams.Radio_Channel, 2);
        mod.SetMusicParam(mod.MusicParams.Radio_QueueTrackNumber, 4);
        await mod.Wait(1);
        mod.PlayMusic(mod.MusicEvents.Radio_Play)
    }

    public static victoryMusic(): void {
    }

    public static async testMusic(): Promise<void> {
        this.stopRegroupMusic();
        await mod.Wait(1);
        mod.SetMusicParam(mod.MusicParams.Radio_QueueTrackNumber, 1);
        mod.PlayMusic(mod.MusicEvents.Radio_Play)
        await mod.Wait(30);
        this.stopRegroupMusic();
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


}