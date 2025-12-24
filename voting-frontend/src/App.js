import { ethers } from "ethers";
import { useState } from "react";

function App() {

  // 🔹 CONTRACT DETAILS
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const abi = [
    "function vote(uint256)",
    "function getCandidate(uint256) view returns (string,uint256)",
    "function getCandidatesCount() view returns (uint256)"
  ];

  // 🔹 STATE
  const [account, setAccount] = useState("");
  const [candidates, setCandidates] = useState([]);

  // 🔹 CONNECT WALLET
  async function connectWallet() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    setAccount(await signer.getAddress());
    loadCandidates();
  }

  // 🔹 LOAD CANDIDATES
  async function loadCandidates() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, abi, provider);

    const count = await contract.getCandidatesCount();
    let temp = [];

    for (let i = 0; i < count; i++) {
      const [name, votes] = await contract.getCandidate(i);
      temp.push({ name, votes: votes.toString() });
    }

    setCandidates(temp);
  }

  // 🔹 VOTE
  async function vote(candidateIndex) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    await contract.vote(candidateIndex);
    await loadCandidates();
  }

  // 🔹 UI
  return (
    <div>
      <h1>Blockchain Voting System</h1>

      <button onClick={connectWallet}>Connect Wallet</button>
      <p>Account: {account}</p>

      <h2>Candidates</h2>
      {candidates.map((c, index) => (
        <div key={index}>
          <span>{c.name} - Votes: {c.votes}</span>
          <button onClick={() => vote(index)}>Vote</button>
        </div>
      ))}
    </div>
  );
}

export default App;
