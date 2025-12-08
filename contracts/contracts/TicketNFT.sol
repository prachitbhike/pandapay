// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title TicketNFT
 * @notice ERC-721 NFT representing event tickets
 * @dev Minted by Event contracts, includes on-chain metadata
 */
contract TicketNFT is ERC721Enumerable, Ownable {
    using Strings for uint256;
    using Strings for address;

    struct TicketData {
        address eventContract;
        string eventName;
        uint256 eventDate;
        string venue;
        uint256 purchasePrice;
        uint256 purchaseTimestamp;
        uint256 ticketNumber;
    }

    // Mapping from token ID to ticket data
    mapping(uint256 => TicketData) public tickets;

    // Counter for token IDs
    uint256 private _tokenIdCounter;

    // Authorized minters (Event contracts)
    mapping(address => bool) public authorizedMinters;

    event TicketMinted(
        uint256 indexed tokenId,
        address indexed owner,
        address indexed eventContract,
        uint256 purchasePrice,
        uint256 ticketNumber
    );

    event MinterAuthorized(address indexed minter);
    event MinterRevoked(address indexed minter);

    constructor() ERC721("Panda Event Ticket", "PANDA") Ownable(msg.sender) {}

    /**
     * @notice Authorize an Event contract to mint tickets
     * @param minter The address to authorize
     */
    function authorizeMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = true;
        emit MinterAuthorized(minter);
    }

    /**
     * @notice Revoke minting authorization
     * @param minter The address to revoke
     */
    function revokeMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = false;
        emit MinterRevoked(minter);
    }

    /**
     * @notice Mint a new ticket NFT
     * @param to The address to mint to
     * @param eventName The name of the event
     * @param eventDate The date of the event (Unix timestamp)
     * @param venue The venue name
     * @param purchasePrice The price paid for the ticket
     * @param ticketNumber The ticket number for this event
     * @return tokenId The ID of the minted token
     */
    function mint(
        address to,
        string memory eventName,
        uint256 eventDate,
        string memory venue,
        uint256 purchasePrice,
        uint256 ticketNumber
    ) external returns (uint256) {
        require(authorizedMinters[msg.sender], "Not authorized to mint");

        uint256 tokenId = _tokenIdCounter++;

        tickets[tokenId] = TicketData({
            eventContract: msg.sender,
            eventName: eventName,
            eventDate: eventDate,
            venue: venue,
            purchasePrice: purchasePrice,
            purchaseTimestamp: block.timestamp,
            ticketNumber: ticketNumber
        });

        _safeMint(to, tokenId);

        emit TicketMinted(tokenId, to, msg.sender, purchasePrice, ticketNumber);

        return tokenId;
    }

    /**
     * @notice Get ticket data for a token
     * @param tokenId The token ID
     * @return The ticket data
     */
    function getTicketData(uint256 tokenId) external view returns (TicketData memory) {
        require(tokenId < _tokenIdCounter, "Token does not exist");
        return tickets[tokenId];
    }

    /**
     * @notice Generate the token URI with on-chain metadata
     * @param tokenId The token ID
     * @return The token URI as a data URI
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(tokenId < _tokenIdCounter, "Token does not exist");

        TicketData memory ticket = tickets[tokenId];

        string memory status = block.timestamp < ticket.eventDate ? "upcoming" : "memory";

        string memory json = string(
            abi.encodePacked(
                '{"name":"',
                ticket.eventName,
                ' #',
                ticket.ticketNumber.toString(),
                '","description":"Event ticket for ',
                ticket.eventName,
                ' at ',
                ticket.venue,
                '","attributes":[',
                '{"trait_type":"Event","value":"',
                ticket.eventName,
                '"},',
                '{"trait_type":"Venue","value":"',
                ticket.venue,
                '"},',
                '{"trait_type":"Ticket Number","value":',
                ticket.ticketNumber.toString(),
                '},',
                '{"trait_type":"Purchase Price (ETH)","value":"',
                _formatEther(ticket.purchasePrice),
                '"},',
                '{"trait_type":"Status","value":"',
                status,
                '"},',
                '{"trait_type":"Event Contract","value":"',
                Strings.toHexString(ticket.eventContract),
                '"}',
                '],"image":"',
                _generateSVG(ticket),
                '"}'
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(json))));
    }

    /**
     * @notice Generate SVG image for the ticket
     */
    function _generateSVG(TicketData memory ticket) internal pure returns (string memory) {
        string memory svg = string(
            abi.encodePacked(
                '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250">',
                '<defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">',
                '<stop offset="0%" style="stop-color:#1a1a2e"/>',
                '<stop offset="100%" style="stop-color:#16213e"/>',
                '</linearGradient></defs>',
                '<rect width="400" height="250" fill="url(#bg)" rx="20"/>',
                '<text x="30" y="45" font-family="Arial" font-size="24" font-weight="bold" fill="#fff">',
                unicode'🐼 PANDA',
                '</text>',
                '<text x="30" y="90" font-family="Arial" font-size="18" fill="#fff">',
                ticket.eventName,
                '</text>',
                '<text x="30" y="120" font-family="Arial" font-size="14" fill="#888">',
                ticket.venue,
                '</text>',
                '<text x="30" y="180" font-family="Arial" font-size="48" font-weight="bold" fill="#00d9ff">',
                '#',
                ticket.ticketNumber.toString(),
                '</text>',
                '<text x="30" y="220" font-family="Arial" font-size="12" fill="#666">',
                _formatEther(ticket.purchasePrice),
                ' ETH',
                '</text>',
                '</svg>'
            )
        );

        return string(abi.encodePacked("data:image/svg+xml;base64,", Base64.encode(bytes(svg))));
    }

    /**
     * @notice Format wei to ETH string (simplified)
     */
    function _formatEther(uint256 weiAmount) internal pure returns (string memory) {
        uint256 eth = weiAmount / 1e18;
        uint256 decimals = (weiAmount % 1e18) / 1e14; // 4 decimal places

        if (decimals == 0) {
            return eth.toString();
        }

        // Pad decimals with leading zeros if needed
        string memory decimalStr = decimals.toString();
        bytes memory padded = new bytes(4);
        bytes memory decBytes = bytes(decimalStr);

        uint256 padding = 4 - decBytes.length;
        for (uint256 i = 0; i < 4; i++) {
            if (i < padding) {
                padded[i] = "0";
            } else {
                padded[i] = decBytes[i - padding];
            }
        }

        return string(abi.encodePacked(eth.toString(), ".", string(padded)));
    }

    /**
     * @notice Get all tickets owned by an address
     * @param owner The owner address
     * @return tokenIds Array of token IDs owned
     */
    function getTicketsByOwner(address owner) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](balance);

        for (uint256 i = 0; i < balance; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(owner, i);
        }

        return tokenIds;
    }
}
