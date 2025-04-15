"use client";

import React, { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Paper from "@mui/material/Paper";
import { useRouter } from "next/navigation";
import SearchService from "../../../services/SearchService";

export default function SearchBar() {
  const [searchWord, setSearchWord] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();

  const handleSearchChange = async (value: string) => {
    setSearchWord(value);
    if (value.trim()) {
      const results = await SearchService.search(value.trim());
      setSearchResults(results);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSearchSubmit = () => {
    router.push(`/search?q=${encodeURIComponent(searchWord)}`);
    setShowSuggestions(false);
  };

  return (
    <div className="relative w-96">
      <TextField
        fullWidth
        label="Søk i annonser"
        variant="outlined"
        value={searchWord}
        onChange={(e) => handleSearchChange(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && handleSearchSubmit()}
      />
      {showSuggestions && searchResults.length > 0 && (
        <Paper elevation={3} className="absolute w-full bg-white z-10 mt-1">
          <List>
            {searchResults.map((result, index) => (
              <ListItem
                key={index}
                button
                onClick={() => router.push(`/search?q=${encodeURIComponent(searchWord)}`)}
              >
                {result.title || result.username}
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </div>
  );
}
