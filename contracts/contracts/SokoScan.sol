// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./SokoPoints.sol";

contract SokoScan is Ownable, ReentrancyGuard {
    IERC20 public immutable cUSD;
    SokoPoints public immutable sokoPoints;

    constructor(address _cUSD, address _sokoPoints) Ownable(msg.sender) {
        cUSD = IERC20(_cUSD);
        sokoPoints = SokoPoints(_sokoPoints);
    }
}
