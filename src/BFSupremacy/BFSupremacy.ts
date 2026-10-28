import { Events } from 'bf6-portal-utils/events';
import { BFSupremacyConquest } from './BFSConquest';
import { GameConfig, ObjectiveVariables, PlayerVariables, UIconfig, MCOMVariables, type SupremacyPlayerData } from './BFSVariables';
import { BFSupremacyUI } from './BFSUI';
import { BFSupremacyCore } from './BFSCore';
import { BFSupremacyPlayer } from './BFSPlayer';
import { BFSupremacyRegroup } from './BFSRegroup';
import { BFSupremacyFinalAssault } from './BFSFinalAssault';
import { BFSAudio } from './MFSAudio';
import { BFSWeather } from './BFSWeather';



const BLASTER_EFFECTS = false;

export class BFSupremacy {
    private static subscribed = false;
    // Every second tick: the script runs at about 60 Hz, and a camera change 33 ms later is not visible. The interact
    // check still runs every tick: IsInteracting is true for only a moment, so every second tick missed some shoulder
    // swaps.
    public static readonly CAMERA_EVERY_TICKS = 1;
    private static cameraTicks = 0;
    // Players by object id with their data, filled on deploy and emptied on leave, so no lookup happens per tick.
    public static cameraPlayers: Map<number, [mod.Player, SupremacyPlayerData]> = new Map();

    // ---- parallax-corrected aim dot ----
    // The zoomed camera sits beside the bullet line, so the point the bullet lands on is off screen centre by an amount that
    // depends on distance. One ray along the aim gives the distance and the dot moves there; it holds while firing.
    private static readonly DOT_RAY_START_M = 1.0;
    private static readonly DOT_RAY_RANGE_M = 300;          // a miss is treated as a hit this far away
    private static readonly DOT_CAMERA_BACK_M = 1.0;        // Andy's zoomed third-person camera sits 1 m behind the eye
    private static readonly DOT_FOV_RAD = 0.8167;           // the third-person camera's fixed vertical field of view (measured)
    private static readonly DOT_BELOW_M = 0.034;            // the bullet line runs this far below the camera axis
    private static readonly DOT_UI_HALF_HEIGHT = 540;       // UI units from screen centre to the top edge (1080-high UI)
    private static readonly DOT_FOCAL_UI = BFSupremacy.DOT_UI_HALF_HEIGHT / Math.tan(BFSupremacy.DOT_FOV_RAD / 2);
    public static readonly DOT_FOR_BOTS = false;
    private static readonly DOT_HOLD_TICKS = 18;            // 0.3 s at the 60 Hz script tick
    private static readonly DOT_MISS_GRACE_TICKS = 30;      // 0.5 s

    private static dotCast(eventPlayer: mod.Player, pd: SupremacyPlayerData): void {
        if (!pd.aimWidget || pd.stance === "ADS") return;   // no dot, or a scoped first-person view
        if (!BFSupremacy.DOT_FOR_BOTS && mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsAISoldier)) return;
        //if (mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsFiring)) pd.dotHoldUntil = BFSupremacy.cameraTicks + BFSupremacy.DOT_HOLD_TICKS;
        if (pd.dotHoldUntil !== undefined && BFSupremacy.cameraTicks < pd.dotHoldUntil) return;   // hold: no ray, no move
        const eye = mod.GetSoldierState(eventPlayer, mod.SoldierStateVector.EyePosition);
        const facing = mod.GetSoldierState(eventPlayer, mod.SoldierStateVector.GetFacingDirection);
        pd.dotEye = eye;
        pd.dotFacing = facing;
        pd.dotRayTick = BFSupremacy.cameraTicks;
        pd.dotPending = true;
        mod.RayCast(eventPlayer, mod.Add(eye, mod.Multiply(facing, BFSupremacy.DOT_RAY_START_M)),
            mod.Add(eye, mod.Multiply(facing, BFSupremacy.DOT_RAY_RANGE_M)));
    }

    public static dotHit(eventPlayer: mod.Player, point: mod.Vector | undefined): void {
        const entry = BFSupremacy.cameraPlayers.get(mod.GetObjId(eventPlayer));
        if (!entry) return;
        const pd = entry[1];
        if (pd.boltPending) { pd.boltPending = false; BFSupremacy.blasterLaunch(pd, point); }
        if (!pd.dotPending) return;
        pd.dotPending = false;
        if (!pd.aimWidget || !pd.dotEye) return;
        if (point) pd.dotLastHit = BFSupremacy.cameraTicks;
        else if (pd.dotLastHit !== undefined && BFSupremacy.cameraTicks - pd.dotLastHit < BFSupremacy.DOT_MISS_GRACE_TICKS) return;
        const depth = (point ? mod.DistanceBetween(pd.dotEye, point) : BFSupremacy.DOT_RAY_RANGE_M) + BFSupremacy.DOT_CAMERA_BACK_M;
        const side = pd.shoulder === "left" ? GameConfig.gameConfig.shoulderLeftCamZoom : GameConfig.gameConfig.shoulderRightCamZoom;
        const x = Math.round(-BFSupremacy.DOT_FOCAL_UI * side / depth);
        const y = Math.round(BFSupremacy.DOT_FOCAL_UI * BFSupremacy.DOT_BELOW_M / depth);   // UI y grows downward
        if (x === pd.dotX && y === pd.dotY && side === pd.dotSide) return;
        pd.dotX = x;
        pd.dotY = y;
        pd.dotSide = side;
        mod.SetUIWidgetPosition(pd.aimWidget, mod.CreateVector(x, y, 0));
    }

    // ---- blaster gag ----
    // Shots are seen as a drop in the magazine (GetInventoryAmmo is the magazine, GetInventoryMagazineAmmo the reserve).
    // The bolt shares the dot's ray when the dot cast this pass; bolts and impacts come from pools spawned once.
    private static readonly BLASTER_BOLT = mod.RuntimeSpawn_Common.FX_TracerDart_Projectile_Glow;
    private static readonly BLASTER_IMPACT = mod.RuntimeSpawn_Common.FX_RepairTool_Sparks_Damage;   // welder damage sparks
    // One sound: layering several (150+ full-length sounds a second at 64 players) lagged the game.
    private static readonly BLASTER_FIRE_SFX = [mod.RuntimeSpawn_Common.SFX_Projectiles_Flybys_Bullet_Whizby_Sniper_Main_OneShot3D];
    private static readonly BLASTER_HIT_SFX = mod.RuntimeSpawn_Common.SFX_Soldier_Melee_Hit_OneShot3D;
    private static readonly BLASTER_COLOR = mod.CreateVector(1, 0.1, 0.1);
    private static readonly BLASTER_BOLT_SCALE = 1;
    private static readonly BLASTER_SPEED_MPS = 60;          // close shots; farther ones fly faster to keep the cap
    private static readonly BLASTER_MAX_FLIGHT_S = 0.2;
    private static readonly BLASTER_START_M = 1;           // past the shooter's own head (bullets leave from the eye)
    // The bolt starts this far below the eye and flies to the bullet's impact, so it runs with the visible tracer from the
    // gun instead of above it. Portal gives no muzzle position (SoldierStateVector: eye, facing,
    // velocity, position only).
    private static readonly BLASTER_DROP_M = 0.2;
    private static readonly BLASTER_RANGE_M = 300;
    private static readonly BLASTER_BOLT_POOL = 24;
    private static readonly BLASTER_IMPACT_POOL = 0;
    private static readonly BLASTER_IMPACT_TICKS = 0;       // impact shows 0.2 s
    private static readonly BLASTER_SOUND_AMPLITUDE = 2;
    private static readonly BLASTER_SOUND_RANGE_M = 80;      // 3D, everyone in range hears it
    private static readonly BLASTER_DIAG = false;            // test only: log the human player's shots and bolt ends
    private static readonly BLASTER_PARK = mod.CreateVector(0, -500, 0);
    private static blasterBolts: mod.VFX[] = [];
    private static blasterImpacts: mod.VFX[] = [];
    private static blasterHitSfx: mod.SFX | undefined;
    private static blasterBoltNext = 0;
    private static blasterImpactNext = 0;
    private static blasterFlying: { vfx: mod.VFX; from: mod.Vector; dir: mod.Vector; length: number; travelled: number; step: number; hit: boolean }[] = [];
    private static blasterShown: { vfx: mod.VFX; until: number }[] = [];
    private static blasterFireSfx: mod.SFX[] = [];

    private static blasterActive: boolean[] = [];
    private static blasterFrom: mod.Vector[] = [];
    private static blasterDir: mod.Vector[] = [];
    private static blasterLength: number[] = [];
    private static blasterTravelled: number[] = [];
    private static blasterStep: number[] = [];
    private static blasterHit: boolean[] = [];

    private static blasterSpawn(kind: mod.RuntimeSpawn_Common, scale: number): mod.VFX {
        const e = mod.SpawnObject(kind, BFSupremacy.BLASTER_PARK, mod.CreateVector(0, 0, 0)) as unknown as mod.VFX;
        mod.EnableVFX(e, false);
        if (scale !== 1) mod.SetVFXScale(e, scale);
        mod.SetVFXColor(e, BFSupremacy.BLASTER_COLOR);
        return e;
    }


    public static blasterTick(): void {
        const now = BFSupremacy.cameraTicks;
        const zero = mod.CreateVector(0, 0, 0);

        // Create the pool once.
        if (BFSupremacy.blasterBolts.length === 0) {
            for (let i = 0; i < BFSupremacy.BLASTER_BOLT_POOL; i++) {
                const bolt = BFSupremacy.blasterSpawn(
                    BFSupremacy.BLASTER_BOLT,
                    BFSupremacy.BLASTER_BOLT_SCALE
                );

                BFSupremacy.blasterBolts.push(bolt);
                BFSupremacy.blasterActive.push(false);
            }
        }

        // Detect ammunition decreases.
        for (const [player, pd] of BFSupremacy.cameraPlayers.values()) {
            if (!pd.cameraEnabled || pd.interacting || !pd.cameraAlive) {
                continue;
            }

            const ammo =
                mod.GetInventoryAmmo(player, mod.InventorySlots.PrimaryWeapon) +
                mod.GetInventoryAmmo(player, mod.InventorySlots.SecondaryWeapon) * 1000;

            const previousAmmo = pd.blasterAmmo;
            pd.blasterAmmo = ammo;

            if (previousAmmo === undefined || ammo >= previousAmmo) {
                continue;
            }

            // Reuse the ray already cast for the aim dot when possible.
            if (pd.dotRayTick === now) {
                pd.boltEye = pd.dotEye;
                pd.boltDir = pd.dotFacing;
            } else {
                pd.boltEye = mod.GetSoldierState(
                    player,
                    mod.SoldierStateVector.EyePosition
                );

                pd.boltDir = mod.GetSoldierState(
                    player,
                    mod.SoldierStateVector.GetFacingDirection
                );

                if (pd.boltEye && pd.boltDir) {
                    mod.RayCast(
                        player,
                        mod.Add(
                            pd.boltEye,
                            mod.Multiply(
                                pd.boltDir,
                                BFSupremacy.DOT_RAY_START_M
                            )
                        ),
                        mod.Add(
                            pd.boltEye,
                            mod.Multiply(
                                pd.boltDir,
                                BFSupremacy.BLASTER_RANGE_M
                            )
                        )
                    );
                }
            }

            pd.boltPending = true;
        }

        // Update the fixed pool. No active-flight array or splice operations.
        for (let i = 0; i < BFSupremacy.blasterBolts.length; i++) {
            if (!BFSupremacy.blasterActive[i]) continue;

            const travelled = Math.min(
                BFSupremacy.blasterTravelled[i] +
                BFSupremacy.blasterStep[i],
                BFSupremacy.blasterLength[i]
            );

            BFSupremacy.blasterTravelled[i] = travelled;

            const at = mod.Add(
                BFSupremacy.blasterFrom[i],
                mod.Multiply(
                    BFSupremacy.blasterDir[i],
                    travelled
                )
            );

            mod.MoveVFX(
                BFSupremacy.blasterBolts[i],
                at,
                zero
            );

            if (travelled >= BFSupremacy.blasterLength[i]) {
                mod.EnableVFX(BFSupremacy.blasterBolts[i], false);
                BFSupremacy.blasterActive[i] = false;
            }
        }
    }



    private static blasterLaunch(
        pd: SupremacyPlayerData,
        point: mod.Vector | undefined
    ): void {
        const eye = pd.boltEye;
        const dir = pd.boltDir;

        if (!eye || !dir) return;

        const slot =
            BFSupremacy.blasterBoltNext %
            BFSupremacy.BLASTER_BOLT_POOL;

        BFSupremacy.blasterBoltNext =
            (slot + 1) % BFSupremacy.BLASTER_BOLT_POOL;

        const e = BFSupremacy.blasterBolts[slot];

        // Reuse this slot immediately. No search for an older flight.
        if (BFSupremacy.blasterActive[slot]) {
            mod.EnableVFX(e, false);
        }

        const flightDir = mod.Normalize(dir);

        // Keep the exact raycast hit point.
        const end = point ??
            mod.Add(eye, mod.Multiply(dir, BFSupremacy.BLASTER_RANGE_M));

        // Start on the same line as the raycast, slightly ahead of the eye.
        const from = mod.Add(
            eye,
            mod.Multiply(flightDir, BFSupremacy.BLASTER_START_M)
        );

        const length = mod.DistanceBetween(from, end);

        // This assumes OngoingGlobal is running at 30 Hz.
        // blasterTick runs every CAMERA_EVERY_TICKS global ticks.
        const tickSeconds =
            BFSupremacy.CAMERA_EVERY_TICKS / 30;

        const speed = Math.max(
            BFSupremacy.BLASTER_SPEED_MPS,
            length / BFSupremacy.BLASTER_MAX_FLIGHT_S
        );

        BFSupremacy.blasterFrom[slot] = from;
        BFSupremacy.blasterDir[slot] = flightDir;
        BFSupremacy.blasterLength[slot] = length;
        BFSupremacy.blasterTravelled[slot] = 0;
        BFSupremacy.blasterStep[slot] = speed * tickSeconds;
        BFSupremacy.blasterHit[slot] = point !== undefined;
        BFSupremacy.blasterActive[slot] = true;

        mod.MoveVFX(e, from, mod.CreateVector(0, 0, 0));
        mod.EnableVFX(e, true);
    }


    // Was the async OngoingPlayer subscriber: one engine dispatch, one GetObjId and two Promises per player per tick.
    public static cameraUpdate(eventPlayer: mod.Player, pd: SupremacyPlayerData, full: boolean): void {
        if (!pd.cameraEnabled || pd.interacting) return;
        // IsAlive is read on full ticks only; reading IsInteracting of a player who is not deployed throws.
        if (full) pd.cameraAlive = mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsAlive);
        if (!pd.cameraAlive) return;
        if (mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsInteracting)) {
            pd.interacting = true;
            BFSupremacy.cameraInteract(eventPlayer, pd);
            return;
        }
        if (full) BFSupremacy.cameraApply(eventPlayer, pd);
    }

    // The interact branch of the old subscriber, unchanged: the only part that waits.
    private static async cameraInteract(eventPlayer: mod.Player, pd: SupremacyPlayerData): Promise<void> {
        const aimWidget = pd.aimWidget;
        await mod.Wait(0.1);
        if (mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsReloading) && !pd.reloading) {
            pd.interacting = false;
            pd.reloading = true;
            await mod.Wait(3);
            pd.reloading = false;
            return;
        } else if (!mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsReviving) && !mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsInVehicle) && pd.stance != "ADS") {
            pd.stance = "changing";
            pd.thirdPerson = false;
            if (pd.shoulder === "left") {
                pd.shoulder = "right";
                if (aimWidget) {
                    mod.SetUIWidgetPosition(aimWidget, GameConfig.gameConfig.shoulderRightUI);
                }
            } else if (pd.shoulder === "right") {
                pd.shoulder = "left";
                if (aimWidget) {
                    mod.SetUIWidgetPosition(aimWidget, GameConfig.gameConfig.shoulderLeftUI);
                }
            }
        }
        BFSupremacy.cameraApply(eventPlayer, pd);
        await mod.Wait(0.033);
        pd.interacting = false;
    }

    // The camera choice of the old subscriber with the same results; state is read only where the branch needs it.
    private static cameraApply(eventPlayer: mod.Player, pd: SupremacyPlayerData): void {
        const aimWidget = pd.aimWidget;
        const cameraPos = pd.shoulder === "left" ? GameConfig.gameConfig.shoulderLeftCam : GameConfig.gameConfig.shoulderRightCam;
        const cameraZoom = pd.shoulder === "left" ? GameConfig.gameConfig.shoulderLeftCamZoom : GameConfig.gameConfig.shoulderRightCamZoom;

        if (mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsZooming)) {
            const specialWeaponActive = (pd.hasSniper && mod.IsInventorySlotActive(eventPlayer, mod.InventorySlots.PrimaryWeapon)) || (pd.hasLauncher && (mod.IsInventorySlotActive(eventPlayer, mod.InventorySlots.GadgetOne) || mod.IsInventorySlotActive(eventPlayer, mod.InventorySlots.GadgetTwo)));
            if (!pd.firstPerson && specialWeaponActive) {
                if (aimWidget) mod.SetUIWidgetVisible(aimWidget, false)
                mod.SetCameraTypeForPlayer(eventPlayer, mod.Cameras.FirstPerson);
                pd.firstPerson = true;
                pd.stance = "ADS"
            } else if (!specialWeaponActive) {
                if (pd.stance == "ADS") {
                    mod.SetCameraTypeForPlayer(eventPlayer, mod.Cameras.ThirdPerson)
                }
                if ((pd.stance != "standing" || pd.interacting) && mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsStanding)) {
                    mod.SetThirdPersonCameraPositionForPlayer(eventPlayer, 1, 0, cameraZoom)
                    pd.stance = "standing"
                    if (aimWidget) mod.SetUIWidgetVisible(aimWidget, true)
                } else if ((pd.stance != "crouching" || pd.interacting) && mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsCrouching)) {
                    mod.SetThirdPersonCameraPositionForPlayer(eventPlayer, 0.9, -0.15, cameraZoom)
                    pd.stance = "crouching"
                    if (aimWidget) mod.SetUIWidgetVisible(aimWidget, true)
                } else if ((pd.stance != "prone" || pd.interacting) && mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsProne)) {
                    mod.SetThirdPersonCameraPositionForPlayer(eventPlayer, 0.8, -0.25, cameraZoom)
                    pd.stance = "prone"
                    if (aimWidget) mod.SetUIWidgetVisible(aimWidget, true)
                }
            }
            BFSupremacy.dotCast(eventPlayer, pd);
            pd.firstPerson = true;
            pd.thirdPerson = false;
        } else {
            const isSprinting = mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsSprinting);
            pd.firstPerson = false;
            pd.thirdPerson = true;
            if (isSprinting) {
                if (pd.stance !== "sprinting" || pd.interacting) {
                    if (pd.stance === "ADS") {
                        mod.SetCameraTypeForPlayer(eventPlayer, mod.Cameras.ThirdPerson);
                    }
                    pd.sprinting = true;
                    pd.stance = "sprinting";
                    mod.SetThirdPersonCameraPositionForPlayer(eventPlayer, 2.2, 0, cameraPos);
                    if (aimWidget) mod.SetUIWidgetVisible(aimWidget, false);
                }
            } else {
                if (pd.stance !== "3rdperson" || pd.interacting) {
                    if (pd.stance === "ADS") {
                        mod.SetCameraTypeForPlayer(eventPlayer, mod.Cameras.ThirdPerson);
                    }
                    pd.sprinting = false;
                    pd.stance = "3rdperson";
                    mod.SetThirdPersonCameraPositionForPlayer(eventPlayer, 2.5, 0, cameraPos);
                    if (aimWidget) mod.SetUIWidgetVisible(aimWidget, false);
                }
            }
        }
    }

    // One vehicle lookup for the air-vehicle checks (they called GetVehicleFromPlayer once per aircraft type).
    public static isAirVehicle(vehicle: mod.Vehicle | undefined): boolean {
        if (!vehicle) return false;
        return GameConfig.gameConfig.airVehicles.some(name => mod.CompareVehicleName(vehicle, name));
    }

    public static init(): void {
        if (BFSupremacy.subscribed) {
            return;
        }

        Events.OngoingGlobal.subscribe(() => {
            if (GameConfig.gameConfig.gameStarted as boolean)
                if (GameConfig.gameConfig.gameStarted && GameConfig.gameConfig.roundOngoing) {
                    if (GameConfig.gameConfig.stage == 0) {
                        BFSupremacyUI.UI_AlphaUpdate();
                        BFSupremacyConquest.ongoingConquest();
                    } else if (GameConfig.gameConfig.stage == 1) {
                        BFSupremacyRegroup.ongoingRegroup();
                    } else if (GameConfig.gameConfig.stage == 2) {
                        BFSupremacyUI.UI_AlphaUpdate();
                        BFSupremacyFinalAssault.ongoingFinalAssault();
                    }
                }
        });

        // The third-person camera, run from OngoingGlobal over the players seen deploying (see cameraUpdate).
        Events.OngoingGlobal.subscribe(() => {
            const full = ++BFSupremacy.cameraTicks % BFSupremacy.CAMERA_EVERY_TICKS === 0;
            if (!GameConfig.gameConfig.gameStarted || GameConfig.gameConfig.cutscene) return;
            for (const [player, pd] of BFSupremacy.cameraPlayers.values()) BFSupremacy.cameraUpdate(player, pd, full);
            if (BLASTER_EFFECTS && full) BFSupremacy.blasterTick();
        });

        Events.OngoingPlayer.subscribe((eventPlayer: mod.Player) => {

        })

        Events.OnRayCastHit.subscribe((eventPlayer: mod.Player, point: mod.Vector) => BFSupremacy.dotHit(eventPlayer, point));
        Events.OnRayCastMissed.subscribe((eventPlayer: mod.Player) => BFSupremacy.dotHit(eventPlayer, undefined));

        Events.OnPlayerDeployed.subscribe((eventPlayer: mod.Player) => {
            BFSupremacy.cameraPlayers.set(mod.GetObjId(eventPlayer), [eventPlayer, PlayerVariables.getPlayerData(eventPlayer)]);
        });

        Events.OnPlayerInteract.subscribe((eventPlayer: mod.Player, interactPoint: mod.InteractPoint) => {

        });




        Events.OnPlayerExitCapturePoint.subscribe((eventPlayer: mod.Player, eventCapturePoint: mod.CapturePoint) => {
            PlayerVariables.getPlayerData(eventPlayer).onPoint = false;
        });

        Events.OnCapturePointCaptured.subscribe(async (eventCapturePoint: mod.CapturePoint) => {
            await mod.Wait(0.1)
            BFSAudio.plagFlagCapturedVO(eventCapturePoint);
            let flagID = mod.GetObjId(eventCapturePoint);
            mod.SetMaxCaptureMultiplier(eventCapturePoint, 1);
            if (GameConfig.gameConfig.gameStarted) {

                let ownerTeam = mod.GetCurrentOwnerTeam(eventCapturePoint);
                let playersOnPoint = mod.GetPlayersOnPoint(eventCapturePoint) as mod.Array;
                for (let i = 0; i < mod.CountOf(playersOnPoint); i++) {
                    let p = mod.ValueInArray(playersOnPoint, i) as mod.Player;
                    if (mod.Equals(mod.GetTeam(p), ownerTeam)) {
                        PlayerVariables.getPlayerData(p).score += 200;
                        PlayerVariables.getPlayerData(p).captures++;
                        BFSupremacyCore.scoreboardUpdate(p);
                        BFSAudio.playCapturedSound(p);
                    }
                }

                if (mod.Equals(GameConfig.gameConfig.stage, 2)) {
                    if (mod.Equals(ownerTeam, GameConfig.gameConfig.attacker) && (flagID >= GameConfig.gameConfig.flagStart && flagID <= GameConfig.gameConfig.flagEnd)) {
                        await BFSupremacyFinalAssault.moveToFinalSectorLevel2();
                    }
                } else {
                    mod.SetCapturePointCapturingTime(eventCapturePoint, GameConfig.gameConfig.capturePointCapturingTime);
                }
                let t1Control = 0;
                let t2Control = 0;

                for (let i = 200; i < 220; i++) {
                    let capturePoint = mod.GetCapturePoint(i);
                    if (mod.IsValid(capturePoint)) {
                        let owner = mod.GetCurrentOwnerTeam(capturePoint);
                        if (mod.Equals(owner, mod.GetTeam(1))) {
                            t1Control++;
                        } else if (mod.Equals(owner, mod.GetTeam(2))) {
                            t2Control++;
                        }
                    }
                }
                if (t1Control > t2Control) {
                    UIconfig.uiConfig.ProgressFlashT1 = true;
                    UIconfig.uiConfig.ProgressFlashT2 = false;
                } else if (t2Control > t1Control) {
                    UIconfig.uiConfig.ProgressFlashT2 = true;
                    UIconfig.uiConfig.ProgressFlashT1 = false;
                } else {
                    UIconfig.uiConfig.ProgressFlashT1 = false;
                    UIconfig.uiConfig.ProgressFlashT2 = false;
                }
            }

        });

        Events.OnCapturePointLost.subscribe(async (eventCapturePoint: mod.CapturePoint) => {
            if (mod.Equals(GameConfig.gameConfig.stage, 0)) {
                mod.SetCapturePointCapturingTime(eventCapturePoint, 0);
            }
            await mod.Wait(0.1)
            let ownerTeam = mod.GetOwnerProgressTeam(eventCapturePoint);
            let playersOnPoint = mod.GetPlayersOnPoint(eventCapturePoint) as mod.Array;
            for (let i = 0; i < mod.CountOf(playersOnPoint); i++) {
                let p = mod.ValueInArray(playersOnPoint, i) as mod.Player;
                if (mod.Equals(mod.GetTeam(p), ownerTeam)) {
                    PlayerVariables.getPlayerData(p).score += 200;
                    PlayerVariables.getPlayerData(p).captures++;
                    BFSupremacyCore.scoreboardUpdate(p);
                }
            }
        });

        Events.OnPlayerJoinGame.subscribe((eventPlayer: mod.Player) => {
            BFSWeather.checkNight(eventPlayer);
        });

        Events.OnPlayerDeployed.subscribe(async (eventPlayer: mod.Player) => {
            PlayerVariables.getPlayerData(eventPlayer).spawned = true;

            if (UIconfig.uiConfig.launchers.some(weapon => mod.HasEquipment(eventPlayer, weapon))) {
                PlayerVariables.getPlayerData(eventPlayer).hasLauncher = true;
            } else {
                PlayerVariables.getPlayerData(eventPlayer).hasLauncher = false;
            }

            if (UIconfig.uiConfig.snipers.some(weapon => mod.HasEquipment(eventPlayer, weapon))) {
                PlayerVariables.getPlayerData(eventPlayer).hasSniper = true;
            } else {
                PlayerVariables.getPlayerData(eventPlayer).hasSniper = false;
            }

            if (!mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsInVehicle)) {
                PlayerVariables.getPlayerData(eventPlayer).cameraEnabled = true;
            }

            if (!GameConfig.gameConfig.cutscene && !mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsInVehicle)) {
                //Force Reset the Camera as height can bug out
                await mod.Wait(0.4);
                mod.SetCameraTypeForPlayer(eventPlayer, mod.Cameras.FirstPerson)
                const aimWidget = PlayerVariables.getPlayerData(eventPlayer).aimWidget;
                if (aimWidget) mod.SetUIWidgetVisible(aimWidget, false)
                await mod.Wait(0.1);
                if (!GameConfig.gameConfig.cutscene && !mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsInVehicle)) {
                    mod.SetCameraTypeForPlayer(eventPlayer, mod.Cameras.ThirdPerson)
                }
            }
            BFSWeather.checkNight(eventPlayer);

            if (PlayerVariables.getPlayerData(eventPlayer).firstDeploy) {
                BFSupremacyPlayer.createPlayerUI(eventPlayer);
                PlayerVariables.getPlayerData(eventPlayer).firstDeploy = false;
            }
            if (GameConfig.gameConfig.roundOngoing) {
                mod.EnableAllInputRestrictions(eventPlayer, false);
            }
            await mod.Wait(1);
            if (mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsInVehicle)) {
                const regroupVehicle = GameConfig.gameConfig.regroupVehicle;
                const regroupBot = GameConfig.gameConfig.regroupBot;
                const vehicle = mod.GetVehicleFromPlayer(eventPlayer);
                if (regroupVehicle && vehicle && mod.Equals(vehicle, regroupVehicle)) {
                    if (!regroupBot || !mod.Equals(eventPlayer, regroupBot)) {
                        mod.UndeployPlayer(eventPlayer);
                        mod.DisplayNotificationMessage(mod.Message(mod.stringkeys.regroup.undeploy), eventPlayer);
                    }
                }
            }
            PlayerVariables.getPlayerData(eventPlayer).spawned = false;
        });

        Events.OnPlayerEarnedKill.subscribe((eventPlayer: mod.Player, eventOtherPlayer: mod.Player, eventDeathType: mod.DeathType) => {
            PlayerVariables.getPlayerData(eventPlayer).kills++;
            PlayerVariables.getPlayerData(eventPlayer).score += 100;
            if (mod.EventDeathTypeCompare(eventDeathType, mod.PlayerDeathTypes.Headshot)) {
                PlayerVariables.getPlayerData(eventPlayer).score += 10;
            }
            if (PlayerVariables.getPlayerData(eventPlayer).onPoint) {
                PlayerVariables.getPlayerData(eventPlayer).score += 50;
            }
            BFSupremacyCore.scoreboardUpdate(eventPlayer);
        });

        Events.OnPlayerEarnedKillAssist.subscribe((eventPlayer: mod.Player, eventOtherPlayer: mod.Player) => {
            PlayerVariables.getPlayerData(eventPlayer).assists++;
            PlayerVariables.getPlayerData(eventPlayer).score += 50;
            BFSupremacyCore.scoreboardUpdate(eventPlayer);
        });

        Events.OnRevived.subscribe((eventPlayer: mod.Player, eventOtherPlayer: mod.Player) => {
            mod.SetCameraTypeForPlayer(eventPlayer, mod.Cameras.ThirdPerson);
            PlayerVariables.getPlayerData(eventPlayer).cameraEnabled = true;
        });

        Events.OnPlayerUndeploy.subscribe(async (eventPlayer: mod.Player) => {
            if (GameConfig.gameConfig.roundOngoing) {
                PlayerVariables.getPlayerData(eventPlayer).deaths++;
                BFSupremacyCore.scoreboardUpdate(eventPlayer);
            }
            await mod.Wait(1);
            const widget = PlayerVariables.getPlayerData(eventPlayer).aimWidget
            if (widget) {
                mod.SetUIWidgetVisible(widget, false);
            }
            PlayerVariables.getPlayerData(eventPlayer).onPoint = false;
            PlayerVariables.getPlayerData(eventPlayer).area = 0;
            PlayerVariables.getPlayerData(eventPlayer).ingoreOOB = false;
            PlayerVariables.getPlayerData(eventPlayer).inEnemyHQ = false;
            PlayerVariables.getPlayerData(eventPlayer).inAirspace = false;
        });

        Events.OnPlayerDied.subscribe((eventPlayer: mod.Player, eventOtherPlayer: mod.Player) => {
            if (GameConfig.gameConfig.cutscene) return;
            if (!PlayerVariables.getPlayerData(eventPlayer).firstPerson) {
                mod.SetCameraTypeForPlayer(eventPlayer, mod.Cameras.FirstPerson);
            }
            PlayerVariables.getPlayerData(eventPlayer).cameraEnabled = false;
            const aimWidget = PlayerVariables.getPlayerData(eventPlayer).aimWidget;
            if (aimWidget) mod.SetUIWidgetVisible(aimWidget, false)
        });

        Events.OnPlayerLeaveGame.subscribe((playerId: number) => {
            BFSupremacy.cameraPlayers.delete(playerId);
            const pd = PlayerVariables.playerData.get(playerId);
            if (pd && pd.uiCreated) {
                mod.DeleteUIWidget(pd.containerWidget);
                if (pd.aimWidget) mod.DeleteUIWidget(pd.aimWidget);
            }
            PlayerVariables.playerData.delete(playerId);
        });

        Events.OnPlayerEnterAreaTrigger.subscribe(async (eventPlayer: mod.Player, eventAreaTrigger: mod.AreaTrigger) => {
            const pd = PlayerVariables.getPlayerData(eventPlayer);
            await mod.Wait(0.033);

            pd.area++;
            if (!mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsAlive)) {
                return;
            }

            let areaID = mod.GetObjId(eventAreaTrigger);
            let team = mod.GetTeam(eventPlayer);

            if (areaID == 1400) {
                PlayerVariables.getPlayerData(eventPlayer).inAirspace = true;
                if (mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsInVehicle)) {
                    if (BFSupremacy.isAirVehicle(mod.GetVehicleFromPlayer(eventPlayer))) {
                        PlayerVariables.getPlayerData(eventPlayer).outOfBounds = false;
                    }
                }
            } else if (mod.Equals(team, mod.GetTeam(1))) {
                if (areaID >= 1200 && areaID <= 1299) {
                    PlayerVariables.getPlayerData(eventPlayer).inEnemyHQ = true;
                    if (mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsInVehicle)) {
                        if (BFSupremacy.isAirVehicle(mod.GetVehicleFromPlayer(eventPlayer))) {
                            PlayerVariables.getPlayerData(eventPlayer).outOfBounds = false;
                        }
                    } else {
                        BFSupremacyUI.outOfBoundsUI(eventPlayer);
                    }
                } else {
                    PlayerVariables.getPlayerData(eventPlayer).outOfBounds = false;
                }
            } else if (mod.Equals(team, mod.GetTeam(2))) {
                if (areaID >= 1100 && areaID <= 1199) {
                    PlayerVariables.getPlayerData(eventPlayer).inEnemyHQ = true;
                    if (mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsInVehicle)) {
                        if (BFSupremacy.isAirVehicle(mod.GetVehicleFromPlayer(eventPlayer))) {
                            PlayerVariables.getPlayerData(eventPlayer).outOfBounds = false;
                        }
                    } else {
                        BFSupremacyUI.outOfBoundsUI(eventPlayer);
                    }
                } else {
                    PlayerVariables.getPlayerData(eventPlayer).outOfBounds = false;
                }
            }
        });

        Events.OnPlayerExitAreaTrigger.subscribe(async (eventPlayer: mod.Player, eventAreaTrigger: mod.AreaTrigger) => {
            await mod.Wait(0.066);
            PlayerVariables.getPlayerData(eventPlayer).area--;
            let areaID = mod.GetObjId(eventAreaTrigger);
            const pd = PlayerVariables.getPlayerData(eventPlayer);

            if (areaID == 1400) {
                pd.inAirspace = false;
                BFSupremacyUI.outOfBoundsUI(eventPlayer);
            }

            if (pd.area == 1 && pd.inAirspace) {
                if (mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsInVehicle)) {
                    if (BFSupremacy.isAirVehicle(mod.GetVehicleFromPlayer(eventPlayer))) {
                        pd.outOfBounds = false;
                    } else {
                        BFSupremacyUI.outOfBoundsUI(eventPlayer);
                    }
                } else {
                    BFSupremacyUI.outOfBoundsUI(eventPlayer);
                }
            } else if (pd.area < 1) {
                BFSupremacyUI.outOfBoundsUI(eventPlayer);
            }

            //Match the ranges used in OnPlayerEnterAreaTrigger: 1100-1199 (team 2 HQ) and 1200-1299 (team 1 HQ).
            if (areaID >= 1100 && areaID <= 1299) {
                pd.inEnemyHQ = false;
            }
        });

        Events.OnSpawnerSpawned.subscribe((eventPlayer: mod.Player, eventSpawner: mod.Spawner) => {
            BFSupremacyRegroup.onBotSpawned(eventPlayer, eventSpawner);
        });

        Events.OnVehicleSpawned.subscribe((eventVehicle: mod.Vehicle) => {
            BFSupremacyRegroup.onVehicleSpawned(eventVehicle);
        });

        Events.OnPlayerEnterVehicle.subscribe(async (eventPlayer: mod.Player, eventVehicle: mod.Vehicle) => {
            await mod.Wait(0.1);
            PlayerVariables.getPlayerData(eventPlayer).cameraEnabled = false;

            if (PlayerVariables.getPlayerData(eventPlayer).area > 0) {
                if (BFSupremacy.isAirVehicle(mod.GetVehicleFromPlayer(eventPlayer))) {
                    PlayerVariables.getPlayerData(eventPlayer).outOfBounds = false;
                }
            }

            if (GameConfig.gameConfig.stage === 1) {
                const regroupVehicle = GameConfig.gameConfig.regroupVehicle;
                const regroupBot = GameConfig.gameConfig.regroupBot;
                if (regroupVehicle && eventVehicle && mod.Equals(eventVehicle, regroupVehicle)) {
                    if (!regroupBot || !mod.Equals(eventPlayer, regroupBot)) {
                        if (GameConfig.gameConfig.extractReady && !PlayerVariables.getPlayerData(eventPlayer).spawned && !PlayerVariables.getPlayerData(eventPlayer).boarded) {
                            PlayerVariables.getPlayerData(eventPlayer).ingoreOOB = true;
                            PlayerVariables.getPlayerData(eventPlayer).boarded = true;
                            BFSupremacyRegroup.playerBoarding(eventPlayer, eventVehicle);
                        } else if (PlayerVariables.getPlayerData(eventPlayer).spawned || PlayerVariables.getPlayerData(eventPlayer).boarded) {
                            mod.UndeployPlayer(eventPlayer);
                        } else {
                            mod.ForcePlayerExitVehicle(eventPlayer, eventVehicle);
                        }
                    }
                }
            }
        });

        Events.OnPlayerExitVehicle.subscribe(async (eventPlayer: mod.Player, eventVehicle: mod.Vehicle) => {
            if (!GameConfig.gameConfig.cutscene) {
                //Force Reset the Camera as height can bug out
                //regroupVehicle is undefined once the regroup stage ends, so it must be checked before mod.Equals.
                const regroupVehicle = GameConfig.gameConfig.regroupVehicle;
                if (!regroupVehicle || !eventVehicle || !mod.Equals(eventVehicle, regroupVehicle)) {
                    mod.SetCameraTypeForPlayer(eventPlayer, mod.Cameras.FirstPerson)
                    mod.SetCameraTypeForPlayer(eventPlayer, mod.Cameras.FirstPerson)
                    mod.SetCameraTypeForPlayer(eventPlayer, mod.Cameras.ThirdPerson)
                    PlayerVariables.getPlayerData(eventPlayer).cameraEnabled = true;
                }
            }

            const pd = PlayerVariables.getPlayerData(eventPlayer);
            if (pd.inEnemyHQ) {
                //Enemy HQ always wins: area can be > 1 because the play area and air combat triggers overlap the HQ.
                BFSupremacyUI.outOfBoundsUI(eventPlayer);
            } else if (pd.inAirspace) {
                if (pd.area == 1) {
                    BFSupremacyUI.outOfBoundsUI(eventPlayer);
                }
            } else if (pd.area < 1) {
                BFSupremacyUI.outOfBoundsUI(eventPlayer);
            }
        });

        Events.OnMCOMArmed.subscribe((eventMCOM: mod.MCOM) => {
            GameConfig.gameConfig.overtime += 1;
            MCOMVariables.getMCOMData(eventMCOM).isArmed = true;
            BFSAudio.MCOMArmedVO(eventMCOM);
            let player = mod.ClosestPlayerTo(mod.GetObjectPosition(eventMCOM), GameConfig.gameConfig.attacker)
            MCOMVariables.getMCOMData(eventMCOM).armedBy = player;
            BFSupremacyPlayer.MCOMScoring(player);
        });

        Events.OnMCOMDestroyed.subscribe((eventMCOM: mod.MCOM) => {
            BFSupremacyFinalAssault.MCOMDestroyed();
            GameConfig.gameConfig.overtime -= 1;
            const data = MCOMVariables.getMCOMData(eventMCOM);
            data.isDestroyed = true;
            data.isArmed = false;
            BFSAudio.MCOMDestroyedVO(eventMCOM);
            let player = MCOMVariables.getMCOMData(eventMCOM).armedBy
            if (player) {
                BFSupremacyPlayer.MCOMScoring(player);
            }
        });

        Events.OnMCOMDefused.subscribe((eventMCOM: mod.MCOM) => {
            GameConfig.gameConfig.overtime -= 1;
            MCOMVariables.getMCOMData(eventMCOM).isArmed = false;
            BFSAudio.MCOMDefuseVO(eventMCOM);
            let player = mod.ClosestPlayerTo(mod.GetObjectPosition(eventMCOM), GameConfig.gameConfig.defender)
            BFSupremacyPlayer.MCOMScoring(player);
        });

        BFSupremacy.subscribed = true;
    }

}