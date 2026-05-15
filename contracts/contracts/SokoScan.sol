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

    function registerMerchant(
        string calldata name,
        string calldata category,
        uint256 pointsPerCUSD
    ) external returns (uint256 merchantId) {
        require(!isMerchant[msg.sender], "Already registered");
        require(bytes(name).length > 0, "Name required");
        require(pointsPerCUSD > 0 && pointsPerCUSD <= 100, "Invalid rate");

        merchantId = _merchantCounter++;
        merchants[merchantId] = Merchant({
            wallet: msg.sender, name: name, category: category,
            active: true, totalReceived: 0, txCount: 0, pointsPerCUSD: pointsPerCUSD
        });
        merchantIdByWallet[msg.sender] = merchantId;
        isMerchant[msg.sender] = true;

        emit MerchantRegistered(merchantId, msg.sender, name);
    }

    function pay(
        uint256 merchantId,
        uint256 amount,
        uint256 pointsToRedeem
    ) external nonReentrant {
        Merchant storage merchant = merchants[merchantId];
        require(merchant.active, "Merchant inactive");
        require(amount > 0, "Amount required");

        uint256 discount = 0;
        if (pointsToRedeem > 0) {
            uint256 userPoints = customerPoints[msg.sender][merchantId];
            require(userPoints >= pointsToRedeem, "Insufficient points");
            discount = pointsToRedeem * 1e15;
            if (discount > amount) discount = amount;
            customerPoints[msg.sender][merchantId] -= pointsToRedeem;
            sokoPoints.burn(msg.sender, pointsToRedeem);
            emit PointsRedeemed(merchantId, msg.sender, pointsToRedeem, discount);
        }

        uint256 finalAmount = amount - discount;
        uint256 platformFee = (finalAmount * PLATFORM_FEE_BPS) / 10000;
        uint256 merchantReceives = finalAmount - platformFee;

        require(cUSD.transferFrom(msg.sender, address(this), finalAmount), "Payment failed");
        require(cUSD.transfer(merchant.wallet, merchantReceives), "Merchant transfer failed");
        merchant.totalReceived += merchantReceives;
        merchant.txCount += 1;

        uint256 pointsIssued = (finalAmount / 1e18) * merchant.pointsPerCUSD;
        if (pointsIssued > 0) {
            customerPoints[msg.sender][merchantId] += pointsIssued;
            sokoPoints.mint(msg.sender, pointsIssued);
        }

        emit PaymentReceived(merchantId, msg.sender, finalAmount, pointsIssued);
    }

    function addLoyaltyRule(uint256 pointsRequired, uint256 discountBPS) external {
        require(isMerchant[msg.sender], "Not a merchant");
        uint256 merchantId = merchantIdByWallet[msg.sender];
        loyaltyRules[merchantId].push(LoyaltyRule({ pointsRequired: pointsRequired, discountBPS: discountBPS }));
    }

    function updateMerchant(string calldata name, string calldata category) external {
        require(isMerchant[msg.sender], "Not a merchant");
        uint256 merchantId = merchantIdByWallet[msg.sender];
        merchants[merchantId].name = name;
        merchants[merchantId].category = category;
    }

    function deactivateMerchant() external {
        require(isMerchant[msg.sender], "Not a merchant");
        merchants[merchantIdByWallet[msg.sender]].active = false;
    }

    function getMerchant(uint256 merchantId) external view returns (Merchant memory) {
        return merchants[merchantId];
    }

    function getCustomerPoints(address customer, uint256 merchantId) external view returns (uint256) {
        return customerPoints[customer][merchantId];
    }
}
