const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Binacoin", function () {
  let owner, addr1;
  beforeEach(async () => {
    [owner, addr1] = await ethers.getSigners();
    let Binacoin = await ethers.getContractFactory("Binacoin", owner);
    contract = await Binacoin.deploy();
    await contract.deployed();
  });

  describe("createBinagorian", () => {
    it("Only owner can create binagorians", async function () {
      expect(await contract.owner()).to.equal(owner.address);
      
      let wallet = ethers.Wallet.createRandom();
      let entryTime = Date.parse('2017-01-05 00:00:00Z')/1000;
      
      await expect(contract.connect(addr1).createBinagorian(wallet.address, entryTime, 'Ema', 20)).to.be.reverted;
    });
    it("Should create a new binagorian with correct values", async function () {
      let wallet = ethers.Wallet.createRandom();
      let entryTime = Date.parse('2017-01-05 00:00:00Z')/1000;

      let createBinagorianTx = await contract.createBinagorian(wallet.address, entryTime, 'Ema', 20);
      // wait until the transaction is mined
      await createBinagorianTx.wait();
  
      let binagorian = await contract.getBinagorian(wallet.address);
      expect(binagorian['name']).to.equal('Ema');
      expect(binagorian['entryTime']).to.equal(entryTime);
      expect(binagorian['rate']).to.equal(20);
    });
  });

  describe("updateBinagorianRate", () => {
    it("Only owner can update binagorian rate", async function () {
      expect(await contract.owner()).to.equal(owner.address);
      
      let wallet = ethers.Wallet.createRandom();
      
      await expect(contract.connect(addr1).updateBinagorianRate(wallet.address, 20)).to.be.reverted;
    });
    it("Should update binagorian rate with correct values", async function () {
      let wallet = ethers.Wallet.createRandom();

      let updateBinagorianRateTx = await contract.updateBinagorianRate(wallet.address, 25);
      // wait until the transaction is mined
      await updateBinagorianRateTx.wait();
  
      let binagorian = await contract.getBinagorian(wallet.address);
      expect(binagorian['rate']).to.equal(25);
    });
  });

  describe("mint", () => {
    it("Only owner can mint new tokens", async function () {
      expect(await contract.owner()).to.equal(owner.address);
      
      let wallet = ethers.Wallet.createRandom();
      
      await expect(contract.connect(addr1).mint(wallet.address, 1000)).to.be.reverted;
    });
    it("Should mint 1000 new tokens in the wallet account", async function () {
      let wallet = ethers.Wallet.createRandom();

      let mintTx = await contract.mint(wallet.address, 1000);
      // wait until the transaction is mined
      await mintTx.wait();
  
      let balance = await contract.balanceOf(wallet.address);
      expect(balance).to.equal(1000);
    });
  })
});
