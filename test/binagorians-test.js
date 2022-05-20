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
      expect(registeredAddresses.length).to.equal(1);
      expect(registeredAddresses[0]).to.equal(wallet.address);
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
      expect(registeredAddresses).to.be.empty;
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

  describe("get airdrop amounts", () => {
    it("No binagorians should returns empty list", async function () {
      let airdropAmounts = await contract.getAirdropAmounts();
      expect(airdropAmounts).to.be.empty;
    });

    it("Created 1 binagorian and get properly airdrop amount", async function () {
      // Creating Binagorian
      let wallet = ethers.Wallet.createRandom();
      let entryTime = Date.parse('2017-01-05 00:00:00Z')/1000;

      let createBinagorianTx = await contract.create(wallet.address, entryTime, 'Binagorian_1', 20);
      // Wait until the transaction is mined
      await createBinagorianTx.wait();

      let airdropAmounts = await contract.getAirdropAmounts();
      expect(airdropAmounts).to.not.be.null;
      expect(airdropAmounts.length).to.equal(1);
      let binagorianAirdrop = airdropAmounts[0];
      expect(binagorianAirdrop).to.not.be.null;
      expect(binagorianAirdrop['amount']).to.equal(20);
      expect(binagorianAirdrop['addr']).to.equal(wallet.address);
    });

    it("Created 3 binagorians and get properly airdrop amount", async function () {
      // Creating Binagorian 1
      let wallet = ethers.Wallet.createRandom();
      let entryTime = Date.parse('2017-01-05 00:00:00Z')/1000;

      let createBinagorianTx = await contract.create(wallet.address, entryTime, 'Binagorian_1', 20);
      // Wait until the transaction is mined
      await createBinagorianTx.wait();

      // Creating Binagorian 2
      let wallet2 = ethers.Wallet.createRandom();
      let entryTime2 = Date.parse('2018-01-05 00:00:00Z')/1000;

      let createBinagorianTx2 = await contract.create(wallet2.address, entryTime2, 'Binagorian_2', 30);
      // Wait until the transaction is mined
      await createBinagorianTx2.wait();

      // Creating Binagorian 3
      let wallet3 = ethers.Wallet.createRandom();
      let entryTime3 = Date.parse('2019-01-05 00:00:00Z')/1000;

      let createBinagorianTx3 = await contract.create(wallet3.address, entryTime3, 'Binagorian_3', 30);
      // Wait until the transaction is mined
      await createBinagorianTx3.wait();

      let airdropAmounts = await contract.getAirdropAmounts();
      expect(airdropAmounts).to.not.be.null;
      expect(airdropAmounts.length).to.equal(3);
      let binagorianAirdrop = airdropAmounts[1];
      expect(binagorianAirdrop).to.not.be.null;
      expect(binagorianAirdrop['amount']).to.equal(15);
      expect(binagorianAirdrop['addr']).to.equal(wallet2.address);
    });
  });

});
