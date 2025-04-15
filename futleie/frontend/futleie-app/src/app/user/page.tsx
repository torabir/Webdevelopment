"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../components/AuthContext"; 
import { useRouter } from "next/navigation"; // ✅ Importerer router for navigasjon
import { UserService } from "../../../services/UserService"; 
import { AdvertService } from "../../../services/AdvertService"; 
import { User } from "../../../logic/User";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Avatar from "@mui/material/Avatar";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { List, ListItem, ListItemText, Divider } from "@mui/material";

export default function UserProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter(); // ✅ Router for navigasjon
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [adverts, setAdverts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    surName: "",
    username: "",
    email: "",
    tlf: "",
    address: "",
  });

  // Hent brukerdata og annonser
  useEffect(() => {
    async function loadUserProfile() {
      if (!user) return;
      setLoading(true);
      try {
        const profile = await UserService.getUserByEmail(user.email as string);
        if (!profile) {
          console.error("Brukerprofil ikke funnet i databasen.");
          setUserProfile(null);
          setLoading(false);
          return;
        }

        setUserProfile(profile);

        setFormData({
          firstName: profile.getFirstName(),
          surName: profile.getSurName(),
          username: profile.getUsername(),
          email: profile.getEmail(),
          tlf: profile.getTlf(),
          address: profile.getAddress(),
        });

        // Hent brukerens annonser
        const userAdverts = await AdvertService.getAdvertsByUserEmail(user.email as string);
        setAdverts(userAdverts);
      } catch (error) {
        console.error("Feil ved henting av brukerprofil eller annonser:", error);
      }
      setLoading(false);
    }

    if (!authLoading) {
      loadUserProfile();
    }
  }, [user, authLoading]);

  // Håndter input-endringer
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Lagre endringer
  const handleSave = async () => {
    if (!userProfile) return;

    try {
      // Oppdater brukerdata i Firestore
      await UserService.updateUserByEmail(userProfile.getEmail(), formData);

      // Oppdater state med ny brukerinfo
      setUserProfile(new User(formData.username, formData.firstName, formData.surName, formData.tlf, formData.email, formData.address));

      //avslutte redigering 
      setIsEditing(false); 
    } catch (error) {
      console.error("Feil ved oppdatering av brukerprofil:", error);
    }
  };

  // Naviger til annonsedetaljsiden når en annonse klikkes
  const handleAdvertClick = (advertId: string) => {
    router.push(`/adverts/${advertId}`); 
  };

  return (
    <Box className="p-6 bg-arctic min-h-screen">
      <Typography variant="h4" gutterBottom color="primary" fontWeight="bold">
        Min profil
      </Typography>
  
      {loading || authLoading ? (
        <CircularProgress />
      ) : userProfile ? (
        <>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3, mb: 4 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4} textAlign="center">
                <Avatar sx={{ width: 150, height: 150, margin: "0 auto", fontSize: 64 }}>
                  {userProfile.getFirstName().charAt(0)}
                </Avatar>
                <Typography variant="h5" fontWeight="bold" mt={2}>
                  {userProfile.getFirstName()} {userProfile.getSurName()}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  @{userProfile.getUsername()}
                </Typography>
              </Grid>
              <Grid item xs={12} md={8}>
                {isEditing ? (
                  <>
                    <TextField fullWidth name="firstName" label="Fornavn" value={formData.firstName} onChange={handleChange} margin="normal" />
                    <TextField fullWidth name="surName" label="Etternavn" value={formData.surName} onChange={handleChange} margin="normal" />
                    <TextField fullWidth name="username" label="Brukernavn" value={formData.username} onChange={handleChange} margin="normal" />
                    <TextField fullWidth name="tlf" label="Telefon" value={formData.tlf} onChange={handleChange} margin="normal" />
                    <TextField fullWidth name="address" label="Adresse" value={formData.address} onChange={handleChange} margin="normal" />
  
                    <Button variant="contained" color="primary" sx={{ mt: 2, mr: 2 }} onClick={handleSave}>
                      Lagre Endringer
                    </Button>
                    <Button variant="contained" sx={{ mt: 2, bgcolor: "#004d40", "&:hover": { bgcolor: "#00332e" } }} onClick={() => setIsEditing(false)}>
                      Avbryt
                    </Button>
                  </>
                ) : (
                  <>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Kontaktinformasjon
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography color="textSecondary">E-post: {userProfile.getEmail()}</Typography>
                    <Typography color="textSecondary">Telefon: {userProfile.getTlf()}</Typography>
                    <Typography color="textSecondary">Adresse: {userProfile.getAddress()}</Typography>
  
                    <Button variant="contained" color="primary" sx={{ mt: 4 }} onClick={() => setIsEditing(true)}>
                      Rediger profil
                    </Button>
                  </>
                )}
              </Grid>
            </Grid>
          </Paper>
            <Typography variant="h4" gutterBottom color="primary" fontWeight="bold">
            Mine Annonser 
          </Typography>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
            {adverts.length > 0 ? (
              <List>
                {adverts.map((advert, index) => (
                  <React.Fragment key={advert.id}>
                      <ListItem component="button" onClick={() => handleAdvertClick(advert.id)} sx={{ cursor: "pointer" }}>
                      <ListItemText primary={advert.title} secondary={`Pris: ${advert.price} kr`} />
                    </ListItem>
                    {index < adverts.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography color="textSecondary">Ingen annonser opprettet.</Typography>
            )}
          </Paper>
        </>
      ) : (
        <Typography variant="body1">Brukerprofil ikke funnet.</Typography>
      )}
    </Box>
  );
}
