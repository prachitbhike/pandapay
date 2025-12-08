import { ethers } from "hardhat";

async function main() {
  console.log("Deploying Panda Event Ticketing contracts...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy EventFactory (which deploys TicketNFT internally)
  console.log("Deploying EventFactory...");
  const EventFactory = await ethers.getContractFactory("EventFactory");
  const factory = await EventFactory.deploy();
  await factory.waitForDeployment();

  const factoryAddress = await factory.getAddress();
  console.log("EventFactory deployed to:", factoryAddress);

  // Get the TicketNFT address
  const ticketNFTAddress = await factory.getTicketNFT();
  console.log("TicketNFT deployed to:", ticketNFTAddress);

  console.log("\n--- Deployment Summary ---");
  console.log(`EventFactory: ${factoryAddress}`);
  console.log(`TicketNFT: ${ticketNFTAddress}`);

  // Create a sample event for testing
  console.log("\nCreating sample event...");

  const oneMonthFromNow = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
  const basePrice = ethers.parseEther("0.001"); // 0.001 ETH
  const slope = ethers.parseEther("0.0001"); // 0.0001 ETH increase per ticket

  const tx = await factory.createEvent(
    "Panda Launch Party",
    "Celebrate the launch of Panda ticketing platform",
    "The Venue, San Francisco",
    oneMonthFromNow,
    "https://example.com/panda-launch.jpg",
    100, // max supply
    basePrice,
    0, // LINEAR curve
    slope,
    true // transfers enabled
  );

  const receipt = await tx.wait();

  const events = await factory.getAllEvents();
  const sampleEventAddress = events[0];
  console.log("Sample event created at:", sampleEventAddress);

  // Output for frontend configuration
  console.log("\n--- Frontend Configuration ---");
  console.log("Add these to your .env.local file:\n");
  console.log(`NEXT_PUBLIC_FACTORY_ADDRESS=${factoryAddress}`);
  console.log(`NEXT_PUBLIC_TICKET_NFT_ADDRESS=${ticketNFTAddress}`);
  console.log(`NEXT_PUBLIC_CHAIN_ID=84532`); // Base Sepolia

  // Return addresses for programmatic use
  return {
    factory: factoryAddress,
    ticketNFT: ticketNFTAddress,
    sampleEvent: sampleEventAddress,
  };
}

main()
  .then((addresses) => {
    console.log("\nDeployment successful!");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
