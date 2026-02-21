import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
} from '@mui/material';
import { FilterList } from '@mui/icons-material';
import FilterPanel from '../filter-panel';

// Données exemple
const sampleData = [
  { id: 1, nom: 'Produit A', categorie: 'Électronique', prix: 299, disponible: true },
  { id: 2, nom: 'Produit B', categorie: 'Vêtements', prix: 49, disponible: true },
  { id: 3, nom: 'Produit C', categorie: 'Électronique', prix: 599, disponible: false },
  { id: 4, nom: 'Produit D', categorie: 'Maison', prix: 129, disponible: true },
  { id: 5, nom: 'Produit E', categorie: 'Vêtements', prix: 79, disponible: false },
  { id: 6, nom: 'Produit F', categorie: 'Maison', prix: 199, disponible: true }
];

// Configuration des filtres avec options pré-définies
const filterConfig = [
  {
    key: 'categorie',
    label: 'Catégorie',
    type: 'multiselect',
    options: ['Électronique', 'Vêtements', 'Maison']
  },
  {
    key: 'disponible',
    label: 'Disponibilité',
    type: 'multiselect',
    options: [true, false],
    valueLabels: { true: 'Disponible', false: 'Non disponible' }
  }
];


function TestFilter() {
  const [filters, setFilters] = useState({});

  // Appliquer les filtres aux données
  const filteredData = sampleData.filter(item => {
    return Object.entries(filters).every(([key, selectedValues]) => {
      if (!selectedValues || selectedValues.length === 0) return true;
      return selectedValues.includes(item[key]);
    });
  });

  const onFilterChange = (toto) => {
    console.debug(toto)
    setFilters(toto);
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <FilterList />
        <Typography variant="h4" component="h1">
          Système de Filtrage
        </Typography>
      </Box>

      {/* Panel de filtres */}
      <FilterPanel
        filterConfig={filterConfig}
        filters={filters}
        setFilters={onFilterChange}
      />

      {/* Résultats filtrés */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Résultats ({filteredData.length})
        </Typography>
        <Stack spacing={2}>
          {filteredData.map(item => (
            <Paper key={item.id} variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {item.nom}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Catégorie: {item.categorie} | Prix: {item.prix}€ | 
                {item.disponible ? ' ✓ Disponible' : ' ✗ Non disponible'}
              </Typography>
            </Paper>
          ))}
          {filteredData.length === 0 && (
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                Aucun résultat ne correspond aux filtres sélectionnés
              </Typography>
            </Paper>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}

export default TestFilter;