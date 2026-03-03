/**
 * InstructorKeyGen.jsx
 * 
 * Step 2.2: Instructor RSA Key Generation & Upload
 * 
 * This page allows instructors to generate cryptographic keys for:
 * - RSA-OAEP (2048-bit): Used to decrypt AES keys from students
 * - RSA-PSS (2048-bit): Used to digitally sign exams and results
 * 
 * Security Notes:
 * - Private keys are stored in localStorage (demo-safe, not production-safe)
 * - Public keys are uploaded to the backend for exam signing verification
 * - All cryptographic operations use Web Crypto API (browser-native)
 */

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { getToken, authFetch } from "./auth/authHelpers";
import { useTheme } from "../context/ThemeContext";

export default function InstructorKeyGen() {
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
    const hasOaepKey = !!localStorage.getItem("instructor_oaep_private_key");
    const hasPssKey = !!localStorage.getItem("instructor_pss_private_key");
    // Also check legacy key name
    const hasLegacyKey = !!localStorage.getItem("instructor_private_key");
    const isUploaded = localStorage.getItem("instructor_keys_uploaded") === "true";

    setKeysGenerated((hasOaepKey && hasPssKey) || hasLegacyKey);
    setKeysUploaded(isUploaded);
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
      // 1. Generate RSA-OAEP key pair (for decrypting AES keys)
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

      // 2. Generate RSA-PSS key pair (for signing exams/results)
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
      localStorage.setItem("instructor_oaep_private_key", bufferToBase64(oaepPrivateKey));
      localStorage.setItem("instructor_pss_private_key", bufferToBase64(pssPrivateKey));
      // Legacy key for backwards compatibility
      localStorage.setItem("instructor_private_key", bufferToBase64(pssPrivateKey));

      // 4. Export public keys as PEM for upload
      const oaepPublicPem = await exportPublicKeyToPem(oaepKeyPair.publicKey);
      const pssPublicPem = await exportPublicKeyToPem(pssKeyPair.publicKey);

      // Store public keys temporarily for upload
      localStorage.setItem("instructor_oaep_public_key", oaepPublicPem);
      localStorage.setItem("instructor_pss_public_key", pssPublicPem);

      setKeysGenerated(true);
      setKeysUploaded(false); // Reset upload status since new keys were generated
      localStorage.removeItem("instructor_keys_uploaded"); // Clear upload flag
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
      const oaepPublicPem = localStorage.getItem("instructor_oaep_public_key");
      const pssPublicPem = localStorage.getItem("instructor_pss_public_key");

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
      setSuccessMessage("Public keys uploaded successfully to the exam server!");

      // Store upload status flag so dashboard can track it
      localStorage.setItem("instructor_keys_uploaded", "true");

      // Clean up temporary public key storage
      localStorage.removeItem("instructor_oaep_public_key");
      localStorage.removeItem("instructor_pss_public_key");

    } catch (err) {
      console.error("Upload failed:", err);
      setError("Failed to upload public key: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-background-dark min-h-screen flex flex-col font-body transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-[#1E3A8A] dark:bg-surface-dark text-white shadow-lg transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-lg">
                <span className="material-symbols-outlined text-2xl">school</span>
              </div>
              <div>
                <h1 className="text-lg font-bold leading-none tracking-tight">University Secure Exam System</h1>
                <span className="text-xs text-blue-200 font-medium uppercase tracking-wider">Faculty Portal</span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="relative flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300"
                aria-label="Toggle theme"
              >
                <span className={`material-symbols-outlined text-lg absolute transition-all duration-300 ${isDarkMode ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100 text-amber-400'}`}>
                  light_mode
                </span>
                <span className={`material-symbols-outlined text-lg absolute transition-all duration-300 ${isDarkMode ? 'opacity-100 rotate-0 scale-100 text-blue-400' : 'opacity-0 -rotate-90 scale-0'}`}>
                  dark_mode
                </span>
              </button>
              <Link to="/instructor/dashboard" className="text-sm font-medium text-blue-200 hover:text-white transition-colors">
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-start pt-12 pb-12 px-4 sm:px-6">
        {/* Header Section */}
        <div className="text-center max-w-2xl mb-10">
          <div className="inline-flex items-center justify-center p-3 mb-4 bg-indigo-100 rounded-full">
            <span className="material-symbols-outlined text-indigo-700 text-3xl">admin_panel_settings</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">Instructor Secure Identity Setup</h2>
          <p className="text-slate-500 dark:text-slate-300 text-lg leading-relaxed">
            Configure your cryptographic identity to sign exams and results.
            Your keys ensure document authenticity and integrity.
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="w-full max-w-3xl mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-400">
            <span className="material-symbols-outlined">error</span>
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
        {successMessage && (
          <div className="w-full max-w-3xl mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
            <span className="material-symbols-outlined">check_circle</span>
            <p className="text-sm font-medium">{successMessage}</p>
          </div>
        )}

        {/* Main Card */}
        <div className="w-full max-w-3xl bg-white dark:bg-surface-dark rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">

          {/* Step 1: Key Generation */}
          <div className="p-8 border-b border-slate-100 dark:border-slate-700">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${keysGenerated ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                  <span className="material-symbols-outlined text-[28px]">{keysGenerated ? 'check_circle' : 'vpn_key'}</span>
                </div>
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">1. Key Pair Generation</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${keysGenerated ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {keysGenerated ? 'Completed' : 'Required'}
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-300 text-sm mb-4 leading-relaxed">
                  We use <span className="font-medium text-slate-700 dark:text-slate-200">RSA-OAEP 2048-bit</span> for key encryption and <span className="font-medium text-slate-700 dark:text-slate-200">RSA-PSS</span> for digitally signing exams and results. This process runs locally in your browser.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    onClick={generateKeys}
                    disabled={isGenerating}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-lg shadow-sm transition-all focus:ring-4 focus:ring-indigo-600/20 disabled:cursor-not-allowed"
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
                  <span className="text-xs text-slate-500 italic flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-indigo-600">info</span>
                    May take up to 10 seconds
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Upload */}
          <div className={`p-8 border-b border-slate-100 dark:border-slate-700 ${!keysGenerated ? 'bg-slate-50/50 dark:bg-slate-800/30' : ''}`}>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${keysUploaded ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                  <span className="material-symbols-outlined text-[28px]">{keysUploaded ? 'cloud_done' : 'cloud_upload'}</span>
                </div>
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">2. Upload Public Keys</h3>
                  {keysUploaded ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      Uploaded
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600 border border-amber-200">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                      </span>
                      Not Uploaded
                    </span>
                  )}
                </div>
                <p className="text-slate-500 dark:text-slate-300 text-sm mb-4 leading-relaxed">
                  Only your <span className="font-medium text-slate-700 dark:text-slate-200">public keys</span> are transmitted to the exam server. Students will use these to verify your signatures on exams and results.
                </p>
                <button
                  onClick={uploadPublicKey}
                  disabled={!keysGenerated || isUploading}
                  className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg shadow-sm transition-all ${keysGenerated
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-4 focus:ring-emerald-600/20'
                    : 'bg-white border border-slate-300 text-slate-400 cursor-not-allowed'
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
                      Upload Public Keys
                    </>
                  )}
                </button>
                {!keysGenerated && (
                  <p className="mt-2 text-xs text-slate-500">Please generate keys first.</p>
                )}
              </div>
            </div>
          </div>

          {/* Security Footer */}
          <div className="px-8 py-6 bg-indigo-50 dark:bg-slate-800/50">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-indigo-700 dark:text-indigo-400 mt-0.5 text-xl">security</span>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Instructor Security Guarantees</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <span className="material-symbols-outlined text-emerald-500 text-[16px]">check_circle</span>
                    Private keys never leave your device
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="material-symbols-outlined text-emerald-500 text-[16px]">check_circle</span>
                    Digital signatures prove exam authenticity
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="material-symbols-outlined text-emerald-500 text-[16px]">check_circle</span>
                    Results are cryptographically verifiable
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Help Text */}
        <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          Having trouble? <a className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium" href="#">Contact IT Support</a> or view the <a className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium" href="#">Faculty Guide</a>.
        </p>
      </main>
    </div>
  );
}
