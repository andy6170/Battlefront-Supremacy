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
    extractionIcon: mod.MCOM;
}

export class GameConfig {
    public static gameConfig: GameConfig = {
        gameStarted: false,
        debug: true,
        capturePointNeutralizationTime: 5,
        capturePointCapturingTime: 5,
        capturePointMultiplier: 3,
        finalCaptureTime: 15,
        finalNeutralizeTime: 25,
        finalCaptureMultiplier: 1,
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
        extractionIcon: mod.SpawnObject(mod.RuntimeSpawn_Common.MCOM, mod.Subtract(mod.GetObjectPosition(mod.GetSpatialObject(902)), mod.CreateVector(0, 1.5, 0)), mod.CreateVector(0, 0, 0))
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
    mcomUI: mod.UIWidget;
    uiAlpha: number;
    uiAlphaUp: boolean;
    flashStart: boolean;
    ProgressFlashT1: boolean;
    ProgressFlashT2: boolean;
    flagLetters: string[];
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
    };
}

export interface SupremacyPlayerData {
    kills: number;
    deaths: number;
    status: number;
    onPoint: boolean;
    uniqueUI: string;
    containerWidget: mod.UIWidget
    firstDeploy: boolean;
    currentObjective: mod.CapturePoint;
}

export class PlayerVariables {
    public static playerData: Map<number, SupremacyPlayerData> = new Map<number, SupremacyPlayerData>();

    public static getPlayerData(player: mod.Player | number): SupremacyPlayerData {
        const playerId = typeof player === 'number' ? player : mod.GetObjId(player);
        if (!PlayerVariables.playerData.has(playerId)) {
            PlayerVariables.playerData.set(playerId, {
                kills: 0,
                deaths: 0,
                status: 0,
                onPoint: false,
                uniqueUI: "",
                containerWidget: mod.GetUIRoot(),
                firstDeploy: true,
                currentObjective: mod.GetCapturePoint(0)
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
    hqHealth: number;
    mcomCount: number;
    finalSectorBreached: number;
}

export class TeamVariables {
    public static teamData: Map<number, TeamData> = new Map<number, TeamData>();

    public static getTeamData(team: mod.Team | number): TeamData {
        const teamId = typeof team === 'number' ? team : mod.GetObjId(team);
        if (!TeamVariables.teamData.has(teamId)) {
            TeamVariables.teamData.set(teamId, {
                score: 0,
                hqHealth: 100000,
                mcomCount: 2,
                finalSectorBreached: 1
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


