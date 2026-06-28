export class BFSMusic {
    public static init(): void {
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


}