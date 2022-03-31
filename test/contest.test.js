const { expect } = require("chai");
const { ethers } = require("hardhat");
const { MerkleTree } = require("./utils/merkle");
const { formatBytes32String } = require("ethers/lib/utils");

describe("Contest", function () {

  // Users
  let owner, user1, user2, user3, user4, user5;

  // Contracts
  let bnf, contest;

  // Arguments
  const name = formatBytes32String('test_room');
  const startAt = parseInt((new Date().getTime()) / 1000) + 600; // start after 10 minutes
  const duration = 300; // game duration is 5 minutes  
  const price = BigInt(100 * 10 ** 18).toString();
  const numTargets = 30; // number of carrots to appear in the game
  const capacity = 2; // number of people to play together
  const maxRegistrants = 4; // number of people can join

  // Constants
  const tokenBalance = BigInt(100000 * 10 ** 18).toString();

  // Variables
  let tree, leaves;
  
  before(async function() {
    [owner, user1, user2, user3, user4, user5] = await ethers.getSigners();

    const BNF = await ethers.getContractFactory("BNF");
    bnf =  await BNF.deploy();
    await bnf.deployed();

    // send tokens to users
    await bnf.transfer(user1.address, tokenBalance);
    await bnf.transfer(user2.address, tokenBalance);
    await bnf.transfer(user3.address, tokenBalance);
    await bnf.transfer(user4.address, tokenBalance);
    await bnf.transfer(user5.address, tokenBalance);

    const Contest = await ethers.getContractFactory("Contest");
    contest = await Contest.deploy();
    await contest.connect(owner).deployed();
    await (await contest.initialize(bnf.address, name, startAt, duration, price, numTargets, capacity, maxRegistrants)).wait();

    // Approve to spend $BNF
    await (await bnf.connect(user1).approve(contest.address, tokenBalance)).wait();
    await (await bnf.connect(user2).approve(contest.address, tokenBalance)).wait();
    await (await bnf.connect(user3).approve(contest.address, tokenBalance)).wait();
    await (await bnf.connect(user4).approve(contest.address, tokenBalance)).wait();
    await (await bnf.connect(user5).approve(contest.address, tokenBalance)).wait();
  });

  it("Should register", async function () {
    // Try register
    await expect(contest.connect(user1).register())
      .to.emit(contest, "Registered").withArgs(user1.address);

    await expect(contest.connect(user1).register())
      .to.be.revertedWith("Already registered");

    await (await contest.connect(user2).register()).wait();
    await (await contest.connect(user3).register()).wait();
    await (await contest.connect(user4).register()).wait();

    await expect(contest.connect(user5).register())
      .to.be.revertedWith("Already reached max registration");

    expect(await contest.numRegistrants()).to.equal(4);

    expect((await contest.registrants(user1.address)).roomId).to.equal((await contest.registrants(user2.address)).roomId);
    expect((await contest.registrants(user1.address)).roomId).to.not.equal((await contest.registrants(user3.address)).roomId);
    expect((await contest.registrants(user3.address)).roomId).to.equal((await contest.registrants(user4.address)).roomId);
  });

  it("Should reject end contest if caller is not owner", async function() {
    await expect(contest.connect(user1).end(
      formatBytes32String("fake-merkle-root"),
      "https://score_link"
    )).to.be.revertedWith("Ownable: caller is not the owner");    
  });

  it("Should end contest and update merkle root", async function () {
    leaves = [user1, user2].map(user => {
        return {
            account: user.address,
            amount: (BigInt(price) * BigInt(2)).toString(),
        }
    })

    // adding another 10 pseudo-randomly generated leaves
    for (let i = 0; i < 10; i++) {
        leaves.push({
            account: ethers.Wallet.createRandom().address,
            amount: "0",
        });
    }
    tree = new MerkleTree(leaves);

    await expect(contest.connect(owner).end(
      tree.root,
      "https://score_link"
    )).to.emit(contest, "Finished").withArgs(tree.root, "https://score_link");
  });

  it("Should reject with wrong amount", async function () {
    await expect(contest.connect(user1).claim(
      tree.getProof(leaves[0]),
      (BigInt(price) * BigInt(3)).toString()
    )).to.be.revertedWith("Claim verification failed");
  });

  it("Should be claimable", async function () {
    const balanceBefore = await bnf.balanceOf(user1.address);
    const claimAmount = (BigInt(price) * BigInt(2)).toString();

    await expect(contest.connect(user1).claim(
      tree.getProof(leaves[0]),
      claimAmount
    )).to.emit(contest, "Claimed").withArgs(user1.address, claimAmount);

    const balanceAfter = await bnf.balanceOf(user1.address);

    expect(BigInt(balanceAfter) - BigInt(balanceBefore)).to.equal(BigInt(claimAmount));
  });
});
