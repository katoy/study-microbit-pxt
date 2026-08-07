basic.forever(function () {
    let degrees = input.compassHeading()
    let index = getDirectionIndex(degrees)
    arrows_array[index].showImage(0)
    basic.pause(100)
})
