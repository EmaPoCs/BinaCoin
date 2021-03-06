//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./MerkleDistributor.sol";

contract Binagorians is Ownable {
    using SafeMath for uint256;

    event Created(address _address);
    event Deleted(address _address);

    // Modifier to check that an address
    // was already registered.
    modifier addressAlreadyRegistered(address _addr) {
        require(
            keccak256(abi.encodePacked((_binagorians[_addr].name))) == keccak256(abi.encodePacked((""))) && 
            _binagorians[_addr].entryTime == 0 &&
            _binagorians[_addr].rate == 0 &&
            _binagorians[_addr].index == 0, 
            "Address already registered");
        // Underscore is a special character only used inside
        // a function modifier and it tells Solidity to
        // execute the rest of the code.
        _;
    }

    // Modifier to check that an address
    // currently exists.
    modifier addressExists(address _addr) {
        require(
            keccak256(abi.encodePacked((_binagorians[_addr].name))) != keccak256(abi.encodePacked((""))) && 
            _binagorians[_addr].entryTime != 0 &&
            _binagorians[_addr].rate != 0, 
            "Address does not exists");
        // Underscore is a special character only used inside
        // a function modifier and it tells Solidity to
        // execute the rest of the code.
        _;
    }

    // Modifier to check that the
    // address passed in is not the zero address.
    modifier validAddress(address _addr) {
        require(_addr != address(0), "Not valid address");
        _;
    }

    // Modifier to check if an address
    // could be deleted
    modifier validAddressToRemove(address _addr) {
        uint256 index = _binagorians[_addr].index;
        require(index < _binagoriansArray.length, "Index out of bounds");
        _;
    }

    struct Binagorian {
        string name;
        uint256 entryTime;
        uint16 rate;
        uint256 index;
    }

    struct BinagorianAirdrop {
        address addr;
        uint256 amount;
    }
    
    mapping(address => Binagorian) private _binagorians;
    address [] private _binagoriansArray;
    MerkleDistributor public _merkleDistributor; // TODO: Find a way to handle multiple distributors

    function create(address _bAddress, uint256 _entryTime, string memory _name, uint16 _rate) 
        public 
        onlyOwner 
        validAddress(_bAddress) 
        addressAlreadyRegistered(_bAddress) 
    {
        _binagoriansArray.push(_bAddress);
        _binagorians[_bAddress] = Binagorian(_name, _entryTime, _rate, _binagoriansArray.length - 1);
        emit Created(_bAddress);
    }

    // Move the last element to the deleted spot.
    // Remove the last element.
    // Update the index in the map.
    function remove(address _bAddress) 
        public 
        onlyOwner 
        validAddress(_bAddress) 
        addressExists(_bAddress) 
        validAddressToRemove(_bAddress) 
    {
        uint256 index = _binagorians[_bAddress].index;
        uint256 lastBinagorianArrayIndex = _binagoriansArray.length-1;
        address lastBinagorianAddress = _binagoriansArray[lastBinagorianArrayIndex];
        _binagorians[lastBinagorianAddress].index = index;
        _binagoriansArray[index] = lastBinagorianAddress;
        _binagoriansArray.pop();
        delete _binagorians[_bAddress];
        emit Deleted(_bAddress);
    }

    function updateRate(address _bAddress, uint16 _newRate) 
        public 
        onlyOwner 
        validAddress(_bAddress) 
        addressExists(_bAddress) 
    {
        Binagorian storage binagorian = _binagorians[_bAddress];
        binagorian.rate = _newRate;
    }

    function get(address _bAddress) 
        public 
        onlyOwner 
        validAddress(_bAddress) 
        addressExists(_bAddress) 
        view 
        returns (string memory name, uint256 entryTime, uint16 rate, uint256 airdropAmount) 
    {
        return (_binagorians[_bAddress].name, _binagorians[_bAddress].entryTime, _binagorians[_bAddress].rate, getAirdropAmount(_bAddress));
    }

    function getCurrent() 
        public 
        addressExists(msg.sender) 
        view 
        returns (string memory name, uint256 entryTime, uint16 rate) 
    {
        address bAddress = msg.sender;
        return (_binagorians[bAddress].name, _binagorians[bAddress].entryTime, _binagorians[bAddress].rate);
    }

    function getRegisteredAddresses() 
        public 
        onlyOwner 
        view 
        returns (address [] memory) 
    {
        return _binagoriansArray;
    }

    // This function should be called from front end in order to
    // calculate the merkle tree for airdrop.
    function getAirdropAmounts() 
        public 
        view 
        returns (BinagorianAirdrop[] memory binagorianAirdrops) 
    {
        BinagorianAirdrop[] memory airdrops = new BinagorianAirdrop[](_binagoriansArray.length);
        for (uint i=0; i<_binagoriansArray.length; i++) {
            BinagorianAirdrop memory bAirdrop = BinagorianAirdrop(_binagoriansArray[i], getAirdropAmount(_binagoriansArray[i]));
            airdrops[i] = bAirdrop;
        }

        return airdrops;
    }

    function getAirdropAmount(address bAddress) 
        private 
        view 
        returns (uint256 amount) 
    {
        uint256 entryTime = _binagorians[bAddress].entryTime;
        uint256 timeWorking = block.timestamp - entryTime;
        uint256 monthsWorking = SafeMath.div(timeWorking, 2629743); // 2629743 is the number of seconds in a month
        
        if (monthsWorking <= 6) {
            return 3;
        }
        else if (monthsWorking <= 12) {
            return 6;
        }
        else if (monthsWorking <= 36) {
            return 10;
        }
        else if (monthsWorking <= 60) {
            return 15;
        }
        else {
            return 20;
        }
    }

    function generateAirdrop(address token, bytes32 merkleRoot) 
        public 
        onlyOwner 
    {
        _merkleDistributor = new MerkleDistributor(token, merkleRoot);
    }

    function getMerkleDistributorAddress() public view returns(address) {
        return address(_merkleDistributor);
    }
}
