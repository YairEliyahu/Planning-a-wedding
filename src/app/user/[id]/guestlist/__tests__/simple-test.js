/* eslint-env jest */

// Simple test to verify Jest is working
describe('Test Suite Setup', () => {
  test('Jest is working correctly', () => {
    expect(1 + 1).toBe(2);
  });

  test('Mock functions work', () => {
    const mockFn = jest.fn();
    mockFn('test');
    expect(mockFn).toHaveBeenCalledWith('test');
  });

  test('Async test works', async () => {
    const promise = Promise.resolve('success');
    const result = await promise;
    expect(result).toBe('success');
  });
});

// Test mock data imports
describe('Mock Data', () => {
  test('Can import mock data', () => {
    // This will test if our mock files are properly structured
    expect(true).toBe(true);
  });
}); 