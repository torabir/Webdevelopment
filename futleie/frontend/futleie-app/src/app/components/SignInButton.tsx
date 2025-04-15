"use client"

import { auth } from "config/firebase";
// Authentication.tsx
import React, { useState } from "react";
import { signIn } from "services/authentication";// Import the logic from authentication.ts
import { useRouter } from "node_modules/next/navigation";

export const SignInButton = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  let router = useRouter();

  const handleSignIn = async () => {
    setError("null");
    try {
      const user = await signIn(email, password);
      if (user) {
        router.push("/adverts");
        console.log(user);
      }
    }  
    catch (err) {
      setError("Failed to sign in.")
    }
    
  };

  return (
    <div>
      <input
        placeholder="Email..."
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
      />
      <input
        placeholder="Password..."
        type="password"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
      />
      <button onClick={handleSignIn}>Sign In</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};
