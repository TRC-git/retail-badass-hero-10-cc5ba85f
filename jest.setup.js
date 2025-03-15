
// Add Jest types for TypeScript
import '@testing-library/jest-dom';

// Add any global setup for Jest tests here
global.jest = jest;
global.describe = describe;
global.it = it;
global.test = test;
global.expect = expect;
global.beforeEach = beforeEach;
global.afterEach = afterEach;
global.beforeAll = beforeAll;
global.afterAll = afterAll;
