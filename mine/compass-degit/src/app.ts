basic.forever(function () {
    // 0〜359 の方位角を取得
    let heading = input.compassHeading()
    
    // 表示用 5x5 LED マトリクスの状態を取得
    let leds = getCompassLeds(heading)
    
    // LEDマトリクスに描画
    for (let x = 0; x < 5; x++) {
        for (let y = 0; y < 5; y++) {
            if (leds[x][y]) {
                led.plot(x, y)
            } else {
                led.unplot(x, y)
            }
        }
    }
    
    // 表示のちらつき防止、及びCPUの負荷軽減のために少しウェイトを入れる
    basic.pause(150)
})
