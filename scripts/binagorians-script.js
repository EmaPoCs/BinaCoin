// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const Binagorians = await hre.ethers.getContractFactory("Binagorians");
  const binagorians = await Binagorians.deploy();

  await binagorians.deployed();

  console.log("Binagorians deployed to:", binagorians.address);

  await binagorians.create("0xdd2fd4581271e230360230f9337d5c0430bf44c0", 123, "Ema", 20);
  await binagorians.create("0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199", 123, "Mati", 30);
  await binagorians.create("0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc", 1232233, "Fer", 40);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
