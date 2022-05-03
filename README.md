# Setup
1. Follow instructions on https://hardhat.org/getting-started/#overview in order to configure hardhat.
2. install open zeppelin contracts https://docs.openzeppelin.com/ running npm install "@openzeppelin/contracts".

# How to initialize locally
```shell
1. npx hardhat node
2. npx hardhat run --network localhost scripts\binagorians-script.js
3. npx hardhat console --network localhost
4. const Binagorians = await hre.ethers.getContractFactory("Binagorians");
5. const binagorians = await Binagorians.attach([address where the contract was deployed - you can see it as output of step 2]);
```
Doing that you're gonna have a node console app to interact with the smart contract (`const binagorians`).

# How to run tests
```shell
npx hardhat test
```