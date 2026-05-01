export interface GameConfig {
    gameStarted: boolean;
    debug: boolean;
    stage: number;
    capturePointNeutralizationTime: number;
    capturePointCapturingTime: number;
    ticketSpeed: number;
    attacker: mod.Team;
    defender: mod.Team;
    baseAttackTime: number;
    bonusTimeAddition: number;
    bonusTime: number;
    remainingTime: number;
    elapsedTime: number;
    flags: mod.CapturePoint[];
    capturePointProgress: number[];
    captureProgressSize: number[];
    captureProgressPosition: mod.Vector[];
    timeEven: boolean;
    timeOdd: boolean
    roundOngoing: boolean;
    ticketDrained: boolean;
}

export class GameConfig {
    public static gameConfig: GameConfig = {
        gameStarted: false,
        debug: true,
        capturePointNeutralizationTime: 5,
        capturePointCapturingTime: 5,
        stage: 0,
        ticketSpeed: 6,
        baseAttackTime: 450,
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
    uiAlpha: number;
    uiAlphaUp: boolean;
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
        uiAlpha: 1,
        uiAlphaUp: false,
    };
}

export interface SupremacyPlayerData {
    kills: number;
    deaths: number;
    status: number;
    onPoint: boolean;
    uniqueUI: string;
    containerWidget: mod.UIWidget | null;
}

export class PlayerVariables {
    public static readonly playerData: Map<number, SupremacyPlayerData> = new Map<number, SupremacyPlayerData>();

    public static getPlayerData(player: mod.Player | number): SupremacyPlayerData {
        const playerId = typeof player === 'number' ? player : mod.GetObjId(player);
        if (!PlayerVariables.playerData.has(playerId)) {
            PlayerVariables.playerData.set(playerId, {
                kills: 0,
                deaths: 0,
                status: 0,
                onPoint: false,
                uniqueUI: "",
                containerWidget: null,
            });
        }
        return PlayerVariables.playerData.get(playerId)!;
    }
}

export interface TeamData {
    capturingUITextColour1: mod.Vector[];
    capturingUITextColour2: mod.Vector[];
    capturingUIBackgroundColour1: mod.Vector[];
    capturingUIBackgroundColour2: mod.Vector[];
    capturingMessage1: string[];
    capturingMessage2: string[];
    playersOnPoint: number[];
    score: number;
    hqHealth: number;
    mcomCount: number;
}

export class TeamVariables {
    public static readonly teamData: Map<number, TeamData> = new Map<number, TeamData>();

    public static getTeamData(team: mod.Team | number): TeamData {
        const teamId = typeof team === 'number' ? team : mod.GetObjId(team);
        if (!TeamVariables.teamData.has(teamId)) {
            TeamVariables.teamData.set(teamId, {
                capturingUITextColour1: [],
                capturingUITextColour2: [],
                capturingUIBackgroundColour1: [],
                capturingUIBackgroundColour2: [],
                capturingMessage1: [],
                capturingMessage2: [],
                playersOnPoint: [],
                score: 0,
                hqHealth: 100000,
                mcomCount: 2,
            });
        }
        return TeamVariables.teamData.get(teamId)!;
    }
}