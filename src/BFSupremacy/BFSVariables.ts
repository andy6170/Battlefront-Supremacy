export interface GameConfig {
    gameStarted: boolean;
    debug: boolean;
    stage: number;
    capturePointNeutralizationTime: number;
    capturePointCapturingTime: number;
    capturePointMultiplier: number;
    finalCaptureTime: number;
    finalNeutralizeTime: number;
    finalCaptureMultiplier: number;
    ticketSpeed: number;
    attacker: mod.Team;
    defender: mod.Team;
    baseAttackTime: number;
    bonusTimeAddition: number;
    bonusTime: number;
    remainingTime: number;
    extractionTime: number;
    extractionRemainingTime: number;
    elapsedTime: number;
    flags: mod.CapturePoint[];
    capturePointProgress: number[];
    captureProgressSize: number[];
    captureProgressPosition: mod.Vector[];
    timeEven: boolean;
    timeOdd: boolean
    roundOngoing: boolean;
    ticketDrained: boolean;
    conquestCapturePoints: number;
    finalAssaultCapturePoints: number;
    flagStart: number;
    flagEnd: number;
    oldFlagStart: number;
    oldFlagEnd: number;
    regroupBot: mod.Player | undefined;
    regroupVehicle: mod.Vehicle | undefined;
    regroupVehicleSelected: boolean;
    extractReady: boolean;
    heliTakeOff: boolean;
    extractionIcon: mod.VFX;
    nightMap: boolean;
    nightFinalArea: boolean;
    overtime: number;
    snow: boolean;
    cutscene: boolean;
    uniqueID: number;
    airVehicles: mod.VehicleList[];
    flagsVO: mod.VoiceOverFlags[];
    MCOMStart: number;
    winning: number;
    night: boolean;
    shoulderLeftCam: number;
    shoulderRightCam: number;
    shoulderLeftCamZoom: number;
    shoulderRightCamZoom: number;
    shoulderLeftUI: mod.Vector;
    shoulderRightUI: mod.Vector;
}

export class GameConfig {
    public static gameConfig: GameConfig = {
        gameStarted: false,
        debug: true,
        capturePointNeutralizationTime: 15,
        capturePointCapturingTime: 15,
        capturePointMultiplier: 2,
        finalCaptureTime: 15,
        finalNeutralizeTime: 25,
        finalCaptureMultiplier: 2,
        stage: 0,
        ticketSpeed: 6,
        extractionTime: 60,
        extractionRemainingTime: 60,
        baseAttackTime: 360,
        bonusTimeAddition: 10,
        bonusTime: 0,
        remainingTime: 0,
        attacker: mod.GetTeam(1),
        defender: mod.GetTeam(2),
        elapsedTime: 0,
        flags: [],
        capturePointProgress: [],
        captureProgressSize: [],
        captureProgressPosition: [],
        timeEven: false,
        timeOdd: false,
        roundOngoing: false,
        ticketDrained: false,
        conquestCapturePoints: 0,
        finalAssaultCapturePoints: 0,
        flagStart: 200,
        flagEnd: 220,
        oldFlagStart: 0,
        oldFlagEnd: 1,
        regroupBot: undefined,
        regroupVehicle: undefined,
        regroupVehicleSelected: false,
        extractReady: false,
        heliTakeOff: false,
        extractionIcon: mod.GetVFX(0),
        nightMap: false,
        nightFinalArea: false,
        overtime: 0,
        snow: false,
        cutscene: false,
        uniqueID: 0,
        airVehicles: [
            mod.VehicleList.F16,
            mod.VehicleList.F22,
            mod.VehicleList.AH64,
            mod.VehicleList.AH6M,
            mod.VehicleList.AH6M_Pax,
            mod.VehicleList.JAS39,
            mod.VehicleList.SU57,
            mod.VehicleList.UH60,
            mod.VehicleList.UH60_Pax
        ],
        flagsVO: [
            mod.VoiceOverFlags.Alpha,
            mod.VoiceOverFlags.Bravo,
            mod.VoiceOverFlags.Charlie,
            mod.VoiceOverFlags.Delta,
            mod.VoiceOverFlags.Echo,
            mod.VoiceOverFlags.Foxtrot,
            mod.VoiceOverFlags.Golf,
            mod.VoiceOverFlags.Hotel,
            mod.VoiceOverFlags.India
        ],
        MCOMStart: 0,
        winning: 0,
        night: false,
        shoulderLeftCam: -0.45,
        shoulderRightCam: 0.35,
        shoulderLeftCamZoom: -0.4,
        shoulderRightCamZoom: 0.4,
        shoulderLeftUI: mod.CreateVector(12, 5, 0),
        shoulderRightUI: mod.CreateVector(-12, 5, 0),
    };
}

export interface UIconfig {
    friendlyColour: mod.Vector;
    enemyColour: mod.Vector;
    friendlyBGColour: mod.Vector;
    enemyBGColour: mod.Vector;
    goldColour: mod.Vector;
    goldBGColour: mod.Vector;
    whiteColour: mod.Vector;
    progressWidth: number;
    defaultPosition: mod.Vector;
    conquestUI: mod.UIWidget;
    regroupUI: mod.UIWidget;
    finalAssaultUI: mod.UIWidget;
    capturePointUI: mod.UIWidget;
    capturepointUIFinalAssault: mod.UIWidget;
    changingSectorUI: mod.UIWidget;
    mcomUI: mod.UIWidget;
    uiAlpha: number;
    uiAlphaUp: boolean;
    flashStart: boolean;
    ProgressFlashT1: boolean;
    ProgressFlashT2: boolean;
    flagLetters: string[];
    snipers: mod.Weapons[];
    launchers: mod.Gadgets[];
    conquestEndUI: mod.UIWidget;
}

export class UIconfig {
    public static uiConfig: UIconfig = {
        friendlyColour: mod.CreateVector(0, 0.7, 1),
        enemyColour: mod.CreateVector(1, 0.2, 0.2),
        friendlyBGColour: mod.CreateVector(0, 0.15, 0.3),
        enemyBGColour: mod.CreateVector(0.4, 0, 0),
        goldColour: mod.CreateVector(1, 0.8, 0),
        goldBGColour: mod.CreateVector(0.5, 0.4, 0),
        whiteColour: mod.CreateVector(1, 1, 1),
        progressWidth: 600,
        defaultPosition: mod.CreateVector(0, 0, 0),
        conquestUI: mod.GetUIRoot(),
        regroupUI: mod.GetUIRoot(),
        finalAssaultUI: mod.GetUIRoot(),
        capturePointUI: mod.GetUIRoot(),
        capturepointUIFinalAssault: mod.GetUIRoot(),
        changingSectorUI: mod.GetUIRoot(),
        mcomUI: mod.GetUIRoot(),
        uiAlpha: 1,
        uiAlphaUp: false,
        flashStart: false,
        ProgressFlashT1: false,
        ProgressFlashT2: false,
        flagLetters: [
            mod.stringkeys.objective.a,
            mod.stringkeys.objective.b,
            mod.stringkeys.objective.c,
            mod.stringkeys.objective.d,
            mod.stringkeys.objective.e,
            mod.stringkeys.objective.f,
            mod.stringkeys.objective.g,
            mod.stringkeys.objective.h,
            mod.stringkeys.objective.i,
            mod.stringkeys.objective.j
        ],
        snipers: [
            mod.Weapons.Sniper_M2010_ESR,
            mod.Weapons.Sniper_Mini_Scout,
            mod.Weapons.Sniper_PSR,
            mod.Weapons.Sniper_SV_98,
            mod.Weapons.DMR_GRT_CPS,
            mod.Weapons.DMR_LMR27,
            mod.Weapons.DMR_M39_EMR,
            mod.Weapons.DMR_SVDM,
            mod.Weapons.DMR_SVK_86
        ],
        launchers: [
            mod.Gadgets.Launcher_Aim_Guided,
            mod.Gadgets.Launcher_Air_Defense,
            mod.Gadgets.Launcher_Auto_Guided,
            mod.Gadgets.Launcher_IGLA,
            mod.Gadgets.Launcher_Unguided_Rocket,
            mod.Gadgets.Launcher_Long_Range,
        ],
        conquestEndUI: mod.GetUIRoot(),
    };
}

export interface SupremacyPlayerData {
    score: number;
    kills: number;
    deaths: number;
    assists: number;
    captures: number;
    status: number;
    onPoint: boolean;
    uniqueUI: string;
    containerWidget: mod.UIWidget
    firstDeploy: boolean;
    currentObjective: mod.CapturePoint;
    spawned: boolean;
    firstPerson: boolean;
    thirdPerson: boolean;
    thirdPersonZoom: boolean;
    hasSniper: boolean;
    hasLauncher: boolean;
    flagTick: number;
    stance: string;
    cameraEnabled: boolean;
    outOfBounds: boolean;
    oobTimer: number;
    inAirspace: boolean;
    area: number;
    ingoreOOB: boolean;
    boarded: boolean;
    shoulder: string;
    interacting: boolean;

}

export class PlayerVariables {
    public static playerData: Map<number, SupremacyPlayerData> = new Map<number, SupremacyPlayerData>();

    public static getPlayerData(player: mod.Player | number): SupremacyPlayerData {
        const playerId = typeof player === 'number' ? player : mod.GetObjId(player);
        if (!PlayerVariables.playerData.has(playerId)) {
            PlayerVariables.playerData.set(playerId, {
                score: 0,
                kills: 0,
                deaths: 0,
                assists: 0,
                captures: 0,
                status: 0,
                onPoint: false,
                uniqueUI: "",
                containerWidget: mod.GetUIRoot(),
                firstDeploy: true,
                currentObjective: mod.GetCapturePoint(0),
                spawned: false,
                firstPerson: false,
                thirdPerson: false,
                thirdPersonZoom: false,
                hasSniper: false,
                hasLauncher: false,
                flagTick: 0,
                stance: "standing",
                cameraEnabled: true,
                outOfBounds: false,
                oobTimer: 0,
                inAirspace: false,
                area: 0,
                ingoreOOB: false,
                boarded: false,
                shoulder: "right",
                interacting: false,
            });
        }
        return PlayerVariables.playerData.get(playerId)!;
    }

    public static setPlayerData(player: mod.Player | number, value: SupremacyPlayerData): void {
        const playerId = typeof player === 'number' ? player : mod.GetObjId(player);
        PlayerVariables.playerData.set(playerId, value);
    }
}

export interface TeamData {
    score: number;
    mcomCount: number;
    finalSectorBreached: number;
    attempts: number;
}

export class TeamVariables {
    public static teamData: Map<number, TeamData> = new Map<number, TeamData>();

    public static getTeamData(team: mod.Team | number): TeamData {
        const teamId = typeof team === 'number' ? team : mod.GetObjId(team);
        if (!TeamVariables.teamData.has(teamId)) {
            TeamVariables.teamData.set(teamId, {
                score: 0,
                mcomCount: 3,
                finalSectorBreached: 1,
                attempts: 0,
            });
        }
        return TeamVariables.teamData.get(teamId)!;
    }

    public static setTeamData(team: mod.Team | number, value: TeamData): void {
        const teamId = typeof team === 'number' ? team : mod.GetObjId(team);
        TeamVariables.teamData.set(teamId, value);
    }
}

export interface CapturePointData {
    uiTextColour1: mod.Vector;
    uiTextColour2: mod.Vector;
    uiBackgroundColour1: mod.Vector;
    uiBackgroundColour2: mod.Vector;
    uiMessage1: mod.Message;
    uiMessage2: mod.Message;
    previousProgress: number;
    progress: number;
    progressSize: mod.Vector;
    position: mod.Vector;
    ownerTeam: mod.Team;
    team1Players: number;
    team2Players: number;
}

export class ObjectiveVariables {
    public static objectiveVariables: Map<number, CapturePointData> = new Map<number, CapturePointData>();

    public static getObjectiveVariables(objective: mod.CapturePoint | number): CapturePointData {
        const objectiveId = typeof objective === 'number' ? objective : mod.GetObjId(objective);
        if (!ObjectiveVariables.objectiveVariables.has(objectiveId)) {
            ObjectiveVariables.objectiveVariables.set(objectiveId, {
                uiTextColour1: mod.CreateVector(1, 1, 1),
                uiTextColour2: mod.CreateVector(1, 1, 1),
                uiBackgroundColour1: mod.CreateVector(0, 0, 0),
                uiBackgroundColour2: mod.CreateVector(0, 0, 0),
                uiMessage1: mod.Message(mod.stringkeys.captureProgress.none),
                uiMessage2: mod.Message(mod.stringkeys.captureProgress.none),
                previousProgress: 0,
                progress: 0,
                progressSize: mod.CreateVector(0, 0, 0),
                position: mod.CreateVector(0, 0, 0),
                ownerTeam: mod.GetTeam(0),
                team1Players: 0,
                team2Players: 0,
            });
        }
        return ObjectiveVariables.objectiveVariables.get(objectiveId)!;
    }

    public static setObjectiveVariables(objective: mod.CapturePoint | number, value: CapturePointData): void {
        const objectiveId = typeof objective === 'number' ? objective : mod.GetObjId(objective);
        ObjectiveVariables.objectiveVariables.set(objectiveId, value);
    }
}

export interface MCOMData {
    isDestroyed: boolean;
    isArmed: boolean;
    armedBy: mod.Player | null;


}

export class MCOMVariables {
    public static mcomVariables: Map<number, MCOMData> = new Map<number, MCOMData>();

    public static getMCOMData(mcom: mod.MCOM | number): MCOMData {
        const mcomId = typeof mcom === 'number' ? mcom : mod.GetObjId(mcom);
        if (!MCOMVariables.mcomVariables.has(mcomId)) {
            MCOMVariables.mcomVariables.set(mcomId, {
                isDestroyed: false,
                isArmed: false,
                armedBy: null
            });
        }
        return MCOMVariables.mcomVariables.get(mcomId)!;
    }

    public static setMCOMData(mcom: mod.MCOM | number, value: MCOMData): void {
        const mcomId = typeof mcom === 'number' ? mcom : mod.GetObjId(mcom);
        MCOMVariables.mcomVariables.set(mcomId, value);
    }
}


