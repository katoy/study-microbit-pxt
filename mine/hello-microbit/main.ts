// 起動時にハートを表示
basic.showIcon(IconNames.Heart)

// Aボタン: 笑顔
input.onButtonPressed(Button.A, function () {
    basic.showIcon(IconNames.Happy)
})

// Bボタン: 悲しい顔
input.onButtonPressed(Button.B, function () {
    basic.showIcon(IconNames.Sad)
})

// A+Bボタン: "Hello!" をスクロール表示後、ハートに戻る
input.onButtonPressed(Button.AB, function () {
    basic.showString("Hello!")
    basic.showIcon(IconNames.Heart)
})

// シェイク: 1〜6のランダムな数字を1秒表示（サイコロ）
input.onGesture(Gesture.Shake, function () {
    basic.showNumber(randint(1, 6))
    basic.pause(1000)
    basic.clearScreen()
})
