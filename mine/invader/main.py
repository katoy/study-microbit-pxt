from microbit import *
import random

# ゲーム設定
MAX_AMMO = 3

def init_game():
    player_x = 2
    bullets = []    # 各弾は [x, y]
    invaders = []   # 各敵は [x, y]
    ammo = MAX_AMMO
    score = 0
    game_over = False
    return player_x, bullets, invaders, ammo, score, game_over

def draw_game(player_x, bullets, invaders, ammo, tick):
    display.clear()
    
    # 1. 敵の描画 (輝度 6〜9、tickで少し点滅)
    for inv in invaders:
        brightness = 9 if (tick % 2 == 0) else 6
        display.set_pixel(inv[0], inv[1], brightness)

    # 2. 弾の描画 (輝度 8)
    for b in bullets:
        display.set_pixel(b[0], b[1], 8)

    # 3. 自機の描画 (最下段 y=4、輝度 9)
    display.set_pixel(player_x, 4, 9)

    # 4. 残弾ゼロ時のリロード警告表示 (自機を点滅)
    if ammo == 0 and (tick % 2 == 1):
        display.set_pixel(player_x, 4, 2)

def main():
    while True:
        display.scroll("INVADER")
        player_x, bullets, invaders, ammo, score, game_over = init_game()
        tick = 0
        spawn_timer = 0
        
        while not game_over:
            # 入力検知 & ウエイト
            a_pressed = False
            b_pressed = False
            ab_pressed = False
            shaken = False
            
            for _ in range(10): # 100ms ループ
                if accelerometer.is_gesture("shake") if hasattr(accelerometer, "is_gesture") else False:
                    shaken = True
                if button_a.was_pressed():
                    a_pressed = True
                if button_b.was_pressed():
                    b_pressed = True
                sleep(10)

            # リロード処理 (Shake 検知)
            if accelerometer.was_gesture("shake") or shaken:
                ammo = MAX_AMMO
                # リロードの視覚フィードバック (短く点滅)
                display.show(Image.YES)
                sleep(150)
                continue

            # ボタン操作判定
            if a_pressed and b_pressed:
                ab_pressed = True
                a_pressed = False
                b_pressed = False

            if a_pressed:
                player_x = max(0, player_x - 1)
            elif b_pressed:
                player_x = min(4, player_x + 1)

            if ab_pressed:
                if ammo > 0:
                    bullets.append([player_x, 3])
                    ammo -= 1

            # 2. 弾の移動 (毎 tick)
            new_bullets = []
            for b in bullets:
                next_y = b[1] - 1
                if next_y >= 0:
                    new_bullets.append([b[0], next_y])
            bullets = new_bullets

            # 3. 敵の移動・生成 (2 tick ごと)
            if tick % 2 == 0:
                new_invaders = []
                for inv in invaders:
                    next_y = inv[1] + 1
                    if next_y > 4:
                        game_over = True # 侵略失敗
                        break
                    else:
                        new_invaders.append([inv[0], next_y])
                invaders = new_invaders

            # 敵の新規生成
            spawn_interval = max(2, 6 - (score // 3))
            spawn_timer += 1
            if spawn_timer >= spawn_interval:
                spawn_timer = 0
                inv_x = random.randint(0, 4)
                # 同じ位置になければ追加
                if not any(inv[0] == inv_x and inv[1] == 0 for inv in invaders):
                    invaders.append([inv_x, 0])

            # 4. 弾と敵の当たり判定
            bullets_to_remove = []
            invaders_to_remove = []

            for b in bullets:
                for inv in invaders:
                    if b[0] == inv[0] and b[1] == inv[1]:
                        bullets_to_remove.append(b)
                        invaders_to_remove.append(inv)
                        score += 1
                        break

            bullets = [b for b in bullets if b not in bullets_to_remove]
            invaders = [inv for inv in invaders if inv not in invaders_to_remove]

            # 5. 自機と敵の衝突判定
            for inv in invaders:
                if inv[0] == player_x and inv[1] == 4:
                    game_over = True
                    break

            if game_over:
                break

            # 描画更新
            draw_game(player_x, bullets, invaders, ammo, tick)
            tick += 1

        # ゲームオーバー処理
        display.show(Image.SKULL)
        sleep(1000)
        display.scroll("SCORE:" + str(score))
        sleep(1000)

if __name__ == "__main__":
    main()
