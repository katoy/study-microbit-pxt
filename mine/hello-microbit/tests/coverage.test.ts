import { buttonHandlers, gestureHandlers } from './mock-microbit';

describe('micro:bit main.ts Coverage Test', () => {
  beforeAll(() => {
    // global オブジェクトが正しく初期化されていることを確認した上で、main.ts をロード
    jest.isolateModules(() => {
      require('../main');
    });
  });

  test('Startup: should display Heart icon', () => {
    const basic = (global as any).basic;
    const IconNames = (global as any).IconNames;
    expect(basic.showIcon).toHaveBeenCalledWith(IconNames.Heart);
  });

  test('Button A pressed: should display Happy icon', () => {
    const Button = (global as any).Button;
    const basic = (global as any).basic;
    const IconNames = (global as any).IconNames;
    
    const handler = buttonHandlers[Button.A];
    expect(handler).toBeDefined();
    handler();
    expect(basic.showIcon).toHaveBeenCalledWith(IconNames.Happy);
  });

  test('Button B pressed: should display Sad icon', () => {
    const Button = (global as any).Button;
    const basic = (global as any).basic;
    const IconNames = (global as any).IconNames;
    
    const handler = buttonHandlers[Button.B];
    expect(handler).toBeDefined();
    handler();
    expect(basic.showIcon).toHaveBeenCalledWith(IconNames.Sad);
  });

  test('Button A+B pressed: should display Hello! text then Heart icon', () => {
    const Button = (global as any).Button;
    const basic = (global as any).basic;
    const IconNames = (global as any).IconNames;
    
    const handler = buttonHandlers[Button.AB];
    expect(handler).toBeDefined();
    handler();
    expect(basic.showString).toHaveBeenCalledWith("Hello!");
    expect(basic.showIcon).toHaveBeenCalledWith(IconNames.Heart);
  });

  test('Shake gesture: should display random number then clear screen after 1 second', () => {
    const Gesture = (global as any).Gesture;
    const basic = (global as any).basic;
    
    const handler = gestureHandlers[Gesture.Shake];
    expect(handler).toBeDefined();
    handler();
    expect(basic.showNumber).toHaveBeenCalled();
    expect(basic.pause).toHaveBeenCalledWith(1000);
    expect(basic.clearScreen).toHaveBeenCalled();
  });
});
