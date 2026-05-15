// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./SokoPoints.sol";

contract SokoScan is Ownable, ReentrancyGuard {
    IERC20 public immutable cUSD;
    SokoPoints public immutable sokoPoints;

    struct Merchant {
        address wallet;
        string name;
        string category;
        bool active;
        uint256 totalReceived;
        uint256 txCount;
        uint256 pointsPerCUSD;
    }

    struct LoyaltyRule {
        uint256 pointsRequired;
        uint256 discountBPS;
    }

    uint256 private _merchantCounter;
    mapping(address => uint256) public merchantIdByWallet;
    mapping(uint256 => Merchant) public merchants;
    mapping(address => bool) public isMerchant;

    mapping(uint256 => LoyaltyRule[]) public loyaltyRules;
    mapping(address => mapping(uint256 => uint256)) public customerPoints;

    uint256 public constant PLATFORM_FEE_BPS = 50;

    event MerchantRegistered(uint256 indexed merchantId, address indexed wallet, string name);
    event PaymentReceived(
        uint256 indexed merchantId,
        address indexed customer,
        uint256 amount,
        uint256 pointsIssued
    );
    event PointsRedeemed(
        uint256 indexed merchantId,
        address indexed customer,
        uint256 pointsBurned,
        uint256 discount
    );

    constructor(address _cUSD, address _sokoPoints) Ownable(msg.sender) {
        cUSD = IERC20(_cUSD);
        sokoPoints = SokoPoints(_sokoPoints);
    }

    function registerMerchant(string calldata name,string calldata category,uint256 pointsPerCUSD) external returns (uint256 merchantId) {
        require(!isMerchant[msg.sender], "Already registered");
        require(bytes(name).length > 0, "Name required");
        require(pointsPerCUSD > 0 && pointsPerCUSD <= 100, "Invalid rate");
    }
}
