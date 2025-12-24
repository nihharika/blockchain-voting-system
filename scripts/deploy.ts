import { ethers } from "ethers";
import hre from "hardhat";

async function main() {
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const signer = await provider.getSigner();

  const artifact = await hre.artifacts.readArtifact("Voting");

  const factory = new ethers.ContractFactory(
    artifact.abi,
    artifact.bytecode,
    signer
  );

  const candidates = ["Alice", "Bob", "Charlie"];
  const contract = await factory.deploy(candidates);

  await contract.waitForDeployment();

  console.log("Voting deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
