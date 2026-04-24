export interface UIConfig {
    readonly friendlyColour: mod.Vector;
    readonly enemyColour: mod.Vector;
    readonly friendlyBgColour: mod.Vector;
    readonly enemyBgColour: mod.Vector;
    readonly goldColour: mod.Vector;
    readonly goldBgColour: mod.Vector;
    readonly whiteColour: mod.Vector;
    readonly leftProgressBarWidth: number;
    readonly rightProgressBarWidth: number;
    readonly leftProgressBarPosition: mod.Vector;
    readonly rightProgressBarPosition: mod.Vector;
}

export class UIConfig {
    public static readonly uiConfig: UIConfig = {
        friendlyColour: mod.CreateVector(0, 0.7, 1),
        enemyColour: mod.CreateVector(1, 0.2, 0.2),
        friendlyBgColour: mod.CreateVector(0, 0.15, 0.3),
        enemyBgColour: mod.CreateVector(0.4, 0, 0),
        goldColour: mod.CreateVector(1, 0.8, 0),
        goldBgColour: mod.CreateVector(0.5, 0.4, 0),
        whiteColour: mod.CreateVector(1, 1, 1),
        leftProgressBarWidth: 600,
        rightProgressBarWidth: 600,
        leftProgressBarPosition: mod.CreateVector(150, 152, 0),
        rightProgressBarPosition: mod.CreateVector(150, 152, 0),
    };
}

export interface GameConfig {
    readonly gameStarted: boolean;
    readonly stage: number;
    readonly ticketSpeed: number;
    readonly attacker: mod.Team;
    readonly defender: mod.Team;
    readonly baseAttackTime: number;
    readonly bonusTimeAddition: number;
    readonly remainingTime: number;
    readonly team1Progress: number;
    readonly team2Progress: number;
    readonly team1MCOMs: number;
    readonly team2MCOMs: number;
    readonly team1HQHealth: number;
    readonly team2HQHealth: number;
    readonly elapsedTime: number;
    readonly flags: mod.CapturePoint[];
    readonly capturePointProgress: number[];
    readonly captureProgressSize: number[];
    readonly captureProgressPosition: mod.Vector[];
    readonly capturingUITextColour1: mod.Vector[];
    readonly capturingUITextColour2: mod.Vector[];
    readonly capturingUIBackgroundColour1: mod.Vector[];
    readonly capturingUIBackgroundColour2: mod.Vector[];
    readonly capturingMessage1: string[];
    readonly capturingMessage2: string[];
}

export class GameConfig {
    public static readonly gameConfig: GameConfig = {
        gameStarted: false,
        stage: 0,
        ticketSpeed: 5,
        baseAttackTime: 450,
        bonusTimeAddition: 10,
        remainingTime: 0,
        attacker: mod.GetTeam(1),
        defender: mod.GetTeam(2),
        team1Progress: 0,
        team2Progress: 0,
        team1MCOMs: 2,
        team2MCOMs: 2,
        team1HQHealth: 100000,
        team2HQHealth: 100000,
        elapsedTime: 0,
        flags: [],
        capturePointProgress: [],
        captureProgressSize: [],
        captureProgressPosition: [],
        capturingUITextColour1: [],
        capturingUITextColour2: [],
        capturingUIBackgroundColour1: [],
        capturingUIBackgroundColour2: [],
        capturingMessage1: [],
        capturingMessage2: [],
    };
}

export interface SupremacyPlayerData {
    kills: number;
    deaths: number;
    status: number;
}

export class PlayerVariables {
    public static readonly playerData: Map<number, SupremacyPlayerData> = new Map<number, SupremacyPlayerData>();

    public static getPlayerData(player: mod.Player | number): SupremacyPlayerData {
        const playerId = typeof player === 'number' ? player : mod.GetObjId(player);
        if (!PlayerVariables.playerData.has(playerId)) {
            PlayerVariables.playerData.set(playerId, {
                kills: 0,
                deaths: 0,
                status: 0
            });
        }
        return PlayerVariables.playerData.get(playerId)!;
    }
}
