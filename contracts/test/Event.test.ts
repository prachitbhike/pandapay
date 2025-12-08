import { expect } from "chai";
import { ethers } from "hardhat";
import { EventFactory, Event, TicketNFT } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("Panda Event Ticketing", function () {
  let factory: EventFactory;
  let ticketNFT: TicketNFT;
  let owner: SignerWithAddress;
  let manager: SignerWithAddress;
  let buyer1: SignerWithAddress;
  let buyer2: SignerWithAddress;

  // Event parameters
  const eventName = "ETH Denver 2025";
  const eventDescription = "The premier Ethereum conference";
  const eventVenue = "Denver Convention Center";
  const eventImageUrl = "https://example.com/image.jpg";
  const maxSupply = 100;
  const basePrice = ethers.parseEther("0.01"); // 0.01 ETH

  beforeEach(async function () {
    [owner, manager, buyer1, buyer2] = await ethers.getSigners();

    const EventFactory = await ethers.getContractFactory("EventFactory");
    factory = await EventFactory.deploy();
    await factory.waitForDeployment();

    // Get the TicketNFT address
    const ticketNFTAddress = await factory.getTicketNFT();
    ticketNFT = await ethers.getContractAt("TicketNFT", ticketNFTAddress);
  });

  describe("EventFactory", function () {
    it("should deploy with correct initial state", async function () {
      expect(await factory.getEventCount()).to.equal(0);
      expect(await factory.protocolFeeBps()).to.equal(250);
    });

    it("should create a new event with linear curve", async function () {
      const futureDate = (await time.latest()) + 86400 * 30; // 30 days from now
      const slope = ethers.parseEther("0.001"); // 0.001 ETH per ticket

      const tx = await factory.connect(manager).createEvent(
        eventName,
        eventDescription,
        eventVenue,
        futureDate,
        eventImageUrl,
        maxSupply,
        basePrice,
        0, // LINEAR
        slope,
        true
      );

      const receipt = await tx.wait();
      expect(await factory.getEventCount()).to.equal(1);

      const events = await factory.getAllEvents();
      expect(events.length).to.equal(1);
    });

    it("should create a new event with exponential curve", async function () {
      const futureDate = (await time.latest()) + 86400 * 30;
      const rate = 500; // 5% increase per ticket

      await factory.connect(manager).createEvent(
        eventName,
        eventDescription,
        eventVenue,
        futureDate,
        eventImageUrl,
        maxSupply,
        basePrice,
        1, // EXPONENTIAL
        rate,
        true
      );

      expect(await factory.getEventCount()).to.equal(1);
    });

    it("should reject event with past date", async function () {
      const pastDate = (await time.latest()) - 86400;

      await expect(
        factory.connect(manager).createEvent(
          eventName,
          eventDescription,
          eventVenue,
          pastDate,
          eventImageUrl,
          maxSupply,
          basePrice,
          0,
          ethers.parseEther("0.001"),
          true
        )
      ).to.be.revertedWith("Event must be in future");
    });

    it("should track events by manager", async function () {
      const futureDate = (await time.latest()) + 86400 * 30;

      await factory.connect(manager).createEvent(
        "Event 1",
        eventDescription,
        eventVenue,
        futureDate,
        eventImageUrl,
        maxSupply,
        basePrice,
        0,
        ethers.parseEther("0.001"),
        true
      );

      await factory.connect(manager).createEvent(
        "Event 2",
        eventDescription,
        eventVenue,
        futureDate,
        eventImageUrl,
        maxSupply,
        basePrice,
        0,
        ethers.parseEther("0.001"),
        true
      );

      const managerEvents = await factory.getEventsByManager(manager.address);
      expect(managerEvents.length).to.equal(2);
    });
  });

  describe("Linear Bonding Curve", function () {
    let event: Event;
    const slope = ethers.parseEther("0.001"); // 0.001 ETH increase per ticket

    beforeEach(async function () {
      const futureDate = (await time.latest()) + 86400 * 30;

      await factory.connect(manager).createEvent(
        eventName,
        eventDescription,
        eventVenue,
        futureDate,
        eventImageUrl,
        maxSupply,
        basePrice,
        0, // LINEAR
        slope,
        true
      );

      const events = await factory.getAllEvents();
      event = await ethers.getContractAt("Event", events[0]);
    });

    it("should return correct initial price", async function () {
      const price = await event.getCurrentPrice();
      expect(price).to.equal(basePrice);
    });

    it("should calculate correct price at different supply levels", async function () {
      // Price at supply 0: basePrice
      expect(await event.getPriceAtSupply(0)).to.equal(basePrice);

      // Price at supply 10: basePrice + (slope * 10)
      const priceAt10 = basePrice + slope * 10n;
      expect(await event.getPriceAtSupply(10)).to.equal(priceAt10);

      // Price at supply 50: basePrice + (slope * 50)
      const priceAt50 = basePrice + slope * 50n;
      expect(await event.getPriceAtSupply(50)).to.equal(priceAt50);
    });

    it("should increase price after each purchase", async function () {
      const price1 = await event.getCurrentPrice();

      await event.connect(buyer1).buyTicket({ value: price1 });

      const price2 = await event.getCurrentPrice();
      expect(price2).to.equal(price1 + slope);

      await event.connect(buyer1).buyTicket({ value: price2 });

      const price3 = await event.getCurrentPrice();
      expect(price3).to.equal(price2 + slope);
    });

    it("should mint NFT ticket on purchase", async function () {
      const price = await event.getCurrentPrice();

      await event.connect(buyer1).buyTicket({ value: price });

      expect(await ticketNFT.balanceOf(buyer1.address)).to.equal(1);

      const tokenId = await ticketNFT.tokenOfOwnerByIndex(buyer1.address, 0);
      const ticketData = await ticketNFT.getTicketData(tokenId);

      expect(ticketData.eventName).to.equal(eventName);
      expect(ticketData.purchasePrice).to.equal(price);
      expect(ticketData.ticketNumber).to.equal(1);
    });

    it("should refund excess payment", async function () {
      const price = await event.getCurrentPrice();
      const overpayment = ethers.parseEther("0.1");

      const balanceBefore = await ethers.provider.getBalance(buyer1.address);

      const tx = await event.connect(buyer1).buyTicket({ value: price + overpayment });
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

      const balanceAfter = await ethers.provider.getBalance(buyer1.address);

      // Should have paid only the ticket price plus gas
      expect(balanceBefore - balanceAfter).to.be.closeTo(price + gasUsed, ethers.parseEther("0.0001"));
    });

    it("should reject insufficient payment", async function () {
      const price = await event.getCurrentPrice();

      await expect(
        event.connect(buyer1).buyTicket({ value: price - 1n })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("should track tickets sold correctly", async function () {
      const price1 = await event.getCurrentPrice();
      await event.connect(buyer1).buyTicket({ value: price1 });

      const price2 = await event.getCurrentPrice();
      await event.connect(buyer2).buyTicket({ value: price2 });

      expect(await event.ticketsSold()).to.equal(2);
      expect(await event.remainingTickets()).to.equal(maxSupply - 2);
    });
  });

  describe("Exponential Bonding Curve", function () {
    let event: Event;
    const rate = 500; // 5% increase per ticket

    beforeEach(async function () {
      const futureDate = (await time.latest()) + 86400 * 30;

      await factory.connect(manager).createEvent(
        eventName,
        eventDescription,
        eventVenue,
        futureDate,
        eventImageUrl,
        maxSupply,
        basePrice,
        1, // EXPONENTIAL
        rate,
        true
      );

      const events = await factory.getAllEvents();
      event = await ethers.getContractAt("Event", events[0]);
    });

    it("should return correct initial price", async function () {
      const price = await event.getCurrentPrice();
      expect(price).to.equal(basePrice);
    });

    it("should calculate exponential price increase", async function () {
      // Price at supply 0: basePrice
      expect(await event.getPriceAtSupply(0)).to.equal(basePrice);

      // Price at supply 1: basePrice * 1.05
      const priceAt1 = await event.getPriceAtSupply(1);
      const expectedAt1 = (basePrice * 10500n) / 10000n;
      expect(priceAt1).to.equal(expectedAt1);

      // Price at supply 2: basePrice * 1.05^2
      const priceAt2 = await event.getPriceAtSupply(2);
      const expectedAt2 = (expectedAt1 * 10500n) / 10000n;
      expect(priceAt2).to.equal(expectedAt2);
    });

    it("should show significant price increase over many tickets", async function () {
      const priceAt0 = await event.getPriceAtSupply(0);
      const priceAt50 = await event.getPriceAtSupply(50);

      // With 5% increase per ticket, price at 50 should be much higher
      // 1.05^50 ≈ 11.47, so price should be ~11.47x base
      expect(priceAt50).to.be.gt(priceAt0 * 10n);
    });
  });

  describe("Bulk Purchases", function () {
    let event: Event;
    const slope = ethers.parseEther("0.001");

    beforeEach(async function () {
      const futureDate = (await time.latest()) + 86400 * 30;

      await factory.connect(manager).createEvent(
        eventName,
        eventDescription,
        eventVenue,
        futureDate,
        eventImageUrl,
        maxSupply,
        basePrice,
        0,
        slope,
        true
      );

      const events = await factory.getAllEvents();
      event = await ethers.getContractAt("Event", events[0]);
    });

    it("should calculate bulk price correctly", async function () {
      // Buying 3 tickets should cost sum of prices at 0, 1, 2
      const price0 = await event.getPriceAtSupply(0);
      const price1 = await event.getPriceAtSupply(1);
      const price2 = await event.getPriceAtSupply(2);

      const expectedBulkPrice = price0 + price1 + price2;
      const actualBulkPrice = await event.getBulkPrice(3);

      expect(actualBulkPrice).to.equal(expectedBulkPrice);
    });

    it("should buy multiple tickets in one transaction", async function () {
      const bulkPrice = await event.getBulkPrice(3);

      await event.connect(buyer1).buyTickets(3, { value: bulkPrice });

      expect(await ticketNFT.balanceOf(buyer1.address)).to.equal(3);
      expect(await event.ticketsSold()).to.equal(3);
    });

    it("should reject buying more than 10 tickets at once", async function () {
      const bulkPrice = await event.getBulkPrice(10);

      await expect(
        event.connect(buyer1).buyTickets(11, { value: bulkPrice * 2n })
      ).to.be.revertedWith("Invalid count");
    });
  });

  describe("Event Management", function () {
    let event: Event;

    beforeEach(async function () {
      const futureDate = (await time.latest()) + 86400 * 30;

      await factory.connect(manager).createEvent(
        eventName,
        eventDescription,
        eventVenue,
        futureDate,
        eventImageUrl,
        maxSupply,
        basePrice,
        0,
        ethers.parseEther("0.001"),
        true
      );

      const events = await factory.getAllEvents();
      event = await ethers.getContractAt("Event", events[0]);
    });

    it("should allow manager to withdraw funds", async function () {
      const price = await event.getCurrentPrice();
      await event.connect(buyer1).buyTicket({ value: price });

      const balanceBefore = await ethers.provider.getBalance(manager.address);

      const tx = await event.connect(manager).withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

      const balanceAfter = await ethers.provider.getBalance(manager.address);

      expect(balanceAfter - balanceBefore).to.equal(price - gasUsed);
    });

    it("should reject withdraw from non-manager", async function () {
      const price = await event.getCurrentPrice();
      await event.connect(buyer1).buyTicket({ value: price });

      await expect(
        event.connect(buyer1).withdraw()
      ).to.be.revertedWith("Only manager");
    });

    it("should allow manager to change event state", async function () {
      await event.connect(manager).setEventState(1); // ONGOING
      expect(await event.state()).to.equal(1);

      await event.connect(manager).setEventState(2); // COMPLETED
      expect(await event.state()).to.equal(2);
    });

    it("should prevent purchases when event is completed", async function () {
      await event.connect(manager).setEventState(2); // COMPLETED

      const price = await event.getCurrentPrice();
      await expect(
        event.connect(buyer1).buyTicket({ value: price })
      ).to.be.revertedWith("Event not active");
    });

    it("should return complete event info", async function () {
      const info = await event.getEventInfo();

      expect(info._name).to.equal(eventName);
      expect(info._description).to.equal(eventDescription);
      expect(info._venue).to.equal(eventVenue);
      expect(info._maxSupply).to.equal(maxSupply);
      expect(info._ticketsSold).to.equal(0);
    });
  });

  describe("TicketNFT", function () {
    let event: Event;

    beforeEach(async function () {
      const futureDate = (await time.latest()) + 86400 * 30;

      await factory.connect(manager).createEvent(
        eventName,
        eventDescription,
        eventVenue,
        futureDate,
        eventImageUrl,
        maxSupply,
        basePrice,
        0,
        ethers.parseEther("0.001"),
        true
      );

      const events = await factory.getAllEvents();
      event = await ethers.getContractAt("Event", events[0]);

      const price = await event.getCurrentPrice();
      await event.connect(buyer1).buyTicket({ value: price });
    });

    it("should return valid tokenURI with metadata", async function () {
      const tokenId = 0;
      const uri = await ticketNFT.tokenURI(tokenId);

      expect(uri).to.match(/^data:application\/json;base64,/);

      // Decode and verify metadata
      const base64Data = uri.replace("data:application/json;base64,", "");
      const jsonString = Buffer.from(base64Data, "base64").toString("utf-8");
      const metadata = JSON.parse(jsonString);

      expect(metadata.name).to.include(eventName);
      expect(metadata.attributes).to.be.an("array");
    });

    it("should return tickets owned by address", async function () {
      // Buy another ticket
      const price = await event.getCurrentPrice();
      await event.connect(buyer1).buyTicket({ value: price });

      const tickets = await ticketNFT.getTicketsByOwner(buyer1.address);
      expect(tickets.length).to.equal(2);
    });

    it("should track ticket data correctly", async function () {
      const tokenId = 0;
      const ticketData = await ticketNFT.getTicketData(tokenId);

      expect(ticketData.eventContract).to.equal(await event.getAddress());
      expect(ticketData.eventName).to.equal(eventName);
      expect(ticketData.ticketNumber).to.equal(1);
    });
  });

  describe("Sold Out Scenario", function () {
    let event: Event;

    beforeEach(async function () {
      const futureDate = (await time.latest()) + 86400 * 30;

      // Create event with only 3 tickets
      await factory.connect(manager).createEvent(
        eventName,
        eventDescription,
        eventVenue,
        futureDate,
        eventImageUrl,
        3, // Only 3 tickets
        basePrice,
        0,
        ethers.parseEther("0.001"),
        true
      );

      const events = await factory.getAllEvents();
      event = await ethers.getContractAt("Event", events[0]);
    });

    it("should sell out correctly", async function () {
      for (let i = 0; i < 3; i++) {
        const price = await event.getCurrentPrice();
        await event.connect(buyer1).buyTicket({ value: price });
      }

      expect(await event.ticketsSold()).to.equal(3);
      expect(await event.remainingTickets()).to.equal(0);
    });

    it("should reject purchase when sold out", async function () {
      for (let i = 0; i < 3; i++) {
        const price = await event.getCurrentPrice();
        await event.connect(buyer1).buyTicket({ value: price });
      }

      const price = await event.getCurrentPrice();
      await expect(
        event.connect(buyer2).buyTicket({ value: price })
      ).to.be.revertedWith("Sold out");
    });
  });
});
