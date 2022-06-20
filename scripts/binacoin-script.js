const hre = require("hardhat");

async function main() {
  // We get the contract to deploy
  const Binacoin = await hre.ethers.getContractFactory("Binacoin");
  const binacoin = await Binacoin.deploy();

  await binacoin.deployed();

  console.log("Binacoin deployed to:", binacoin.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
