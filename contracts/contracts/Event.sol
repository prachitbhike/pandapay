// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./TicketNFT.sol";

/**
 * @title Event
 * @notice Event contract with bonding curve pricing for ticket sales
 * @dev Supports linear and exponential bonding curves
 */
contract Event is ReentrancyGuard {
    // Curve types
    enum CurveType {
        LINEAR,
        EXPONENTIAL
    }

    // Event states
    enum EventState {
        UPCOMING,
        ONGOING,
        COMPLETED,
        CANCELLED
    }

    // Event metadata
    string public name;
    string public description;
    string public venue;
    uint256 public eventDate;
    string public imageUrl;

    // Ticket configuration
    uint256 public maxSupply;
    uint256 public ticketsSold;
    bool public transfersEnabled;

    // Bonding curve parameters
    CurveType public curveType;
    uint256 public basePrice;
    uint256 public curveParameter; // slope for linear, rate (in basis points) for exponential

    // Ownership and state
    address public manager;
    address public factory;
    EventState public state;

    // NFT contract
    TicketNFT public ticketNFT;

    // Revenue tracking
    uint256 public totalRevenue;
    mapping(address => uint256[]) public ticketsByBuyer;

    // Events
    event TicketPurchased(
        address indexed buyer,
        uint256 indexed ticketNumber,
        uint256 indexed tokenId,
        uint256 price
    );
    event FundsWithdrawn(address indexed manager, uint256 amount);
    event EventStateChanged(EventState newState);
    event TransfersToggled(bool enabled);

    modifier onlyManager() {
        require(msg.sender == manager, "Only manager");
        _;
    }

    modifier eventActive() {
        require(state == EventState.UPCOMING || state == EventState.ONGOING, "Event not active");
        _;
    }

    constructor(
        string memory _name,
        string memory _description,
        string memory _venue,
        uint256 _eventDate,
        string memory _imageUrl,
        uint256 _maxSupply,
        uint256 _basePrice,
        CurveType _curveType,
        uint256 _curveParameter,
        bool _transfersEnabled,
        address _manager,
        address _ticketNFT
    ) {
        name = _name;
        description = _description;
        venue = _venue;
        eventDate = _eventDate;
        imageUrl = _imageUrl;
        maxSupply = _maxSupply;
        basePrice = _basePrice;
        curveType = _curveType;
        curveParameter = _curveParameter;
        transfersEnabled = _transfersEnabled;
        manager = _manager;
        factory = msg.sender;
        ticketNFT = TicketNFT(_ticketNFT);
        state = EventState.UPCOMING;
    }

    /**
     * @notice Calculate the price for a ticket at a given supply
     * @param supply The supply at which to calculate the price
     * @return The price in wei
     */
    function getPriceAtSupply(uint256 supply) public view returns (uint256) {
        if (curveType == CurveType.LINEAR) {
            // Linear: price = basePrice + (slope * supply)
            // curveParameter is the slope in wei
            return basePrice + (curveParameter * supply);
        } else {
            // Exponential: price = basePrice * (1 + rate/10000)^supply
            // curveParameter is the rate in basis points (e.g., 500 = 5%)
            // Using integer math approximation for gas efficiency
            uint256 price = basePrice;
            uint256 rate = curveParameter;

            for (uint256 i = 0; i < supply && i < 100; i++) {
                // Cap iterations for gas
                price = (price * (10000 + rate)) / 10000;
            }

            // For supplies > 100, use simplified calculation
            if (supply > 100) {
                uint256 remaining = supply - 100;
                // Approximate with larger jumps
                for (uint256 i = 0; i < remaining / 10; i++) {
                    price = (price * (10000 + rate * 10)) / 10000;
                }
                for (uint256 i = 0; i < remaining % 10; i++) {
                    price = (price * (10000 + rate)) / 10000;
                }
            }

            return price;
        }
    }

    /**
     * @notice Get the current ticket price
     * @return The current price in wei
     */
    function getCurrentPrice() external view returns (uint256) {
        return getPriceAtSupply(ticketsSold);
    }

    /**
     * @notice Get prices for multiple supply points (for curve visualization)
     * @param startSupply The starting supply
     * @param count The number of points to return
     * @return prices Array of prices
     */
    function getPriceRange(uint256 startSupply, uint256 count) external view returns (uint256[] memory) {
        uint256[] memory prices = new uint256[](count);
        uint256 maxCount = startSupply + count > maxSupply ? maxSupply - startSupply : count;

        for (uint256 i = 0; i < maxCount; i++) {
            prices[i] = getPriceAtSupply(startSupply + i);
        }

        return prices;
    }

    /**
     * @notice Buy a ticket
     * @dev Price is determined by bonding curve at current supply
     */
    function buyTicket() external payable nonReentrant eventActive returns (uint256) {
        require(ticketsSold < maxSupply, "Sold out");

        uint256 price = getPriceAtSupply(ticketsSold);
        require(msg.value >= price, "Insufficient payment");

        uint256 ticketNumber = ticketsSold + 1;
        ticketsSold++;
        totalRevenue += price;

        // Mint NFT ticket
        uint256 tokenId = ticketNFT.mint(
            msg.sender,
            name,
            eventDate,
            venue,
            price,
            ticketNumber
        );

        ticketsByBuyer[msg.sender].push(tokenId);

        // Refund excess payment
        if (msg.value > price) {
            (bool refunded, ) = msg.sender.call{value: msg.value - price}("");
            require(refunded, "Refund failed");
        }

        emit TicketPurchased(msg.sender, ticketNumber, tokenId, price);

        return tokenId;
    }

    /**
     * @notice Buy multiple tickets
     * @param count Number of tickets to buy
     */
    function buyTickets(uint256 count) external payable nonReentrant eventActive returns (uint256[] memory) {
        require(count > 0 && count <= 10, "Invalid count");
        require(ticketsSold + count <= maxSupply, "Not enough tickets");

        uint256 totalCost = 0;
        uint256[] memory tokenIds = new uint256[](count);

        // Calculate total cost
        for (uint256 i = 0; i < count; i++) {
            totalCost += getPriceAtSupply(ticketsSold + i);
        }

        require(msg.value >= totalCost, "Insufficient payment");

        // Mint tickets
        for (uint256 i = 0; i < count; i++) {
            uint256 price = getPriceAtSupply(ticketsSold);
            uint256 ticketNumber = ticketsSold + 1;
            ticketsSold++;
            totalRevenue += price;

            uint256 tokenId = ticketNFT.mint(
                msg.sender,
                name,
                eventDate,
                venue,
                price,
                ticketNumber
            );

            tokenIds[i] = tokenId;
            ticketsByBuyer[msg.sender].push(tokenId);

            emit TicketPurchased(msg.sender, ticketNumber, tokenId, price);
        }

        // Refund excess payment
        if (msg.value > totalCost) {
            (bool refunded, ) = msg.sender.call{value: msg.value - totalCost}("");
            require(refunded, "Refund failed");
        }

        return tokenIds;
    }

    /**
     * @notice Calculate cost to buy multiple tickets
     * @param count Number of tickets
     * @return Total cost in wei
     */
    function getBulkPrice(uint256 count) external view returns (uint256) {
        require(ticketsSold + count <= maxSupply, "Not enough tickets");

        uint256 totalCost = 0;
        for (uint256 i = 0; i < count; i++) {
            totalCost += getPriceAtSupply(ticketsSold + i);
        }
        return totalCost;
    }

    /**
     * @notice Withdraw collected funds
     */
    function withdraw() external onlyManager nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool success, ) = manager.call{value: balance}("");
        require(success, "Withdrawal failed");

        emit FundsWithdrawn(manager, balance);
    }

    /**
     * @notice Update event state
     * @param newState The new state
     */
    function setEventState(EventState newState) external onlyManager {
        state = newState;
        emit EventStateChanged(newState);
    }

    /**
     * @notice Toggle ticket transfers
     * @param enabled Whether transfers are enabled
     */
    function setTransfersEnabled(bool enabled) external onlyManager {
        transfersEnabled = enabled;
        emit TransfersToggled(enabled);
    }

    /**
     * @notice Get event info for frontend
     */
    function getEventInfo()
        external
        view
        returns (
            string memory _name,
            string memory _description,
            string memory _venue,
            uint256 _eventDate,
            string memory _imageUrl,
            uint256 _maxSupply,
            uint256 _ticketsSold,
            uint256 _currentPrice,
            uint256 _basePrice,
            CurveType _curveType,
            uint256 _curveParameter,
            EventState _state,
            address _manager,
            uint256 _totalRevenue
        )
    {
        return (
            name,
            description,
            venue,
            eventDate,
            imageUrl,
            maxSupply,
            ticketsSold,
            getPriceAtSupply(ticketsSold),
            basePrice,
            curveType,
            curveParameter,
            state,
            manager,
            totalRevenue
        );
    }

    /**
     * @notice Get tickets purchased by an address
     */
    function getTicketsByBuyer(address buyer) external view returns (uint256[] memory) {
        return ticketsByBuyer[buyer];
    }

    /**
     * @notice Check if an address owns a ticket for this event
     */
    function hasTicket(address holder) external view returns (bool) {
        return ticketsByBuyer[holder].length > 0;
    }

    /**
     * @notice Get remaining ticket count
     */
    function remainingTickets() external view returns (uint256) {
        return maxSupply - ticketsSold;
    }

    receive() external payable {}
}
