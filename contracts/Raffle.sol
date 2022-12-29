// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/KeeperCompatible.sol";
import "hardhat/console.sol";

error Raffle__TransferFailed();
error Raffle__SendMoreToEnterRaffle();
error Raffle__NotOpen();
error Raffle__UpkeepNotNeeded(
    uint256 curretnBalance,
    uint256 numPlayers,
    uint256 raffelState
);

/**
 * @title Sample Raffle contract
 * @author Me
 * @notice Raffle contract
 * @dev Implements Chainlink VRF v2 and Chainlink Keepers
 **/

contract Raffle is VRFConsumerBaseV2, KeeperCompatibleInterface, Ownable {
    /* types */
    enum RaffleState {
        OPEN,
        CALCULATING
    }

    /* State vars */
    uint256 private immutable i_entranceFee;
    address payable[] private s_players;

    /* State variables */
    // Chainlink VRF Variables
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private i_gasLane;
    uint64 private i_subscriptionId;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private i_callbackGasLimit;
    uint32 private constant NUM_WORDS = 1;

    // lottery variables
    address private s_owner;
    address private s_recentWinner;
    RaffleState private s_raffleState;
    uint256 private s_lastTimeStamp;
    uint256 private i_keepersUpdateInterval;

    // events
    event RequestedRaffleWinner(uint256 indexed requestId);
    event RaffleEnter(address indexed player);
    event WinnerPicked(address indexed winner);

    // modifiers

    modifier raffleMustBeOpen() {
        if (s_raffleState != RaffleState.OPEN) {
            revert Raffle__NotOpen();
        }
        _;
    }

    // functions
    constructor(
        address vrfCoordinatorV2,
        uint64 subscriptionId,
        uint256 entranceFee,
        bytes32 gasLane,
        uint32 callbackGasLimit,
        uint256 keepersUpdateInterval
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        s_owner = msg.sender;
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_subscriptionId = subscriptionId;
        i_entranceFee = entranceFee;
        i_gasLane = gasLane;
        i_callbackGasLimit = callbackGasLimit;
        s_raffleState = RaffleState.OPEN;
        s_lastTimeStamp = block.timestamp;
        i_keepersUpdateInterval = keepersUpdateInterval;
    }

    function enterRaffle() public payable raffleMustBeOpen {
        if (msg.value < i_entranceFee) {
            revert Raffle__SendMoreToEnterRaffle();
        }
        s_players.push(payable(msg.sender));

        emit RaffleEnter(msg.sender);
    }

    function checkUpkeep(
        bytes memory /* checkData */
    )
        public
        view
        override
        returns (
            bool upkeepNeeded,
            bytes memory /* performData */
        )
    {
        bool isOpen = RaffleState.OPEN == s_raffleState;
        bool timePassed = (block.timestamp - s_lastTimeStamp) >
            i_keepersUpdateInterval;
        bool hasPLayers = s_players.length > 0;
        bool hasBalance = address(this).balance > 0;

        // upkeepNeeded automatically returned as defined bool upkeepNeeded in return
        upkeepNeeded = (timePassed && isOpen && hasBalance && hasBalance);
        return (upkeepNeeded, "0x0");
    }

    // Just changing this function from requestRandomWords to performUpkeep
    // function requestRandomWords() external onlyOwner {
    function performUpkeep(bytes calldata performData) external override {
        ///We highly recommend revalidating the upkeep in the performUpkeep function
        (bool upKeepNeeded, ) = checkUpkeep("");
        if (!upKeepNeeded) {
            revert Raffle__UpkeepNotNeeded(
                address(this).balance,
                s_players.length,
                uint256(s_raffleState)
            );
        }
        // Will revert if subscription is not set and funded.
        s_raffleState = RaffleState.CALCULATING;
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );

        emit RequestedRaffleWinner(requestId);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
        internal
        override
    {
        uint256 indesOfWinner = randomWords[0] % s_players.length;
        address payable recentWinner = s_players[indesOfWinner];
        s_recentWinner = recentWinner;
        // reset
        s_raffleState = RaffleState.OPEN;
        s_players = new address payable[](0);
        s_lastTimeStamp = block.timestamp;
        (bool success, ) = recentWinner.call{value: address(this).balance}("");
        if (!success) {
            revert Raffle__TransferFailed();
        }
        emit WinnerPicked(recentWinner);
    }

    // pure and views getters
    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    function getPlayer(uint256 i) public view returns (address) {
        return s_players[i];
    }

    function getRecentWinner() public view returns (address) {
        return s_recentWinner;
    }

    function getRaffleState() public view returns (RaffleState) {
        return s_raffleState;
    }

    function getNumWords() public pure returns (uint256) {
        return NUM_WORDS;
    }

    function getNumberOfPlayers() public view returns (uint256) {
        return s_players.length;
    }

    function getLatestTimestamp() public view returns (uint256) {
        return s_lastTimeStamp;
    }

    function getRequestConfirmations() public pure returns (uint256) {
        return REQUEST_CONFIRMATIONS;
    }

    function getRaffleKeeperInterval() public view returns (uint256) {
        return i_keepersUpdateInterval;
    }

    function getLastTimeStamp() public view returns (uint256) {
        return s_lastTimeStamp;
    }

    receive() external payable {}

    fallback() external payable {}
}
