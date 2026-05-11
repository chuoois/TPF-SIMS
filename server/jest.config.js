module.exports = {
  // Bật thu thập coverage (độ bao phủ code)
  collectCoverage: true,
  // Thư mục chứa báo cáo coverage
  coverageDirectory: "coverage",
  // Nhóm các môi trường test cho node (chạy backend)
  testEnvironment: "node",
  // Khai báo root dir
  rootDir: ".",
  // Nơi jest tìm kiếm các file test
  testMatch: [
    "**/tests/**/*.test.js"
  ],
  // Bỏ qua các file trong node_modules
  testPathIgnorePatterns: [
    "/node_modules/"
  ],
  // Clear mock sau mỗi test case
  clearMocks: true,
};
