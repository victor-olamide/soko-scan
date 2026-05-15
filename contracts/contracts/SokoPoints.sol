// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SokoPoints is ERC20, Ownable {
    address public sokoScan;

    constructor() ERC20("SokoPoints", "SOKO") Ownable(msg.sender) {}

    function setSokoScan(address _sokoScan) external onlyOwner {
        sokoScan = _sokoScan;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external {
        _burn(from, amount);
    }
}
