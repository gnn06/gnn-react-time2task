import {
  exprToSelection, selectionToExpr,
  selectionToggle, selectionShift, selectionSetRepetition, selectionSetDisable,
} from './slot-selection';

// Cf. docs/slot-picker.test.md : transitions raisonnées sur le modèle de données
// (selection: Map), indépendamment de l'UI. Harnais : expr -> évènements -> expr.
// today/tomorrow sont des feuilles localisées niveau 3 sous this_week (comme mardi).

const MONTH = 'this_month';
const WEEK = 'this_month this_week';
const TODAY = 'this_month this_week today';
const TOMORROW = 'this_month this_week tomorrow';
const TODAY_MATIN = 'this_month this_week today matin';
const TODAY_APREM = 'this_month this_week today aprem';
const TOMORROW_MATIN = 'this_month this_week tomorrow matin';
const MARDI = 'this_month this_week mardi';
const JEUDI = 'this_month this_week jeudi';
const MARDI_MATIN = 'this_month this_week mardi matin';

// Applique une suite de clics (toggle) à partir d'une expression initiale.
function clicks(expr, ...paths) {
  let sel = exprToSelection(expr);
  for (const path of paths) sel = selectionToggle(sel, path);
  return selectionToExpr(sel);
}

describe('slot-selection — ouverture / migration', () => {
  // Une tâche stockée en forme nue (legacy) est relue localisée sous this_week.
  test('tomorrow nu est localisé sous this_week', () => {
    expect(selectionToExpr(exprToSelection('tomorrow'))).toBe(TOMORROW);
  });
  test('today matin nu est localisé', () => {
    expect(selectionToExpr(exprToSelection('today matin'))).toBe(TODAY_MATIN);
  });
  test('roundtrip this_week mardi', () => {
    expect(selectionToExpr(exprToSelection('this_week mardi'))).toBe(MARDI);
  });
});

describe('slot-selection — choix depuis un état vide', () => {
  test('localisant this_month', () => {
    expect(clicks('', MONTH)).toBe('this_month');
  });
  test('tomorrow', () => {
    expect(clicks('', TOMORROW)).toBe(TOMORROW);
  });
  test('this_week mardi', () => {
    expect(clicks('', MARDI)).toBe(MARDI);
  });
});

describe('slot-selection — raffinage / accumulation localisante', () => {
  test('raffine this_month en this_week', () => {
    expect(clicks('this_month', WEEK)).toBe(WEEK);
  });
  test('raffine this_week mardi en mardi matin', () => {
    expect(clicks('this_week mardi', MARDI_MATIN)).toBe(MARDI_MATIN);
  });
  test('ajoute jeudi à this_week mardi', () => {
    expect(clicks('this_week mardi', JEUDI)).toBe('this_month this_week mardi jeudi');
  });
  test('retire jeudi de this_week mardi jeudi', () => {
    expect(clicks('this_week mardi jeudi', JEUDI)).toBe(MARDI);
  });
  // Bug : à l'ouverture, exprToSelection produit des valeurs {disable:false} qui
  // empêchaient selectionAdd de raffiner → le parent restait sélectionné (bleu).
  test('raffiner depuis une sélection ouverte ne garde pas le parent', () => {
    const sel = selectionToggle(exprToSelection('this_month'), WEEK);
    expect(Array.from(sel.keys())).toEqual([WEEK]);
  });
});

describe('slot-selection — today/tomorrow sous this_week (feuilles niveau 3)', () => {
  // today contenu dans this_week → cliquer today raffine this_week (homogène avec mardi).
  test('raffine this_week en today', () => {
    expect(clicks('this_week', TODAY)).toBe(TODAY);
  });
  // today et mardi sont des jours disjoints → accumulation (multi niveau 3).
  test('ajoute mardi à today', () => {
    expect(clicks(TODAY, MARDI)).toBe('this_month this_week today mardi');
  });
  test('ajoute tomorrow quand today est sélectionné', () => {
    expect(clicks(TODAY, TOMORROW)).toBe('this_month this_week today tomorrow');
  });
  test('ajoute today quand tomorrow est sélectionné', () => {
    expect(clicks(TOMORROW, TODAY)).toBe('this_month this_week tomorrow today');
  });
});

describe('slot-selection — round-trip formes localisées', () => {
  test.each([
    TODAY,
    'this_month this_week today mardi',
    'this_month this_week today tomorrow',
    TODAY_MATIN,
  ])('round-trip %s', (expr) => {
    expect(selectionToExpr(exprToSelection(expr))).toBe(expr);
  });
});

describe('slot-selection — raffinage present-day', () => {
  test('raffine today en today matin', () => {
    expect(clicks(TODAY, TODAY_MATIN)).toBe(TODAY_MATIN);
  });
  test('raffine tomorrow en tomorrow matin', () => {
    expect(clicks(TOMORROW, TOMORROW_MATIN)).toBe(TOMORROW_MATIN);
  });
});

describe('slot-selection — shift present-day', () => {
  test('shift today -> tomorrow', () => {
    const sel = selectionShift(exprToSelection('today'), TODAY, 1);
    expect(selectionToExpr(sel)).toBe(TOMORROW);
  });
  test('shift tomorrow -> today', () => {
    const sel = selectionShift(exprToSelection('tomorrow'), TOMORROW, -1);
    expect(selectionToExpr(sel)).toBe(TODAY);
  });
});

describe('slot-selection — répétition', () => {
  test('today répétitif', () => {
    const sel = selectionSetRepetition(exprToSelection('today'), TODAY);
    expect(selectionToExpr(sel)).toBe('this_month this_week every 1 today');
  });
  test('this_week mardi répétitif', () => {
    const sel = selectionSetRepetition(exprToSelection('this_week mardi'), MARDI);
    expect(selectionToExpr(sel)).toBe('this_month this_week every 1 mardi');
  });
});

describe('slot-selection — disable', () => {
  test('disable today', () => {
    const sel = selectionSetDisable(exprToSelection('today'), TODAY);
    expect(selectionToExpr(sel)).toBe('this_month this_week disable today');
  });
  test('disable this_week mardi', () => {
    const sel = selectionSetDisable(exprToSelection('this_week mardi'), MARDI);
    expect(selectionToExpr(sel)).toBe('this_month this_week disable mardi');
  });
});

describe('slot-selection — remontée / désélection', () => {
  test('remonte this_week mardi vers this_week', () => {
    expect(clicks('this_week mardi', WEEK)).toBe(WEEK);
  });
  test('remonte today matin vers today', () => {
    expect(clicks('today matin', TODAY)).toBe(TODAY);
  });
  test('déselectionne le seul slot this_week mardi -> vide', () => {
    expect(clicks('this_week mardi', MARDI)).toBe('');
  });
  test('today aprem sur today matin -> accumulation', () => {
    expect(clicks('today matin', TODAY_APREM)).toBe('this_month this_week today matin aprem');
  });
});

describe('slot-selection — récurrence + today (cas 1)', () => {
  // today s'ajoute en exception ponctuelle à côté du motif localisant récurrent,
  // qui garde son every.
  test('rajoute today à every mardi (répétition niveau jour)', () => {
    const base = selectionSetRepetition(exprToSelection('this_week mardi'), MARDI);
    expect(selectionToExpr(selectionToggle(base, TODAY)))
      .toBe('this_month this_week every 1 mardi today');
  });
  test('retire today rétablit le motif récurrent', () => {
    const base = selectionSetRepetition(exprToSelection('this_week mardi'), MARDI);
    const withToday = selectionToggle(base, TODAY);
    expect(selectionToExpr(selectionToggle(withToday, TODAY)))
      .toBe('this_month this_week every 1 mardi');
  });
  test('rajoute today à every this_week mardi (répétition niveau semaine)', () => {
    const base = selectionSetRepetition(exprToSelection('this_week mardi'), WEEK);
    expect(selectionToExpr(selectionToggle(base, TODAY)))
      .toBe('this_month every 1 this_week mardi today');
  });
  test('round-trip every mardi + today', () => {
    const e = 'this_month this_week every 1 mardi today';
    expect(selectionToExpr(exprToSelection(e))).toBe(e);
  });
});

describe('slot-selection — remplace today par mardi dans every this_week', () => {
  // « Remplacer » = action de l'utilisateur en deux gestes (retirer today,
  // ajouter mardi) — composition de désélection + accumulation, indépendante de l'ordre.
  const base = () =>
    selectionToggle(selectionSetRepetition(exprToSelection('this_week'), WEEK), TODAY);

  test('état de départ {every this_week, today}', () => {
    expect(selectionToExpr(base())).toBe('this_month every 1 this_week today');
  });
  test('ajoute mardi puis retire today', () => {
    const after = selectionToggle(selectionToggle(base(), MARDI), TODAY);
    expect(selectionToExpr(after)).toBe('this_month every 1 this_week mardi');
  });
  test('retire today puis ajoute mardi (même résultat)', () => {
    const after = selectionToggle(selectionToggle(base(), TODAY), MARDI);
    expect(selectionToExpr(after)).toBe('this_month every 1 this_week mardi');
  });
});

describe('slot-selection — shift d\'un motif récurrent (every this_week)', () => {
  // Le shift décale l'ancre en préservant la récurrence et les compléments.
  // (Le shift arrière depuis this_week = plancher, hors scope du doc.)
  test('shift every this_week -> every next_week', () => {
    const sel = selectionSetRepetition(exprToSelection('this_week'), WEEK);
    expect(selectionToExpr(selectionShift(sel, WEEK, 1)))
      .toBe('this_month every 1 next_week');
  });
  test('shift every this_week mardi -> every next_week mardi', () => {
    const sel = selectionSetRepetition(exprToSelection('this_week mardi'), WEEK);
    expect(selectionToExpr(selectionShift(sel, WEEK, 1)))
      .toBe('this_month every 1 next_week mardi');
  });
});

// --- Cas restant à spécifier (cf. plan, tail) -------------------------------
describe('slot-selection — disables aux limites (test.todo)', () => {
  test.todo('disables aux limites');
});
