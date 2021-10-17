import { ethers } from "hardhat";
import { Signer, constants } from "ethers";
import chai from "chai";
import { deployContract, solidity } from "ethereum-waffle";
import { BlockHubGovernanceToken } from "../../typechain/BlockHubGovernanceToken";
import BlockHubGovernanceTokenArtifact from "../../artifacts/contracts/BlockHubGovernanceToken.sol/BlockHubGovernanceToken.json";

chai.use(solidity);
const { expect } = chai;
const DECIMALS = 18;

// For debug only: const log = console.log;

describe("BlockHubGovernanceToken", () => {
  let blockHubGovernanceToken: BlockHubGovernanceToken;
  let blockHubGovernanceToken_: BlockHubGovernanceToken;

  let signers: Signer[];

  const initialSupply = ethers.utils.parseUnits("0", DECIMALS);

  before(async () => {
    signers = await ethers.getSigners();

    blockHubGovernanceToken = (await deployContract(
      signers[0],
      BlockHubGovernanceTokenArtifact,
      ["BlockHubDAO", "BHDAO", 18]
    )) as BlockHubGovernanceToken;
    blockHubGovernanceToken_ = blockHubGovernanceToken.connect(signers[1]);
  });

  describe("Deployment", () => {
    it("should deploy the BlockHubDAO token with a proper contract address", async () => {
      expect(blockHubGovernanceToken.address).to.properAddress;
      expect(await blockHubGovernanceToken.symbol()).to.eq("BHDAO");
      expect(await blockHubGovernanceToken.name()).to.eq("BlockHubDAO");
    });

    it("should mint the initial supply during deployment", async () => {
      expect(await blockHubGovernanceToken.totalSupply()).to.eq(initialSupply);
    });
  });

  describe("Snapshot methods", () => {
    it("should not allow user to query snapshotted balance if no snapshot were made", async () => {
      await expect(
        blockHubGovernanceToken.balanceOfAt(await signers[0].getAddress(), 0)
      ).to.be.revertedWith("ERC20Snapshot: id is 0");
    });
    it("should not allow user to query snapshotted balance if snapshotID does not exist", async () => {
      await expect(
        blockHubGovernanceToken.balanceOfAt(await signers[0].getAddress(), 100)
      ).to.be.revertedWith("ERC20Snapshot: nonexistent id");
    });
    it("should allow admin to take snapshot", async () => {
      await blockHubGovernanceToken.snapshot();
      expect(await blockHubGovernanceToken.currentSnapshotId()).to.eq(1);
    });
  });

  describe("minting methods", () => {
    it("should not allow minting if user is not allowed", async () => {
      await expect(
        blockHubGovernanceToken_.mintNewVotingTokens(
          await signers[1].getAddress(),
          ethers.utils.parseUnits("10000", DECIMALS)
        )
      ).to.be.revertedWith("Auth: Caller is not allowed");
    });
    it("should only allow super-admin for minting", async () => {
      expect(
        await blockHubGovernanceToken.balanceOf(await signers[2].getAddress())
      ).to.be.eq(0);
      await blockHubGovernanceToken.mintNewVotingTokens(
        await signers[2].getAddress(),
        ethers.utils.parseUnits("10000", DECIMALS)
      );
      expect(
        await blockHubGovernanceToken.balanceOf(await signers[2].getAddress())
      ).to.be.eq(ethers.utils.parseUnits("10000", DECIMALS));
    });
  });
});
