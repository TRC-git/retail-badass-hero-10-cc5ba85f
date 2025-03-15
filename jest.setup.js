
// Add Jest types for TypeScript
import '@testing-library/jest-dom';

// Ensure Jest globals are properly typed and available
global.jest = jest;
global.describe = describe;
global.it = it;
global.test = test;
global.expect = expect;
global.beforeEach = beforeEach;
global.afterEach = afterEach;
global.beforeAll = beforeAll;
global.afterAll = afterAll;

// Add MockedFunction type to global Jest namespace if it doesn't exist
if (!global.jest.MockedFunction) {
  global.jest.MockedFunction = function() {};
}
