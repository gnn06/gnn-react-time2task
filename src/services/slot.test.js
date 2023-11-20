import { slotIsInOther, completeSlot, slotEqual, firstSlot, lowerSlot, slotDepth } from './slot.js';

describe('slotIsInOther', () => {
    it('slotIsInOther true by first level', () => {
        const result = slotIsInOther('S32 mercredi matin','S32');
        expect(result).toBeTruthy();
    })

    it('slotIsInOther true by second level', () => {
        const result = slotIsInOther('S32 mercredi matin','S32 mercredi');
        expect(result).toBeTruthy();
    })

    it('slotIsInOther true by last level', () => {
        const result = slotIsInOther('S32 mercredi matin','S32 mercredi matin');
        expect(result).toBeTruthy();
    })

    it('slotIsInOther false by last level', () => {
        const result = slotIsInOther('S32 mercredi aprem','S32 mercredi matin');
        expect(result).toBeFalsy()
    })

    it('slotIsInOther false by second level', () => {
        const result = slotIsInOther('S32 mercredi aprem','S32 lundi aprem');
        expect(result).toBeFalsy()
    })

    it('slotIsInOther false by first level', () => {
        const result = slotIsInOther('S32 mercredi aprem','S33 mercredi aprem');
        expect(result).toBeFalsy()
    })

    it('slotIsInOther true other less deeper', () => {
        const result = slotIsInOther('S32 mercredi aprem','S32 mercredi');
        expect(result).toBeTruthy()
    })

    it('slotIsInOther false other less deeper', () => {
        const result = slotIsInOther('S32 mercredi aprem','S32 lundi');
        expect(result).toBeFalsy()
    })

    it('slotIsInOther true other has 1 level', () => {
        const result = slotIsInOther('S32 mercredi aprem','S32');
        expect(result).toBeTruthy()
    })

    it('slotIsInOther false other has 1 level', () => {
        const result = slotIsInOther('S32 mercredi aprem','S33');
        expect(result).toBeFalsy()
    })

    it('slotIsInOther incomplet expr', () => {
        const result = slotIsInOther('S33','S33');
        expect(result).toBeTruthy()
    })

    it('slotIsInOther incomplet expr trop précis', () => {
        const result = slotIsInOther('S33','S33 mercredi');
        expect(result).toBeFalsy()
    })

    it('slotIsInOther incomplet expr false', () => {
        const result = slotIsInOther('S32 mercredi','S33');
        expect(result).toBeFalsy()
    })
})

describe('firstSlot', () => {
    it('firstSlot', () => {
        const result = firstSlot('S32 mercredi matin');
        expect(result).toEqual('S32')
    })

    it('firstSlot one level', () => {
        const result = firstSlot('matin');
        expect(result).toEqual('matin')
    })

    it('firstSlot empty', () => {
        const result = firstSlot('');
        expect(result).toEqual('')
    })
})

describe('lowerSlot', () => {
    it('lowerSlot', () => {
        expect(lowerSlot('S32 mercredi matin')).toEqual('mercredi matin')
    })

    it('lowerSlot no lower', () => {
        expect(lowerSlot('matin')).toEqual('')
    })

    it('lowerSlot empty', () => {
        expect(lowerSlot('')).toEqual('')
    })
})

describe('completeSlot', () => {
    it('completeSlot level1', () => {
        const result = completeSlot('week');
        expect(result).toEqual('this_month week');
    })

    it('completeSlot level2', () => {
        const result = completeSlot('vendredi');
        expect(result).toEqual('this_month week vendredi');

    })

    it('completeSlot level3', () => {
        const result = completeSlot('aprem');
        expect(result).toEqual('this_month week lundi aprem');
    })

    it('completeSlot level1 level2', () => {
        const result = completeSlot('week vendredi');
        expect(result).toEqual('this_month week vendredi');

    })

    it('completeSlot level1_bis level2', () => {
        const result = completeSlot('next_week vendredi');
        expect(result).toEqual('this_month next_week vendredi');
    })

    it('completeSlot unidefined', () => {
        const result = completeSlot(undefined);
        expect(result).toEqual(undefined);

    })
})

describe('slotDepth', () => {
    it('one level', () => {
        const result = slotDepth('week');
        expect(result).toEqual(1);
    })

    it('two levels', () => {
        const result = slotDepth('week lundi');
        expect(result).toEqual(2);
    })

    it('three levels', () => {
        const result = slotDepth('week lundi aprem');
        expect(result).toEqual(3);
    })
})

describe('slotEqual', () => {
    it('equal one level', () => {
        const result = slotEqual('week', 'week');
        expect(result).toEqual(true);
    })
    it('not equal one level', () => {
        const result = slotEqual('week', 'next_week');
        expect(result).toEqual(false);
    })
    it('equal two level', () => {
        const result = slotEqual('week lundi', 'week lundi');
        expect(result).toEqual(true);
    })
    it('not equal tow level', () => {
        const result = slotEqual('week lundi', 'week mardi');
        expect(result).toEqual(false);
    })
    it('other empty', () => {
        const result = slotEqual('week lundi', 'week');
        expect(result).toEqual(false);
    })
    it('this empty', () => {
        const result = slotEqual('week', 'week lundi');
        expect(result).toEqual(false);
    })    
})

describe('sort', () => {
    it('week next_week', () => {
        const result = 12;
        expect(result) .toEqual(-1);
    })

    it('next_week week', () => {
        const result = 12;
        expect(result).toEqual(1)
    })
    
    it('week week', () => {
        const result = 12;
        expect(result).toEqual(0)
    })

    it('week lundi week mardi', () => {
        const result = 12;
        expect(result).toEqual(-1)
    })
})