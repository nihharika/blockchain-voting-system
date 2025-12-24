/*import { useParams, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import "./VoteConfirm.css";

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const abi = [
  "function vote(uint256)"
];

export default function VoteConfirm({ account }) {
  const { id } = useParams();
  const navigate = useNavigate();

  async function confirmVote() {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);

      const tx = await contract.vote(id);
      await tx.wait();

      alert("Vote confirmed successfully!");
      navigate("/dashboard");
    } catch (e) {
      if (e.code === 4001) alert("Transaction rejected");
      else alert("Vote failed");
    }
  }

  return (
    <div className="confirm">
      <div className="confirm-card">
        <h2>Confirm Your Vote</h2>
        <p>You are voting for candidate #{id}</p>
        <button onClick={confirmVote}>Confirm Vote</button>
        <button className="secondary" onClick={() => navigate("/dashboard")}>
          Cancel
        </button>
      </div>
    </div>
  );
}*/

import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ethers } from "ethers";
import "./VoteConfirm.css";

export default function VoteConfirm({ signer, contractAddress, abi }) {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  async function confirmVote() {
    try {
      setSubmitting(true);

      const contract = new ethers.Contract(
        contractAddress,
        abi,
        signer
      );

      const tx = await contract.vote(candidateId);
      await tx.wait();

      alert("✅ Your vote has been successfully recorded on the blockchain.");
      navigate("/");
    } catch (err) {
      if (err.code === 4001) {
        alert("Transaction rejected by user.");
      } else {
        console.error(err);
        alert("❌ Vote failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="confirm-container">
      <h2>Confirm Your Vote</h2>
      <p>
        You are about to cast a <strong>permanent</strong> vote for candidate #{candidateId}.
      </p>

      <button className="primary-btn" onClick={confirmVote} disabled={submitting}>
        {submitting ? "Submitting vote..." : "Confirm Vote"}
      </button>

      <button className="secondary-btn" onClick={() => navigate("/")}>
        Cancel
      </button>
    </div>
  );
}
