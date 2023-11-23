import { multi2Mono, completeMultiSlot } from './slot.js';

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
})

describe.skip('', () => {
    it('completeSlot of multi', () => {
        const result = completeMultiSlot(['mardi', 'jeudi'])
        expect(result[0]).toEqual('this_month this_week mardi')
        expect(result[1]).toEqual('this_month next_week jeudi')
    })
})