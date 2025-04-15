"use client";

import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import { UserService } from "../../../services/UserService";
import { User } from "../../../logic/User";

export default function UserProfilePage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUsername, setNewUsername] = useState("");
  const [newFirstName, setNewFirstName] = useState("");
  const [newSurName, setNewSurName] = useState("");
  const [newTlf, setNewTlf] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newAddress, setNewAddress] = useState("");

  useEffect(() => {
    async function loadUsers() {
      setLoading(true);
      try {
        const userList = await UserService.getAllUsers();
        setUsers(userList);
      } catch (error) {
        console.error("Feil ved henting av brukere:", error);
      }
      setLoading(false);
    }
    loadUsers();
  }, []);

  const handleAddUser = async () => {
    const newUser = new User(
      newUsername,
      newFirstName,
      newSurName,
      parseInt(newTlf, 10),
      newEmail,
      newAddress
    );

    try {
      await UserService.createUser(newUser);
      const updatedUsers = await UserService.getAllUsers();
      setUsers(updatedUsers);
      setNewUsername("");
      setNewFirstName("");
      setNewSurName("");
      setNewTlf("");
      setNewEmail("");
      setNewAddress("");
    } catch (error) {
      console.error("Feil ved lagring av bruker:", error);
    }
  };

  return (
    <Box className="p-6 bg-arctic min-h-screen">
      <Typography variant="h4" gutterBottom color="primary" fontWeight="bold">
        Alle brukerprofiler
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={3} mb={5}>
          {users.length > 0 ? (
            users.map((user, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card elevation={3}>
                  <CardContent>
                    <Typography variant="h6" color="textPrimary" fontWeight="bold">
                      {user.getUsername()}
                    </Typography>
                    <Typography color="textSecondary">{user.getFirstName()} {user.getSurName()}</Typography>
                    <Typography color="textSecondary">E-post: {user.getEmail()}</Typography>
                    <Typography color="textSecondary">Telefon: {user.getTlf()}</Typography>
                    <Typography color="textSecondary">Adresse: {user.getAddress()}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography variant="body1">Ingen brukere funnet.</Typography>
          )}
        </Grid>
      )}
    </Box>
  );
}
