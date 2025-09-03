import type { HardhatUserConfig } from "hardhat/config";
import { config as dotenvConfig } from "dotenv";

import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";

dotenvConfig();

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: `https://sepolia.infura.io/v3/${process.env.PROJECT_ID}`,
      accounts: process.env.SEPOLIA_PRIVATE_KEY ? [process.env.SEPOLIA_PRIVATE_KEY] : [],
    },
  },
};

export default config;
