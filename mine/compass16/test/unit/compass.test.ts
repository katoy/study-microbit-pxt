import { describe, it, expect, beforeAll } from 'vitest';

// images のグローバルモックを定義（モジュールのロード前に実行するため、動的インポートを使用）
(globalThis as any).images = {
    createImage: (pattern: string) => {
        // パターンの余計な空白を取り除き、検証用のプレーンテキストとして返す
        const cleaned = pattern.trim().split('\n').map(l => l.trim().replace(/\s+/g, '')).join('\n');
        return {
            pattern: cleaned,
            showImage: (offset: number) => {}
        };
    },
    arrowImage: (arrowName: any) => {
        return {
            arrowName: arrowName,
            showImage: (offset: number) => {}
        };
    }
};

(globalThis as any).ArrowNames = {
    North: 0,
    NorthEast: 1,
    East: 2,
    SouthEast: 3,
    South: 4,
    SouthWest: 5,
    West: 6,
    NorthWest: 7
};

let arrows_array: any[];
let getDirectionIndex: (degrees: number) => number;

beforeAll(async () => {
    const mod = await import('../../src/compass');
    arrows_array = mod.arrows_array;
    getDirectionIndex = mod.getDirectionIndex;
});

describe('arrows_array Array', () => {
    it('has exactly 16 elements', () => {
        expect(arrows_array.length).toBe(16);
    });

    it('custom patterns have 5 lines of 5 characters', () => {
        arrows_array.forEach((img: any, idx) => {
            // arrowImageで作られたものはスキップ
            if (img.pattern === undefined) return;
            
            const lines = img.pattern.split('\n');
            expect(lines.length).toBe(5);
            lines.forEach((line: string) => {
                expect(line.length).toBe(5);
                // Each character must be either '.' or '#'
                for (let i = 0; i < 5; i++) {
                    expect(['.', '#']).toContain(line[i]);
                }
            });
        });
    });
});

describe('getDirectionIndex Unit Tests (100% Coverage)', () => {
    describe('Representive Angles for 16 Directions', () => {
        const testCases = [
            { degrees: 0, expected: 0 },       // N
            { degrees: 22.5, expected: 1 },    // NNW
            { degrees: 45, expected: 2 },     // NW
            { degrees: 67.5, expected: 3 },    // WNW
            { degrees: 90, expected: 4 },      // W
            { degrees: 112.5, expected: 5 },   // WSW
            { degrees: 135, expected: 6 },     // SW
            { degrees: 157.5, expected: 7 },   // SSW
            { degrees: 180, expected: 8 },     // S
            { degrees: 202.5, expected: 9 },   // SSE
            { degrees: 225, expected: 10 },    // SE
            { degrees: 247.5, expected: 11 },  // ESE
            { degrees: 270, expected: 12 },    // E
            { degrees: 292.5, expected: 13 },  // ENE
            { degrees: 315, expected: 14 },    // NE
            { degrees: 337.5, expected: 15 }   // NNE
        ];

        testCases.forEach(({ degrees, expected }) => {
            it(`returns index ${expected} for ${degrees} degrees`, () => {
                expect(getDirectionIndex(degrees)).toBe(expected);
            });
        });
    });

    describe('Boundary Values and Rounding', () => {
        // N (0) range: >= 348.75 or < 11.25
        it('rounds 11.24 degrees down to index 0', () => {
            expect(getDirectionIndex(11.24)).toBe(0);
        });
        it('rounds 11.25 degrees up to index 1', () => {
            expect(getDirectionIndex(11.25)).toBe(1);
        });

        // NNW (1) range: >= 11.25 and < 33.75
        it('rounds 33.74 degrees down to index 1', () => {
            expect(getDirectionIndex(33.74)).toBe(1);
        });
        it('rounds 33.75 degrees up to index 2', () => {
            expect(getDirectionIndex(33.75)).toBe(2);
        });

        // NNE (15) range: >= 326.25 and < 348.75
        it('rounds 348.74 degrees down to index 15', () => {
            expect(getDirectionIndex(348.74)).toBe(15);
        });
        it('rounds 348.75 degrees up to index 0', () => {
            expect(getDirectionIndex(348.75)).toBe(0);
        });
    });

    describe('Out-of-bounds and Normalization', () => {
        it('normalizes negative angles (e.g. -22.5 is normalized to 337.5, returning index 15)', () => {
            expect(getDirectionIndex(-22.5)).toBe(15);
        });
        it('normalizes negative angles (e.g. -45 is normalized to 315, returning index 14)', () => {
            expect(getDirectionIndex(-45)).toBe(14);
        });
        it('normalizes angles >= 360 (e.g. 382.5 is normalized to 22.5, returning index 1)', () => {
            expect(getDirectionIndex(382.5)).toBe(1);
        });
        it('normalizes large negative angles (e.g. -382.5 is normalized to 337.5, returning index 15)', () => {
            expect(getDirectionIndex(-382.5)).toBe(15);
        });
    });
});
