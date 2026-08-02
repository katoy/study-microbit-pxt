// mock-microbit.ts
// micro:bit API のグローバルオブジェクト用モック定義

export const buttonHandlers: { [key: number]: () => void } = {};
export const gestureHandlers: { [key: number]: () => void } = {};

// microbit API のモック関数
const mockBasic = {
  showIcon: jest.fn(),
  showString: jest.fn(),
  showNumber: jest.fn(),
  pause: jest.fn(),
  clearScreen: jest.fn(),
};

const mockInput = {
  onButtonPressed: jest.fn((btn: number, handler: () => void) => {
    buttonHandlers[btn] = handler;
  }),
  onGesture: jest.fn((gesture: number, handler: () => void) => {
    gestureHandlers[gesture] = handler;
  }),
};

const mockRandint = jest.fn((min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
});

// グローバルオブジェクトへの割り当て
(global as any).basic = mockBasic;
(global as any).input = mockInput;
(global as any).randint = mockRandint;

// PXTの各種Enum/オブジェクトを定義
(global as any).IconNames = {
  Heart: 1,
  Happy: 2,
  Sad: 3,
};

(global as any).Button = {
  A: 1,
  B: 2,
  AB: 3,
};

(global as any).Gesture = {
  Shake: 11,
};
