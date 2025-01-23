const hre = require("hardhat");

async function main() {
    // Obtenir les usines de contrat
    const SimpleNFT = await hre.ethers.getContractFactory("SimpleNFT");
    const MyToken = await hre.ethers.getContractFactory("MyToken");
    const TodoList = await hre.ethers.getContractFactory("TodoList");

    // Déployer SimpleNFT
    const simpleNFT = await SimpleNFT.deploy("RAFALESNFT", "RNFT");
    await simpleNFT.waitForDeployment();
    console.log("SimpleNFT deployed to:", simpleNFT.target);

    // Déployer MyToken avec un approvisionnement initial de 1 000 000 tokens
    const initialSupply = hre.ethers.parseUnits("1000000", 18); // 1 000 000 avec 18 décimales
    const myToken = await MyToken.deploy("RCoin", "RC", initialSupply);
    await myToken.waitForDeployment();
    console.log("MyToken deployed to:", myToken.target);

    // Déployer TodoList
    const todoList = await TodoList.deploy();
    await todoList.waitForDeployment();
    console.log("TodoList deployed to:", todoList.target);

    // Interactions possibles après le déploiement (exemples, facultatif)
    // Exemple : attribuer des tokens à l'adresse propriétaire du contrat TodoList
    // const [owner] = await hre.ethers.getSigners();
    // await myToken.mint(owner.address, hre.ethers.parseUnits("1000", 18));
    // console.log("Minted 1000 MTK tokens to:", owner.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
