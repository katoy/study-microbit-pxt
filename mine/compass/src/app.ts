basic.forever(function () {
    let degrees = input.compassHeading()
    let northHeading = (360 - degrees) % 360
    basic.showArrow(getDirection(northHeading))
})
