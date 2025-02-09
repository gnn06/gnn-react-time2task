import { branchAdd } from "./slot-branch++";

describe('branchAdd', () => {
    test('nominal', () => {
        const givenSource = {type: 'branch', value: ['this_month'] }
        const givenToAdd = {type: 'branch', value: ['next_month'] }
        const expected = {type: 'multi', value: [{type: 'branch', value: ['this_month'] },{type: 'branch', value: ['next_month'] }] }
        const result = branchAdd(givenSource, givenToAdd)
        expect(result).toEqual(expected)
    });
});