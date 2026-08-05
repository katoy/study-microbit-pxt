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

export function getDirection(degrees: number): ArrowNames {
    if (degrees < 23 || degrees >= 338) {
        return ArrowNames.North
    } else if (degrees < 68) {
        return ArrowNames.NorthEast
    } else if (degrees < 113) {
        return ArrowNames.East
    } else if (degrees < 158) {
        return ArrowNames.SouthEast
    } else if (degrees < 203) {
        return ArrowNames.South
    } else if (degrees < 248) {
        return ArrowNames.SouthWest
    } else if (degrees < 293) {
        return ArrowNames.West
    } else {
        return ArrowNames.NorthWest
    }
}
