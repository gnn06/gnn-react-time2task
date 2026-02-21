import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FilterPanel from './filter-panel'
import { taskPredicateMulti, taskPredicateDisable } from '../data/task'

// Configuration de test pour FilterPanel
const mockFilterConfig = [
  {
    key: 'activity',
    label: 'Activité',
    options: ['act1', 'act2', 'act3', 'act4'],
    valueLabels: {
      'act1': 'activité 1',
      'act2': 'activité 2',
      'act3': 'activité 3',
      'act4': 'activité 4'
    }
  },
  {
    key: 'status',
    label: 'Statut',
    options: ['todo', 'done', 'fait'],
    valueLabels: {
      'todo': 'À faire',
      'done': 'Terminé',
      'fait': 'Fait'
    }
  },
  {
    key: 'favorite',
    label: 'Favori',
    options: [true, false],
    valueLabels: { true: 'Favori', false: 'Non favori' }
  },
  {
    key: 'isMulti',
    label: 'isMulti',
    type: 'slotexpr',
    options: [true, false],
    valueLabels: { true: 'plusieurs créneau' },
    predicate: taskPredicateMulti
  },
  {
    key: 'isDisable',
    label: 'isDisable',
    type: 'slotexpr',
    options: [true, false],
    valueLabels: { true: 'contient disabled' },
    predicate: taskPredicateDisable
  }
]

describe('FilterPanel', () => {
  let mockSetFilters

  beforeEach(() => {
    mockSetFilters = vi.fn()
  })

  test('should render filter panel with main button', () => {
    render(
      <FilterPanel
        filterConfig={mockFilterConfig}
        filters={{}}
        setFilters={mockSetFilters}
      />
    )

    expect(screen.getByText('Filtres')).toBeInTheDocument()
  })

  test('should open main menu when clicking filter button', async () => {
    const user = userEvent.setup()
    
    render(
      <FilterPanel
        filterConfig={mockFilterConfig}
        filters={{}}
        setFilters={mockSetFilters}
      />
    )

    const filterButton = screen.getByText('Filtres')
    await user.click(filterButton)

    expect(screen.getByText('Statut')).toBeInTheDocument()
    expect(screen.getByText('Favori')).toBeInTheDocument()
  })

  test('should open submenu when clicking on filter category', async () => {
    const user = userEvent.setup()
    
    render(
      <FilterPanel
        filterConfig={mockFilterConfig}
        filters={{}}
        setFilters={mockSetFilters}
      />
    )

    // Ouvrir le menu principal
    const filterButton = screen.getByText('Filtres')
    await user.click(filterButton)

    // Ouvrir le sous-menu Statut
    const statusMenuItem = screen.getByText('Statut')
    await user.click(statusMenuItem)

    // Vérifier que les options sont affichées
    expect(screen.getByText('À faire')).toBeInTheDocument()
    expect(screen.getByText('Terminé')).toBeInTheDocument()
    expect(screen.getByText('Fait')).toBeInTheDocument()
  })

  test('should call setFilters when clicking on a filter option', async () => {
    const user = userEvent.setup()
    
    render(
      <FilterPanel
        filterConfig={mockFilterConfig}
        filters={{}}
        setFilters={mockSetFilters}
      />
    )

    // Ouvrir le menu principal
    const filterButton = screen.getByText('Filtres')
    await user.click(filterButton)

    // Ouvrir le sous-menu Statut
    const statusMenuItem = screen.getByText('Statut')
    await user.click(statusMenuItem)

    // Cliquer sur l'option "À faire"
    const todoOption = screen.getByText('À faire')
    // const todoOption = screen.getByRole('checkbox', { name: 'À faire' })
    // await user.click(todoOption)
    fireEvent.click(todoOption);
    /* * userEvent.click simule un clic "réaliste" avec toute la chaîne d'événements 
     *   (pointermove, mouseover, mousedown, mouseup, click...) 
     *   qui remonte via le bubbling et se fait intercepter par NestedMenuItem.
     * * fireEvent.click déclenche uniquement l'événement click directement sur l'<input>, 
     *   sans bubbling simulé, ce qui bypasse l'interception de NestedMenuItem
     * Dans jsdom avec userEvent, tout est simulé séquentiellement via le système d'événements 
     * synthétiques de React, sans cette priorité native du change sur le click. Le click 
     * remonte immédiatement et se fait intercepter par NestedMenuItem avant que le onChange ne
     *  soit déclenché. C'est une limitation fondamentale de jsdom : il ne reproduit pas
     *  fidèlement l'ordre et la priorité des événements natifs du navigateur, notamment pour
     *  les éléments de formulaire comme les checkboxes.
    */


    // Vérifier que setFilters a été appelé avec les bonnes valeurs
    expect(mockSetFilters).toHaveBeenCalledWith({
      status: ['todo']
    })
  })

  test('should add multiple values to same filter key', async () => {
    const user = userEvent.setup()
    
    render(
      <FilterPanel
        filterConfig={mockFilterConfig}
        filters={{
      status: ['todo']
    }}
        setFilters={mockSetFilters}
      />
    )

    // Ouvrir le menu principal
    const filterButton = screen.getByText('Filtres')
    await user.click(filterButton)

    // Ouvrir le sous-menu Statut
    const statusMenuItem = screen.getByText('Statut')
    await user.click(statusMenuItem)

    // Cliquer sur "Terminé"
    const doneOption = screen.getByText('Terminé')
    fireEvent.click(doneOption);

    // Vérifier le deuxième appel avec les deux valeurs
    expect(mockSetFilters).toHaveBeenCalledWith({
      status: ['todo', 'done']
    })
  })

  test('should remove value when clicking on already selected option', async () => {
    const user = userEvent.setup()
    
    render(
      <FilterPanel
        filterConfig={mockFilterConfig}
        filters={{ status: ['todo'] }}
        setFilters={mockSetFilters}
      />
    )

    // Ouvrir le menu principal
    const filterButton = screen.getByText('Filtres')
    await user.click(filterButton)

    // Ouvrir le sous-menu Statut
    const statusMenuItem = screen.getByText('Statut')
    await user.click(statusMenuItem)

    // Cliquer sur "À faire" pour le désélectionner
    const todoOption = screen.getByText('À faire')
    fireEvent.click(todoOption)

    // Vérifier que la valeur a été retirée
    expect(mockSetFilters).toHaveBeenCalledWith({
      status: []
    })
  })

  test('should reset all filters when clicking reset button', async () => {
    const user = userEvent.setup()
    
    render(
      <FilterPanel
        filterConfig={mockFilterConfig}
        filters={{ status: ['todo'], favorite: [true] }}
        setFilters={mockSetFilters}
      />
    )

    // Ouvrir le menu principal
    const filterButton = screen.getByText('Filtres')
    await user.click(filterButton)

    // Cliquer sur le bouton Réinitialiser
    const resetButton = screen.getByText('Réinitialiser')
    await user.click(resetButton)

    // Vérifier que tous les filtres ont été réinitialisés
    expect(mockSetFilters).toHaveBeenCalledWith({})
  })

  test('should show filter count in chip when filters are active', () => {
    render(
      <FilterPanel
        filterConfig={mockFilterConfig}
        filters={{ status: ['todo', 'done'], favorite: [true] }}
        setFilters={mockSetFilters}
      />
    )

    // Vérifier que le chip affiche le nombre total de filtres actifs
    const filterChip = screen.getByText('3') // 2 status + 1 favorite
    expect(filterChip).toBeInTheDocument()
  })

  test('should show "prédicat" menu when slotexpr filters exist', async () => {
    const user = userEvent.setup()
    
    render(
      <FilterPanel
        filterConfig={mockFilterConfig}
        filters={{}}
        setFilters={mockSetFilters}
      />
    )

    // Ouvrir le menu principal
    const filterButton = screen.getByText('Filtres')
    await user.click(filterButton)

    // Vérifier que le menu "prédicat" est affiché
    expect(screen.getByText('créneau')).toBeInTheDocument()
  })

  test('should open "prédicat" submenu when clicking on it', async () => {
    const user = userEvent.setup()
    
    render(
      <FilterPanel
        filterConfig={mockFilterConfig}
        filters={{}}
        setFilters={mockSetFilters}
      />
    )

    // Ouvrir le menu principal
    const filterButton = screen.getByText('Filtres')
    await user.click(filterButton)

    // Ouvrir le sous-menu "prédicat"
    const predicatMenuItem = screen.getByText('créneau')
    await user.click(predicatMenuItem)

    // Vérifier que les options de prédicats sont affichées
    expect(screen.getByText('plusieurs créneau')).toBeInTheDocument()
    expect(screen.getByText('contient disabled')).toBeInTheDocument()
  })

  test('should activate predicate when clicking on it', async () => {
    const user = userEvent.setup()
    
    render(
      <FilterPanel
        filterConfig={mockFilterConfig}
        filters={{}}
        setFilters={mockSetFilters}
      />
    )

    // Ouvrir le menu principal
    const filterButton = screen.getByText('Filtres')
    await user.click(filterButton)

    // Ouvrir le sous-menu "prédicat"
    const predicatMenuItem = screen.getByText('créneau')
    await user.click(predicatMenuItem)

    // Cliquer sur "plusieurs créneau"
    const multiOption = screen.getByText('plusieurs créneau')
    fireEvent.click(multiOption)

    // Vérifier que setFilters a été appelé avec le prédicat
    expect(mockSetFilters).toHaveBeenCalledWith({
      isMulti: taskPredicateMulti
    })
  })

  test('should deactivate predicate when clicking on already active one', async () => {
    const user = userEvent.setup()
    
    render(
      <FilterPanel
        filterConfig={mockFilterConfig}
        filters={{ isMulti: taskPredicateMulti }}
        setFilters={mockSetFilters}
      />
    )

    // Ouvrir le menu principal
    const filterButton = screen.getByText('Filtres')
    await user.click(filterButton)

    // Ouvrir le sous-menu "prédicat"
    const predicatMenuItem = screen.getByText('créneau')
    await user.click(predicatMenuItem)

    // Cliquer sur "plusieurs créneau" pour le désactiver
    const multiOption = screen.getByText('plusieurs créneau')
    fireEvent.click(multiOption)

    // Vérifier que setFilters a été appelé avec null
    expect(mockSetFilters).toHaveBeenCalledWith({
      isMulti: null
    })
  })

  test('should show active predicate count in "prédicat" chip', () => {
    render(
      <FilterPanel
        filterConfig={mockFilterConfig}
        filters={{ isMulti: taskPredicateMulti, isDisable: taskPredicateDisable }}
        setFilters={mockSetFilters}
      />
    )

    // Vérifier que le chip "prédicat" affiche le nombre de prédicats actifs
    const predicatChip = screen.getByText('2')
    expect(predicatChip).toBeInTheDocument()
  })

  test('should handle boolean filter values', async () => {
    const user = userEvent.setup()
    
    render(
      <FilterPanel
        filterConfig={mockFilterConfig}
        filters={{}}
        setFilters={mockSetFilters}
      />
    )

    // Ouvrir le menu principal
    const filterButton = screen.getByText('Filtres')
    await user.click(filterButton)

    // Ouvrir le sous-menu favori (utiliser le MenuItem dans le menu principal)
    const favoriteMenuItems = screen.getAllByText('Favori')
    const favoriteMenuItem = favoriteMenuItems[0] // Le premier est dans le menu principal
    await user.click(favoriteMenuItem)

    // Cliquer sur l'option "favori" dans le sous-menu (utiliser le checkbox)
    const favoriteCheckbox = screen.getByRole('checkbox', { name: 'Favori' })
    fireEvent.click(favoriteCheckbox)

    // Vérifier que setFilters a été appelé avec la valeur booléenne
    expect(mockSetFilters).toHaveBeenCalledWith({
      favorite: [true]
    })
  })

  describe('none and all options', () => {
    test('should show "Aucune" and "Toutes" options for filters with 3+ values', async () => {
      const user = userEvent.setup()

      render(
        <FilterPanel
          filterConfig={mockFilterConfig}
          filters={{}}
          setFilters={mockSetFilters}
        />
      )

      // Ouvrir le menu principal
      const filterButton = screen.getByText('Filtres')
      await user.click(filterButton)

      // Ouvrir le sous-menu Statut (qui a 3 valeurs)
      const statusMenuItem = screen.getByText('Activité')
      await user.click(statusMenuItem)

      // Vérifier que les options "Aucune" et "Toutes" sont affichées
      expect(screen.getByText('Aucun')).toBeInTheDocument()
      expect(screen.getByText('Tout')).toBeInTheDocument()
    })

    test('should not show "Aucune" and "Toutes" options for filters with less than 3 values', async () => {
      const user = userEvent.setup();
      const mockFilterConfigLocal = [
        {
          key: 'status',
          label: 'Statut',
          options: ['todo', 'done'],
          valueLabels: {
            'todo': 'À faire',
            'done': 'Terminé'
          }
        }
      ];

      render(
        <FilterPanel
          filterConfig={mockFilterConfigLocal}
          filters={{}}
          setFilters={mockSetFilters}
        />
      )

      // Ouvrir le menu principal
      const filterButton = screen.getByText('Filtres')
      await user.click(filterButton)

      // Ouvrir le sous-menu Favori (qui a 2 valeurs: true, false)
      const favoriteMenuItems = screen.getAllByText('Statut')
      const favoriteMenuItem = favoriteMenuItems[0] // Le premier est dans le menu principal
      await user.click(favoriteMenuItem)

      // Vérifier que les options "Aucune" et "Toutes" ne sont pas affichées
      expect(screen.queryByText('Aucune')).not.toBeInTheDocument()
      expect(screen.queryByText('Toutes')).not.toBeInTheDocument()
    })
    test('should select all values when clicking "Toutes" option', async () => {
      const user = userEvent.setup()

      render(
        <FilterPanel
          filterConfig={mockFilterConfig}
          filters={{}}
          setFilters={mockSetFilters}
        />
      )

      // Ouvrir le menu principal
      const filterButton = screen.getByText('Filtres')
      await user.click(filterButton)

      // Ouvrir le sous-menu Statut
      const statusMenuItem = screen.getByText('Activité')
      await user.click(statusMenuItem)

      // Cliquer sur l'option "Toutes"
      const toutesOption = screen.getByText('Tout')
      fireEvent.click(toutesOption)

      // Vérifier que toutes les valeurs ont été sélectionnées
      expect(mockSetFilters).toHaveBeenCalledWith({
        activity: ['act1', 'act2', 'act3', 'act4']
      })
    })

    test('should clear all values when clicking "Aucune" option', async () => {
      const user = userEvent.setup()

      render(
        <FilterPanel
          filterConfig={mockFilterConfig}
          filters={{ activity: ['act1', 'act2'] }}
          setFilters={mockSetFilters}
        />
      )

      // Ouvrir le menu principal
      const filterButton = screen.getByText('Filtres')
      await user.click(filterButton)

      // Ouvrir le sous-menu Statut
      const statusMenuItem = screen.getByText('Activité')
      await user.click(statusMenuItem)

      // Cliquer sur l'option "Aucune"
      const aucuneOption = screen.getByText('Aucun')
      fireEvent.click(aucuneOption)

      // Vérifier que toutes les valeurs ont été désélectionnées
      expect(mockSetFilters).toHaveBeenCalledWith({
        activity: []
      })
    })

    test('should check "Aucune" checkbox when no values are selected', async () => {
      const user = userEvent.setup()

      render(
        <FilterPanel
          filterConfig={mockFilterConfig}
          filters={{ status: [] }}
          setFilters={mockSetFilters}
        />
      )

      // Ouvrir le menu principal
      const filterButton = screen.getByText('Filtres')
      await user.click(filterButton)

      // Ouvrir le sous-menu Statut
      const statusMenuItem = screen.getByText('Activité')
      await user.click(statusMenuItem)

      // Vérifier que la checkbox "Aucune" est cochée
      const aucuneCheckbox = screen.getByRole('checkbox', { name: 'Aucun' })
      expect(aucuneCheckbox).toBeChecked()
    })

    test('should check "Toutes" checkbox when all values are selected', async () => {
      const user = userEvent.setup()

      render(
        <FilterPanel
          filterConfig={mockFilterConfig}
          filters={{ activity: ['act1', 'act2', 'act3', 'act4'] }}
          setFilters={mockSetFilters}
        />
      )

      // Ouvrir le menu principal
      const filterButton = screen.getByText('Filtres')
      await user.click(filterButton)

      // Ouvrir le sous-menu Statut
      const statusMenuItem = screen.getByText('Activité')
      await user.click(statusMenuItem)

      // Vérifier que la checkbox "Toutes" est cochée
      const toutesCheckbox = screen.getByRole('checkbox', { name: 'Tout' })
      expect(toutesCheckbox).toBeChecked()
    })

    test('should not check "Aucune" or "Toutes" when some values are selected', async () => {
      const user = userEvent.setup()

      render(
        <FilterPanel
          filterConfig={mockFilterConfig}
          filters={{ activity: ['act1', 'act2'] }}
          setFilters={mockSetFilters}
        />
      )

      // Ouvrir le menu principal
      const filterButton = screen.getByText('Filtres')
      await user.click(filterButton)

      // Ouvrir le sous-menu Statut
      const statusMenuItem = screen.getByText('Activité')
      await user.click(statusMenuItem)

      // Vérifier que ni "Aucune" ni "Toutes" ne sont cochées
      const aucuneCheckbox = screen.getByRole('checkbox', { name: 'Aucun' })
      const toutesCheckbox = screen.getByRole('checkbox', { name: 'Tout' })
      expect(aucuneCheckbox).not.toBeChecked()
      expect(toutesCheckbox).not.toBeChecked()
    })

  });
})
