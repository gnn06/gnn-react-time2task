import { removeDisable } from './slot.js';

jest.useFakeTimers()
jest.setSystemTime(new Date('2023-12-20')) // mercredi

describe('removeDisable', () => {
    describe('one remove', () => {
        test('middle', () => {
            expect(removeDisable(['lundi', 'disable', 'lundi', 'aprem', 'mardi']))
            .toEqual(['lundi', 'mardi'])
        })
        test('start', () => {
            expect(removeDisable(['disable', 'lundi', 'aprem', 'mardi']))
            .toEqual(['mardi'])
        })
        test('end', () => {
            expect(removeDisable(['lundi', 'disable', 'lundi', 'aprem']))
            .toEqual(['lundi'])
        }) 
    });
    describe('two remove', () => {
        test('middle consecutif', () => {
            expect(removeDisable(['lundi', 'disable', 'lundi', 'aprem', 'disable', 'mardi', 'mercredi']))
            .toEqual(['lundi', 'mercredi'])
        })
        test('middle non consecutif', () => {
            expect(removeDisable(['lundi', 'disable', 'lundi', 'aprem', 'mercredi', 'disable', 'mardi', 'jeudi']))
            .toEqual(['lundi', 'mercredi', 'jeudi'])
        })
        test('start', () => {
            expect(removeDisable(['disable', 'lundi', 'aprem', 'disable', 'mardi', 'mercredi']))
            .toEqual(['mercredi'])
        })
        test('end', () => {
            expect(removeDisable(['lundi', 'disable', 'lundi', 'aprem', 'disable', 'mardi']))
            .toEqual(['lundi'])
        })
    });
})