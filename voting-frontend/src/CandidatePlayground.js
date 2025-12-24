/*import { useNavigate } from "react-router-dom";
import "./CandidatePlayground.css";

const candidates = [
  {
    id: 0,
    name: "Alice",
    image: "https://i.pravatar.cc/150?img=47",
    intro: "Advocates transparency and decentralization."
  },
  {
    id: 1,
    name: "Bob",
    image: "https://i.pravatar.cc/150?img=12",
    intro: "Focused on student innovation and tech growth."
  },
  {
    id: 2,
    name: "Charlie",
    image: "https://i.pravatar.cc/150?img=32",
    intro: "Supports inclusive and fair governance."
  }
];

export default function CandidatePlayground({ account }) {
  const navigate = useNavigate();

  return (
    <div className="playground">
      <header className="pg-header">
        <h1>Choose Your Representative</h1>
        <span className="wallet">
          {account.slice(0, 6)}...{account.slice(-4)}
        </span>
      </header>

      <div className="candidate-grid">
        {candidates.map((c) => (
          <div
            key={c.id}
            className="candidate-card"
            onClick={() => navigate(`/vote/${c.id}`)}
          >
            <img src={c.image} alt={c.name} />
            <div className="overlay">
              <h3>{c.name}</h3>
              <p>{c.intro}</p>
              <span>Click to Vote</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
*/

import "./CandidatePlayground.css";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { useEffect, useState } from "react";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const ABI = [
  "function getCandidate(uint256) view returns (string,uint256)",
  "function getCandidatesCount() view returns (uint256)"
];

const staticCandidates = [
  {
    id: 0,
    name: "Alice Johnson",
    intro: "Advocates transparency and digital governance.",
    image: "/candidates/alice.jpg",
  },
  {
    id: 1,
    name: "Bob Williams",
    intro: "Focused on security and voter privacy.",
    image: "/candidates/bob.jpg",
  },
  {
    id: 2,
    name: "Carol Smith",
    intro: "Supports decentralized democracy.",
    image: "/candidates/carol.jpg",
  },
];

export default function CandidatePlayground() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);

  async function loadResults() {
    try {
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

      const count = await contract.getCandidatesCount();
      const temp = [];

      for (let i = 0; i < count; i++) {
        const [name, votes] = await contract.getCandidate(i);
        temp.push({ name, votes: Number(votes) });
      }

      setResults(temp);
    } catch (err) {
      console.error("Failed to load results:", err);
    }
  }

  useEffect(() => {
    loadResults();
    const interval = setInterval(loadResults, 5000);
    return () => clearInterval(interval);
  }, []);

  const maxVotes = Math.max(...results.map(r => r.votes), 0);

  return (
    <div className="playground-container">
      <h1 className="dashboard-title">Blockchain Voting Dashboard</h1>

      {/* Candidate Playground */}
      <div className="candidate-grid">
        {staticCandidates.map((c) => (
          <div
            key={c.id}
            className="candidate-card"
            onClick={() => navigate(`/vote/${c.id}`)}
          >
            <img src={c.image} alt={c.name} />
            <div className="candidate-overlay">
              <h3>{c.name}</h3>
              <p>{c.intro}</p>
              <span className="click-text">Click to Vote</span>
            </div>
          </div>
        ))}
      </div>

      {/* Live Results */}
      <div className="results-panel">
        <h2>Live Results</h2>

        {results.length === 0 && (
          <p className="loading-text">Fetching live votes...</p>
        )}

        {results.map((r, index) => (
          <div
            key={index}
            className={`result-row ${
              r.votes === maxVotes && maxVotes > 0 ? "leading" : ""
            }`}
          >
            <span className="candidate-name">{r.name}</span>
            <span className="vote-count">{r.votes} votes</span>
          </div>
        ))}
      </div>
    </div>
  );
}
