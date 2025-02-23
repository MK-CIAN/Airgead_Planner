import "@testing-library/jest-dom";

// Mock ResizeObserver globally
if (typeof global.ResizeObserver === "undefined") {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// Mock lucide-react to prevent Jest from breaking
jest.mock("lucide-react", () => ({
  __esModule: true,
  TrendingUp: () => "TrendingUp",
  Label: () => "Label",
  PolarGrid: () => "PolarGrid",
}));
