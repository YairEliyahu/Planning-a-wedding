// Polyfills for JSDOM environment

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
}

global.IntersectionObserver = MockIntersectionObserver;

// Mock HTMLElement.getBoundingClientRect
global.HTMLElement.prototype.getBoundingClientRect = function() {
  return {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    toJSON: function() {}
  };
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: function(query) {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: function() {},
      removeListener: function() {},
      addEventListener: function() {},
      removeEventListener: function() {},
      dispatchEvent: function() {},
    };
  },
});

// Mock requestAnimationFrame
global.requestAnimationFrame = function(cb) {
  return setTimeout(cb, 0);
};
global.cancelAnimationFrame = function(id) {
  return clearTimeout(id);
};

// Mock scrollTo
global.scrollTo = function() {};

// Fix for React 18 warnings in tests
const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning: ReactDOM.render is deprecated')
  ) {
    return;
  }
  originalError.call(console, ...args);
}; 