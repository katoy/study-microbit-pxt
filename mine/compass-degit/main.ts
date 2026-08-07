// Automatically generated. Do not edit directly.
/**
 * 0〜359の方位角から、北(0度)からの最小のずれの角度と符号を計算します。
 * 東回りは '+', 西回りは '-'
 */
function calculateHeadingOffset(heading: number): { sign: string, value: number } {
    // 0〜359の範囲に正規化
    let normalized = ((heading % 360) + 360) % 360;

    if (normalized <= 180) {
        return { sign: "+", value: Math.round(normalized) };
    } else {
        return { sign: "-", value: Math.round(360 - normalized) };
    }
}

/**
 * 数字（0〜9）をそろばん形式のLED列（長さ5のboolean配列）に変換します。
 * Y=0 (五玉): N >= 5 で点灯
 * Y=1..4 (一玉): N%5 >= y で点灯
 */
function getSorobanColumn(digit: number): boolean[] {
    const col: boolean[] = [];
    const val = Math.max(0, Math.min(9, Math.floor(digit)));
    
    // Y=0: 五玉 (0 or 5)
    col.push(val >= 5);
    
    // Y=1..4: 一玉 (0..4)
    const ones = val % 5;
    for (let y = 1; y <= 4; y++) {
        col.push(ones >= y);
    }
    
    return col;
}

function getSignColumns(sign: string): boolean[][] {
    const col0: boolean[] = [false, false, false, false, false];
    const col1: boolean[] = [false, false, false, false, false];
    
    if (sign === "+") {
        // プラス符号は左2列のどのLEDも点灯させない
    } else if (sign === "-") {
        col0[2] = true;
        
        col1[2] = true;
    }
    
    return [col0, col1];
}

/**
 * 0〜359の方位角から、5x5 LEDマトリクスに表示する状態（boolean[5][5]）を生成します。
 * 戻り値の配列：leds[x][y] （x: 0..4, y: 0..4）
 */
function getCompassLeds(heading: number): boolean[][] {
    const { sign, value } = calculateHeadingOffset(heading);
    
    // 3桁の数字に分解 (000〜180)
    const hundreds = Math.floor(value / 100) % 10;
    const tens = Math.floor((value % 100) / 10) % 10;
    const ones = value % 10;
    
    const leds: boolean[][] = [];
    
    // X=0, 1: 符号
    const signCols = getSignColumns(sign);
    leds.push(signCols[0]);
    leds.push(signCols[1]);
    
    // X=2: 百の位
    leds.push(getSorobanColumn(hundreds));
    
    // X=3: 十の位
    leds.push(getSorobanColumn(tens));
    
    // X=4: 一の位
    leds.push(getSorobanColumn(ones));
    
    return leds;
}

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
