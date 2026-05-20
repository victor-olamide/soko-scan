// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./SokoPoints.sol";

/// @title SokoScan
/// @notice Merchant registry, cUSD payment processor, and loyalty points engine.
/// @dev Merchants register once and receive a numeric ID. Customers pay by ID
///      and earn SokoPoints. Platform takes a 0.5% fee on each transaction.
contract SokoScan is Ownable, ReentrancyGuard {
    IERC20 public immutable cUSD;
    SokoPoints public immutable sokoPoints;

    /// @notice Full merchant profile stored on-chain.
    struct Merchant {
        address wallet;
        string name;
        string category;
        bool active;
        uint256 totalReceived;
        uint256 txCount;
        uint256 pointsPerCUSD;
    }

    /// @notice A reward tier: spend pointsRequired points, get discountBPS basis-point discount.
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

    /// @notice Platform fee in basis points (50 = 0.5%).
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
    event MerchantUpdated(uint256 indexed merchantId, string name, string category);
    event MerchantDeactivated(uint256 indexed merchantId);

    constructor(address _cUSD, address _sokoPoints) Ownable(msg.sender) {
        cUSD = IERC20(_cUSD);
        sokoPoints = SokoPoints(_sokoPoints);
    }

    /// @notice Register a new merchant. Caller must not already be registered.
    /// @param name Business display name.
    /// @param category Business category string.
    /// @param pointsPerCUSD How many SokoPoints a customer earns per whole cUSD paid.
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

    /// @notice Pay a merchant in cUSD, optionally redeeming SokoPoints for a discount.
    /// @param merchantId Merchant to pay.
    /// @param amount Full gross amount in wei (18 decimals).
    /// @param pointsToRedeem Number of SokoPoints to burn for a discount.
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

        uint256 pointsIssued = (finalAmount * merchant.pointsPerCUSD) / 1e18;
        if (pointsIssued > 0) {
            customerPoints[msg.sender][merchantId] += pointsIssued;
            sokoPoints.mint(msg.sender, pointsIssued);
        }

        emit PaymentReceived(merchantId, msg.sender, finalAmount, pointsIssued);
    }

    /// @notice Add a loyalty reward rule for the calling merchant.
    function addLoyaltyRule(uint256 pointsRequired, uint256 discountBPS) external {
        require(isMerchant[msg.sender], "Not a merchant");
        uint256 merchantId = merchantIdByWallet[msg.sender];
        loyaltyRules[merchantId].push(LoyaltyRule({ pointsRequired: pointsRequired, discountBPS: discountBPS }));
    }

    /// @notice Update the display name and category of the calling merchant.
    function updateMerchant(string calldata name, string calldata category) external {
        require(isMerchant[msg.sender], "Not a merchant");
        uint256 merchantId = merchantIdByWallet[msg.sender];
        merchants[merchantId].name = name;
        merchants[merchantId].category = category;
        emit MerchantUpdated(merchantId, name, category);
    }

    /// @notice Deactivate the calling merchant's account (irreversible).
    function deactivateMerchant() external {
        require(isMerchant[msg.sender], "Not a merchant");
        uint256 merchantId = merchantIdByWallet[msg.sender];
        merchants[merchantId].active = false;
        emit MerchantDeactivated(merchantId);
    }

    /// @notice Returns full profile for a merchant by ID.
    function getMerchant(uint256 merchantId) external view returns (Merchant memory) {
        return merchants[merchantId];
    }

    /// @notice Returns accumulated SokoPoints a customer holds at a specific merchant.
    function getCustomerPoints(address customer, uint256 merchantId) external view returns (uint256) {
        return customerPoints[customer][merchantId];
    }

    /// @notice Returns all loyalty rules set by a merchant.
    function getLoyaltyRules(uint256 merchantId) external view returns (LoyaltyRule[] memory) {
        return loyaltyRules[merchantId];
    }

    /// @notice Returns total number of merchants ever registered.
    function totalMerchants() external view returns (uint256) {
        return _merchantCounter;
    }

    /// @notice Withdraws accumulated platform fees to owner wallet.
    function withdrawFees() external onlyOwner {
        uint256 balance = cUSD.balanceOf(address(this));
        require(cUSD.transfer(owner(), balance), "Withdraw failed");
    }
}
