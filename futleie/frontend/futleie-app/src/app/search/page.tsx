"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import SearchService from "../../../services/SearchService";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";


export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<any[]>([]);
  const query = searchParams.get("q") || "";

  useEffect(() => {
    if (query) {
      SearchService.search(query).then(setResults);
    }
  }, [query]);

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Søkeresultater for: {query.toString()}
      </Typography>
      {results.length === 0 ? (
        <Typography variant="body1">Ingen resultater funnet.</Typography>
      ) : (
        results.map((result, index) => (
          <Card key={index} className="mb-4">
            <CardContent>
              <Typography variant="h6">{result.title || result.username}</Typography>
              {result.tekstblokk && (
                <Typography variant="body2">{result.tekstblokk}</Typography>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
