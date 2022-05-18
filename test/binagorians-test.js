const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Binagorians", function () {
  let owner, addr1;
  beforeEach(async () => {
    [owner, addr1] = await ethers.getSigners();
    let Binagorians = await ethers.getContractFactory("Binagorians", owner);
    contract = await Binagorians.deploy();
    await contract.deployed();
  });

  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

  describe("create", () => {
    it("Only owner can create binagorians", async function () {
      expect(await contract.owner()).to.equal(owner.address);
      
      let wallet = ethers.Wallet.createRandom();
      let entryTime = Date.parse('2017-01-05 00:00:00Z')/1000;
      let createBinagorianTx = contract.connect(addr1).create(wallet.address, entryTime, 'Ema', 20);
      
      await expect(createBinagorianTx).to.be.reverted;
    });
    it("Address should be valid", async function () {
      let entryTime = Date.parse('2017-01-05 00:00:00Z')/1000;
      
      let createBinagorianTx = contract.create(ZERO_ADDRESS, entryTime, 'Ema', 20);

      await expect(createBinagorianTx).to.be.revertedWith("Not valid address");
    });
    it("Address shouldn't exists", async function () {
      let wallet = ethers.Wallet.createRandom();
      let entryTime = Date.parse('2017-01-05 00:00:00Z')/1000;

      let createBinagorianTx = await contract.create(wallet.address, entryTime, 'Ema', 20);
      // wait until the transaction is mined
      await createBinagorianTx.wait();

      let createBinagorianTx2 = contract.create(wallet.address, entryTime, 'Ema2', 200);
      await expect(createBinagorianTx2).to.be.revertedWith("Address already registered");
    });
    it("Should create a new binagorian with correct values", async function () {
      let wallet = ethers.Wallet.createRandom();
      let entryTime = Date.parse('2017-01-05 00:00:00Z')/1000;

      let createBinagorianTx = await contract.create(wallet.address, entryTime, 'Ema', 20);
      // wait until the transaction is mined
      await createBinagorianTx.wait();
  
      let binagorian = await contract.get(wallet.address);
      expect(binagorian).to.not.be.null;
      expect(binagorian['name']).to.equal('Ema');
      expect(binagorian['entryTime']).to.equal(entryTime);
      expect(binagorian['rate']).to.equal(20);

      let registeredAddresses = await contract.getRegisteredAddresses();
      expect(registeredAddresses.length).to.equal(2);
      expect(registeredAddresses[1]).to.equal(wallet.address);
    });
  });

  describe("update rate", () => {
    it("Only owner can update binagorian rate", async function () {
      expect(await contract.owner()).to.equal(owner.address);
      
      let wallet = ethers.Wallet.createRandom();
      
      await expect(contract.connect(addr1).updateRate(wallet.address, 20)).to.be.reverted;
    });
    it("Address should be valid", async function () {
      let updateTx = contract.updateRate(ZERO_ADDRESS, 65);

      await expect(updateTx).to.be.revertedWith("Not valid address");
    });
    it("Address should exists", async function () {
      let wallet = ethers.Wallet.createRandom();
      let updateTx = contract.updateRate(wallet.address, 55);

      await expect(updateTx).to.be.revertedWith("Address does not exists");
    });
    it("Should update binagorian rate with correct values", async function () {
      let wallet = ethers.Wallet.createRandom();
      let entryTime = Date.parse('2017-01-05 00:00:00Z')/1000;

      let createBinagorianTx = await contract.create(wallet.address, entryTime, 'Ema', 20);
      // wait until the transaction is mined
      await createBinagorianTx.wait();

      let updateBinagorianRateTx = await contract.updateRate(wallet.address, 25);
      // wait until the transaction is mined
      await updateBinagorianRateTx.wait();
  
      let binagorian = await contract.get(wallet.address);
      expect(binagorian['rate']).to.equal(25);
    });
  });

  describe("remove", () => {
    it("Only owner can remove binagorian", async function () {
      expect(await contract.owner()).to.equal(owner.address);
      
      let wallet = ethers.Wallet.createRandom();
      
      await expect(contract.connect(addr1).remove(wallet.address)).to.be.reverted;
    });
    it("Address should be valid", async function () {
      let removeTx = contract.remove(ZERO_ADDRESS);

      await expect(removeTx).to.be.revertedWith("Not valid address");
    });
    it("Address should exists", async function () {
      let wallet = ethers.Wallet.createRandom();
      let removeTx = contract.remove(wallet.address);

      await expect(removeTx).to.be.revertedWith("Address does not exists");
    });
    it("Owner can't be deleted", async function () {
      let removeTx = contract.remove(owner.address);

      await expect(removeTx).to.be.revertedWith("Owner can't be deleted");
    });
    it("Should remove binagorian", async function () {
      let wallet = ethers.Wallet.createRandom();
      let entryTime = Date.parse('2017-01-05 00:00:00Z')/1000;

      let createBinagorianTx = await contract.create(wallet.address, entryTime, 'Ema', 20);
      // wait until the transaction is mined
      await createBinagorianTx.wait();
  
      let binagorian = await contract.get(wallet.address);
      expect(binagorian).to.not.be.null;
      expect(binagorian['name']).to.equal('Ema');
      expect(binagorian['entryTime']).to.equal(entryTime);
      expect(binagorian['rate']).to.equal(20);
      
      let removeTx = await contract.remove(wallet.address);
      // wait until the transaction is mined
      await removeTx.wait();
  
      let registeredAddresses = await contract.getRegisteredAddresses();
      expect(registeredAddresses.length).to.equal(1);
      expect(registeredAddresses[0]).to.equal(await contract.owner()); // just the owner address
    });
  });

  describe("get", () => {
    it("Only owner can get binagorians by address", async function () {
      let wallet = ethers.Wallet.createRandom();
      let entryTime = Date.parse('2017-01-05 00:00:00Z')/1000;

      let createBinagorianTx = await contract.create(wallet.address, entryTime, 'Ema', 20);
      // wait until the transaction is mined
      await createBinagorianTx.wait();

      let currentBinagorianTx = contract.connect(addr1).get(wallet.address);

      await expect(currentBinagorianTx).to.be.reverted;

    });
    it("Address should be valid", async function () {
      let getTx = contract.get(ZERO_ADDRESS);

      await expect(getTx).to.be.revertedWith("Not valid address");
    });
    it("Address should exists", async function () {
      let wallet = ethers.Wallet.createRandom();
      let getTx = contract.get(wallet.address);

      await expect(getTx).to.be.revertedWith("Address does not exists");
    });
    it("Should get binagorian by address", async function () {
      let wallet = ethers.Wallet.createRandom();
      let entryTime = Date.parse('2017-01-05 00:00:00Z')/1000;

      let createBinagorianTx = await contract.create(wallet.address, entryTime, 'Ema', 20);
      // wait until the transaction is mined
      await createBinagorianTx.wait();
  
      let binagorian = await contract.get(wallet.address);
      expect(binagorian).to.not.be.null;
      expect(binagorian['name']).to.equal('Ema');
      expect(binagorian['entryTime']).to.equal(entryTime);
      expect(binagorian['rate']).to.equal(20);
    });
  });

  describe("get current", () => {
    it("Address should exists", async function () {
      let getCurrentTx = contract.connect(addr1).getCurrent();

      await expect(getCurrentTx).to.be.revertedWith("Address does not exists");
    });
    it("Should return current binagorian", async function () {
      let entryTime = Date.parse('2017-01-05 00:00:00Z')/1000;

      let createBinagorianTx = await contract.create(addr1.address, entryTime, 'Ema', 20);
      // wait until the transaction is mined
      await createBinagorianTx.wait();

      let currentBinagorian = await contract.connect(addr1).getCurrent();
      expect(currentBinagorian).to.not.be.null;
      expect(currentBinagorian['name']).to.equal('Ema');
      expect(currentBinagorian['entryTime']).to.equal(entryTime);
      expect(currentBinagorian['rate']).to.equal(20);
    });
  });

});
