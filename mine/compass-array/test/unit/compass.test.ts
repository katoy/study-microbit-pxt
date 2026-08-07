import { describe, it, expect } from 'vitest';
import { getDirection, ArrowNames } from '../../src/compass';

describe('ArrowNames Enum', () => {
    it('has correct numeric values for all directions', () => {
        expect(ArrowNames.North).toBe(0);
        expect(ArrowNames.NorthEast).toBe(1);
        expect(ArrowNames.East).toBe(2);
        expect(ArrowNames.SouthEast).toBe(3);
        expect(ArrowNames.South).toBe(4);
        expect(ArrowNames.SouthWest).toBe(5);
        expect(ArrowNames.West).toBe(6);
        expect(ArrowNames.NorthWest).toBe(7);
    });
});

describe('getDirection Unit Tests (100% Coverage)', () => {
    describe('North (0 <= deg < 23 || 338 <= deg <= 359)', () => {
        it('returns North for 0 degrees', () => {
            expect(getDirection(0)).toBe(ArrowNames.North);
        });
        it('returns North for 22 degrees (boundary value)', () => {
            expect(getDirection(22)).toBe(ArrowNames.North);
        });
        it('returns North for 22.99 degrees (float threshold)', () => {
            expect(getDirection(22.99)).toBe(ArrowNames.North);
        });
        it('returns North for 338 degrees (boundary value)', () => {
            expect(getDirection(338)).toBe(ArrowNames.North);
        });
        it('returns North for 359 degrees', () => {
            expect(getDirection(359)).toBe(ArrowNames.North);
        });
        it('returns North for values >= 338 or < 23 (e.g. 360, -1)', () => {
            expect(getDirection(360)).toBe(ArrowNames.North);
            expect(getDirection(-1)).toBe(ArrowNames.North);
        });
    });

    describe('NorthEast input (23 <= deg < 68) -> returns NorthWest', () => {
        it('returns NorthWest for 23 degrees (boundary value)', () => {
            expect(getDirection(23)).toBe(ArrowNames.NorthWest);
        });
        it('returns NorthWest for 45 degrees', () => {
            expect(getDirection(45)).toBe(ArrowNames.NorthWest);
        });
        it('returns NorthWest for 67 degrees (boundary value)', () => {
            expect(getDirection(67)).toBe(ArrowNames.NorthWest);
        });
        it('returns NorthWest for 67.99 degrees (float threshold)', () => {
            expect(getDirection(67.99)).toBe(ArrowNames.NorthWest);
        });
    });

    describe('East input (68 <= deg < 113) -> returns West', () => {
        it('returns West for 68 degrees (boundary value)', () => {
            expect(getDirection(68)).toBe(ArrowNames.West);
        });
        it('returns West for 90 degrees', () => {
            expect(getDirection(90)).toBe(ArrowNames.West);
        });
        it('returns West for 112 degrees (boundary value)', () => {
            expect(getDirection(112)).toBe(ArrowNames.West);
        });
        it('returns West for 112.99 degrees (float threshold)', () => {
            expect(getDirection(112.99)).toBe(ArrowNames.West);
        });
    });

    describe('SouthEast input (113 <= deg < 158) -> returns SouthWest', () => {
        it('returns SouthWest for 113 degrees (boundary value)', () => {
            expect(getDirection(113)).toBe(ArrowNames.SouthWest);
        });
        it('returns SouthWest for 135 degrees', () => {
            expect(getDirection(135)).toBe(ArrowNames.SouthWest);
        });
        it('returns SouthWest for 157 degrees (boundary value)', () => {
            expect(getDirection(157)).toBe(ArrowNames.SouthWest);
        });
        it('returns SouthWest for 157.99 degrees (float threshold)', () => {
            expect(getDirection(157.99)).toBe(ArrowNames.SouthWest);
        });
    });

    describe('South input (158 <= deg < 203) -> returns South', () => {
        it('returns South for 158 degrees (boundary value)', () => {
            expect(getDirection(158)).toBe(ArrowNames.South);
        });
        it('returns South for 180 degrees', () => {
            expect(getDirection(180)).toBe(ArrowNames.South);
        });
        it('returns South for 202 degrees (boundary value)', () => {
            expect(getDirection(202)).toBe(ArrowNames.South);
        });
        it('returns South for 202.99 degrees (float threshold)', () => {
            expect(getDirection(202.99)).toBe(ArrowNames.South);
        });
    });

    describe('SouthWest input (203 <= deg < 248) -> returns SouthEast', () => {
        it('returns SouthEast for 203 degrees (boundary value)', () => {
            expect(getDirection(203)).toBe(ArrowNames.SouthEast);
        });
        it('returns SouthEast for 225 degrees', () => {
            expect(getDirection(225)).toBe(ArrowNames.SouthEast);
        });
        it('returns SouthEast for 247 degrees (boundary value)', () => {
            expect(getDirection(247)).toBe(ArrowNames.SouthEast);
        });
        it('returns SouthEast for 247.99 degrees (float threshold)', () => {
            expect(getDirection(247.99)).toBe(ArrowNames.SouthEast);
        });
    });

    describe('West input (248 <= deg < 293) -> returns East', () => {
        it('returns East for 248 degrees (boundary value)', () => {
            expect(getDirection(248)).toBe(ArrowNames.East);
        });
        it('returns East for 270 degrees', () => {
            expect(getDirection(270)).toBe(ArrowNames.East);
        });
        it('returns East for 292 degrees (boundary value)', () => {
            expect(getDirection(292)).toBe(ArrowNames.East);
        });
        it('returns East for 292.99 degrees (float threshold)', () => {
            expect(getDirection(292.99)).toBe(ArrowNames.East);
        });
    });

    describe('NorthWest input (293 <= deg < 338) -> returns NorthEast', () => {
        it('returns NorthEast for 293 degrees (boundary value)', () => {
            expect(getDirection(293)).toBe(ArrowNames.NorthEast);
        });
        it('returns NorthEast for 315 degrees', () => {
            expect(getDirection(315)).toBe(ArrowNames.NorthEast);
        });
        it('returns NorthEast for 337 degrees (boundary value)', () => {
            expect(getDirection(337)).toBe(ArrowNames.NorthEast);
        });
        it('returns NorthEast for 337.99 degrees (float threshold)', () => {
            expect(getDirection(337.99)).toBe(ArrowNames.NorthEast);
        });
    });

    describe('Out-of-bounds / Negative angles (Normalization)', () => {
        it('handles negative angles (e.g. -45 is normalized to 315, returning NorthEast)', () => {
            expect(getDirection(-45)).toBe(ArrowNames.NorthEast);
        });
        it('handles negative angles (e.g. -90 is normalized to 270, returning East)', () => {
            expect(getDirection(-90)).toBe(ArrowNames.East);
        });
        it('handles angles >= 360 (e.g. 450 is normalized to 90, returning West)', () => {
            expect(getDirection(450)).toBe(ArrowNames.West);
        });
        it('handles large negative angles (e.g. -405 is normalized to 315, returning NorthEast)', () => {
            expect(getDirection(-405)).toBe(ArrowNames.NorthEast);
        });
    });
});
