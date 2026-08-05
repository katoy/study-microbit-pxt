import { describe, it, expect } from 'vitest';
import { getDirection, ArrowNames } from '../../src/compass';

describe('getDirection Unit Tests (100% Coverage)', () => {
    describe('North (0 <= deg < 23 || 338 <= deg <= 359)', () => {
        it('returns North for 0 degrees', () => {
            expect(getDirection(0)).toBe(ArrowNames.North);
        });
        it('returns North for 22 degrees (boundary value)', () => {
            expect(getDirection(22)).toBe(ArrowNames.North);
        });
        it('returns North for 338 degrees (boundary value)', () => {
            expect(getDirection(338)).toBe(ArrowNames.North);
        });
        it('returns North for 359 degrees', () => {
            expect(getDirection(359)).toBe(ArrowNames.North);
        });
    });

    describe('NorthEast (23 <= deg < 68)', () => {
        it('returns NorthEast for 23 degrees (boundary value)', () => {
            expect(getDirection(23)).toBe(ArrowNames.NorthEast);
        });
        it('returns NorthEast for 45 degrees', () => {
            expect(getDirection(45)).toBe(ArrowNames.NorthEast);
        });
        it('returns NorthEast for 67 degrees (boundary value)', () => {
            expect(getDirection(67)).toBe(ArrowNames.NorthEast);
        });
    });

    describe('East (68 <= deg < 113)', () => {
        it('returns East for 68 degrees (boundary value)', () => {
            expect(getDirection(68)).toBe(ArrowNames.East);
        });
        it('returns East for 90 degrees', () => {
            expect(getDirection(90)).toBe(ArrowNames.East);
        });
        it('returns East for 112 degrees (boundary value)', () => {
            expect(getDirection(112)).toBe(ArrowNames.East);
        });
    });

    describe('SouthEast (113 <= deg < 158)', () => {
        it('returns SouthEast for 113 degrees (boundary value)', () => {
            expect(getDirection(113)).toBe(ArrowNames.SouthEast);
        });
        it('returns SouthEast for 135 degrees', () => {
            expect(getDirection(135)).toBe(ArrowNames.SouthEast);
        });
        it('returns SouthEast for 157 degrees (boundary value)', () => {
            expect(getDirection(157)).toBe(ArrowNames.SouthEast);
        });
    });

    describe('South (158 <= deg < 203)', () => {
        it('returns South for 158 degrees (boundary value)', () => {
            expect(getDirection(158)).toBe(ArrowNames.South);
        });
        it('returns South for 180 degrees', () => {
            expect(getDirection(180)).toBe(ArrowNames.South);
        });
        it('returns South for 202 degrees (boundary value)', () => {
            expect(getDirection(202)).toBe(ArrowNames.South);
        });
    });

    describe('SouthWest (203 <= deg < 248)', () => {
        it('returns SouthWest for 203 degrees (boundary value)', () => {
            expect(getDirection(203)).toBe(ArrowNames.SouthWest);
        });
        it('returns SouthWest for 225 degrees', () => {
            expect(getDirection(225)).toBe(ArrowNames.SouthWest);
        });
        it('returns SouthWest for 247 degrees (boundary value)', () => {
            expect(getDirection(247)).toBe(ArrowNames.SouthWest);
        });
    });

    describe('West (248 <= deg < 293)', () => {
        it('returns West for 248 degrees (boundary value)', () => {
            expect(getDirection(248)).toBe(ArrowNames.West);
        });
        it('returns West for 270 degrees', () => {
            expect(getDirection(270)).toBe(ArrowNames.West);
        });
        it('returns West for 292 degrees (boundary value)', () => {
            expect(getDirection(292)).toBe(ArrowNames.West);
        });
    });

    describe('NorthWest (293 <= deg < 338)', () => {
        it('returns NorthWest for 293 degrees (boundary value)', () => {
            expect(getDirection(293)).toBe(ArrowNames.NorthWest);
        });
        it('returns NorthWest for 315 degrees', () => {
            expect(getDirection(315)).toBe(ArrowNames.NorthWest);
        });
        it('returns NorthWest for 337 degrees (boundary value)', () => {
            expect(getDirection(337)).toBe(ArrowNames.NorthWest);
        });
    });
});
