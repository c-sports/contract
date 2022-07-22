// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const { BigNumber }  = require("ethers");

async function main() {
  const Token = await hre.ethers.getContractFactory("CSPNToken");
  const token = await Token.deploy();

  await token.deployed();

  console.log("CSPN Token deployed to:", token.address);

  // const Staking = await hre.ethers.getContractFactory("Staking");
  // const staking = await Staking.deploy("0x9A0b381394fbE689B344d1ebd2d4DccFF31adf87"); //CSPN Token address: 0x9A0b381394fbE689B344d1ebd2d4DccFF31adf87

  // await staking.deployed();

  // console.log("CSPN Staking deployed to:", staking.address);

  const CSPNNFTFactory = await hre.ethers.getContractFactory("CSPNNFTFactory");
  const cspnNFTFactory = await CSPNNFTFactory.deploy();

  await cspnNFTFactory.deployed();

  console.log("CSPN NFTFactory deployed to:", cspnNFTFactory.address);

  const signers = await ethers.getSigners();
  const platformFee = BigNumber.from(10); // 10%
  const feeRecipient = signers[0].address;

  const CSPNMarketplace = await hre.ethers.getContractFactory(
    "CSPNNFTMarketplace"
  );
  const cspnMarketplace = await CSPNMarketplace.deploy(
    platformFee,
    feeRecipient,
    cspnNFTFactory.address
  );

  await cspnMarketplace.deployed();

  console.log("CSPN NFTMarketplace deployed to:", cspnMarketplace.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
