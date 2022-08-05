import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { network } from "hardhat";
import { developmentChains, networkConfig } from "../helper-hardhat-config";
import { verify } from "../utils/verify";

const deployRaffle: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network, ethers } = hre;
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  const MOCK_FUND_AMOUNT = "1000000000000000000000";

  console.log("NETWORK ++++", network.name);
  let vrfCoordinatorV2Address, subscriptionId;
  if (developmentChains.includes(network.name)) {
    const vrfCoordinatorV2Mock = await ethers.getContract(
      "VRFCoordinatorV2Mock"
    );
    vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
    const transactionResponse = await vrfCoordinatorV2Mock.createSubscription();
    const transactionReceipt = await transactionResponse.wait();
    subscriptionId = transactionReceipt.events[0].args.subId;
    // Fund the subscription
    // Our mock makes it so we don't actually have to worry about sending fund
    await vrfCoordinatorV2Mock.fundSubscription(
      subscriptionId,
      MOCK_FUND_AMOUNT
    );
  } else {
    vrfCoordinatorV2Address =
      networkConfig[chainId as number]["vrfCoordinator"]!;
    subscriptionId = networkConfig[chainId as number]["subscriptionId"]!;
  }

  log("----------------------------------------------------");
  log("Deploying Raffle and waiting for confirmations...");

  const { entranceFee, gasLane, callbackGasLimit, keepersUpdateInterval } =
    networkConfig[chainId as number] || {};
  const args = [
    vrfCoordinatorV2Address,
    subscriptionId,
    entranceFee,
    gasLane,
    callbackGasLimit,
    keepersUpdateInterval,
  ];
  const raffle = await deploy("Raffle", {
    from: deployer,
    args,
    log: true,
    // @ts-ignore
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  log(`Raffle deployed at ${raffle.address}`);

  log(`Verifying... ${raffle.address}`);

  if (
    !developmentChains.includes(network.name) &&
    process.env.BSC_SCANNER_API_KEY
  ) {
    await verify(raffle.address, args);
  }

  log(`Verifying done for Raffle... ${raffle.address}`);
};

export default deployRaffle;

deployRaffle.tags = ["all", "Raffle"];
