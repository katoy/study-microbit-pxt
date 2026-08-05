import { describe, it, expect } from 'vitest';
import { getDirectionIndex, getDirectionPoints, DIRECTION_POINTS } from '../../src/compass32';

describe('compass32 Unit Tests (100% Coverage)', () => {
    it('returns index 0 for North boundaries (0, 352.99, 360, negative)', () => {
        expect(getDirectionIndex(0)).toBe(0);
        expect(getDirectionIndex(352.99)).toBe(0);
        expect(getDirectionIndex(355)).toBe(0);
        expect(getDirectionIndex(360)).toBe(0);
        expect(getDirectionIndex(-5)).toBe(0);
    });

    it('returns correct indices across all 32 ranges', () => {
        const testAngles = [
            0, 14, 26, 36, 45, 53, 63, 75,
            90, 104, 116, 126, 135, 143, 153, 165,
            180, 194, 206, 216, 225, 233, 243, 255,
            270, 284, 296, 306, 315, 323, 333, 345
        ];

        for (let i = 0; i < 32; i++) {
            expect(getDirectionIndex(testAngles[i])).toBe(i);
        }
    });

    it('handles values just below boundary thresholds', () => {
        const boundaryTestValues = [
            6.9, 20.2, 31.6, 40.8, 49.0, 58.2, 69.6, 82.9,
            97.0, 110.2, 121.6, 130.8, 139.0, 148.2, 159.6, 172.9,
            187.0, 200.2, 211.6, 220.8, 229.0, 238.2, 250.6, 262.9,
            277.0, 290.2, 301.6, 310.8, 319.0, 328.2, 339.6, 352.9
        ];
        for (let i = 0; i < 32; i++) {
            expect(getDirectionIndex(boundaryTestValues[i])).toBe(i);
        }
    });

    it('returns correct point arrays for all 32 directions', () => {
        for (let i = 0; i < 32; i++) {
            expect(getDirectionPoints(i * 11.25)).toEqual(DIRECTION_POINTS[i]);
            expect(DIRECTION_POINTS[i].length).toBe(5);
        }
    });
});
