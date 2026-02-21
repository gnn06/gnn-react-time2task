import { GenericFilterSet, SlotExprPredicate, FilterValue } from '../types/filters';

/**
 * Crée une fonction de filtrage générique à partir d'un GenericFilterSet
 * @param filters - Ensemble de filtres à appliquer
 * @returns {function} - Fonction qui prend une tâche et retourne un boolean
 */
export function makeGenericFilter(filters: GenericFilterSet) {
  return function(task: any): boolean {
    // Si aucun filtre n'est défini, toutes les tâches passent
    if (!filters || Object.keys(filters).length === 0) {
      return true;
    }

    // Pour chaque clé de filtre, vérifier si la tâche correspond
    for (const [key, values] of Object.entries(filters)) {
      // Si aucune valeur pour cette clé, ignorer ce filtre
      if (!values) {
        continue;
      }

      // Vérifier si la valeur est un prédicat slotExpr
      if (typeof values === 'function') {
        // Filtrage de type slotexpr: appliquer le prédicat
        const predicate = values as SlotExprPredicate;
        if (!predicate(task)) {
          return false;
        }
      } else {
        // Filtrage de type property: vérifier les propriétés de la tâche
        if (values.length === 0) {
          continue;
        }

        if (!task.hasOwnProperty(key)) {
          return false;
        }

        const taskValue = task[key];

        // Vérifier si la valeur de la tâche correspond à une des valeurs filtrées
        const matchesFilter = values.some((filterValue: FilterValue) => {
          // Gérer différents types de comparaison
          if (typeof filterValue === 'string' && typeof taskValue === 'string') {
            return taskValue === filterValue;
          }
          if (typeof filterValue === 'number' && typeof taskValue === 'number') {
            return taskValue === filterValue;
          }
          if (typeof filterValue === 'boolean' && typeof taskValue === 'boolean') {
            return taskValue === filterValue;
          }
          // Pour les comparaisons mixtes (string vs number), convertir en string
          return String(taskValue) === String(filterValue);
        });

        // Si la tâche ne correspond à aucune des valeurs pour cette clé, elle est rejetée
        if (!matchesFilter) {
          return false;
        }
      }
    }

    // La tâche passe tous les filtres
    return true;
  };
}

/**
 * Filtre un tableau de tâches en utilisant un GenericFilterSet
 * @param tasks - Tableau de tâches à filtrer
 * @param filters - Ensemble de filtres à appliquer
 * @returns {Array} - Tableau des tâches qui passent les filtres
 */
export function filterTasks(tasks: any[], filters: GenericFilterSet): any[] {
  const filterFunc = makeGenericFilter(filters);
  return tasks.filter(filterFunc);
}
