module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(t|j)sx?$": "ts-jest",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(lucide-react)/)", // Prevent Jest from trying to process lucide-react
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "lucide-react": "<rootDir>/src/__mocks__/lucide-react.ts", // Redirect imports to a mock
  },
  testMatch: ["**/src/__tests__/**/*.[jt]s?(x)"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "mjs"],
};
