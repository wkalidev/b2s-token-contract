import { initSimnet } from "@hirosystems/clarinet-sdk";

(global as any).options = {
  clarinet: {
    manifestPath: "./Clarinet.toml",
    initBeforeEach: false,
    coverage: false,
    coverageFilename: "coverage.lcov",
    costs: false,
    costsFilename: "costs.csv",
    includeBootContracts: false,
    bootContractsPath: "",
  }
};

(global as any).simnet = await initSimnet("./Clarinet.toml");
(global as any).coverageReports = [];
(global as any).costsReports = [];