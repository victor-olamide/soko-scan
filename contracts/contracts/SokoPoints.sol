// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title SokoPoints
/// @notice ERC-20 loyalty token minted and burned exclusively by SokoScan.
/// @dev 1 SokoPoint redeems for 0.001 cUSD (1e15 wei) of discount.
contract SokoPoints is ERC20, Ownable {
    /// @notice Address of the SokoScan contract authorised to mint and burn.
    address public sokoScan;

    constructor() ERC20("SokoPoints", "SOKO") Ownable(msg.sender) {}

    /// @notice Sets the SokoScan contract address. Can only be called once by owner.
    function setSokoScan(address _sokoScan) external onlyOwner {
        sokoScan = _sokoScan;
    }

    /// @notice Mints loyalty points to a customer after a successful payment.
    function mint(address to, uint256 amount) external {
        require(msg.sender == sokoScan, "Only SokoScan");
        _mint(to, amount);
    }

    /// @notice Burns loyalty points when a customer redeems them for a discount.
    function burn(address from, uint256 amount) external {
        require(msg.sender == sokoScan, "Only SokoScan");
        _burn(from, amount);
    }
}
