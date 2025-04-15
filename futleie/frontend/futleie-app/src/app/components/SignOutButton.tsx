"use client";

import { useRouter } from "node_modules/next/router";
// Authentication.tsx
import React, { useState } from "react";
import { signingOut } from "services/authentication";// Import the logic from authentication.ts

export const SignOutButton = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSignOut = () => {
    signingOut();
    router.push("..")
    
  };

  return (
    <div>
      <button onClick={handleSignOut}>Sign Out</button>
    </div>
  );
};
