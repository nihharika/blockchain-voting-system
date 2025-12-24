/*import { useState } from "react";
import { ethers } from "ethers";
import "./App.css";

function App() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const abi = [
    "function vote(uint256)",
    "function getCandidate(uint256) view returns (string,uint256)",
    "function getCandidatesCount() view returns (uint256)"
  ];

  const [account, setAccount] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  async function connectWallet() {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);

      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setAccount(address);
      setConnected(true);
      await loadCandidates(provider);
    } catch (error) {
      if (error.code === 4001) {
        alert("Wallet connection rejected");
      } else {
        console.error(error);
      }
    }
  }

  async function loadCandidates(provider) {
    const contract = new ethers.Contract(contractAddress, abi, provider);
    const count = await contract.getCandidatesCount();

    let temp = [];
    for (let i = 0; i < Number(count); i++) {
      const [name, votes] = await contract.getCandidate(i);
      temp.push({ index: i, name, votes: votes.toString() });
    }
    setCandidates(temp);
  }

  async function vote() {
    if (selectedCandidate === "") {
      alert("Please select a candidate");
      return;
    }

    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);

      const tx = await contract.vote(selectedCandidate);
      await tx.wait();

      await loadCandidates(provider);
      alert("Vote cast successfully!");
    } catch (error) {
      if (error.code === 4001) {
        alert("Transaction rejected");
      } else {
        console.error(error);
        alert("Voting failed");
      }
    } finally {
      setLoading(false);
    }
  }

  // ---------------- UI ----------------

  if (!connected) {
    return (
      <div className="landing">
        <div className="card">
          <h1>🗳 Blockchain Voting System</h1>
          <p>Secure • Transparent • Decentralized</p>
          <button className="primary-btn" onClick={connectWallet}>
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header>
        <h2>Welcome to the Voting Dashboard</h2>
        <span className="account">
          {account.slice(0, 6)}...{account.slice(-4)}
        </span>
      </header>

      <div className="vote-card">
        <h3>Select Your Representative</h3>

        <select
          value={selectedCandidate}
          onChange={(e) => setSelectedCandidate(e.target.value)}
        >
          <option value="">-- Choose Candidate --</option>
          {candidates.map((c) => (
            <option key={c.index} value={c.index}>
              {c.name}
            </option>
          ))}
        </select>

        <button
          className="primary-btn"
          onClick={vote}
          disabled={loading}
        >
          {loading ? "Casting Vote..." : "Vote"}
        </button>
      </div>

      <div className="results">
        <h3>Live Results</h3>
        {candidates.map((c) => (
          <div key={c.index} className="result-row">
            <span>{c.name}</span>
            <span>{c.votes} votes</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
*/


import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { ethers } from "ethers";

import CandidatePlayground from "./CandidatePlayground";
import VoteConfirm from "./VoteConfirm";
import "./App.css";

/* ---------------- CONTRACT CONFIG ---------------- */

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const ABI = [
  "function vote(uint256)",
  "function getCandidate(uint256) view returns (string,uint256)",
  "function getCandidatesCount() view returns (uint256)"
];

/* ---------------- APP ROOT ---------------- */

export default function App() {
  const navigate = useNavigate();

  /* ---------- GLOBAL STATE ---------- */
  const [provider, setProvider] = useState(null); // ✅ FIXED
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState("");
  const [network, setNetwork] = useState("");
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ---------- CONNECT WALLET ---------- */
  async function connectWallet(redirectTo) {
    try {
      if (!window.ethereum) {
        alert("MetaMask is required to vote.");
        return;
      }

      setLoading(true);

      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      await browserProvider.send("eth_requestAccounts", []);

      const signerInstance = await browserProvider.getSigner();
      const address = await signerInstance.getAddress();
      const net = await browserProvider.getNetwork();

      setProvider(browserProvider);
      setSigner(signerInstance);
      setAccount(address);
      setNetwork(net.name || "Localhost");
      setConnected(true);

      if (redirectTo) navigate(redirectTo);
    } catch (err) {
      if (err.code === 4001) {
        alert("Wallet connection rejected.");
      } else {
        console.error(err);
        setError("Wallet connection failed.");
      }
    } finally {
      setLoading(false);
    }
  }

  /* ---------- AUTO RECONNECT ---------- */
  useEffect(() => {
    async function reconnect() {
      if (!window.ethereum) return;

      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (accounts.length > 0) {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        const signerInstance = await browserProvider.getSigner();
        const net = await browserProvider.getNetwork();

        setProvider(browserProvider);
        setSigner(signerInstance);
        setAccount(accounts[0]);
        setNetwork(net.name || "Localhost");
        setConnected(true);
      }
    }

    reconnect();
  }, []); // ✅ added dependency array (important)

  /* ---------- DISCONNECT ---------- */
  function disconnectWallet() {
    setProvider(null);
    setSigner(null);
    setAccount("");
    setConnected(false);
    navigate("/");
  }

  /* ---------- ROUTE GUARD ---------- */
  function Protected({ children }) {
    if (!connected) return <Navigate to="/" replace />;
    return children;
  }

  /* ---------- UI ---------- */
  return (
    <div className="app-root">
      <header className="app-header">
        <div className="logo">🗳️ Decentralized Voting</div>

        <div className="header-actions">
          {connected && (
            <>
              <div className="network-pill">{network}</div>
              <div className="account-pill">
                {account.slice(0, 6)}…{account.slice(-4)}
              </div>
              <button className="secondary-btn" onClick={disconnectWallet}>
                Disconnect
              </button>
            </>
          )}

          {!connected && (
            <button
              className="primary-btn"
              onClick={() => connectWallet()}
              disabled={loading}
            >
              {loading ? "Connecting…" : "Connect Wallet"}
            </button>
          )}
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <Routes>
        <Route
          path="/"
          element={
            <CandidatePlayground
              isConnected={connected}
              connectWallet={connectWallet}
              contractAddress={CONTRACT_ADDRESS}
              abi={ABI}
            />
          }
        />

        <Route
          path="/vote/:candidateId"
          element={
            <Protected>
              <VoteConfirm
                signer={signer}
                contractAddress={CONTRACT_ADDRESS}
                abi={ABI}
              />
            </Protected>
          }
        />
      </Routes>

      <footer className="app-footer">
        <p>Powered by Ethereum · Transparency · Democracy</p>
        <p className="footer-sub">
          Every vote matters. Your voice is immutable.
        </p>
      </footer>
    </div>
  );
}
