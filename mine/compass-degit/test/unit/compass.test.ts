import { describe, it, expect, beforeEach } from 'vitest';
import {
    getHeadingOffset,
    plotSign,
    plotSorobanColumn
} from '../../src/compass';

// LEDのモック状態管理
const plottedLeds: { [key: string]: boolean } = {};
(globalThis as any).led = {
    plot: (x: number, y: number) => {
        plottedLeds[`${x},${y}`] = true;
    },
    unplot: (x: number, y: number) => {
        plottedLeds[`${x},${y}`] = false;
    }
};

describe('getHeadingOffset Unit Tests', () => {
    it('returns 0 for 0 degrees', () => {
        expect(getHeadingOffset(0)).toBe(0);
    });

    it('returns 90 for 90 degrees (East)', () => {
        expect(getHeadingOffset(90)).toBe(90);
    });

    it('returns 180 for 180 degrees (South)', () => {
        expect(getHeadingOffset(180)).toBe(180);
    });

    it('returns -179 for 181 degrees', () => {
        expect(getHeadingOffset(181)).toBe(-179);
    });

    it('returns -90 for 270 degrees (West)', () => {
        expect(getHeadingOffset(270)).toBe(-90);
    });

    it('returns -1 for 359 degrees', () => {
        expect(getHeadingOffset(359)).toBe(-1);
    });

    it('handles values out of [0, 360) range', () => {
        expect(getHeadingOffset(360)).toBe(0);
        expect(getHeadingOffset(720)).toBe(0);
        expect(getHeadingOffset(-90)).toBe(-90); // 270 deg -> -90
        expect(getHeadingOffset(-370)).toBe(-10); // 350 deg -> -10
    });
});

describe('plotSign Unit Tests', () => {
    beforeEach(() => {
        // LED状態をクリア
        for (let x = 0; x < 5; x++) {
            for (let y = 0; y < 5; y++) {
                plottedLeds[`${x},${y}`] = false;
            }
        }
    });

    it('plots correct layout for + (isNegative = false, all off in col 0,1)', () => {
        plotSign(false);
        for (let x = 0; x < 2; x++) {
            for (let y = 0; y < 5; y++) {
                expect(plottedLeds[`${x},${y}`]).toBe(false);
            }
        }
    });

    it('plots correct layout for - (isNegative = true, (0,2) and (1,2) on)', () => {
        plotSign(true);
        for (let x = 0; x < 2; x++) {
            for (let y = 0; y < 5; y++) {
                if (y === 2) {
                    expect(plottedLeds[`${x},${y}`]).toBe(true);
                } else {
                    expect(plottedLeds[`${x},${y}`]).toBe(false);
                }
            }
        }
    });
});

describe('plotSorobanColumn Unit Tests', () => {
    beforeEach(() => {
        for (let x = 0; x < 5; x++) {
            for (let y = 0; y < 5; y++) {
                plottedLeds[`${x},${y}`] = false;
            }
        }
    });

    const getColumnState = (x: number): boolean[] => {
        const col: boolean[] = [];
        for (let y = 0; y < 5; y++) {
            col.push(!!plottedLeds[`${x},${y}`]);
        }
        return col;
    };

    it('formats 0 correctly', () => {
        plotSorobanColumn(2, 0);
        expect(getColumnState(2)).toEqual([false, false, false, false, false]);
    });

    it('formats 1 correctly', () => {
        plotSorobanColumn(2, 1);
        expect(getColumnState(2)).toEqual([false, true, false, false, false]);
    });

    it('formats 3 correctly', () => {
        plotSorobanColumn(2, 3);
        expect(getColumnState(2)).toEqual([false, true, true, true, false]);
    });

    it('formats 4 correctly', () => {
        plotSorobanColumn(2, 4);
        expect(getColumnState(2)).toEqual([false, true, true, true, true]);
    });

    it('formats 5 correctly', () => {
        plotSorobanColumn(2, 5);
        expect(getColumnState(2)).toEqual([true, false, false, false, false]);
    });

    it('formats 6 correctly', () => {
        plotSorobanColumn(2, 6);
        expect(getColumnState(2)).toEqual([true, true, false, false, false]);
    });

    it('formats 8 correctly', () => {
        plotSorobanColumn(2, 8);
        expect(getColumnState(2)).toEqual([true, true, true, true, false]);
    });

    it('formats 9 correctly', () => {
        plotSorobanColumn(2, 9);
        expect(getColumnState(2)).toEqual([true, true, true, true, true]);
    });

    it('caps negative values to 0', () => {
        plotSorobanColumn(2, -1);
        expect(getColumnState(2)).toEqual([false, false, false, false, false]);
    });

    it('caps values greater than 9 to 9', () => {
        plotSorobanColumn(2, 10);
        expect(getColumnState(2)).toEqual([true, true, true, true, true]);
    });
});
