import { ethers } from "hardhat";

async function main() {
  console.log("Deploying PaymentEscrow contract...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Deploy PaymentEscrow
  const PaymentEscrow = await ethers.getContractFactory("PaymentEscrow");
  const escrow = await PaymentEscrow.deploy();
  await escrow.waitForDeployment();

  const escrowAddress = await escrow.getAddress();
  console.log("\n✅ PaymentEscrow deployed to:", escrowAddress);

  // Print deployment info
  console.log("\n📝 Deployment Summary:");
  console.log("=====================================");
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  console.log("Chain ID:", (await ethers.provider.getNetwork()).chainId);
  console.log("Contract Address:", escrowAddress);
  console.log("Owner:", await escrow.owner());
  console.log("Escrow Period:", await escrow.ESCROW_PERIOD(), "seconds (7 days)");
  console.log("=====================================");

  // Save deployment info
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    contractAddress: escrowAddress,
    owner: await escrow.owner(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  console.log("\n📄 Deployment Info (copy for frontend):");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Verification instructions
  if ((await ethers.provider.getNetwork()).chainId !== 31337n) {
    console.log("\n🔍 To verify on block explorer, run:");
    console.log(`npx hardhat verify --network ${(await ethers.provider.getNetwork()).name} ${escrowAddress}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
