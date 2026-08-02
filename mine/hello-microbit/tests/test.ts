// tests/test.ts
// Micro:bit PXT 標準テストスクリプト

// Aボタン押下をシミュレート
console.log("Simulating Button A press...")
control.raiseEvent(EventBusSource.MICROBIT_ID_BUTTON_A, EventBusValue.MICROBIT_BUTTON_EVT_CLICK)
basic.pause(500)

// Bボタン押下をシミュレート
console.log("Simulating Button B press...")
control.raiseEvent(EventBusSource.MICROBIT_ID_BUTTON_B, EventBusValue.MICROBIT_BUTTON_EVT_CLICK)
basic.pause(500)

// A+Bボタン押下をシミュレート
console.log("Simulating Button A+B press...")
control.raiseEvent(EventBusSource.MICROBIT_ID_BUTTON_AB, EventBusValue.MICROBIT_BUTTON_EVT_CLICK)
basic.pause(1000)

// シェイクジェスチャーをシミュレート (MICROBIT_ID_GESTURE = 13, MICROBIT_ACCELEROMETER_EVT_SHAKE = 11)
console.log("Simulating Shake gesture...")
control.raiseEvent(13, 11)
basic.pause(1500)

console.log("All simulations complete.")
