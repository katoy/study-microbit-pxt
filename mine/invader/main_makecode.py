MAX_AMMO = 3
player_x = 2
bullets: List[List[number]] = []
invaders: List[List[number]] = []
ammo = MAX_AMMO
score = 0
game_over = False

def init_game():
    global player_x, bullets, invaders, ammo, score, game_over
    player_x = 2
    bullets = []
    invaders = []
    ammo = MAX_AMMO
    score = 0
    game_over = False

def on_gesture_shake():
    global ammo
    ammo = MAX_AMMO
    basic.show_icon(IconNames.YES)
    basic.pause(150)
input.on_gesture(Gesture.SHAKE, on_gesture_shake)

def is_in_list(item: List[number], lst: List[List[number]]) -> bool:
    for x in lst:
        if x[0] == item[0] and x[1] == item[1]:
            return True
    return False

def draw_game(tick: number):
    basic.clear_screen()
    # 1. 敵の描画
    for inv in invaders:
        led.plot(inv[0], inv[1])
    # 2. 弾の描画
    for b in bullets:
        led.plot(b[0], b[1])
    # 3. 自機の描画
    led.plot(player_x, 4)
    # 残弾ゼロ時の警告点滅
    if ammo == 0 and tick % 2 == 1:
        led.unplot(player_x, 4)

def on_forever():
    global player_x, bullets, invaders, ammo, score, game_over
    basic.show_string("INVADER")
    init_game()
    tick = 0
    spawn_timer = 0

    while not game_over:
        a_pressed = input.button_is_pressed(Button.A)
        b_pressed = input.button_is_pressed(Button.B)
        ab_pressed = input.button_is_pressed(Button.AB)

        if ab_pressed:
            if ammo > 0:
                bullets.append([player_x, 3])
                ammo -= 1
                basic.pause(100)
        elif a_pressed:
            player_x = max(0, player_x - 1)
            basic.pause(100)
        elif b_pressed:
            player_x = min(4, player_x + 1)
            basic.pause(100)

        # 弾の移動
        new_bullets: List[List[number]] = []
        for b in bullets:
            next_y = b[1] - 1
            if next_y >= 0:
                new_bullets.append([b[0], next_y])
        bullets = new_bullets

        # 敵の移動 (2 tick ごと)
        if tick % 2 == 0:
            new_invaders: List[List[number]] = []
            for inv in invaders:
                next_y = inv[1] + 1
                if next_y > 4:
                    game_over = True
                    break
                else:
                    new_invaders.append([inv[0], next_y])
            invaders = new_invaders

        # 敵の生成
        spawn_interval = max(2, 6 - Math.idiv(score, 3))
        spawn_timer += 1
        if spawn_timer >= spawn_interval:
            spawn_timer = 0
            inv_x = randint(0, 4)
            exists = False
            for inv in invaders:
                if inv[0] == inv_x and inv[1] == 0:
                    exists = True
                    break
            if not exists:
                invaders.append([inv_x, 0])

        # 当たり判定
        rem_bullets: List[List[number]] = []
        rem_invaders: List[List[number]] = []
        for b in bullets:
            for inv in invaders:
                if b[0] == inv[0] and b[1] == inv[1]:
                    rem_bullets.append(b)
                    rem_invaders.append(inv)
                    score += 1
                    break

        bullets = [b for b in bullets if not is_in_list(b, rem_bullets)]
        invaders = [inv for inv in invaders if not is_in_list(inv, rem_invaders)]

        # 衝突判定
        for inv in invaders:
            if inv[0] == player_x and inv[1] == 4:
                game_over = True
                break

        if game_over:
            break

        draw_game(tick)
        tick += 1
        basic.pause(150)

    basic.show_icon(IconNames.SKULL)
    basic.pause(1000)
    basic.show_string("SCORE:" + str(score))
    basic.pause(1000)

basic.forever(on_forever)
