"use client";

// Authentication.tsx
import React, { useState } from "react";
import { register_user } from "services/authentication";// Import the logic from authentication.ts

export const CreateUserButton = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = () => {
    register_user(email, password);
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
      <button onClick={handleRegister}>Register User</button>
    </div>
  );
};