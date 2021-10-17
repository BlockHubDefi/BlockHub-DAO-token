import { ethers } from "hardhat";
import { Signer } from "ethers";

const log = console.log;

async function main() {
  let signers: Signer[];
  signers = await ethers.getSigners();

  const BlockHubGovernanceTokenFactory = await ethers.getContractFactory(
    "BlockHubGovernanceToken"
  );
  let blockHubGovernanceToken = await BlockHubGovernanceTokenFactory.deploy(
    "BlockHubDAO",
    "BHDAO",
    18
  );
  log(
    `BlockHubGovernanceToken deployment transaction hash: ${blockHubGovernanceToken.deployTransaction.hash}`
  );
  await blockHubGovernanceToken.deployed();
  log(
    `BlockHubGovernanceToken deployed address: ${blockHubGovernanceToken.address}`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
