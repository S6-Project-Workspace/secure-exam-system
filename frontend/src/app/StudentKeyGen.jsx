/**
 * StudentKeyGen.jsx
 * 
 * Step 2.1: Student RSA Key Generation & Upload
 * 
 * This page allows students to generate cryptographic keys for:
 * - RSA-OAEP (2048-bit): Used to decrypt AES exam keys
 * - RSA-PSS (2048-bit): Used to digitally sign answer submissions
 * 
 * Security Notes:
 * - Private keys are stored in localStorage (demo-safe, not production-safe)
 * - Public keys are uploaded to the backend for exam encryption
 * - All cryptographic operations use Web Crypto API (browser-native)
 */

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { getToken, authFetch } from "./auth/authHelpers";
import { useTheme } from "../context/ThemeContext";
import DashboardHeaderNew from "./student-dashboard/components/DashboardHeaderNew";

export default function StudentKeyGen() {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

  // Key generation state
  const [keysGenerated, setKeysGenerated] = useState(false);
  const [keysUploaded, setKeysUploaded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Check for existing keys on mount
  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    // Check if keys already exist in localStorage
    const hasOaepKey = !!localStorage.getItem("student_oaep_private_key");
    const hasPssKey = !!localStorage.getItem("student_pss_private_key");
    // Also check legacy key names for backwards compatibility
    const hasLegacyOaep = !!localStorage.getItem("student_private_key");
    const hasLegacyPss = !!localStorage.getItem("student_sign_private_key");

    setKeysGenerated((hasOaepKey && hasPssKey) || (hasLegacyOaep && hasLegacyPss));
  }, [navigate]);

  /**
   * Convert ArrayBuffer to Base64 string
   */
  const bufferToBase64 = (buffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  /**
   * Export public key to PEM format
   */
  const exportPublicKeyToPem = async (publicKey) => {
    const spki = await window.crypto.subtle.exportKey("spki", publicKey);
    const base64 = bufferToBase64(spki);
    // Format as PEM with 64-character lines
    const pemBody = base64.match(/.{1,64}/g).join("\n");
    return `-----BEGIN PUBLIC KEY-----\n${pemBody}\n-----END PUBLIC KEY-----`;
  };

  /**
   * Generate RSA Key Pairs (RSA-OAEP + RSA-PSS)
   */
  const generateKeys = async () => {
    setIsGenerating(true);
    setError("");
    setSuccessMessage("");

    try {
      // 1. Generate RSA-OAEP key pair (for decrypting AES exam keys)
      const oaepKeyPair = await window.crypto.subtle.generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]), // 65537
          hash: "SHA-256"
        },
        true, // extractable
        ["encrypt", "decrypt"]
      );

      // 2. Generate RSA-PSS key pair (for signing submissions)
      const pssKeyPair = await window.crypto.subtle.generateKey(
        {
          name: "RSA-PSS",
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]), // 65537
          hash: "SHA-256"
        },
        true, // extractable
        ["sign", "verify"]
      );

      // 3. Export private keys as PKCS#8 and store in localStorage
      const oaepPrivateKey = await window.crypto.subtle.exportKey("pkcs8", oaepKeyPair.privateKey);
      const pssPrivateKey = await window.crypto.subtle.exportKey("pkcs8", pssKeyPair.privateKey);

      // Store with both new and legacy key names for compatibility
      localStorage.setItem("student_oaep_private_key", bufferToBase64(oaepPrivateKey));
      localStorage.setItem("student_pss_private_key", bufferToBase64(pssPrivateKey));
      // Legacy keys for backwards compatibility with existing code
      localStorage.setItem("student_private_key", bufferToBase64(oaepPrivateKey));
      localStorage.setItem("student_sign_private_key", bufferToBase64(pssPrivateKey));

      // 4. Export public keys as PEM for upload
      const oaepPublicPem = await exportPublicKeyToPem(oaepKeyPair.publicKey);
      const pssPublicPem = await exportPublicKeyToPem(pssKeyPair.publicKey);

      // Store public keys temporarily for upload
      localStorage.setItem("student_oaep_public_key", oaepPublicPem);
      localStorage.setItem("student_pss_public_key", pssPublicPem);

      setKeysGenerated(true);
      setKeysUploaded(false); // Reset upload status since new keys were generated
      setSuccessMessage("RSA key pairs generated successfully! Private keys stored locally.");

    } catch (err) {
      console.error("Key generation failed:", err);
      setError("Failed to generate keys: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Upload Public Keys to Backend
   */
  const uploadPublicKey = async () => {
    setIsUploading(true);
    setError("");
    setSuccessMessage("");

    try {
      // Retrieve stored public keys
      const oaepPublicPem = localStorage.getItem("student_oaep_public_key");
      const pssPublicPem = localStorage.getItem("student_pss_public_key");

      if (!oaepPublicPem || !pssPublicPem) {
        throw new Error("Public keys not found. Please generate keys first.");
      }

      // Combine both public keys into a JSON structure
      const combinedPublicKey = JSON.stringify({
        oaep: oaepPublicPem,
        pss: pssPublicPem
      });

      // Upload to backend using query parameter (matching backend expectation)
      const response = await authFetch(
        `${API_BASE_URL}/keys/upload?public_key=${encodeURIComponent(combinedPublicKey)}`,
        { method: "POST" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Upload failed");
      }

      setKeysUploaded(true);
      setSuccessMessage("Public key uploaded successfully to the exam server!");

      // Clean up temporary public key storage
      localStorage.removeItem("student_oaep_public_key");
      localStorage.removeItem("student_pss_public_key");

    } catch (err) {
      console.error("Upload failed:", err);
      setError("Failed to upload public key: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`${isDarkMode ? 'bg-[#0f172a]' : 'bg-slate-50'} min-h-screen flex flex-col font-body transition-colors duration-300`}>
      {/* Header - Using the same navbar as student dashboard */}
      <DashboardHeaderNew showBackButton={true} />

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-start pt-12 pb-12 px-4 sm:px-6">
        {/* Header Section */}
        <div className="text-center max-w-2xl mb-10">
          <div className={`inline-flex items-center justify-center p-3 mb-4 ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'} rounded-full`}>
            <span className={`material-symbols-outlined ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} text-3xl`}>lock_person</span>
          </div>
          <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-3 tracking-tight`}>Secure Identity Setup</h2>
          <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-600'} text-lg leading-relaxed`}>
            Before entering the exam environment, you must configure your local cryptographic identity.
            Your keys ensure exam confidentiality and integrity.
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className={`w-full max-w-3xl mb-6 p-4 ${isDarkMode ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'} border rounded-xl flex items-center gap-3 text-red-400`}>
            <span className="material-symbols-outlined">error</span>
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
        {successMessage && (
          <div className={`w-full max-w-3xl mb-6 p-4 ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'} border rounded-xl flex items-center gap-3 text-emerald-400`}>
            <span className="material-symbols-outlined">check_circle</span>
            <p className="text-sm font-medium">{successMessage}</p>
          </div>
        )}

        {/* Main Card */}
        <div className={`w-full max-w-3xl ${isDarkMode ? 'bg-[#1a2332] border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'} rounded-2xl border overflow-hidden transition-colors duration-300`}>

          {/* Step 1: Key Generation */}
          <div className={`p-8 border-b ${isDarkMode ? 'border-slate-700/50' : 'border-slate-200'}`}>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${keysGenerated ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                  <span className="material-symbols-outlined text-[28px]">{keysGenerated ? 'check_circle' : 'vpn_key'}</span>
                </div>
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>1. Key Pair Generation</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${keysGenerated ? 'bg-emerald-500/20 text-emerald-400' : isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>
                    {keysGenerated ? 'Completed' : 'Required'}
                  </span>
                </div>
                <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-600'} text-sm mb-4 leading-relaxed`}>
                  We use <span className={`font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>RSA-OAEP 2048-bit</span> for decrypting exam papers and <span className={`font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>RSA-PSS</span> for digitally signing your answers. This process runs locally in your browser.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    onClick={generateKeys}
                    disabled={isGenerating}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white text-sm font-semibold rounded-lg shadow-sm transition-all focus:ring-4 focus:ring-blue-600/20 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                        Generating...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[20px]">cached</span>
                        {keysGenerated ? 'Regenerate RSA Keys' : 'Generate RSA Keys'}
                      </>
                    )}
                  </button>
                  <span className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} italic flex items-center gap-1`}>
                    <span className="material-symbols-outlined text-[16px] text-blue-400">info</span>
                    May take up to 10 seconds
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Upload */}
          <div className={`p-8 border-b ${isDarkMode ? 'border-slate-700/50' : 'border-slate-200'} ${!keysGenerated ? (isDarkMode ? 'bg-slate-800/30' : 'bg-slate-50') : ''}`}>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${keysUploaded ? 'bg-emerald-500/20 text-emerald-400' : isDarkMode ? 'bg-slate-700 text-slate-500' : 'bg-slate-200 text-slate-400'}`}>
                  <span className="material-symbols-outlined text-[28px]">{keysUploaded ? 'cloud_done' : 'cloud_upload'}</span>
                </div>
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>2. Upload Public Key</h3>
                  {keysUploaded ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      Uploaded
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                      </span>
                      Not Uploaded
                    </span>
                  )}
                </div>
                <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-600'} text-sm mb-4 leading-relaxed`}>
                  Only your <span className={`font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>public key</span> is transmitted to the exam server to encrypt your question paper. Your private key remains strictly on this device.
                </p>
                <button
                  onClick={uploadPublicKey}
                  disabled={!keysGenerated || isUploading}
                  className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg shadow-sm transition-all ${keysGenerated
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-4 focus:ring-emerald-600/20'
                    : isDarkMode ? 'bg-slate-700 border border-slate-600 text-slate-500 cursor-not-allowed' : 'bg-slate-200 border border-slate-300 text-slate-400 cursor-not-allowed'
                    }`}
                >
                  {isUploading ? (
                    <>
                      <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">upload_file</span>
                      Upload Public Key
                    </>
                  )}
                </button>
                {!keysGenerated && (
                  <p className={`mt-2 text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Please generate keys first.</p>
                )}
              </div>
            </div>
          </div>

          {/* Security Footer */}
          <div className={`px-8 py-6 ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-blue-400 mt-0.5 text-xl">security</span>
              <div>
                <h4 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2`}>Security Guarantees</h4>
                <ul className="space-y-2">
                  <li className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    <span className="material-symbols-outlined text-emerald-500 text-[16px]">check_circle</span>
                    Private keys never leave your device
                  </li>
                  <li className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    <span className="material-symbols-outlined text-emerald-500 text-[16px]">check_circle</span>
                    Public keys enable secure, individualized exam delivery
                  </li>
                  <li className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    <span className="material-symbols-outlined text-emerald-500 text-[16px]">check_circle</span>
                    Cryptographic keys are unique per student session
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Help Text */}
        <p className={`mt-8 text-center text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          Having trouble? <a className="text-blue-400 hover:underline font-medium" href="#">Contact Exam Support</a> or view the <a className="text-blue-400 hover:underline font-medium" href="#">Student Guide</a>.
        </p>
      </main>
    </div>
  );
}
