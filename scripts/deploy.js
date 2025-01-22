const hre = require("hardhat");

async function main() {
    // Obtenir l'usine de contrat
    const SimpleNFT = await hre.ethers.getContractFactory("SimpleNFT");

    // Déployer le contrat
    const simpleNFT = await SimpleNFT.deploy("TestNFT", "TNFT");

    // Attendre le déploiement
    await simpleNFT.waitForDeployment();

    // Obtenir l'adresse du contrat déployé
    console.log("SimpleNFT deployed to:", simpleNFT.target);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
