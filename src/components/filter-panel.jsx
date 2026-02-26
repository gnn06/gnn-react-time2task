import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Checkbox,
  FormControlLabel,
  Stack,
  Menu,
  MenuItem
} from '@mui/material';
import { FilterList, Clear, KeyboardArrowDown, KeyboardArrowRight } from '@mui/icons-material';
import { NestedMenuItem } from 'mui-nested-menu';

/**
 * 
 * @param {Object} props.filters - État des filtres appliqués
 *   - Clé: string (correspond à filterConfig[].key)
 *   - Valeur: Array<string|number|boolean> (valeurs sélectionnées pour ce filtre)
 *   @example
 *   {
 *     categorie: ['Électronique', 'Vêtements'],
 *     disponible: [true]
 *   }
 * 
 */
function FilterPanel({
  filterConfig,
  filters,
  setFilters
}) {
  const [mainMenuAnchor, setMainMenuAnchor] = useState(null);
  
  const isMainMenuOpen = Boolean(mainMenuAnchor);

  // Fermer le menu principal
  const closeMainMenu = () => {
    setMainMenuAnchor(null);
  };

  // Gérer le changement de filtre
  const handleFilterChange = (filterKey, value, filterType) => {
    if (filterType === 'slotexpr') {
      // Pour les filtres slotexpr, la valeur est un prédicat
      // On active/désactive le prédicat
      const currentPredicate = filters[filterKey];
      const newPredicate = currentPredicate ? null : value;
      
      setFilters({
        ...filters,
        [filterKey]: newPredicate
      });
    } else if (value === 'none') {
      // Pour l'option 'none', on déselectionne toutes les valeurs
      setFilters({
        ...filters,
        [filterKey]: []
      });
    } else if (value === 'all') {
      // Pour l'option 'all', on sélectionne toutes les valeurs disponibles
      const config = filterConfig.find(f => f.key === filterKey);
      const allValues = config?.options || [];
      setFilters({
        ...filters,
        [filterKey]: allValues
      });
    } else {
      // Pour les filtres property (comportement existant)
      const currentValues = filters[filterKey] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      setFilters({
        ...filters,
        [filterKey]: newValues
      });
    }
  };

  // Réinitialiser tous les filtres
  const resetFilters = () => {
    setFilters({});
  };

  // Composant réutilisable pour les MenuItem avec checkbox
  const CheckboxMenuItem = ({ checked, onChange, label, sx = {} }) => (
    <MenuItem>
      <FormControlLabel
        control={
          <Checkbox 
            checked={checked}
            size="small"
            onChange={onChange}
          />
        }
        label={label}        
        sx={{mt:0}}
      />
    </MenuItem>
  );

  // Obtenir le label d'affichage pour une valeur
  const getValueLabel = (filterKey, value) => {
    const config = filterConfig.find(f => f.key === filterKey);
    if (config?.valueLabels) {
      return config.valueLabels[value] || String(value);
    }
    return String(value);
  };

  // Calculer le nombre de filtres actifs
  const getActiveFilterCount = () => {
    return Object.values(filters).reduce((acc, vals) => {
      if (typeof vals === 'function') {
        return acc + 1; // Filtre slotexpr compte comme 1
      }
      return acc + (vals?.length || 0); // Filtre property
    }, 0);
  };

  // Obtenir les filtres slotexpr actifs
  const getActiveSlotExprFilters = () => {
    return filterConfig.filter(f => f.type === 'slotexpr').filter(f => typeof filters[f.key] === 'function');
  };

  const hasActiveFilters = getActiveFilterCount() > 0;

  return (
    <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>

        {/* Bouton principal Filtres */}
        <Button
          variant="contained"
          startIcon={<FilterList />}
          endIcon={ hasActiveFilters ? <Clear onClick={(e) => { e.stopPropagation(); resetFilters(); }}/> : <KeyboardArrowDown /> }
          onClick={(e) => setMainMenuAnchor(e.currentTarget)}
          sx={{ minWidth: 150 }}
        >
          Filtres
          {hasActiveFilters && (
            <Chip 
              label={getActiveFilterCount()} 
              size="small" 
              color="secondary"
              sx={{ ml: 1 }}
            />
          )}
        </Button>

        {/* Menu principal */}
        <Menu
          anchorEl={mainMenuAnchor}
          open={isMainMenuOpen}
          onClose={closeMainMenu}
          PaperProps={{
            sx: { minWidth: 300 }
          }}
        >
          {filterConfig.map(filter => {
            const filterValue = filters[filter.key];
            const isSlotExprType = filter.type === 'slotexpr';
            const selectedValues = !isSlotExprType ? (filterValue || []) : [];

            // Skip les filtres slotexpr, ils seront gérés dans le menu "prédicat"
            if (isSlotExprType) {
              return null;
            }

            return (
              <NestedMenuItem
                key={filter.key}
                label={<>{filter.label} {selectedValues.length > 0 ? (
                      <Chip 
                        label={selectedValues.length} 
                        size="small" 
                        color="primary"
                        sx={{ ml: 1 }}
                      />
                    ) : null}</>}
                rightIcon={<KeyboardArrowRight />}
                parentMenuOpen={isMainMenuOpen}
                sx={{ py:1.5, px:1 }}
              >
                {/* Pour les filtres property (comportement existant) */}
                {filter.options.map(value => (
                  <CheckboxMenuItem
                    key={String(value)}
                    checked={selectedValues.includes(value)}
                    onChange={() => handleFilterChange(filter.key, value, filter.type)}
                    label={getValueLabel(filter.key, value)}
                  />
                ))}
                
                {/* Options 'none' et 'all' pour les filtres property (uniquement si >= 3 valeurs) */}
                {filter.options.length >= 3 && (
                  <>
                    {/* Séparateur */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mx: 1 }} />
                    <CheckboxMenuItem
                      checked={selectedValues.length === 0}
                      onChange={() => handleFilterChange(filter.key, 'none', filter.type)}
                      label="Aucun"
                      sx={{ fontWeight: 'bold' }}
                    />
                    <CheckboxMenuItem
                      checked={selectedValues.length === filter.options.length}
                      onChange={() => handleFilterChange(filter.key, 'all', filter.type)}
                      label="Tout"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </>
                )}
              </NestedMenuItem>
            );
          })}
          
          {/* Menu "prédicat" pour tous les filtres slotexpr */}
          {filterConfig.some(filter => filter.type === 'slotexpr') && (
            <NestedMenuItem
              label={<>créneau {getActiveSlotExprFilters().length > 0 ? <Chip 
                  label={getActiveSlotExprFilters().length} 
                  size="small" 
                  color="primary"
                /> : null}</>}
              rightIcon={<KeyboardArrowRight />}
              parentMenuOpen={isMainMenuOpen}
              sx={{ py:1.5, px:1 }}
            >
              {filterConfig.filter(filter => filter.type === 'slotexpr').map(filter => {
                const isSlotExprActive = typeof filters[filter.key] === 'function';
                return (
                  <CheckboxMenuItem
                    key={filter.key}
                    checked={isSlotExprActive}
                    onChange={() => handleFilterChange(filter.key, filter.predicate, filter.type)}
                    label={filter.valueLabels?.[true] || filter.label}
                  />
                );
              })}
            </NestedMenuItem>
          )}
        </Menu>
      </Stack>
  );
}

export default FilterPanel;