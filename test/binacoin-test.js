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
      
      await expect(contract.connect(addr1).createBinagorian(wallet.address, entryTime, 'Ema', 30)).to.be.reverted;
    });
    it("Should create a new Binagorian with correct values", async function () {
      let wallet = ethers.Wallet.createRandom();
      let entryTime = Date.parse('2017-01-05 00:00:00Z')/1000;

      let createBinagorianTx = await contract.createBinagorian(wallet.address, entryTime, 'Ema', 30);
      // wait until the transaction is mined
      await createBinagorianTx.wait();
  
      let binagorian = await contract.getBinagorian(wallet.address);
      expect(binagorian['name']).to.equal('Ema');
      expect(binagorian['entryTime']).to.equal(entryTime);
      expect(binagorian['rate']).to.equal(30);
    });
  })
  
});
