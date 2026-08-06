basic.show_icon(IconNames.HEART)

def on_button_pressed_a():
    basic.show_icon(IconNames.HAPPY)
input.on_button_pressed(Button.A, on_button_pressed_a)

def on_button_pressed_b():
    basic.show_icon(IconNames.SAD)
input.on_button_pressed(Button.B, on_button_pressed_b)

def on_button_pressed_ab():
    basic.show_string("Hello!")
    basic.show_icon(IconNames.HEART)
input.on_button_pressed(Button.AB, on_button_pressed_ab)

def on_gesture_shake():
    num = randint(1, 6)
    basic.show_number(num)
    basic.pause(1000)
    basic.clear_screen()
input.on_gesture(Gesture.SHAKE, on_gesture_shake)

