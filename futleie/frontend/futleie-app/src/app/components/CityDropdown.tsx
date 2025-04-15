"use client";

import { useEffect, useState } from "react";
import { fetchCities } from "services/CityService";
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";

const CityDropdown = ({ selectedCity, setSelectedCity }: { selectedCity: string, setSelectedCity: (city: string) => void }) => {
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    const getCities = async () => {
      const cityList = await fetchCities();
      setCities(cityList);
    };
    getCities();
  }, []);

  return (
    <FormControl fullWidth>
      <InputLabel>Velg sted</InputLabel>
      <Select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
        {cities.map((city) => (
          <MenuItem key={city} value={city}>
            {city}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default CityDropdown;
