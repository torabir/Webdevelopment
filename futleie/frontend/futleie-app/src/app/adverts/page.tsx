"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Paper,
  Box,
  Typography,
  CircularProgress,
  TextField,
  Button,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { AdvertService } from "../../../services/AdvertService";
import { fetchCities } from "../../../services/CityService";
import { Advert } from "../../../logic/Advert";
import Link from "next/link";
import { useAuth } from "../components/AuthContext";
import { User } from "logic/User";

export default function AdvertsPage() {
  const { user } = useAuth();
  const [adverts, setAdverts] = useState<Advert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const [selectedAdvertCity, setSelectedAdvertCity] = useState("");

  const [newAdvertTitle, setNewAdvertTitle] = useState("");
  const [newAdvertText, setNewAdvertText] = useState("");
  const [newAdvertPrice, setNewAdvertPrice] = useState("");
  const [newAdvertTag, setNewAdvertTag] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadAdverts() {
      setLoading(true);
      try {
        const advertsList = await AdvertService.getAllAdverts();
        setAdverts(advertsList);
      } catch (error) {
        console.error("Feil ved henting av annonser:", error);
      }
      setLoading(false);
    }

    async function loadCities() {
      try {
        const cityList = await fetchCities();
        setCities(cityList);
      } catch (error) {
        console.error("Feil ved henting av byer:", error);
      }
    }

    loadAdverts();
    loadCities();
  }, []);

  const filteredAdverts = adverts.filter((advert) => {
    const matchesSearch = advert.getTitle().toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = selectedCity === "" || advert.getCity() === selectedCity;
    return matchesSearch && matchesCity;
  });

  const handleFileChange = (file: File | null) => {
    if (file) {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAddAdvert = async () => {
    if (!user || isSubmitting || !newAdvertTitle || !newAdvertPrice || !selectedAdvertCity) return;
    setIsSubmitting(true);

    try {
      const currentUser = new User(
        user.displayName || user.email || "Ukjent",
        "",
        "",
        0,
        user.email || "",
        ""
      );
      const newAdvert = new Advert(
        "",
        newAdvertTitle,
        newAdvertText,
        parseFloat(newAdvertPrice),
        currentUser,
        newAdvertTag,
        new Set(),
        user.email || "",
        "",
        selectedAdvertCity
      );

      const advertId = await AdvertService.createAdvert(newAdvert);

      if (imageFile) {
        const imageUrl = await AdvertService.uploadImage(advertId, imageFile);
        await AdvertService.updateAdvertImage(advertId, imageUrl);
      }

      const updatedAdverts = await AdvertService.getAllAdverts();
      setAdverts(updatedAdverts);
      setNewAdvertTitle("");
      setNewAdvertText("");
      setNewAdvertPrice("");
      setNewAdvertTag("");
      setSelectedAdvertCity("");
      setImageFile(null);
      setPreviewImage(null);
    } catch (error) {
      console.error("Feil ved lagring av annonse:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ mb: 6, display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
        <TextField
          fullWidth
          label="Søk etter annonse"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <FormControl fullWidth variant="outlined">
          <InputLabel id="city-select-label">Velg sted</InputLabel>
          <Select
            labelId="city-select-label"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
          >
            <MenuItem value="">Alle steder</MenuItem>
            {cities.map((city, index) => (
              <MenuItem key={`${city}-${index}`} value={city}>
                {city}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 4, textAlign: "center" }}>
        Ledige leieobjekter
      </Typography>

      {loading || isSubmitting ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : (
        <Box
          display="grid"
          gridTemplateColumns={{ xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }}
          gap={4}
          mb={6}
        >
          {filteredAdverts.length > 0 ? (
            filteredAdverts.map((advert) => (
              <Link key={advert.getId()} href={`/adverts/${advert.getId()}`} passHref>
                <Paper
                  elevation={3}
                  sx={{ padding: 2, cursor: "pointer", ":hover": { boxShadow: 6 } }}
                >
                  {advert.getImageUrl() && (
                    <img
                      src={advert.getImageUrl()}
                      alt="Annonsebilde"
                      style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                  )}
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                      {advert.getTitle()}
                    </Typography>
                    <Typography sx={{ mb: 1 }}>{advert.getTekstblokk()}</Typography>
                    <Typography sx={{ fontWeight: "bold", color: "darkred" }}>
                      Pris: {advert.getPrice()} NOK
                    </Typography>
                    <Typography sx={{ color: "gray", fontSize: "14px" }}>
                      Utleier: {advert.getUser().getUsername()}
                    </Typography>
                  </CardContent>
                </Paper>
              </Link>
            ))
          ) : (
            <Typography variant="body1">Ingen annonser funnet.</Typography>
          )}
        </Box>
      )}
      <Paper elevation={3} sx={{ padding: 4, mt: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
          Legg til ny annonse
        </Typography>

        <TextField
          fullWidth
          required
          label="Tittel"
          variant="outlined"
          sx={{ mb: 2 }}
          value={newAdvertTitle}
          onChange={(e) => setNewAdvertTitle(e.target.value)}
        />

        <TextField
          fullWidth
          label="Beskrivelse"
          variant="outlined"
          multiline
          rows={4}
          sx={{ mb: 2 }}
          value={newAdvertText}
          onChange={(e) => setNewAdvertText(e.target.value)}
        />

        <TextField
          fullWidth
          required
          label="Pris (NOK)"
          variant="outlined"
          type="number"
          value={newAdvertPrice}
          onChange={(e) => {
            const value = parseFloat(e.target.value);
            setNewAdvertPrice(isNaN(value) ? "" : Math.max(0, value).toString());
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") e.preventDefault();
          }}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Kategori (tag)"
          variant="outlined"
          sx={{ mb: 2 }}
          value={newAdvertTag}
          onChange={(e) => setNewAdvertTag(e.target.value)}
        />

        <FormControl fullWidth variant="outlined">
          <InputLabel id="advert-city-label">Velg sted</InputLabel>
          <Select
            labelId="advert-city-label"
            required
            value={selectedAdvertCity}
            sx={{ mb: 2 }}
            onChange={(e) => setSelectedAdvertCity(e.target.value)}
          >
            {cities.map((city) => (
              <MenuItem key={city} value={city}>
                {city}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box
          sx={{
            border: "2px dashed gray",
            p: 2,
            textAlign: "center",
            cursor: "pointer",
            mb: 2,
          }}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          {previewImage ? (
            <>
              <img
                src={previewImage}
                alt="Forhåndsvisning"
                style={{ maxHeight: "150px", marginBottom: "8px" }}
              />
              <Box>
                <Button
                  variant="contained" sx={{ mt: 2, bgcolor: "#004d40", "&:hover": { bgcolor: "#00332e" } }}
                  onClick={(e) => {
                    e.stopPropagation(); 
                    handleRemoveImage();
                  }}
                >
                  Fjern bilde
                </Button>
              </Box>
            </>
          ) : (
            <Typography>Drag and drop eller klikk for å velge fil</Typography>
          )}
        </Box>

        <input
          ref={fileInputRef}
          type="file"
          style={{ display: "none" }}
          accept="image/*"
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
        />

        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2, width: "100%" }}
          onClick={handleAddAdvert}
          disabled={!newAdvertTitle || !newAdvertPrice || !selectedAdvertCity || isSubmitting}
        >
          {isSubmitting ? "Lagrer..." : "Legg til annonse"}
        </Button>
      </Paper>
    </Container>
  );
}
