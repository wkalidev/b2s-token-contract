export default function setup() {
  (global as any).options = {
    clarinet: {
      manifestPath: "./Clarinet.toml",
      initBeforeEach: false,
      coverage: false,
      costs: false,
      includeBootContracts: false,
    }
  };
}