it('test Map', () => {
    const foo = new Map([
        [ 'task1', 'slot1' ]
    ]);
    expect(foo.size).toEqual(1);
    expect(foo.get('task1')).toEqual('slot1');
    expect(foo.get('task2')).toEqual(undefined);
});

it('test Object', () => {
    const foo = {
        
    };
    foo['task1'] = 'slot1';
    expect(foo['task1']).toEqual('slot1');
    expect(foo['task2']).toEqual(undefined);
});