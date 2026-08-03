from microbit import *
import random

def main():
    # 起動時: ハートを表示
    display.show(Image.HEART)
    
    while True:
        # A+B ボタン同時押し判定
        if button_a.is_pressed() and button_b.is_pressed():
            display.scroll("Hello!")
            display.show(Image.HEART)
            # チャタリング防止とボタン解放待ち
            while button_a.is_pressed() or button_b.is_pressed():
                sleep(10)
            # 個別のボタン履歴フラグをクリアしておく
            button_a.was_pressed()
            button_b.was_pressed()
            
        # Aボタン押し (前回のチェック以降に押されたか)
        elif button_a.was_pressed():
            display.show(Image.HAPPY)
            
        # Bボタン押し
        elif button_b.was_pressed():
            display.show(Image.SAD)
            
        # シェイク
        elif accelerometer.was_gesture("shake"):
            # 1〜6のランダムな数字
            num = random.randint(1, 6)
            display.show(str(num))
            sleep(1000)
            display.clear()
            
        sleep(50)

if __name__ == "__main__":
    main()
