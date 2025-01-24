const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const TokenModule = buildModule("TokenModule", (m) => {
    const token = m.contract("SimpleNFT", ["MyNFT", "MNFT"], {
        gasLimit: 50000, // Augmentez la limite de gaz si nécessaire
    });

    return { token };
});

module.exports = TokenModule;
