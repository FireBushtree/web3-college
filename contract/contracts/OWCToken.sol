// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OWCToken is ERC20, Ownable {
    uint256 public rate;

    constructor() ERC20("OWC", "OW") Ownable(msg.sender) {
        rate = 5000;
        _mint(msg.sender, 1000000 * 10**decimals());
    }

    function buyTokens() external payable {
        require(msg.value > 0, "Send ETH to buy tokens");
        uint256 tokenAmount = msg.value * rate;
        require(balanceOf(address(this)) >= tokenAmount, "Not enough tokens");
        _transfer(address(this), msg.sender, tokenAmount);
    }

    function sellTokens(uint256 tokenAmount) external {
        require(tokenAmount > 0, "Specify token amount");
        require(balanceOf(msg.sender) >= tokenAmount, "Not enough tokens");

        uint256 ethAmount = tokenAmount / rate;
        require(address(this).balance >= ethAmount, "Not enough ETH");

        _transfer(msg.sender, address(this), tokenAmount);
        payable(msg.sender).transfer(ethAmount);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }

    function burnFrom(address account, uint256 amount) public {
        _spendAllowance(account, msg.sender, amount);
        _burn(account, amount);
    }
}