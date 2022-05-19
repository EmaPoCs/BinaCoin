const { expect } = require("chai");
const { ethers } = require("hardhat");
const { utils } = require("ethers");

const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

describe("MerkleDistributor", function () {
    let binacoin;
    beforeEach('deploy token', async () => {
        const Binacoin = await ethers.getContractFactory("Binacoin");
        binacoin = await Binacoin.deploy();
        await binacoin.deployed();
    });

    const users = [
        { address: "0xD08c8e6d78a1f64B1796d6DC3137B19665cb6F1F", amount: 10 },
        { address: "0xb7D15753D3F76e7C892B63db6b4729f700C01298", amount: 15 },
        { address: "0xf69Ca530Cd4849e3d1329FBEC06787a96a3f9A68", amount: 20 },
        { address: "0xa8532aAa27E9f7c3a96d754674c99F1E2f824800", amount: 30 },
      ];
    
    // equal to MerkleDistributor.sol #keccak256(abi.encodePacked(account, amount));
    const elements = users.map((x) =>
        utils.solidityKeccak256(["address", "uint256"], [x.address, x.amount])
    );

    describe("canClaim", () => {
        it("Should can claim successfully for valid proof", async () => {
            const merkleTree = new MerkleTree(elements, keccak256, { sort: true });
            const root = merkleTree.getHexRoot();
            const leaf = elements[3];
            const proof = merkleTree.getHexProof(leaf);
    
            // Deploy contract
            const Distributor = await ethers.getContractFactory("MerkleDistributor");
            const distributor = await Distributor.deploy(binacoin.address, root);
            await distributor.deployed();

            // Attempt to can claim and verify success
            let canClaim = await distributor.canClaim(users[3].address, users[3].amount, proof);
            expect(canClaim).to.be.true;
          });
        
        it("Shouldn't can claim for invalid proof", async () => {
            const merkleTree = new MerkleTree(elements, keccak256, { sort: true });
            const root = merkleTree.getHexRoot();
    
            // Deploy contract
            const Distributor = await ethers.getContractFactory("MerkleDistributor");
            const distributor = await Distributor.deploy(binacoin.address, root);
            await distributor.deployed();

            // Attempt to can claim and verify success
            let canClaim = await distributor.canClaim(users[2].address, users[2].amount, []);
            expect(canClaim).to.be.false;
          });

        it("Shouldn't can claim for invalid amount or address", async () => {
            const merkleTree = new MerkleTree(elements, keccak256, { sort: true });
            const root = merkleTree.getHexRoot();
            const leaf = elements[2];
            const proof = merkleTree.getHexProof(leaf);
    
            // Deploy contract
            const Distributor = await ethers.getContractFactory("MerkleDistributor");
            const distributor = await Distributor.deploy(binacoin.address, root);
            await distributor.deployed();

            // random amount
            let invalidAmountClaim = await distributor.canClaim(users[2].address, 10000, proof);
            expect(invalidAmountClaim).to.be.false;

            // random address
            let invalidAccountClaim = await distributor.canClaim("0x94069d197c64D831fdB7C3222Dd512af5339bd2d", users[2].amount, proof);
            expect(invalidAccountClaim).to.be.false;
          });
    });

    describe("claim", () => {
        it("Should claim successfully for valid proof", async () => {
            const merkleTree = new MerkleTree(elements, keccak256, { sort: true });
            const root = merkleTree.getHexRoot();
            const leaf = elements[3];
            const proof = merkleTree.getHexProof(leaf);
    
            // Deploy contract
            const Distributor = await ethers.getContractFactory("MerkleDistributor");
            const distributor = await Distributor.deploy(binacoin.address, root);
            await distributor.deployed();

            // Minting tokens to be able to transfer
            await binacoin.mint(distributor.address, 30);
        
            // Attempt to claim and verify success
            await expect(distributor.claim(users[3].address, users[3].amount, proof))
              .to.emit(distributor, "Claimed")
              .withArgs(users[3].address, users[3].amount);
          });

        it("Should revert for transfer amount exceeds balance", async () => {
            const merkleTree = new MerkleTree(elements, keccak256, { sort: true });
            const root = merkleTree.getHexRoot();
            const leaf = elements[3];
            const proof = merkleTree.getHexProof(leaf);
    
            // Deploy contract
            const Distributor = await ethers.getContractFactory("MerkleDistributor");
            const distributor = await Distributor.deploy(binacoin.address, root);
            await distributor.deployed();

            // Minting less tokens than needed to transfer the airdrop
            await binacoin.mint(distributor.address, 20);
        
            // Attempt to claim and verify success
            await expect(distributor.claim(users[3].address, users[3].amount, proof))
                .to.be.revertedWith("ERC20: transfer amount exceeds balance");
          });

        it("Should revert for drop already claimed", async () => {
            const merkleTree = new MerkleTree(elements, keccak256, { sort: true });
            const root = merkleTree.getHexRoot();
            const leaf = elements[3];
            const proof = merkleTree.getHexProof(leaf);
    
            // Deploy contract
            const Distributor = await ethers.getContractFactory("MerkleDistributor");
            const distributor = await Distributor.deploy(binacoin.address, root);
            await distributor.deployed();

            // Minting tokens to be able to transfer
            await binacoin.mint(distributor.address, 30);
        
            // Attempt to claim and verify success
            await expect(distributor.claim(users[3].address, users[3].amount, proof))
                .to.emit(distributor, "Claimed")
                .withArgs(users[3].address, users[3].amount);
            
            // Attempt to claim again and verify revert
            await expect(distributor.claim(users[3].address, users[3].amount, proof))
                .to.be.revertedWith("MerkleDistributor: Drop already claimed.");
          });
        
          it("Should revert for invalid amount or address", async () => {
            const merkleTree = new MerkleTree(elements, keccak256, { sort: true });
            const root = merkleTree.getHexRoot();
            const leaf = elements[3];
            const proof = merkleTree.getHexProof(leaf);
        
            // Deploy contract
            const Distributor = await ethers.getContractFactory("MerkleDistributor");
            const distributor = await Distributor.deploy(binacoin.address, root);
            await distributor.deployed();
        
            // random amount
            await expect(
              distributor.claim(users[3].address, 10000, proof)
            ).to.be.revertedWith("MerkleDistributor: Invalid proof.");
        
            // random address
            await expect(
              distributor.claim(
                "0x94069d197c64D831fdB7C3222Dd512af5339bd2d",
                users[3].amount,
                proof
              )
            ).to.be.revertedWith("MerkleDistributor: Invalid proof.");
          });
    
          it("Should revert for invalid proof", async () => {
            const merkleTree = new MerkleTree(elements, keccak256, { sort: true });
            const root = merkleTree.getHexRoot();
        
            // Deploy contract
            const Distributor = await ethers.getContractFactory("MerkleDistributor");
            const distributor = await Distributor.deploy(binacoin.address, root);
            await distributor.deployed();
        
            // Attempt to claim and verify success
            await expect(
              distributor.claim(users[3].address, users[3].amount, [])
            ).to.be.revertedWith("MerkleDistributor: Invalid proof.");
          });
    });
});