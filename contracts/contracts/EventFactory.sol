// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Event.sol";
import "./TicketNFT.sol";

/**
 * @title EventFactory
 * @notice Factory contract for deploying new Event contracts with bonding curve pricing
 */
contract EventFactory is Ownable {
    // The shared TicketNFT contract
    TicketNFT public ticketNFT;

    // Array of all deployed events
    address[] public events;

    // Mapping from manager to their events
    mapping(address => address[]) public eventsByManager;

    // Mapping to check if an address is a valid event
    mapping(address => bool) public isEvent;

    // Protocol fee (in basis points, e.g., 250 = 2.5%)
    uint256 public protocolFeeBps;

    // Events
    event EventCreated(
        address indexed eventAddress,
        address indexed manager,
        string name,
        uint256 eventDate,
        uint256 maxSupply,
        Event.CurveType curveType
    );
    event ProtocolFeeUpdated(uint256 newFeeBps);

    constructor() Ownable(msg.sender) {
        ticketNFT = new TicketNFT();
        protocolFeeBps = 250; // 2.5% default
    }

    /**
     * @notice Create a new event with bonding curve pricing
     * @param _name Event name
     * @param _description Event description
     * @param _venue Venue name
     * @param _eventDate Event date (Unix timestamp)
     * @param _imageUrl Event image URL
     * @param _maxSupply Maximum ticket supply
     * @param _basePrice Starting price in wei
     * @param _curveType LINEAR (0) or EXPONENTIAL (1)
     * @param _curveParameter Slope (linear) or rate in bps (exponential)
     * @param _transfersEnabled Whether tickets can be transferred
     */
    function createEvent(
        string memory _name,
        string memory _description,
        string memory _venue,
        uint256 _eventDate,
        string memory _imageUrl,
        uint256 _maxSupply,
        uint256 _basePrice,
        Event.CurveType _curveType,
        uint256 _curveParameter,
        bool _transfersEnabled
    ) external returns (address) {
        require(bytes(_name).length > 0, "Name required");
        require(_eventDate > block.timestamp, "Event must be in future");
        require(_maxSupply > 0, "Max supply must be > 0");
        require(_basePrice > 0, "Base price must be > 0");

        Event newEvent = new Event(
            _name,
            _description,
            _venue,
            _eventDate,
            _imageUrl,
            _maxSupply,
            _basePrice,
            _curveType,
            _curveParameter,
            _transfersEnabled,
            msg.sender,
            address(ticketNFT)
        );

        address eventAddress = address(newEvent);

        // Authorize the new event to mint tickets
        ticketNFT.authorizeMinter(eventAddress);

        // Track the event
        events.push(eventAddress);
        eventsByManager[msg.sender].push(eventAddress);
        isEvent[eventAddress] = true;

        emit EventCreated(
            eventAddress,
            msg.sender,
            _name,
            _eventDate,
            _maxSupply,
            _curveType
        );

        return eventAddress;
    }

    /**
     * @notice Get all events
     */
    function getAllEvents() external view returns (address[] memory) {
        return events;
    }

    /**
     * @notice Get total number of events
     */
    function getEventCount() external view returns (uint256) {
        return events.length;
    }

    /**
     * @notice Get events by manager
     */
    function getEventsByManager(address manager) external view returns (address[] memory) {
        return eventsByManager[manager];
    }

    /**
     * @notice Get paginated events (for large lists)
     * @param offset Starting index
     * @param limit Number of events to return
     */
    function getEventsPaginated(uint256 offset, uint256 limit)
        external
        view
        returns (address[] memory)
    {
        require(offset < events.length, "Offset out of bounds");

        uint256 end = offset + limit;
        if (end > events.length) {
            end = events.length;
        }

        address[] memory result = new address[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = events[i];
        }

        return result;
    }

    /**
     * @notice Get upcoming events (events that haven't happened yet)
     * @param limit Maximum number to return
     */
    function getUpcomingEvents(uint256 limit) external view returns (address[] memory) {
        // First, count upcoming events
        uint256 count = 0;
        for (uint256 i = 0; i < events.length && count < limit; i++) {
            Event evt = Event(payable(events[i]));
            if (evt.eventDate() > block.timestamp && evt.state() == Event.EventState.UPCOMING) {
                count++;
            }
        }

        // Then collect them
        address[] memory result = new address[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < events.length && index < count; i++) {
            Event evt = Event(payable(events[i]));
            if (evt.eventDate() > block.timestamp && evt.state() == Event.EventState.UPCOMING) {
                result[index++] = events[i];
            }
        }

        return result;
    }

    /**
     * @notice Update protocol fee
     * @param newFeeBps New fee in basis points
     */
    function setProtocolFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= 1000, "Fee too high"); // Max 10%
        protocolFeeBps = newFeeBps;
        emit ProtocolFeeUpdated(newFeeBps);
    }

    /**
     * @notice Get the TicketNFT contract address
     */
    function getTicketNFT() external view returns (address) {
        return address(ticketNFT);
    }
}
