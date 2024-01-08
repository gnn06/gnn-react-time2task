import { multi2Mono, completeMultiSlot, multiSlotIsInOther, multi2MonoKeep } from './slot.js';

describe('multi slot', () => {
    it('empty', () => {
        const result = multi2Mono('')
        expect(result).toEqual([''])
    })
    
    it('one slot', () => {
        const result = multi2Mono('this_week')
        expect(result).toEqual(['this_week'])
    })
    
    it('no multi slot', () => {
        const result = multi2Mono('this_week mardi aprem')
        expect(result).toEqual(['this_week mardi aprem'])
    })
    
    it('repetition same level', () => {
        const result = multi2Mono('this_week mardi mercredi')
        expect(result).toEqual(['this_week mardi', 'this_week mercredi'])
    })

    it('next slot at upper level', () => {
        const result = multi2Mono('this_week mardi next_week jeudi')
        expect(result).toEqual(['this_week mardi', 'next_week jeudi'])
    })

    it('mix repetition and upper', () => {
        const result = multi2Mono('this_week mardi mercredi next_week jeudi')
        expect(result).toEqual(['this_week mardi', 'this_week mercredi', 'next_week jeudi'])
    })    

    it('debug', () => {
        const result = multi2Mono('mercredi jeudi')
        expect(result).toEqual(['mercredi', 'jeudi'])
    })    

    describe('removeDisble', () => {
        it('one slot', () => {
            const result = multi2Mono('lundi matin disable mardi aprem mercredi')
            expect(result).toEqual(['lundi matin', 'mercredi'])
        })
    });

    describe('removeDisble at begin', () => {
        it('one slot', () => {
            const result = multi2Mono('disable lundi matin mardi aprem mercredi')
            expect(result).toEqual(['mardi aprem', 'mercredi'])
        })
    });

    it('chaque', () => {
        const result = multi2Mono('lundi matin chaque mardi aprem mercredi')
        expect(result).toEqual(['lundi matin', 'mardi aprem', 'mercredi'])
    })

    it('chaque multi', () => {
        const result = multi2Mono('chaque mardi chaque mercredi')
        expect(result).toEqual(['mardi', 'mercredi'])
    })
})

describe('multi slot keep', () => {
    it('empty', () => {
        const result = multi2MonoKeep('')
        expect(result).toEqual([''])
    })
    
    it('one slot', () => {
        const result = multi2MonoKeep('this_week')
        expect(result).toEqual(['this_week'])
    })
    
    it('no multi slot', () => {
        const result = multi2MonoKeep('this_week mardi aprem')
        expect(result).toEqual(['this_week mardi aprem'])
    })
    
    it('repetition same level', () => {
        const result = multi2MonoKeep('this_week mardi mercredi')
        expect(result).toEqual(['this_week mardi', 'this_week mercredi'])
    })

    it('next slot at upper level', () => {
        const result = multi2MonoKeep('this_week mardi next_week jeudi')
        expect(result).toEqual(['this_week mardi', 'next_week jeudi'])
    })

    it('mix repetition and upper', () => {
        const result = multi2MonoKeep('this_week mardi mercredi next_week jeudi')
        expect(result).toEqual(['this_week mardi', 'this_week mercredi', 'next_week jeudi'])
    })    

    it('debug', () => {
        const result = multi2MonoKeep('mercredi jeudi')
        expect(result).toEqual(['mercredi', 'jeudi'])
    })    

    describe('removeDisble', () => {
        it('one slot', () => {
            const result = multi2MonoKeep('lundi matin disable mardi aprem mercredi')
            expect(result).toEqual(['lundi matin', 'disable mardi aprem', 'mercredi'])
        })
    });

    describe('removeDisble at begin', () => {
        it('one slot', () => {
            const result = multi2MonoKeep('disable lundi matin disable mardi aprem mercredi')
            expect(result).toEqual(['disable lundi matin', 'disable mardi aprem', 'mercredi'])
        })
    });

    it('chaque', () => {
        const result = multi2MonoKeep('lundi matin chaque mardi aprem mercredi')
        expect(result).toEqual(['lundi matin', 'chaque mardi aprem', 'mercredi'])
    })

    it('chaque multi', () => {
        const result = multi2MonoKeep('chaque mardi chaque mercredi')
        expect(result).toEqual(['chaque mardi', 'chaque mercredi'])
    })
})

describe('multiSlotIsInOther', () => {
    it('first', () => {
        const result = multiSlotIsInOther(['this_month this_week mercredi matin', 'this_month next_week'],'this_month this_week');
        expect(result).toBeTruthy();
    })

    it('second', () => {
        const result = multiSlotIsInOther(['this_month this_week mercredi matin', 'this_month next_week'],'this_month next_week');
        expect(result).toBeTruthy();
    })

    it('false', () => {
        const result = multiSlotIsInOther(['this_month this_week mercredi matin', 'this_month next_week'],'this_month this_week jeudi');
        expect(result).toBeFalsy();
    })
})

describe('completeMultiSlot', () => {
    it('completeSlot of multi', () => {
        const result = completeMultiSlot(['mardi', 'next_week jeudi'])
        expect(result[0]).toEqual('this_month this_week mardi')
        expect(result[1]).toEqual('this_month next_week jeudi')
    })
})