/**
 * 0〜359の方位角から、北(0度)からの最小のずれの角度（-180〜+180）を計算します。
 * 東回りは正の値、西回りは負の値。
 */
export function getHeadingOffset(heading: number): number {
    let normalized = ((heading % 360) + 360) % 360;
    if (normalized <= 180) {
        return Math.round(normalized);
    } else {
        return -Math.round(360 - normalized);
    }
}

/**
 * マイナス符号を表示（X=0, 1列目）
 */
export function plotSign(isNegative: boolean): void {
    if (isNegative) {
        for (let x = 0; x < 2; x++) {
            for (let y = 0; y < 5; y++) {
                if (y === 2) {
                    led.plot(x, y);
                } else {
                    led.unplot(x, y);
                }
            }
        }
    } else {
        for (let x = 0; x < 2; x++) {
            for (let y = 0; y < 5; y++) {
                led.unplot(x, y);
            }
        }
    }
}

/**
 * 指定した列(X)に数値をそろばん形式で描画します。
 */
export function plotSorobanColumn(x: number, digit: number): void {
    const val = Math.max(0, Math.min(9, Math.floor(digit)));
    
    // Y=0: 五玉 (5以上なら点灯)
    if (val >= 5) {
        led.plot(x, 0);
    } else {
        led.unplot(x, 0);
    }
    
    // Y=1..4: 一玉 (0..4)
    const ones = val % 5;
    for (let y = 1; y <= 4; y++) {
        if (ones >= y) {
            led.plot(x, y);
        } else {
            led.unplot(x, y);
        }
    }
}
