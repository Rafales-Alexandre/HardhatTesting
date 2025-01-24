const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const TokenModule = buildModule("TokenModule", (m) => {
    const token = m.contract("SimpleNFT", ["MyNFT", "MNFT"]);

  return { token };
});

module.exports = TokenModule;