import { Parser } from './parser'
import { SlotPath } from './slot-path'
import { getSlotNextPrev } from './slot-next-prev'

const parser = new Parser()

describe('getSlotNextPrev — tâche unique', () => {

    test('slot passé → null', () => {
        const slot     = parser.parse('this_week lundi')
        const slotPath = new SlotPath('this_month this_week mercredi')
        expect(getSlotNextPrev(slot, slotPath, +1)).toBeNull()
    })

    test('slot futur → inchangé', () => {
        const slot     = parser.parse('this_week vendredi')
        const slotPath = new SlotPath('this_month this_week mercredi')
        expect(getSlotNextPrev(slot, slotPath, +1))
            .toEqual(new SlotPath('this_week vendredi'))
    })

    test("slot = aujourd'hui → null", () => {
        const slot     = parser.parse('this_week mercredi')
        const slotPath = new SlotPath('this_month this_week mercredi')
        expect(getSlotNextPrev(slot, slotPath, +1)).toBeNull()
    })

    test('slot semaine en cours, sans jour → inchangé', () => {
        const slot     = parser.parse('this_week')
        const slotPath = new SlotPath('this_month this_week mercredi')
        expect(getSlotNextPrev(slot, slotPath, +1))
            .toEqual(new SlotPath('this_week'))
    })

    test('slot semaine future → inchangé', () => {
        const slot     = parser.parse('next_week')
        const slotPath = new SlotPath('this_month this_week mercredi')
        expect(getSlotNextPrev(slot, slotPath, +1))
            .toEqual(new SlotPath('next_week'))
    })

    test('slot semaine passée → null', () => {
        const slot     = parser.parse('this_week')
        const slotPath = new SlotPath('next_week lundi')
        expect(getSlotNextPrev(slot, slotPath, +1)).toBeNull()
    })
})

describe('getSlotNextPrev — jour-ancre today (sans shift) vs weekday', () => {
    // 'today' désigne par définition le jour courant : quel que soit le vrai jour de la
    // semaine porté par slotPath (lundi..vendredi), 'this_week today' doit être traité
    // comme "même jour", jamais comme passé ni futur. Bug : weight['today']=1 (échelle
    // relatifPresent) était comparé directement à weight[vraiJour] (échelle relatifParent,
    // lundi=1..vendredi=5) → dès que le vrai jour n'est pas lundi, 'today' était classé
    // "passé" à tort.
    test.each(['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'])(
        "today vs %s (comparison='inclusive') → même jour, retourné",
        (weekday) => {
            const slot     = parser.parse('this_week today')
            const slotPath = new SlotPath(`this_month this_week ${weekday}`)
            expect(getSlotNextPrev(slot, slotPath, +1, 'inclusive'))
                .toEqual(new SlotPath('this_week today'))
        }
    )

    test.each(['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'])(
        "today vs %s (comparison='strict') → même jour, sans répétition → null",
        (weekday) => {
            const slot     = parser.parse('this_week today')
            const slotPath = new SlotPath(`this_month this_week ${weekday}`)
            expect(getSlotNextPrev(slot, slotPath, +1, 'strict')).toBeNull()
        }
    )
})

describe('getSlotNextPrev — jour-ancre relatifPresent avec shift (today/tomorrow + N)', () => {
    // Un jour-ancre porté par un shift ('tomorrow + 1') est emballé par le parser dans
    // un nœud branch imbriqué. Il est par construction aujourd'hui-ou-futur (offset >= 0
    // depuis today) → c'est le prochain slot tel quel. Régression : ce nœud était pris
    // pour un multi et faisait crasher (b.value undefined).
    test('tomorrow + 1 → futur, retourné', () => {
        const slot     = parser.parse('this_week tomorrow + 1')
        const slotPath = new SlotPath('this_month this_week mercredi')
        expect(getSlotNextPrev(slot, slotPath, +1))
            .toEqual(new SlotPath('this_week tomorrow + 1'))
    })

    test('today + 2 → futur, retourné (comparison inclusive)', () => {
        const slot     = parser.parse('this_week today + 2')
        const slotPath = new SlotPath('this_month this_week mercredi')
        expect(getSlotNextPrev(slot, slotPath, +1, 'inclusive'))
            .toEqual(new SlotPath('this_week today + 2'))
    })

    test('tomorrow + 1 aprem → conserve l\'heure', () => {
        const slot     = parser.parse('this_week tomorrow + 1 aprem')
        const slotPath = new SlotPath('this_month this_week mercredi')
        expect(getSlotNextPrev(slot, slotPath, +1))
            .toEqual(new SlotPath('this_week tomorrow + 1 aprem'))
    })
})

describe('getSlotNextPrev — slot niveau mois', () => {

    test('next_month → retourné', () => {
        const slot     = parser.parse('next_month')
        const slotPath = new SlotPath('this_month this_week mercredi')
        expect(getSlotNextPrev(slot, slotPath, +1))
            .toEqual(new SlotPath('next_month'))
    })

    test("this_month, tâche active (comparison='inclusive') → retourné", () => {
        const slot     = parser.parse('this_month')
        const slotPath = new SlotPath('this_month this_week mercredi')
        expect(getSlotNextPrev(slot, slotPath, +1, 'inclusive'))
            .toEqual(new SlotPath('this_month'))
    })

    test('this_month, tâche faite → null', () => {
        const slot     = parser.parse('this_month')
        const slotPath = new SlotPath('this_month this_week mercredi')
        expect(getSlotNextPrev(slot, slotPath, +1, 'strict')).toBeNull()
    })

    test('this_month next_month, tâche faite (false) → retourné', () => {
        const slot     = parser.parse('this_month next_month')
        const slotPath = new SlotPath('this_month this_week mercredi')
        expect(getSlotNextPrev(slot, slotPath, +1, 'strict')).toEqual(new SlotPath('next_month'))
    })
})

describe('getSlotNextPrev — tâche multi', () => {

    test('premier slot passé, second à venir → retourne le second', () => {
        const slot     = parser.parse('this_week mardi jeudi')
        const slotPath = new SlotPath('this_month this_week mercredi')
        expect(getSlotNextPrev(slot, slotPath, +1))
            .toEqual(new SlotPath('this_week jeudi'))
    })

    test('deux slots à venir → retourne le plus proche', () => {
        const slot     = parser.parse('this_week jeudi vendredi')
        const slotPath = new SlotPath('this_month this_week mercredi')
        expect(getSlotNextPrev(slot, slotPath, +1))
            .toEqual(new SlotPath('this_week jeudi'))
    })

    test('tous les slots passés → null', () => {
        const slot     = parser.parse('this_week lundi mardi')
        const slotPath = new SlotPath('this_month  this_week mercredi')
        expect(getSlotNextPrev(slot, slotPath, +1)).toBeNull()
    })

    test("tous les slots <= aujourd'hui → null", () => {
        const slot     = parser.parse('this_week mardi mercredi')
        const slotPath = new SlotPath('this_month this_week mercredi')
        expect(getSlotNextPrev(slot, slotPath, +1)).toBeNull()
    })

    test('slot du jour présent avec un futur → retourne le futur', () => {
        const slot     = parser.parse('this_week mercredi jeudi')
        const slotPath = new SlotPath('this_month this_week mercredi')
        expect(getSlotNextPrev(slot, slotPath, +1))
            .toEqual(new SlotPath('this_week jeudi'))
    })
})

describe("getSlotNextPrev — comparison = 'inclusive'", () => {

    test("slot = aujourd'hui → retourné", () => {
        const slot     = parser.parse('this_week mercredi')
        const slotPath = new SlotPath('this_month this_week mercredi')
        expect(getSlotNextPrev(slot, slotPath, +1, 'inclusive'))
            .toEqual(new SlotPath('this_week mercredi'))
    })

    test('multi : slot du jour présent → retourné en premier', () => {
        const slot     = parser.parse('this_week mercredi jeudi')
        const slotPath = new SlotPath('this_month this_week mercredi')
        expect(getSlotNextPrev(slot, slotPath, +1, 'inclusive'))
            .toEqual(new SlotPath('this_week mercredi'))
    })

    test("slot passé → null même avec comparison='inclusive'", () => {
        const slot     = parser.parse('this_week lundi')
        const slotPath = new SlotPath('this_month this_week mercredi')
        expect(getSlotNextPrev(slot, slotPath, +1, 'inclusive')).toBeNull()
    })
})

describe('getSlotNextPrev — niveau heure (jour unique)', () => {

    test('heure future → retourné avec heure', () => {
        const slot     = parser.parse('this_week mercredi aprem')
        const slotPath = new SlotPath('this_month this_week mercredi matin')
        expect(getSlotNextPrev(slot, slotPath, +1))
            .toEqual(new SlotPath('this_week mercredi aprem'))
    })

    test('heure passée → null', () => {
        const slot     = parser.parse('this_week mercredi matin')
        const slotPath = new SlotPath('this_month this_week mercredi aprem')
        expect(getSlotNextPrev(slot, slotPath, +1)).toBeNull()
    })

    test("même heure, comparison='strict' → null", () => {
        const slot     = parser.parse('this_week mercredi matin')
        const slotPath = new SlotPath('this_month this_week mercredi matin')
        expect(getSlotNextPrev(slot, slotPath, +1, 'strict')).toBeNull()
    })

    test("même heure, comparison='inclusive' → retourné", () => {
        const slot     = parser.parse('this_week mercredi matin')
        const slotPath = new SlotPath('this_month this_week mercredi matin')
        expect(getSlotNextPrev(slot, slotPath, +1, 'inclusive'))
            .toEqual(new SlotPath('this_week mercredi matin'))
    })

    test("slot sans heure, path avec heure, comparison='strict' → null", () => {
        const slot     = parser.parse('this_week mercredi')
        const slotPath = new SlotPath('this_month this_week mercredi matin')
        expect(getSlotNextPrev(slot, slotPath, +1, 'strict')).toBeNull()
    })

    test("slot sans heure, path avec heure, comparison='inclusive' → retourné", () => {
        const slot     = parser.parse('this_week mercredi')
        const slotPath = new SlotPath('this_month this_week mercredi matin')
        expect(getSlotNextPrev(slot, slotPath, +1, 'inclusive'))
            .toEqual(new SlotPath('this_week mercredi'))
    })

    test('jour futur avec heure → retourné avec heure', () => {
        const slot     = parser.parse('this_week vendredi matin')
        const slotPath = new SlotPath('this_month this_week mercredi aprem')
        expect(getSlotNextPrev(slot, slotPath, +1))
            .toEqual(new SlotPath('this_week vendredi matin'))
    })

    test('semaine future avec heure → retourné avec heure', () => {
        const slot     = parser.parse('next_week lundi aprem')
        const slotPath = new SlotPath('this_month this_week mercredi matin')
        expect(getSlotNextPrev(slot, slotPath, +1))
            .toEqual(new SlotPath('next_week lundi aprem'))
    })
})

describe('getSlotNextPrev — niveau heure (multi)', () => {

    test('premier item passé (heure), second futur → retourne le second avec heure', () => {
        const slot     = parser.parse('this_week mardi matin mercredi aprem')
        const slotPath = new SlotPath('this_month this_week mardi aprem')
        expect(getSlotNextPrev(slot, slotPath, +1))
            .toEqual(new SlotPath('this_week mercredi aprem'))
    })

    test('tous les items passés → null', () => {
        const slot     = parser.parse('this_week mardi matin mercredi aprem')
        const slotPath = new SlotPath('this_month this_week mercredi aprem')
        expect(getSlotNextPrev(slot, slotPath, +1, 'strict')).toBeNull()
    })

    test("dernier item = maintenant, comparison='inclusive' → retourné", () => {
        const slot     = parser.parse('this_week mardi matin mercredi aprem')
        const slotPath = new SlotPath('this_month this_week mercredi aprem')
        expect(getSlotNextPrev(slot, slotPath, +1, 'inclusive'))
            .toEqual(new SlotPath('this_week mercredi aprem'))
    })

    test('deux heures même jour, première pas encore passée → retourne la seconde', () => {
        const slot     = parser.parse('this_week mercredi matin aprem')
        const slotPath = new SlotPath('this_month this_week mercredi matin')
        expect(getSlotNextPrev(slot, slotPath, +1, 'inclusive'))
            .toEqual(new SlotPath('this_week mercredi matin'))
    })
    
    test('deux heures même jour, première passée → retourne la seconde', () => {
        const slot     = parser.parse('this_week mercredi matin aprem')
        const slotPath = new SlotPath('this_month this_week mercredi matin')
        expect(getSlotNextPrev(slot, slotPath, +1, 'strict'))
            .toEqual(new SlotPath('this_week mercredi aprem'))
    })
})

describe('getSlotNextPrev — tâche repeat', () => {

    test('every 1 : jour passé → semaine suivante', () => {
        const slot     = parser.parse('every 1 this_week lundi')
        const slotPath = new SlotPath('this_month this_week mercredi')
        expect(getSlotNextPrev(slot, slotPath, +1))
            .toEqual(new SlotPath('next_week lundi'))
    })

    test('every 2 : jour passé → +2 semaines', () => {
        const slot     = parser.parse('every 2 this_week lundi')
        const slotPath = new SlotPath('this_month this_week mercredi')
        expect(getSlotNextPrev(slot, slotPath, +1))
            .toEqual(new SlotPath('following_week lundi'))
    })

    test('every 2 : jour pas encore passé → inchangé', () => {
        const slot     = parser.parse('every 2 this_week vendredi')
        const slotPath = new SlotPath('this_month this_week mercredi')
        expect(getSlotNextPrev(slot, slotPath, +1))
            .toEqual(new SlotPath('this_week vendredi'))
    })

    test('every 2 : slot en next_week → inchangé', () => {
        const slot     = parser.parse('every 2 next_week lundi')
        const slotPath = new SlotPath('this_month this_week mercredi')
        expect(getSlotNextPrev(slot, slotPath, +1))
            .toEqual(new SlotPath('next_week lundi'))
    })

    test('every 1 : même jour, même heure, strict → semaine suivante', () => {
        const slot     = parser.parse('this_month every 1 this_week mercredi matin')
        const slotPath = new SlotPath('this_month this_week mercredi matin')
        expect(getSlotNextPrev(slot, slotPath, +1, 'strict'))
            .toEqual(new SlotPath('next_week mercredi matin'))
    })

    test('every 1 : même jour, sans heure, strict → semaine suivante', () => {
        const slot     = parser.parse('this_month every 1 this_week mercredi')
        const slotPath = new SlotPath('this_month this_week mercredi matin')
        expect(getSlotNextPrev(slot, slotPath, +1, 'strict'))
            .toEqual(new SlotPath('next_week mercredi'))
    })

    test("every 1 : même jour, même heure, inclusive → retourné", () => {
        const taskSlot     = parser.parse('this_month every 1 this_week jeudi aprem')
        const slotPath = new SlotPath('this_month this_week jeudi aprem')
        expect(getSlotNextPrev(taskSlot, slotPath, +1, 'inclusive'))
            .toEqual(new SlotPath('this_week jeudi aprem'))
    });

    test("every 3 ", () => {
        const taskSlot     = parser.parse('every 3 this_month this_week jeudi aprem');
        console.log(taskSlot);
        const slotPath = new SlotPath('this_month this_week jeudi aprem')
        expect(getSlotNextPrev(taskSlot, slotPath, +1, 'strict'))
            .toEqual(new SlotPath("this_month + 3 this_week jeudi aprem"))
    })
})
