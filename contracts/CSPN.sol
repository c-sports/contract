//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CSPN is ERC20, Ownable {

    uint private _totalSupply = 13370000;
    uint private _initialSupply = 1000;
    // mapping (address => bool) public _usermint;

    constructor() ERC20 ('Crypto Sports Network', 'CSPN') {
        _mint(owner(), _initialSupply * 10 ** 18);
    }

    function mint(address to, uint256 amount) external onlyOwner payable {
        require(to != address(0), "CSPN Token: cannot mint to zero address");
        // require(!_usermint[to], 'Already minted');
        require(_totalSupply > _initialSupply + amount, 'Override totalSupply');
        // _usermint[to] = true;
        _initialSupply = _initialSupply + amount;
        _mint(to, amount * 10 ** 18);
        // (bool sent, bytes memory data) = to.call{value: msg.value}("");
        // require(sent, "Failed to send CSPN");
    }
}
