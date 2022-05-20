//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract MerkleDistributor {
    using SafeERC20 for IERC20;

    address public immutable token;
    bytes32 public immutable merkleRoot;

    mapping(address => bool) public claimed;

    event Claimed(address account, uint256 amount);

    constructor(address _token, bytes32 _merkleRoot) {
        token = _token;
        merkleRoot = _merkleRoot;
    }

    function claim(address account, uint256 amount, bytes32[] calldata merkleProof) 
        external 
    {
        require(
            canClaim(account, amount, merkleProof),
            "MerkleDistributor: Invalid proof."
        );

        claimed[account] = true;
        IERC20(token).safeTransfer(account, amount);

        emit Claimed(account, amount);
    }

    function canClaim(address account, uint256 amount, bytes32[] calldata merkleProof)
        public
        view
        returns (bool)
    {
        require(
            !claimed[account],
            'MerkleDistributor: Drop already claimed.'
        );

        bytes32 node = keccak256(abi.encodePacked(account, amount));
        return MerkleProof.verify(merkleProof, merkleRoot, node);
    }
}