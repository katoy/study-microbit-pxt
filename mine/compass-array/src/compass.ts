export enum ArrowNames {
    North = 0,
    NorthEast = 1,
    East = 2,
    SouthEast = 3,
    South = 4,
    SouthWest = 5,
    West = 6,
    NorthWest = 7
}

const BOUNDS = [23, 68, 113, 158, 203, 248, 293];
// 常に北を指すように、本体の向き（degrees）とは逆の方向の矢印を割り当てる
const DIRECTIONS = [
    ArrowNames.North,      // < 23 (北): 北は正面 -> North
    ArrowNames.NorthWest,  // < 68 (北東): 北は左前 -> NorthWest
    ArrowNames.West,       // < 113 (東): 北は左 -> West
    ArrowNames.SouthWest,  // < 158 (南東): 北は左後ろ -> SouthWest
    ArrowNames.South,      // < 203 (南): 北は真後ろ -> South
    ArrowNames.SouthEast,  // < 248 (南西): 北は右後ろ -> SouthEast
    ArrowNames.East        // < 293 (西): 北は右 -> East
];

export function getDirection(degrees: number): ArrowNames {
    // 角度を [0, 360) の範囲に正規化（負の角度や 360度以上の値にも対応）
    const normalized = ((degrees % 360) + 360) % 360;

    if (normalized >= 338) {
        return ArrowNames.North; // >= 338 (北): 北は正面 -> North
    }
    for (let i = 0; i < BOUNDS.length; i++) {
        if (normalized < BOUNDS[i]) {
            return DIRECTIONS[i];
        }
    }
    return ArrowNames.NorthEast; // >= 293 && < 338 (北西): 北は右前 -> NorthEast
}
