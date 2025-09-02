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

    // 重写 decimals 函数，使用 0 位小数（整数代币）
    function decimals() public view virtual override returns (uint8) {
        return 0;
    }

    function buyTokens() external payable {
        require(msg.value > 0, "Send ETH to buy tokens");
        uint256 tokenAmount = msg.value * rate;
        require(balanceOf(owner()) >= tokenAmount, "Not enough tokens");
        _transfer(owner(), msg.sender, tokenAmount);
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

    function withdrawETH() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        payable(owner()).transfer(balance);
    }

    function burnFrom(address account, uint256 amount) public {
        _spendAllowance(account, msg.sender, amount);
        _burn(account, amount);
    }
}