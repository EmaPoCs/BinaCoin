//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Binacoin is ERC20, ERC20Burnable, Ownable {
    struct Binagorian {
        string name;
        uint256 entryTime;
        uint16 rate;
    }
    mapping(address => Binagorian) private _binagorians;
    
    event Withdraw(address indexed _from, uint _value);

    constructor() ERC20("Binacoin", "BINA") {}

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function createBinagorian(address bAddress, uint256 entryTime, string memory name, uint16 rate) public onlyOwner {
        _binagorians[bAddress] = Binagorian(name, entryTime, rate);
    }

    function updateBinagorianRate(address bAddress, uint16 newRate) public onlyOwner {
        Binagorian storage binagorian = _binagorians[bAddress];
        binagorian.rate = newRate;
    }

    function getBinagorian(address bAddress) public view returns (string memory name, uint256 entryTime, uint16 rate) {
        return (_binagorians[bAddress].name, _binagorians[bAddress].entryTime, _binagorians[bAddress].rate);
    }

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override 
    {
        super._afterTokenTransfer(from, to, amount);
        
        if (to == address(0)) {
            // Here the binagorian should get the payment of the burned tokens
            emit Withdraw(from, amount);
        }
    }
}