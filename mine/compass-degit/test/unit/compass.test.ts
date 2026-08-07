import { describe, it, expect } from 'vitest';
import {
    calculateHeadingOffset,
    getSorobanColumn,
    getSignColumns,
    getCompassLeds
} from '../../src/compass';

describe('calculateHeadingOffset Unit Tests', () => {
    it('returns +0 for 0 degrees', () => {
        expect(calculateHeadingOffset(0)).toEqual({ sign: '+', value: 0 });
    });

    it('returns +90 for 90 degrees (East)', () => {
        expect(calculateHeadingOffset(90)).toEqual({ sign: '+', value: 90 });
    });

    it('returns +180 for 180 degrees (South)', () => {
        expect(calculateHeadingOffset(180)).toEqual({ sign: '+', value: 180 });
    });

    it('returns -179 for 181 degrees', () => {
        expect(calculateHeadingOffset(181)).toEqual({ sign: '-', value: 179 });
    });

    it('returns -90 for 270 degrees (West)', () => {
        expect(calculateHeadingOffset(270)).toEqual({ sign: '-', value: 90 });
    });

    it('returns -1 for 359 degrees', () => {
        expect(calculateHeadingOffset(359)).toEqual({ sign: '-', value: 1 });
    });

    it('handles values out of [0, 360) range', () => {
        expect(calculateHeadingOffset(360)).toEqual({ sign: '+', value: 0 });
        expect(calculateHeadingOffset(720)).toEqual({ sign: '+', value: 0 });
        expect(calculateHeadingOffset(-90)).toEqual({ sign: '-', value: 90 }); // 270 deg
        expect(calculateHeadingOffset(-370)).toEqual({ sign: '-', value: 10 }); // 350 deg -> -10
    });
});

describe('getSorobanColumn Unit Tests', () => {
    it('formats 0 correctly', () => {
        expect(getSorobanColumn(0)).toEqual([false, false, false, false, false]);
    });

    it('formats 1 correctly', () => {
        expect(getSorobanColumn(1)).toEqual([false, true, false, false, false]);
    });

    it('formats 3 correctly', () => {
        expect(getSorobanColumn(3)).toEqual([false, true, true, true, false]);
    });

    it('formats 4 correctly', () => {
        expect(getSorobanColumn(4)).toEqual([false, true, true, true, true]);
    });

    it('formats 5 correctly', () => {
        expect(getSorobanColumn(5)).toEqual([true, false, false, false, false]);
    });

    it('formats 6 correctly', () => {
        expect(getSorobanColumn(6)).toEqual([true, true, false, false, false]);
    });

    it('formats 8 correctly', () => {
        expect(getSorobanColumn(8)).toEqual([true, true, true, true, false]);
    });

    it('formats 9 correctly', () => {
        expect(getSorobanColumn(9)).toEqual([true, true, true, true, true]);
    });

    it('caps negative values to 0', () => {
        expect(getSorobanColumn(-1)).toEqual([false, false, false, false, false]);
    });

    it('caps values greater than 9 to 9', () => {
        expect(getSorobanColumn(10)).toEqual([true, true, true, true, true]);
    });
});

describe('getSignColumns Unit Tests', () => {
    it('returns correct layout for +', () => {
        const sign = getSignColumns('+');
        // col 0: all off
        expect(sign[0]).toEqual([false, false, false, false, false]);
        // col 1: all off
        expect(sign[1]).toEqual([false, false, false, false, false]);
    });

    it('returns correct layout for -', () => {
        const sign = getSignColumns('-');
        // col 0: horizontal bar
        expect(sign[0]).toEqual([false, false, true, false, false]);
        // col 1: horizontal bar
        expect(sign[1]).toEqual([false, false, true, false, false]);
    });
});

describe('getCompassLeds Unit Tests', () => {
    it('returns correct matrix for 0 degrees (+000)', () => {
        const leds = getCompassLeds(0);
        // + sign (all off)
        expect(leds[0]).toEqual([false, false, false, false, false]);
        expect(leds[1]).toEqual([false, false, false, false, false]);
        // 0 hundreds
        expect(leds[2]).toEqual([false, false, false, false, false]);
        // 0 tens
        expect(leds[3]).toEqual([false, false, false, false, false]);
        // 0 ones
        expect(leds[4]).toEqual([false, false, false, false, false]);
    });

    it('returns correct matrix for 30 degrees (+030)', () => {
        const leds = getCompassLeds(30);
        // + sign (all off)
        expect(leds[0]).toEqual([false, false, false, false, false]);
        expect(leds[1]).toEqual([false, false, false, false, false]);
        // 0 hundreds
        expect(leds[2]).toEqual([false, false, false, false, false]);
        // 3 tens
        expect(leds[3]).toEqual([false, true, true, true, false]);
        // 0 ones
        expect(leds[4]).toEqual([false, false, false, false, false]);
    });

    it('returns correct matrix for 235 degrees (-125)', () => {
        const leds = getCompassLeds(235);
        // - sign
        expect(leds[0]).toEqual([false, false, true, false, false]);
        expect(leds[1]).toEqual([false, false, true, false, false]);
        // 1 hundreds
        expect(leds[2]).toEqual([false, true, false, false, false]);
        // 2 tens
        expect(leds[3]).toEqual([false, true, true, false, false]);
        // 5 ones
        expect(leds[4]).toEqual([true, false, false, false, false]);
    });
});
