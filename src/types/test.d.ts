
// Jest global types
import '@types/jest';

declare global {
  // Standard Jest globals
  const describe: typeof import('@jest/globals').describe;
  const expect: typeof import('@jest/globals').expect;
  const test: typeof import('@jest/globals').test;
  const jest: typeof import('@jest/globals').jest & {
    MockedFunction: any;
    Mock: any;
    fn: jest.Mock;
  };
  const beforeEach: typeof import('@jest/globals').beforeEach;
  const afterEach: typeof import('@jest/globals').afterEach;
  const beforeAll: typeof import('@jest/globals').beforeAll;
  const afterAll: typeof import('@jest/globals').afterAll;
  
  namespace jest {
    interface Mock<T = any, Y extends any[] = any[]> {
      (...args: Y): T;
      mockImplementation: (fn: (...args: Y) => T) => Mock<T, Y>;
      mockReturnValue: (value: T) => Mock<T, Y>;
      mockReturnThis: () => Mock<T, Y>;
      mockResolvedValue: (value: T) => Mock<T, Y>;
      mockRejectedValue: (value: any) => Mock<T, Y>;
    }
    type MockedFunction<T extends (...args: any[]) => any> = Mock<ReturnType<T>, Parameters<T>>;
  }
}
