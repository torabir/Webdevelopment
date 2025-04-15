"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdvertService } from "../../../../services/AdvertService";
import { Advert } from "../../../../logic/Advert";
import { useAuth } from "../../components/AuthContext";
import CityDropdown from "../../components/CityDropdown";
import {
  Container,
  Paper,
  Box,
  Typography,
  CircularProgress,
  Button,
  TextField,
} from "@mui/material";

export default function AdvertDetailPage() {
  const { advertId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [advert, setAdvert] = useState<Advert | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    tekstblokk: "",
    price: "",
    tag: "",
    city: "",
  });

  useEffect(() => {
    const fetchAdvert = async () => {
      if (!advertId) return;
      setLoading(true);
      try {
        const advertData = await AdvertService.getAdvertById(advertId as string);
        setAdvert(advertData);
        if (advertData) {
          setFormData({
            title: advertData.getTitle(),
            tekstblokk: advertData.getTekstblokk(),
            price: advertData.getPrice().toString(),
            tag: advertData.getTag(),
            city: advertData.getCity(),
          });
        }
      } catch (error) {
        console.error("Feil ved henting av annonse:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdvert();
  }, [advertId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!advert) return;
    try {
      await AdvertService.updateAdvertById(advert.getId(), {
        title: formData.title,
        tekstblokk: formData.tekstblokk,
        price: parseFloat(formData.price),
        tag: formData.tag,
        city: formData.city,
      });
      setAdvert(
        new Advert(
          advert.getId(),
          formData.title,
          formData.tekstblokk,
          parseFloat(formData.price),
          advert.getUser(),
          formData.tag,
          advert.getUnavailableDates(),
          advert.getEmail(),
          advert.getImageUrl(),
          formData.city
        )
      );
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error("Feil ved oppdatering av annonse:", error);
    }
  };

  const handleDelete = async () => {
    if (!advert) return;
    try {
      await AdvertService.deleteAdvertById(advert.getId());
      router.push("/adverts");
    } catch (error) {
      console.error("Feil ved sletting av annonse:", error);
    }
  };

  if (loading) {
    return (
      <Container
        maxWidth="sm"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (!advert) {
    return (
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
          <Typography variant="h5">Annonse ikke funnet.</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.back()}
            sx={{ mt: 2 }}
          >
            Gå tilbake
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {advert.getImageUrl() && (
          <img
            src={advert.getImageUrl()}
            alt="Annonsebilde"
            style={{
              maxWidth: "100%",
              maxHeight: "400px",
              objectFit: "cover",
              borderRadius: "10px",
              marginBottom: "20px",
            }}
          />
        )}

        {isEditing ? (
          <>
            <TextField
              fullWidth
              name="title"
              label="Tittel"
              variant="outlined"
              sx={{ mb: 2 }}
              value={formData.title}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              name="tekstblokk"
              label="Beskrivelse"
              variant="outlined"
              multiline
              rows={4}
              sx={{ mb: 2 }}
              value={formData.tekstblokk}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              name="price"
              label="Pris (NOK)"
              variant="outlined"
              type="number"
              sx={{ mb: 2 }}
              value={formData.price}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              name="tag"
              label="Kategori (tag)"
              variant="outlined"
              sx={{ mb: 2 }}
              value={formData.tag}
              onChange={handleChange}
            />

            <CityDropdown
              selectedCity={formData.city}
              setSelectedCity={(city: string) =>
                setFormData((prev) => ({ ...prev, city }))
              }
            />

            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                sx={{ mr: 2 }}
                onClick={handleSave}
              >
                Lagre Endringer
              </Button>
              <Button
                variant="contained"
                sx={{ mr: 2, bgcolor: "#004d40", "&:hover": { bgcolor: "#00332e" } }}
                onClick={() => setIsEditing(false)}
              >
                Avbryt
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleDelete}
              >
                Slett
              </Button>
            </Box>
          </>
        ) : (
          <>
            <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2 }}>
              {advert.getTitle()}
            </Typography>
            <Typography sx={{ mb: 2 }}>
              {advert.getTekstblokk()}
            </Typography>
            <Typography
              sx={{ fontWeight: "bold", color: "#B22222", mb: 2 }}
            >
              Pris: {advert.getPrice()} NOK
            </Typography>
            <Typography sx={{ color: "gray", mb: 2 }}>
              Utleier: {advert.getUser().getUsername()}
            </Typography>
            <Typography sx={{ color: "gray", mb: 4 }}>
              Kontakt: {advert.getEmail()}
            </Typography>
            {advert.getCity() && (
              <Typography sx={{ mb: 2 }}>
                Sted: {advert.getCity()}
              </Typography>
            )}
            <Box sx={{ mt: 2 }}>
              {user?.email === advert.getEmail() && (
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mr: 2 }}
                  onClick={() => setIsEditing(true)}
                >
                  Rediger
                </Button>
              )}
              <Button
                variant="contained"
                sx={{
                  mr: 2,
                  bgcolor: "#004d40",
                  "&:hover": { bgcolor: "#00332e" },
                }}
                onClick={() => router.back()}
              >
                Tilbake
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
}
