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
    readonly stage: number;
    readonly ticketSpeed: number;
    readonly attacker: mod.Team;
    readonly defender: mod.Team;
}

export class GameConfig {
    public static readonly gameConfig: GameConfig = {
        stage: 0,
        ticketSpeed: 5,
        attacker: mod.GetTeam(1),
        defender: mod.GetTeam(2),


    };
}
