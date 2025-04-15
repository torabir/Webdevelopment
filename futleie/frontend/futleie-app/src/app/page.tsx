"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container, Paper, TextField, Button, Typography, Box, Alert } from "@mui/material";
import { signIn } from "services/authentication"; // Import authentication logic
import { useAuth } from "./components/AuthContext"; 

export default function Home() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, loading } = useAuth(); // Hent autentiseringsstatus

  // 🚀 Omdiriger bruker til `/adverts` hvis allerede innlogget
  useEffect(() => {
    if (!loading && user) {
      router.push("/adverts");
    }
  }, [user, loading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const user = await signIn(formData.email, formData.password);
      if (user) {
        router.push("/adverts");
      }
    } catch (err) {
      setError("Failed to sign in.");
    }
  };

  return (
    <Container maxWidth="xs" sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <Paper elevation={3} sx={{ p: 4, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
        <Typography variant="h4" align="center">Sign In</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <TextField fullWidth label="Email" name="email" type="email" onChange={handleChange} required margin="normal" />
          <TextField fullWidth label="Password" name="password" type="password" onChange={handleChange} required margin="normal" />
          <Button fullWidth type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
            Sign In
          </Button>
        </form>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">Don't have an account?</Typography>
          <Button variant="text" color="primary" onClick={() => router.push("/registerUser")}>
            Register here
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
