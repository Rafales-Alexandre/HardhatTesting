// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "./ERC721.sol";

/**
 * @title SimpleNFT
 * @dev A simple implementation of the ERC-721 standard for non-fungible tokens (NFTs).
 */
contract SimpleNFT is ERC721 {
    /**
     * @dev Mapping from token ID to owner address.
     */
    mapping(uint256 => address) private owners;

    /**
     * @dev Mapping from owner address to token count.
     */
    mapping(address => uint256) private balances;

    /**
     * @dev Mapping from token ID to approved address.
     */
    mapping(uint256 => address) private tokenApprovals;

    /**
     * @dev Mapping from owner to operator approvals.
     */
    mapping(address => mapping(address => bool)) private operatorApprovals;

    // Token name
    string private _name;

    // Token symbol
    string private _symbol;

    /**
     * @dev Emitted when a new token is minted.
     */
    event Mint(address indexed to, uint256 indexed tokenId);

    /**
     * @dev Errors for common failure cases.
     */
    error InvalidAddress(address owner);
    error NoTokenId(uint256 tokenId);
    error NotAuthorized(address caller);
    error InvalidRecipient(address recipient);
    error TokenAlreadyExists(uint256 tokenId);
    error CannotApproveSelf(address operator);

    /**
     * @dev Initializes the contract by setting a `name` and a `symbol` for the token collection.
     * @param name_ The name of the token collection.
     * @param symbol_ The symbol of the token collection.
     */
    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    /**
     * @dev Returns the name of the token collection.
     */
    function name() external view returns (string memory) {
        return _name;
    }

    /**
     * @dev Returns the symbol of the token collection.
     */
    function symbol() external view returns (string memory) {
        return _symbol;
    }

    /**
     * @dev Returns the number of tokens owned by `owner`.
     * @param owner The address of the token owner.
     * @return The number of tokens owned.
     */
    function balanceOf(address owner) external view override returns (uint256) {
        if (owner == address(0)) {
            revert InvalidAddress(owner);
        }
        return balances[owner];
    }

    /**
     * @dev Returns the owner of the token with the given ID.
     * @param tokenId The ID of the token.
     * @return The address of the token owner.
     */
    function ownerOf(uint256 tokenId) external view override returns (address) {
        address owner = owners[tokenId];
        if (owner == address(0)) {
            revert NoTokenId(tokenId);
        }
        return owner;
    }

    /**
     * @dev Transfers a token from `from` to `to`.
     * @param from The address of the current owner.
     * @param to The address of the recipient.
     * @param tokenId The ID of the token to transfer.
     */
    function transferFrom(
    address from,
    address to,
    uint256 tokenId
) external payable override {
    if (owners[tokenId] != from) {
        revert NotAuthorized(msg.sender);
    }
    if (
        msg.sender != from &&
        msg.sender != tokenApprovals[tokenId] &&
        !operatorApprovals[from][msg.sender]
    ) {
        revert NotAuthorized(msg.sender);
    }
    if (to == address(0)) {
        revert InvalidRecipient(to);
    }

    // Update balances and ownership
    balances[from] -= 1;
    balances[to] += 1;
    owners[tokenId] = to;

    // Clear approvals for the token
    delete tokenApprovals[tokenId];

    emit Transfer(from, to, tokenId);
}

    /**
     * @dev Approves `approved` to manage the `tokenId` token.
     * @param approved The address to approve.
     * @param tokenId The ID of the token.
     */
    function approve(address approved, uint256 tokenId) external payable override {
    address owner = owners[tokenId];
    if (owner == address(0)) {
        revert NoTokenId(tokenId);
    }
    if (msg.sender != owner && !operatorApprovals[owner][msg.sender]) {
        revert NotAuthorized(msg.sender);
    }
    if (approved == address(0)) {
        revert InvalidRecipient(approved); // Vérification ajoutée ici
    }
    tokenApprovals[tokenId] = approved;

    emit Approval(owner, approved, tokenId);
}

    /**
     * @dev Returns the approved address for a token ID, or zero if no address is set.
     * @param tokenId The ID of the token.
     * @return The approved address.
     */
    function getApproved(
        uint256 tokenId
    ) external view override returns (address) {
        if (owners[tokenId] == address(0)) {
            revert NoTokenId(tokenId);
        }
        return tokenApprovals[tokenId];
    }

    /**
     * @dev Approves or removes `operator` as an operator for the caller.
     * Operators can call {transferFrom} or {safeTransferFrom} for any token owned by the caller.
     * @param operator The address to grant or revoke operator rights.
     * @param approved True to grant rights, false to revoke them.
     */
    function setApprovalForAll(
        address operator,
        bool approved
    ) external override {
        if (msg.sender == operator) {
            revert CannotApproveSelf(operator);
        }
        operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    /**
     * @dev Returns whether `operator` is allowed to manage all tokens of `owner`.
     * @param owner The address of the token owner.
     * @param operator The address of the operator.
     * @return True if the operator is approved, false otherwise.
     */
    function isApprovedForAll(
        address owner,
        address operator
    ) external view override returns (bool) {
        return operatorApprovals[owner][operator];
    }

    /**
     * @dev Mints a new token with the given ID and assigns it to `to`.
     * @param to The address of the recipient.
     * @param tokenId The ID of the token to mint.
     */
    function mint(address to, uint256 tokenId) external {
        if (to == address(0)) {
            revert InvalidRecipient(to);
        }
        if (owners[tokenId] != address(0)) {
            revert TokenAlreadyExists(tokenId);
        }

        // Update balances and ownership
        balances[to] += 1;
        owners[tokenId] = to;

        emit Transfer(address(0), to, tokenId);
    }
}
