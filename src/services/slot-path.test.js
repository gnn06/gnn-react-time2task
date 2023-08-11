import SlotPath from './slot-path';

test('that constructor split expr', () => {
    const slot = new SlotPath('S32 mercredi matin');
    expect(slot.slots).toEqual(['S32', 'mercredi', 'matin'])
})