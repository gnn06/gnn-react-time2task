import { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHotkeys } from 'react-hotkeys-hook'
import { Stack } from "@mui/material";
import _ from 'lodash';

import { setTaskFilter, setActivity, setFilterIsMulti, setFilterIsDisable, setFilterGeneric, setFilterSlot } from "../features/taskSlice";
import { SLOTIDS_LST } from "../data/slot-id";
import { STATUS_LST } from "./task-status";
import { useGetActivitiesQuery } from "../features/apiSlice";

import SyntaxInput from './syntax-input';
import DialogHelpExpression from "./button-help-expression";
import {FILTER_KEYWORDS, makeFilterExpr} from '../data/filter-engine'
import FilterPanel from './filter-panel';
import SlotPickerButton from './slot-picker-button';
import { taskPredicateDisable, taskPredicateMulti, makeTaskPredicateImprecise } from "../data/task";

// Fonction pour générer la configuration des filtres avec les activités
function createFilterConfig(activities = [], levelMaxIncluded = null) {
  const baseConfig = [
    {
      key: 'status',
      label: 'status',
      type: 'multiselect',
      options: STATUS_LST.map(status => status.value),
      valueLabels: STATUS_LST.reduce((acc, status) => {
        acc[status.value] = status.value;
        return acc;
      }, {})
    },
    {
      key: 'favorite',
      label: 'favori',
      type: 'multiselect',
      options: [true, false],
      valueLabels: { true: 'favori', false: 'Non favori' }
    },
    {
      key: 'isMulti',
      label: 'isMulti',
      type: 'slotexpr',
      options: [true, false],
      valueLabels: { true: 'plusieurs créneaux' },
      predicate: taskPredicateMulti
    },
    {
      key: 'isDisable',
      label: 'isDisable',
      type: 'slotexpr',
      options: [true, false],
      valueLabels: { true: 'contient disabled' },
      predicate: taskPredicateDisable
    },
    {
      key: 'isImprecise',
      label: 'isImprecise',
      type: 'slotexpr',
      options: [true, false],
      valueLabels: { true: 'tâche imprécise' },
      predicate: makeTaskPredicateImprecise(levelMaxIncluded)
    }
  ];

  // Ajouter le filtre activity si des activités sont disponibles
  if (activities && activities.length > 0) {
    activities = _.orderBy(activities, ['label']);
    const activityOptions = activities.map(activity => activity.id);
    const activityValueLabels = activities.reduce((acc, activity) => {
      acc[activity.id] = activity.label || `Activity ${activity.id}`;
      return acc;
    }, {});

    baseConfig.push({
      key: 'activity',
      label: 'activité',
      type: 'multiselect',
      options: [...activityOptions, null],
      valueLabels: { ...activityValueLabels, null: 'sans activité' }
    });
  }

  // Trier alphabétiquement les filtres par label
  return baseConfig.sort((a, b) => a.label.localeCompare(b.label));
}

export default function TaskFilter() {
    
    const dispatch = useDispatch();
    const { data: activities, isSuccess: isActivitiesSuccess } = useGetActivitiesQuery();
    const [error, setError] = useState('')
    const [isMultiFilter, setIsMultiFilter] = useState(false)
    const [isDisableFilter, setIsDisableFilter] = useState(false)
    const filterExpr = useSelector(state => state.tasks.currentFilter.expression);
    const genericFilters = useSelector(state => state.tasks.currentFilter.genericFilters) || {};
    const filterSlot = useSelector(state => state.tasks.currentFilter.slot);    
    const activity = useSelector(state => state.tasks.currentActivity);

    const filterRef = useRef(null);

    // Générer la configuration des filtres avec les activités dynamiques
    // Seulement si les activités sont chargées avec succès
    const levelMaxIncluded = useSelector(state => state.tasks.slotViewFilterConf.levelMaxIncluded);
    const filterConfig = createFilterConfig(isActivitiesSuccess ? activities : [], levelMaxIncluded);

    const onInputChange = (e) => {
        const filter = e;
        const {func, error} = makeFilterExpr(filter)
        if (error) {
            setError(error)
        } else {
            dispatch(setTaskFilter({filter}));
            setError('')
        }
    }
    
    const filters = SLOTIDS_LST.concat(FILTER_KEYWORDS);

    const onActivityChange = (activity) => {
        dispatch(setActivity({activity}));
    }

    const onIsMultiFilter = () => {
        dispatch(setFilterIsMulti({filter: !isMultiFilter}))
        setIsMultiFilter(!isMultiFilter)
    }

    const onIsDisableFilter = () => {
        dispatch(setFilterIsDisable({filter: !isDisableFilter}))
        setIsDisableFilter(!isDisableFilter)
    }

    const onGenericFilterChange = (genericFilters) => {
        dispatch(setFilterGeneric(genericFilters));
    }

    // TODO (option B) : le prédicat isImprecise est une closure sur levelMaxIncluded.
    // Quand le niveau change, on recrée le prédicat si le filtre est actif.
    // Solution définitive : stocker un booléen dans Redux et construire le prédicat
    // dynamiquement dans le moteur de filtrage en lui passant la conf de vue.
    useEffect(() => {
        if (typeof genericFilters.isImprecise === 'function') {
            dispatch(setFilterGeneric({
                ...genericFilters,
                isImprecise: makeTaskPredicateImprecise(levelMaxIncluded)
            }));
        }
    }, [levelMaxIncluded]);

    const onSlotChange = (slotExpr) => {
        dispatch(setFilterSlot(slotExpr));
    }

    const onCtrlK = () => {
        filterRef.current.focus();
    }
    useHotkeys('ctrl+k', onCtrlK, { preventDefault: true, enableOnFormTags: true })

    return (
        <Stack direction="row" spacing={1} >
          <label htmlFor="task-filter" className="content-center">Filtre&nbsp;:</label>        
          <div >
              <SyntaxInput id="task-filter" inputRef={filterRef} items={filters}
                  placeHolderInput={"CTRL-K | lundi, next_week mardi, " + FILTER_KEYWORDS.join(', ')}
                  closeIcon={true}
                  variant="primary"
                  onInputChange={onInputChange} initialInputValue={filterExpr}/>
              { error && <div className="m-1 text-red-500">{error}</div>}
          </div>
          <DialogHelpExpression/>            
          <SlotPickerButton selectedSlotExpr={filterSlot} onSlotChange={onSlotChange} />
          <FilterPanel filters={genericFilters} setFilters={onGenericFilterChange} filterConfig={filterConfig}/>
        </Stack>
    );
};