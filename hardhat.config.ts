import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-ethers";
import { config } from "dotenv";
//import "./tasks";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "@typechain/hardhat";
import "hardhat-deploy";

config({ path: ".env.local" });

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.8",
      },
      {
        version: "0.6.6",
      },
    ],
  },
  defaultNetwork: "hardhat",
  networks: {
    rinkeby: {
      url: process.env.RINKEBY_RPC_URL_ALCHEMY,
      accounts: [process.env.PRIVATE_KEY_DEV_1],
      chainId: 4,
      blockConfirmations: 6,
    },
    hardhat: {
      chainId: 31337,
    },
    bscTest: {
      url: process.env.BNB_TESTNET_RPC_URL_QUICKNODE,
      accounts: [process.env.PRIVATE_KEY_DEV_1],
      chainId: 97,
      blockConfirmations: 6,
    },
  },
  etherscan: {
    apiKey: process.env.BSC_SCANNER_API_KEY,
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
    // coinmarketcap: process.env.COINMARKET_CAP_API_KEY,
    //token: "MATIC", // for polygon blockchain(optional).
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    player: {
      default: 1,
    },
  },
};
