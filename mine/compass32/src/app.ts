const BRIGHTNESS = [255, 170, 110, 60, 25]

basic.forever(function () {
    let degrees = input.compassHeading()
    let points = getDirectionPoints(degrees)
    basic.clearScreen()
    for (let i = 0; i < points.length; i++) {
        let p = points[i]
        led.plotBrightness(p.x, p.y, BRIGHTNESS[i])
    }
})
