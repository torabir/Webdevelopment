"use client";

import React, { useState } from "react"
import { useRouter } from "next/navigation";
import { User } from "logic/User";
import { UserService } from "services/UserService";
import { register_user } from "services/authentication";
import { TextField, Button, Typography, Container, Paper, Alert } from "@mui/material";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    surName: "",
    tlf: "",
    email: "",
    password: "",
    address: "",
  });
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

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
      const user = new User(
        formData.username,
        formData.firstName,
        formData.surName,
        Number(formData.tlf),
        formData.email,
        formData.address
      );
      const registered_user = await register_user(formData.email, formData.password);
      if (registered_user) {
        UserService.createUser(user);
      }
      router.push("/adverts");
    } catch (err) {
      setError("Failed to register user");
    }
  };

  return (
    <Container maxWidth="xs" sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 2 }}>
      <Paper elevation={3} sx={{ p: 3, width: "100%", maxHeight: "90vh", overflow: "auto", display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Typography variant="h5" align="center">Register</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField fullWidth label="Email" name="email" type="email" onChange={handleChange} required margin="dense" />
          <TextField fullWidth label="Password" name="password" type="password" onChange={handleChange} required margin="dense" />
          <TextField fullWidth label="Username" name="username" onChange={handleChange} required margin="dense" />
          <TextField fullWidth label="First Name" name="firstName" onChange={handleChange} required margin="dense" />
          <TextField fullWidth label="Surname" name="surName" onChange={handleChange} required margin="dense" />
          <TextField fullWidth label="Phone Number" name="tlf" type="number" onChange={handleChange} required margin="dense" />
          <TextField fullWidth label="Address" name="address" onChange={handleChange} required margin="dense" />
          <Button fullWidth type="submit" variant="contained" color="primary" sx={{ mt: 1.5 }}>
            Register
          </Button>
        </form>
        <Button fullWidth variant="outlined" sx={{ mt: 1.5, bgcolor: "#004d40", color: "white", "&:hover": { bgcolor: "#00332e" } }} onClick={() => router.push("/")}>
          Back to Home
        </Button>
      </Paper>
    </Container>
  );
}
