import { composeFuncAnd } from './predicateUtil'

const input = [100, 200, 50]

describe('', () => {
    test('no filter', () => {
        const result = composeFuncAnd([])
        expect(input.filter(result)).toEqual(input)
    })
    
    test('nominal', () => {
        const result = composeFuncAnd([(value) => value >= 100])
        expect(input.filter(result)).toEqual([100, 200])
    })
    test('nominal', () => {
        const result = composeFuncAnd([(value) => value >= 100, (value) => value < 200])
        expect(input.filter(result)).toEqual([100])
    })
})
