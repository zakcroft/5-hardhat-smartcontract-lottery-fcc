import { BigNumber, ethers } from "ethers";

export interface networkConfigItem {
  name: string;
  blockConfirmations?: number;
  vrfCoordinator?: string;
  subscriptionId?: number;
  gasLane?: string;
  callbackGasLimit?: number;
  entranceFee?: BigNumber;
  keepersUpdateInterval?: number;
}

interface NetworkConfigType {
  [key: number]: networkConfigItem;
}

const networkConfig: NetworkConfigType = {
  31337: {
    name: "localhost",
    subscriptionId: 9214,
    entranceFee: ethers.utils.parseEther("0.01"),
    gasLane:
      "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc", //this is mocked
    callbackGasLimit: 100000,
    keepersUpdateInterval: 30,
  },
  4: {
    name: "rinkeby",
    vrfCoordinator: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
    subscriptionId: 9214,
    entranceFee: ethers.utils.parseEther("0.01"),
    gasLane:
      "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc", //gasLaneRinkeby30
    callbackGasLimit: 100000,
    keepersUpdateInterval: 30,
  },
  97: {
    name: "bnbTest",
    vrfCoordinator: "0x6A2AAd07396B36Fe02a22b33cf443582f682c82f",
    subscriptionId: 1498,
    entranceFee: ethers.utils.parseEther("0.01"),
    gasLane:
      "0xd4bb89654db74673a187bd804519e65e3f71a52bc55f11da7601a13dcf505314", //gasLaneRinkeby30
    callbackGasLimit: 100000,
    keepersUpdateInterval: 1,
  },
};

const developmentChains: Array<string> = ["hardhat", "localhost"];

export { networkConfig, developmentChains };
