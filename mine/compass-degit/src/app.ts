basic.forever(function () {
    let heading = input.compassHeading()
    let offset = getHeadingOffset(heading)
    
    // 負数かどうかの判定
    let isNegative = offset < 0
    let absValue = Math.abs(offset)
    
    // 3桁の各数字を取得
    let hundreds = Math.floor(absValue / 100) % 10
    let tens = Math.floor((absValue % 100) / 10) % 10
    let ones = absValue % 10
    
    // LEDに直接描画
    plotSign(isNegative)
    plotSorobanColumn(2, hundreds)
    plotSorobanColumn(3, tens)
    plotSorobanColumn(4, ones)
    
    basic.pause(150)
})
