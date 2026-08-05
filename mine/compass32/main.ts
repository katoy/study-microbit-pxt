// 32-direction compass for micro:bit
// 360 degrees divided into 32 distinct direction lines

function getDirectionIndex(degrees: number): number {
    let norm = degrees % 360
    if (norm < 0) {
        norm += 360
    }
    if (norm >= 353 || norm < 7) {
        return 0
    } else if (norm < 20) {
        return 1
    } else if (norm < 32) {
        return 2
    } else if (norm < 41) {
        return 3
    } else if (norm < 49) {
        return 4
    } else if (norm < 58) {
        return 5
    } else if (norm < 70) {
        return 6
    } else if (norm < 83) {
        return 7
    } else if (norm < 97) {
        return 8
    } else if (norm < 110) {
        return 9
    } else if (norm < 122) {
        return 10
    } else if (norm < 131) {
        return 11
    } else if (norm < 139) {
        return 12
    } else if (norm < 148) {
        return 13
    } else if (norm < 160) {
        return 14
    } else if (norm < 173) {
        return 15
    } else if (norm < 187) {
        return 16
    } else if (norm < 200) {
        return 17
    } else if (norm < 212) {
        return 18
    } else if (norm < 221) {
        return 19
    } else if (norm < 229) {
        return 20
    } else if (norm < 238) {
        return 21
    } else if (norm < 251) {
        return 22
    } else if (norm < 263) {
        return 23
    } else if (norm < 277) {
        return 24
    } else if (norm < 290) {
        return 25
    } else if (norm < 302) {
        return 26
    } else if (norm < 311) {
        return 27
    } else if (norm < 319) {
        return 28
    } else if (norm < 328) {
        return 29
    } else if (norm < 340) {
        return 30
    } else if (norm < 353) {
        return 31
    } else {
        return 0
    }
}

basic.forever(function () {
    let degrees = input.compassHeading()
    let idx = getDirectionIndex(degrees)
    basic.clearScreen()

    if (idx == 0) {
        led.plot(2, 0); led.plot(2, 1); led.plot(2, 2); led.plot(2, 3); led.plot(2, 4)
    } else if (idx == 1) {
        led.plot(3, 0); led.plot(3, 1); led.plot(2, 2); led.plot(2, 3); led.plot(2, 4)
    } else if (idx == 2) {
        led.plot(4, 0); led.plot(3, 1); led.plot(3, 2); led.plot(2, 3); led.plot(2, 4)
    } else if (idx == 3) {
        led.plot(4, 0); led.plot(3, 1); led.plot(2, 2); led.plot(2, 3); led.plot(1, 4)
    } else if (idx == 4) {
        led.plot(4, 0); led.plot(3, 1); led.plot(2, 2); led.plot(1, 3); led.plot(0, 4)
    } else if (idx == 5) {
        led.plot(4, 1); led.plot(3, 2); led.plot(2, 2); led.plot(1, 3); led.plot(0, 4)
    } else if (idx == 6) {
        led.plot(4, 2); led.plot(3, 2); led.plot(2, 3); led.plot(1, 3); led.plot(0, 4)
    } else if (idx == 7) {
        led.plot(4, 3); led.plot(3, 3); led.plot(2, 3); led.plot(1, 4); led.plot(0, 4)
    } else if (idx == 8) {
        led.plot(4, 2); led.plot(3, 2); led.plot(2, 2); led.plot(1, 2); led.plot(0, 2)
    } else if (idx == 9) {
        led.plot(4, 4); led.plot(3, 4); led.plot(2, 3); led.plot(1, 3); led.plot(0, 3)
    } else if (idx == 10) {
        led.plot(4, 4); led.plot(3, 3); led.plot(2, 3); led.plot(1, 2); led.plot(0, 2)
    } else if (idx == 11) {
        led.plot(4, 4); led.plot(3, 3); led.plot(2, 2); led.plot(1, 2); led.plot(0, 1)
    } else if (idx == 12) {
        led.plot(4, 4); led.plot(3, 3); led.plot(2, 2); led.plot(1, 1); led.plot(0, 0)
    } else if (idx == 13) {
        led.plot(3, 4); led.plot(2, 3); led.plot(2, 2); led.plot(1, 1); led.plot(0, 0)
    } else if (idx == 14) {
        led.plot(2, 4); led.plot(2, 3); led.plot(1, 2); led.plot(1, 1); led.plot(0, 0)
    } else if (idx == 15) {
        led.plot(1, 4); led.plot(1, 3); led.plot(1, 2); led.plot(0, 1); led.plot(0, 0)
    } else if (idx == 16) {
        led.plot(2, 4); led.plot(2, 3); led.plot(2, 2); led.plot(2, 1); led.plot(2, 0)
    } else if (idx == 17) {
        led.plot(1, 4); led.plot(1, 3); led.plot(2, 2); led.plot(2, 1); led.plot(2, 0)
    } else if (idx == 18) {
        led.plot(0, 4); led.plot(1, 3); led.plot(1, 2); led.plot(2, 1); led.plot(2, 0)
    } else if (idx == 19) {
        led.plot(0, 4); led.plot(1, 3); led.plot(2, 2); led.plot(2, 1); led.plot(3, 0)
    } else if (idx == 20) {
        led.plot(0, 4); led.plot(1, 3); led.plot(2, 2); led.plot(3, 1); led.plot(4, 0)
    } else if (idx == 21) {
        led.plot(0, 3); led.plot(1, 2); led.plot(2, 2); led.plot(3, 1); led.plot(4, 0)
    } else if (idx == 22) {
        led.plot(0, 2); led.plot(1, 2); led.plot(2, 1); led.plot(3, 1); led.plot(4, 0)
    } else if (idx == 23) {
        led.plot(0, 1); led.plot(1, 1); led.plot(2, 1); led.plot(3, 0); led.plot(4, 0)
    } else if (idx == 24) {
        led.plot(0, 2); led.plot(1, 2); led.plot(2, 2); led.plot(3, 2); led.plot(4, 2)
    } else if (idx == 25) {
        led.plot(0, 0); led.plot(1, 0); led.plot(2, 1); led.plot(3, 1); led.plot(4, 1)
    } else if (idx == 26) {
        led.plot(0, 0); led.plot(1, 1); led.plot(2, 1); led.plot(3, 2); led.plot(4, 2)
    } else if (idx == 27) {
        led.plot(0, 0); led.plot(1, 1); led.plot(2, 2); led.plot(3, 2); led.plot(4, 3)
    } else if (idx == 28) {
        led.plot(0, 0); led.plot(1, 1); led.plot(2, 2); led.plot(3, 3); led.plot(4, 4)
    } else if (idx == 29) {
        led.plot(1, 0); led.plot(2, 1); led.plot(2, 2); led.plot(3, 3); led.plot(4, 4)
    } else if (idx == 30) {
        led.plot(2, 0); led.plot(2, 1); led.plot(3, 2); led.plot(3, 3); led.plot(4, 4)
    } else {
        led.plot(3, 0); led.plot(3, 1); led.plot(3, 2); led.plot(4, 3); led.plot(4, 4)
    }
})
