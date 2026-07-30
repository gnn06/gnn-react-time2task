import { appendWithSpace } from "../utils/stringUtil";
import { getSlotIdCurrent, getSlotIdLevel, isAnchor, SLOTIDS_BY_LEVEL } from "./slot-id";
// Semaine calendaire complète (lundi→dimanche) pour aligner today/tomorrow sur une
// colonne weekday. samedi/dimanche ne sont pas des slot-ids : ils marquent l'overflow.
const WEEK_CALENDAR = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
import { getCurrentPathExpr, SlotPath } from "./slot-path";

/**
 * Tronque un chemin (tokens de slot-id) au premier jour "ancre" (today/tomorrow).
 * La grille tree n'a de colonnes que pour les weekdays (lundi..vendredi) ; une tâche
 * sur un jour ancre n'y a donc pas de colonne et doit remonter au niveau semaine par
 * bubbling. Les weekdays (compléments) sont conservés, avec leur éventuelle heure.
 */
export function truncatePathAtAnchorDay(tokens: string[]): string[] {
    const cut = tokens.findIndex(t => getSlotIdLevel(t) === 3 && isAnchor(t));
    return cut === -1 ? tokens : tokens.slice(0, cut);
}

interface SlotViewConf {
  levelMin:         number | null,
    levelMaxIncluded: number | null,
    remove: string[],
    collapse: string[],
    view: "tree" | "list"
}

export const DEFAULT_CONF:SlotViewConf = {
    collapse: [
        "this_month next_week",
        "this_month following_week",
        "next_month"
    ],
    remove: [],
    levelMin: null,
    levelMaxIncluded: null,
    view: "tree"
}

interface Slot {
    id: string,
    path: string,
    inner: Slot[]
}

export function transPathToConf(pathS:string) : string {
    const path = new SlotPath(pathS)
    const level = getSlotIdLevel(path.getLast())
    if (level === getSlotIdLevel("day")) {
        path.replace(level, "day")
    }
    if (level === 4) {
        path.replace(3, "day")
        path.truncate(3)
    }
    return path.toExpr()
}

export function reduceCollapseOnConf(conf: SlotViewConf, path: string) : SlotViewConf {
    const collapseSet = new Set(conf.collapse);
    const pathConf = transPathToConf(path)
    if (collapseSet.has(pathConf)) {
        collapseSet.delete(pathConf)
    } else {
        collapseSet.add(pathConf)
    }
    conf.collapse = Array.from(collapseSet)
    return conf
}

export function slotTreeToSlotList(root: Slot): Slot[][] {
    const levels: Slot[][] = [];
    
    // Fonction récursive pour parcourir l'arbre par niveau
    function traverseLevel(nodes: Slot[], depth: number) {
        if (nodes.length === 0) {
            return;
        }
        
        // Initialiser le niveau si nécessaire
        if (!levels[depth]) {
            levels[depth] = [];
        }
        
        // Ajouter tous les nœuds du niveau actuel
        levels[depth].push(...nodes);
        
        // Collecter tous les enfants pour le niveau suivant
        const children: Slot[] = [];
        for (const node of nodes) {
            if (node.inner && node.inner.length > 0) {
                children.push(...node.inner);
            }
        }
        
        // Traiter le niveau suivant
        if (children.length > 0) {
            traverseLevel(children, depth + 1);
        }
    }
    
    // Démarrer la traversée avec les enfants du root
    if (root.inner && root.inner.length > 0) {
        traverseLevel(root.inner, 0);
    }
    
    // Inverser l'ordre des niveaux (du plus profond au plus superficiel)
    return levels.reverse();
}

// v1 C1b : axe jour = ancres relatifPresent today/tomorrow (paths standalone).
// today porte ses créneaux matin/aprem ; tomorrow reste au niveau jour.
function relativePresentDaySlots(): [Slot, Slot] {
    const hours:[Slot, Slot] = [
        { id: "matin",  path: "today matin", inner: [] },
        { id: "aprem",  path: "today aprem", inner: [] },
    ];
    return [
        { id: "today",    path: "today",    inner: hours },
        { id: "tomorrow", path: "tomorrow", inner: [] },
    ];
}

function defaultSlotViewList(): Slot {
    const [todaySlot, tomorrowSlot] = relativePresentDaySlots();
    const thisWeek:Slot     = { id: "this_week", path: "this_month this_week", inner: [todaySlot, tomorrowSlot] };
    const nextWeek:Slot     = { id: "next_week", path: "this_month next_week", inner: [] };
    const thisMonth:Slot    = { id: "this_month", path: "this_month",          inner: [thisWeek, nextWeek] };
    const nextMonth:Slot    = { id: "next_month", path: "next_month",          inner: [] };
    return { id: "root", path: "", inner: [thisMonth, nextMonth] };
}

/**
 * return the slot node matching expr path or node itself if not found
 * @param node 
 * @param expr 
 * @returns 
 */
export function slotFind(node: Slot, expr: string): Slot | null {
    if (node.path === expr) return node;
    if (!node.inner || node.inner.length === 0) return null;
    for (const child of node.inner) {
        const res = slotFind(child, expr);
        if (res) return res;
    }
    return null;
}

export function getSlotsForRow(slots:Slot[]) : [Slot | null, Slot | null, Slot[]] {
    const givenLevel = new SlotPath(slots[0].path).getLevel();
    const currentPath = getCurrentPathExpr(givenLevel);
    const found = slots.findIndex(s => s.path === currentPath);
    // Fallback: today/tomorrow ont des paths standalone sans weekday → middle = 0.
    const middle = found >= 0 ? found : 0;
    const result:[Slot | null, Slot | null, Slot[]] = [null, null, []];
    if (middle >= 1) {
        result[0] = slots[0];
    }
    result[1] = slots[middle];
    if (middle < slots.length - 1) {
        result[2] = slots.slice(middle + 1);
    }
    return result;
}

const HOUR_ORDER = ['matin', 'aprem'];

/**
 * Répartit les nœuds heure (matin/aprem) d'un jour sur l'axe Past/Present/Future, selon
 * l'heure courante (getSlotIdCurrent(4)). Miroir de getSlotsForRow pour un axe à 2 valeurs :
 * pas d'empilement possible (un seul slot avant/après l'heure courante).
 */
export function getHourSlotsForRow(dayNode: Slot | null): [Slot | null, Slot | null, Slot | null] {
    const currentIdx = HOUR_ORDER.indexOf(getSlotIdCurrent(4));
    const result: [Slot | null, Slot | null, Slot | null] = [null, null, null];
    for (const node of dayNode?.inner ?? []) {
        const idx = HOUR_ORDER.indexOf(node.id);
        if (idx === -1) continue;
        if (idx < currentIdx) result[0] = node;
        else if (idx > currentIdx) result[2] = node;
        else result[1] = node;
    }
    return result;
}

export function slotHasImpreciseIcon(slotPath: string, slotLevel: number): boolean {
    const currentMonthId = getSlotIdCurrent(1);
    return slotLevel < 4 && (
        slotPath === currentMonthId ||
        slotPath.startsWith(currentMonthId + ' ' + getSlotIdCurrent(2))
    );
}

function truncateToFirstMissing(tokens: string[], slots: Slot[], depth = 0): string[] | null {
    if (!tokens || tokens.length === 0) return null;
    if (depth > 1) return null; // inject au maximum jusqu'au niveau semaine
    const id = tokens[0];
    const found = slots?.find(s => s.id === id);
    if (!found) return tokens.slice(0, 1);
    const sub = truncateToFirstMissing(tokens.slice(1), found.inner ?? [], depth + 1);
    if (!sub) return null;
    return [id, ...sub];
}

function stripInnerAtMaxLevel(slots: Slot[], maxLevel: number): Slot[] {
    return slots.map(slot => {
        if (getSlotIdLevel(slot.id) >= maxLevel) return { ...slot, inner: [] }
        return { ...slot, inner: stripInnerAtMaxLevel(slot.inner, maxLevel) }
    })
}

/** Arbre de base de la vue list (today/tomorrow sous this_week) + injection des slots de tâches absents. */
function buildListTree(taskPaths?: string[][]): Slot {
    const tree = defaultSlotViewList();
    if (taskPaths) {
        taskPaths
            .map(p => truncateToFirstMissing(p, tree.inner))
            .filter((p): p is string[] => p !== null)
            .forEach(p => { tree.inner = slotViewAdd(tree.inner, p) });
    }
    return tree;
}

/** Aplatit un arbre list en lignes de niveau, borné à conf.levelMaxIncluded. */
function listTreeToRows(tree: Slot, conf?: Pick<SlotViewConf, 'levelMaxIncluded'>): Slot[][] {
    const result = slotTreeToSlotList(tree);
    if (conf?.levelMaxIncluded) {
        const maxLevel = conf.levelMaxIncluded
        return result
            .filter(row => getSlotIdLevel(row[0].id) <= maxLevel)
            .map(row => stripInnerAtMaxLevel(row, maxLevel))
    }
    return result;
}

export function slotViewList(path:string, conf?: Pick<SlotViewConf, 'levelMaxIncluded'>, taskPaths?: string[][]): Slot[][] {
    let tree = buildListTree(taskPaths);
    if (path) {
        const temp = slotFind(tree, path) || tree;
        tree = { id:'root', path:'', inner:[temp]};
    }
    return listTreeToRows(tree, conf);
}

/**
 * 
 * @returns [ { id: string, path: string 'id1 id2 id3', inner: recursive result }]
 */

export function slotViewFilter(conf: SlotViewConf, level = 0, parentPath = new SlotPath("")) : Slot[]  {
    const SLOTIDS = Object.values(SLOTIDS_BY_LEVEL);
    if (conf.levelMin && level < conf.levelMin) {
        level = conf.levelMin - 1;
        for (let j = 0; j < conf.levelMin; j++) {
            parentPath.append(getSlotIdCurrent(j))
        }
    }
    if (level >= SLOTIDS.length) return [];
    const IDslevel = SLOTIDS[level]
    let result = []
    if (!conf.levelMaxIncluded || level <= conf.levelMaxIncluded - 1) {
        for (let i = 0; i < IDslevel.length; i++) {
            const id = IDslevel[i];
            const _path = new SlotPath(parentPath.toExpr()).append(id)
            const remove = conf.remove.map(el => new SlotPath(el)).some(el => el.equals(_path));
            if (remove) continue;
            const collapse = conf.collapse.map(el => new SlotPath(el)).some(el => el.equals(_path));
            let inner = !collapse ? slotViewFilter(conf, level + 1, _path) : []
            const node = { id: id, path: _path.toExpr(), inner: inner }
            result.push(node)
        }
    };
    return result;
}

// Ancres jour relatifPresent pour le picker de filtre : today ET tomorrow portent
// leurs créneaux matin/aprem (paths standalone), homogène avec le picker de tâche.
// (La vue liste, elle, garde tomorrow en feuille via relativePresentDaySlots.)
function relativePresentDayPickerSlots(): [Slot, Slot] {
    const dayHours = (day: string): Slot[] => [
        { id: "matin", path: `${day} matin`, inner: [] },
        { id: "aprem", path: `${day} aprem`, inner: [] },
    ];
    return [
        { id: "today",    path: "today",    inner: dayHours("today") },
        { id: "tomorrow", path: "tomorrow", inner: dayHours("tomorrow") },
    ];
}

/** Préfixe l'inner du nœud this_week avec les ancres relatifPresent (today/tomorrow). */
export function injectRelativeDaysUnderThisWeek(slots: Slot[]): Slot[] {
    return slots.map(slot => {
        if (slot.id === "this_week") {
            return { ...slot, inner: [...relativePresentDayPickerSlots(), ...(slot.inner ?? [])] };
        }
        return { ...slot, inner: injectRelativeDaysUnderThisWeek(slot.inner ?? []) };
    });
}

/**
 * Arbre de slots du picker de filtre : la grille absolue (weekdays) de slotViewFilter
 * augmentée des ancres relatifPresent today/tomorrow injectées sous this_week, afin de
 * pouvoir filtrer aussi bien sur les weekdays que sur today / today matin / today aprem / tomorrow.
 */
export function slotViewPicker(conf: SlotViewConf): Slot[] {
    return injectRelativeDaysUnderThisWeek(slotViewFilter(conf));
}

/**
 *
 * @param {*} slotView
 * @param {[string]} path
 * @returns
 */
export function slotViewAdd(slotView: Slot[], path:string[], currentPath = "") : Slot[] {

    if (slotView === null) return []
    if (path === null || path.length === 0) return slotView

    const id = path[0]
    const hasId = slotView.length > 0 && slotView.find(node => node.id === id);
    if (hasId) {
    return slotView.map(el => 
      {if (el.id === id) {
        return {...el, inner: slotViewAdd(el.inner, path.slice(1), el.path)}
            } else {
                return el
      }})
    } else {
        return slotView.concat(
      { id: id, 
                path: appendWithSpace(currentPath, id),
                inner: slotViewAdd([], path.slice(1), appendWithSpace(currentPath, id))
            })
    }
}

/**
 * Validates that a tokenized slot path (from IDizer) is a clean hierarchical path:
 * all tokens are valid slot IDs and levels are strictly increasing.
 * Rejects keyword tokens (every, chaque, disable), numbers, multi-slot separators (|),
 * and same-level sequences like ["this_month", "next_month"].
 */
export function isCleanSlotPath(tokens: string[] | null): boolean {
    if (!tokens || tokens.length === 0) return false
    let prevLevel = 0
    for (const token of tokens) {
        const base = token.match(/^(\S+)/)?.[1]
        const level = getSlotIdLevel(base ?? '')
        if (level === -1 || level <= prevLevel) return false
        prevLevel = level
    }
    return true
}

/**
 * Génère une arborescence de slot à afficher 
 * selon la conf spécifiée en y rajoutant les slots nécessaires 
 * aux taches qui ne serait pas affichées.
 * @param paths tableau de sorte de SlotPath à injecter
 */
export function slotViewFilterSelection(conf: SlotViewConf, paths: string[][]) {
  let slotView = slotViewFilter(conf)
  paths.forEach(path => {slotView = slotViewAdd(slotView, path)})
  return slotView
}

/**
 * Colonne weekday sur laquelle aligner un jour rolling dans la section rollingDays du tree.
 * today → jour courant ; tomorrow → lendemain calendaire. Renvoie un weekday id
 * (lundi..vendredi) ou null si hors plage (week-end) → colonne overflow.
 * @param dayId 'today' | 'tomorrow'
 * @param currentWeekdayId nom du jour courant (getSlotIdCurrent(3)), ex. 'mercredi'
 */
export function getRollingDayColumnId(dayId: string, currentWeekdayId: string): string | null {
    const offset = dayId === 'tomorrow' ? 1 : 0;
    const idx = WEEK_CALENDAR.indexOf(currentWeekdayId);
    if (idx === -1) return null;
    const targetId = WEEK_CALENDAR[idx + offset];
    return SLOTIDS_BY_LEVEL['3'].includes(targetId) ? targetId : null;
}

// Chemin de la semaine courante (this_week sous le mois courant). SLOTIDS_BY_LEVEL['2']
// place un nœud this_week sous CHAQUE mois ; seule la semaine courante porte la section
// rollingDays (today/tomorrow sont ancrés au présent).
export const CURRENT_WEEK_PATH = "this_month this_week";

/** Injecte today/tomorrow (avec matin/aprem) sous le seul nœud de la semaine courante. */
function injectRollingUnderCurrentWeek(slots: Slot[]): Slot[] {
    return slots.map(slot => {
        if (slot.path === CURRENT_WEEK_PATH) {
            return { ...slot, inner: [...relativePresentDayPickerSlots(), ...(slot.inner ?? [])] };
        }
        return { ...slot, inner: injectRollingUnderCurrentWeek(slot.inner ?? []) };
    });
}

/**
 * Arbre de slots de la vue tree : grille weekday augmentée de la section rollingDays
 * (today/tomorrow avec matin/aprem) injectée sous la semaine courante uniquement.
 * today/tomorrow ne sont pas des colonnes weekday : le composant les rend dans une
 * section séparée, alignée. Respecte levelMaxIncluded : pas d'injection sous le niveau
 * jour (3), pas de matin/aprem si le max s'arrête au jour.
 */
export function slotViewTreeSelection(conf: SlotViewConf, paths: string[][]): Slot[] {
    const base = slotViewFilterSelection(conf, paths);
    const max = conf.levelMaxIncluded;
    if (max && max < 3) return base; // pas de niveau jour affiché → pas de rollingDays
    const injected = injectRollingUnderCurrentWeek(base);
    return max ? stripInnerAtMaxLevel(injected, max) : injected;
}

interface ListDaySections {
    rolling: { present: Slot, future: Slot },
    weekday: { past: Slot[], present: Slot | null, future: Slot[] },
}

/** Nœud weekday complet (avec matin/aprem) de la semaine courante, ou null hors plage. */
function weekdayNode(weekdayId: string | null): Slot | null {
    if (!weekdayId) return null;
    const grid: Slot = { id: 'root', path: '', inner: slotViewFilter(DEFAULT_CONF) };
    return slotFind(grid, `${CURRENT_WEEK_PATH} ${weekdayId}`);
}

/**
 * Partitionne les weekdays (lundi..vendredi) de la semaine courante par rapport au jour de
 * today : avant → past, égal → present, après → future (indices calendaires). Un currentWeekday
 * hors lundi..vendredi (week-end) place tous les weekdays en past ; un currentWeekday inconnu
 * (null) laisse toutes les cases vides.
 *
 * Seul le jour present (l'équivalent weekDay de today) garde ses matin/aprem en inner : c'est
 * le seul à alimenter la ligne heure. Les jours past/future ont un inner vide pour que leurs
 * tâches heure bubblent sur leur propre case jour (Past/Future) plutôt que de créer une ligne
 * heure pour un jour qui n'est pas today.
 */
function partitionWeekdays(currentWeekday: string | null): { past: Slot[], present: Slot | null, future: Slot[] } {
    const idx = currentWeekday ? WEEK_CALENDAR.indexOf(currentWeekday) : -1;
    if (idx === -1) return { past: [], present: null, future: [] };
    const past: Slot[] = [];
    const future: Slot[] = [];
    let present: Slot | null = null;
    for (const id of SLOTIDS_BY_LEVEL['3']) {
        const node = weekdayNode(id);
        if (!node) continue;
        const dayIdx = WEEK_CALENDAR.indexOf(id);
        if (dayIdx < idx) past.push({ ...node, inner: [] });
        else if (dayIdx > idx) future.push({ ...node, inner: [] });
        else present = node;
    }
    return { past, present, future };
}

/**
 * Sections du niveau jour de la vue list, alignées sur l'axe Past/Present/Future :
 * - rolling : today (present) / tomorrow (future), chacun avec matin/aprem.
 * - weekday : le jour de today (present) ; les weekdays de la semaine après today (future,
 *   empilés) ; avant today (past, empilés). Miroir de la ligne semaine (Future empile ses
 *   slots). Chaque weekday ayant sa case, aucun ne remonte à this_week par bubbling.
 * Les sections partagent les colonnes ; le composant les rend entrelacées par niveau. Pas de
 * projection : today/tomorrow et les weekdays restent des créneaux distincts (familles séparées).
 *
 * maxLevel : quand la ligne heure n'est pas affichée (< niveau 4), le present doit perdre son
 * inner matin/aprem — sinon findTaskBySlotExpr (cf. task.js) exclut les tâches heure de la case
 * jour en pensant qu'elles seront rendues par une case heure qui n'existe pas, et elles
 * disparaissent. Une tâche doit toujours rester visible : elle bubble alors sur la case jour.
 * @param currentWeekday jour du today STOCKÉ (getCurrentWeekdayId(snapDates))
 * @param maxLevel conf.levelMaxIncluded ; falsy = pas de restriction
 */
export function slotViewListDaySections(currentWeekday: string | null, maxLevel?: number | null): ListDaySections {
    const [today, tomorrow] = relativePresentDayPickerSlots();
    // tomorrow (Future) perd son inner matin/aprem : seul today (Present) alimente la ligne
    // heure, symétrique au traitement des weekDays past/future (cf. partitionWeekdays).
    const weekday = partitionWeekdays(currentWeekday);
    // Colonne Past affichée de bas en haut : le plus récent en haut, le plus ancien en bas
    // (miroir de la colonne Future, qui reste en ordre calendaire). Ne concerne que Past.
    const sections = {
        rolling: { present: today, future: { ...tomorrow, inner: [] } },
        weekday: { ...weekday, past: [...weekday.past].reverse() },
    };
    if (!maxLevel) return sections;
    return {
        rolling: { ...sections.rolling, present: stripInnerAtMaxLevel([sections.rolling.present], maxLevel)[0] },
        weekday: {
            ...sections.weekday,
            present: sections.weekday.present && stripInnerAtMaxLevel([sections.weekday.present], maxLevel)[0],
        },
    };
}

/**
 * Ajoute les weekdays de la semaine courante (past + present + future) sous le nœud de la
 * semaine courante, à côté de today/tomorrow. Les rend « visibles » pour le bubbling : les
 * tâches qui leur sont affectées ne remontent plus à this_week (chaque jour a sa case au
 * niveau jour). this_week ne reçoit donc plus que les tâches réellement imprécises.
 */
function injectMappedWeekdaysUnderCurrentWeek(slots: Slot[], mapped: Slot[]): Slot[] {
    return slots.map(slot => {
        if (slot.path === CURRENT_WEEK_PATH) {
            return { ...slot, inner: [...(slot.inner ?? []), ...mapped] };
        }
        return { ...slot, inner: injectMappedWeekdaysUnderCurrentWeek(slot.inner ?? [], mapped) };
    });
}

/**
 * Lignes de niveau de la vue list, avec les weekdays mappés par today/tomorrow injectés
 * sous la semaine courante. Le composant ne rend génériquement que les niveaux mois/semaine
 * (le niveau jour est rendu explicitement via slotViewListDaySections) ; l'injection sert
 * ici à ce que le bubbling de this_week exclue les tâches de ces weekdays (pas de doublon).
 */
export function slotViewListSelection(currentWeekday: string | null, conf?: Pick<SlotViewConf, 'levelMaxIncluded'>, taskPaths?: string[][]): Slot[][] {
    const { weekday } = slotViewListDaySections(currentWeekday);
    const mapped = [...weekday.past, weekday.present, ...weekday.future].filter((s): s is Slot => s !== null);
    const base = buildListTree(taskPaths);
    const tree = { ...base, inner: injectMappedWeekdaysUnderCurrentWeek(base.inner, mapped) };
    return listTreeToRows(tree, conf);
}