// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // const Token = await hre.ethers.getContractFactory("WalterToken");
  // const token = await Token.deploy();

  // await token.deployed();

  // console.log("CSPN Token deployed to:", token.address);
  
  // const Token = await hre.ethers.getContractFactory("CSPNToken");
  // const token = await Token.deploy();

  // await token.deployed();

  // console.log("CSPN Token deployed to:", token.address);

  const Staking = await hre.ethers.getContractFactory("Staking");
  const staking = await Staking.deploy("0xf3F909aEE89985DD7DDb5B6132f0c53a595151B6");

  await staking.deployed();

  console.log("CSPN Staking deployed to:", staking.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
