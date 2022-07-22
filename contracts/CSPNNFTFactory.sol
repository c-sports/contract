// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./CSPNNFT.sol";

/* CSPN NFT Factory
    Create new CSPN NFT collection
*/
contract CSPNNFTFactory is Ownable {
    // owner address => nft list
    mapping(address => address[]) private nfts;

    mapping(address => bool) private cspnNFT;

    mapping(address => bool) private whiteList;

    event CreatedNFTCollection(
        address creator,
        address nft,
        string name,
        string symbol
    );

    function createNFTCollection(
        string memory _name,
        string memory _symbol,
        uint256 _royaltyFee,
        address _royaltyRecipient
    ) external onlyOwner {
        CSPNNFT nft = new CSPNNFT(
            _name,
            _symbol,
            msg.sender,
            _royaltyFee,
            _royaltyRecipient
        );
        nfts[msg.sender].push(address(nft));
        cspnNFT[address(nft)] = true;
        emit CreatedNFTCollection(msg.sender, address(nft), _name, _symbol);
    }

    function getOwnCollections() external view returns (address[] memory) {
        return nfts[msg.sender];
    }

    function isCSPNNFT(address _nft) external view returns (bool) {
        return cspnNFT[_nft];
    }
}
