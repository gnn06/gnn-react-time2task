import { Parser, getLevelNode, reduceConcatBranch, reduceConcatBranchMulti, reduceConcatBranchMulti2Multi, reduceMulti, reduceFlag, shiftBranchOrFlag } from './parser'


describe('getLevelNode', () => {
  test('should multi', () => {
    expect(getLevelNode({type:'multi',value:[{type:'branch', value:['mardi']}]})).toEqual(3)
  });

  test('should string', () => {
    expect(getLevelNode('mardi')).toEqual(3)
  });

  test('should branch', () => {
    expect(getLevelNode({type:'branch', value:['mardi']})).toEqual(3)
  });

  test('should number', () => {
    expect(getLevelNode(1)).toEqual(1)
  })

  test('should string number', () => {
    expect(getLevelNode('1')).toEqual(1)
  })

  test('should string chaque', () => {
    expect(getLevelNode('chaque')).toEqual(-1)
  })
});

describe('reduce functions', () => {
  test('shiftBranch branch', () => {
    expect(shiftBranchOrFlag('mardi')).toEqual({ type: 'branch', value: [ 'mardi' ] })
  });
  
  test('shiftBranch flag disable', () => {
    expect(shiftBranchOrFlag('disable')).toEqual({ type: 'flag', value: 'disable' })
  })

  test('shiftBranch flag chaque', () => {
    expect(shiftBranchOrFlag('chaque')).toEqual({ type: 'flag', value: 'chaque' })
  })

  test('reduceMulti', () => {
    expect(reduceMulti('toto', 'titi')).toEqual({ type: 'multi', value: [ 'toto', 'titi' ] })
  });
  
  describe('reduceConcatBranch', () => {
    test('reduceConcatBranch simple branches', () => {
      expect(reduceConcatBranch(
        {type:'branch', value:['previous']}, 
        {type:'branch', value:['last']}))
      .toEqual({ type: 'branch', value: [ 'previous', 'last' ] })
    });
  
    test('reduceConcatBranch', () => {
      const result = reduceConcatBranch(
        {type:'branch',value:['previous'] }, 
        {type:'branch',value:['last', { type: 'multi', value: ['toto', 'titi']}]}
      )
      expect(result).toEqual(
        { type: 'branch', value: [ 'previous', 'last', { type: 'multi', value: ['toto', 'titi']} ] }
      )
    });
    
    test('reduceConcatBranch branch with flags', () => {
      const result = reduceConcatBranch(
        {type:'branch', value:['previous'], flags:['disable']},
        {type:'branch', value:['last'],     flags:['chaque']})
      expect(result).toEqual(
        { type: 'branch',
          value: [ 'previous', 
                    {type:'branch',value:['last'], flags:['chaque']} ],
          flags:['disable'] })
    });
  
    
  });

  test('reduceConcatBranchMulti', () => {
    expect(reduceConcatBranchMulti(
      { type: 'branch', value: ['previous'] }, 
      { type: 'multi',  value: ['toto', 'titi'] })
    ).toEqual({ type: 'branch', value: [ 'previous', { type: 'multi',  value: ['toto', 'titi'] } ] })
  });

  test('reduceConcatBranchMulti2Multi', () => {
    const result = reduceConcatBranchMulti2Multi(
      { type: 'branch', value: [ 1 ] }, 
      { type: 'multi',  value: [
        { type: 'branch', value: [ 1 ] },
        { type: 'branch', value: [ 1 ] }
      ] })
    expect(result).toEqual({ type: 'multi', value: [ { type: 'branch', value: [ 1 ] }, { type: 'branch', value: [ 1 ] }, { type: 'branch', value: [ 1 ] } ] })
  })

  test('reduceFlag branch without flag', () => {
    expect(reduceFlag({type:'flag', value:'disable'}, {type:'branch',value:['1','2']}))
      .toEqual({type:'branch',value:['1','2'], flags:['disable']})
  });

  test('reduceFlag branch with flag', () => {
    expect(reduceFlag({type:'flag', value:'disable'}, {type:'branch',value:['1','2'], flags: ['chaque']}))
      .toEqual({type:'branch',value:['1','2'], flags:['disable', 'chaque']})
  })

  test('reduceFlag multi with flag', () => {
    expect(reduceFlag({type:'flag', value:'disable'}, { type: 'multi', value: [{type:'branch',value:['1']}, {type:'branch',value:['2']}]}))
      .toEqual({ type: 'multi', value: [{type:'branch',value:['1'], flags: ['disable']}, {type:'branch',value:['2']}]})
  })
});

describe('shiftReduce', () => {
  test('shiftReduce empty', () => {
    const parser = new Parser(['1', '2', '$end'], []);
    parser.shiftReduce();
    expect(parser.stack).toEqual([{type:'branch',value:['1']}])
    expect(parser.input).toEqual(['2', '$end'])
  })
  
  test('shiftReduce no rupture', () => {
    const parser = new Parser(['2', '$end'], [{type:'branch',value:['1']}]);
    parser.shiftReduce();
    expect(parser.stack).toEqual([{type:'branch',value:['1']}, {type:'branch',value:['2']}])
    expect(parser.input).toEqual(['$end'])
  })
  
  test('shiftBranch rupture $end', () => {
    const parser = new Parser(['1', '$end'], [{type:'multi',value:[{type:'branch',value:['2']}, {type:'branch',value:['2']}]}]);
    parser.shiftReduce();
    expect(parser.stack).toEqual([
      {type:'multi',value:[
        {type:'branch',value:['2']},
        {type:'branch',value:['2']}]},
      {type:'branch',value:['1']}
      ])
    expect(parser.input).toEqual(['$end'])
  })

  test('shiftBranch rupture stack too small', () => {
    const parser = new Parser(['1', '$end'], [{type:'branch',value:[2 , 3]}]);
    parser.shiftReduce();
    expect(parser.stack).toEqual([
        {type:'branch',value:[2 , 3]},
        {type:'branch',value:['1']}
      ])
    expect(parser.input).toEqual(['$end'])
  })

  test('reduce multi of two branches', () => {
    const parser = new Parser(['$end'], [
      {type:'branch',value:[2 , 3]},
      {type:'branch',value:['1']}
    ]);
    parser.shiftReduce();
    expect(parser.stack).toEqual([
        {type:'multi', value: [
          {type:'branch',value:[2 , 3]},
          {type:'branch',value:['1']}        
        ]}
      ]);
    expect(parser.input).toEqual(['$end'])
  })

  test('reduceMulti1', () => {
    const parser = new Parser(['$end'], [{type:'branch',value:['1']}, {type:'branch',value:['1']}]);
    parser.shiftReduce();
    expect(parser.stack).toEqual([{type:'multi',value:[{type:'branch',value:['1']}, {type:'branch',value:['1']}]}])
    expect(parser.input).toEqual(['$end'])
  })

  test('reduceMulti2', () => {
    const parser = new Parser(
      ['$end'],
      [
        {type:'multi',value:[
          {type:'branch',value:['2']},
          {type:'branch',value:['2']}]},
        {type:'branch',value:['1']}
      ]);
    parser.shiftReduce();
    expect(parser.stack).toEqual([
      {type:'multi',value:[
        {type:'multi',value:[
          {type:'branch',value:['2']},
          {type:'branch',value:['2']}]},
        {type:'branch',value:['1']}
      ]}
    ])
    expect(parser.input).toEqual(['$end'])
  })

  test('reduceConcatBranch', () => {
    const parser = new Parser(['$end'], [{type:'branch',value:['1']}, {type:'branch',value:['2']}]);
    parser.shiftReduce();
    expect(parser.stack).toEqual([{type:'branch',value:['1', '2']}])
    expect(parser.input).toEqual(['$end'])
  })
  
  test('reduceConcatBranchMulti', () => {
    const parser = new Parser(
        ['$end'],
        [
          {type:'branch',value:['1']},
          {type:'multi',value:[{type:'branch',value:['2']},{type:'branch',value:['2']}]}
        ]);
    parser.shiftReduce();
    expect(parser.stack).toEqual([
      {type:'branch',value:[
          '1',
          {type:'multi',value:[{type:'branch',value:['2']},{type:'branch',value:['2']}]}
      ]}
    ])
    expect(parser.input).toEqual(['$end'])
  });
});

describe('parser number', () => {
  test('1', () => {
    const parser = new Parser()
    const result = parser.parse('1');
    expect(result).toEqual({type:'branch',value:['1']})
  })
  
  test('1, 2', () => {
    const parser = new Parser();
    const result = parser.parse('1 2');
    expect(result).toEqual({type:'branch',value:['1', '2']})
  })
  
  test('2, 2', () => {
    const parser = new Parser();
    const result = parser.parse('2 2 $end');
    expect(result).toEqual({type:'multi',value:[{type:'branch',value:['2']}, {type:'branch',value:['2']}]})
  })

  test('2, 1', () => {
    const parser = new Parser();
    const result = parser.parse('2 1 $end');
    expect(result).toEqual({type:'multi',value:[{type:'branch',value:['2']}, {type:'branch',value:['1']}]})
    expect(parser.input).toEqual([])
  })
  
  test('1, 1, 1', () => {
    const parser = new Parser();
    const result = parser.parse('1 1 1 $end');
    expect(result).toEqual({ type:'multi', value:[
      {type:'branch',value:['1']},
      {type:'branch',value:['1']},
      {type:'branch',value:['1']}
    ]})
    expect(parser.input).toEqual([])
  })

  test('2, 1, 1', () => {
    const parser = new Parser();
    const result = parser.parse('2 1 1 $end');
    expect(result).toEqual({ type:'multi', value:[
      {type:'branch',value:['2']},
      {type:'branch',value:['1']},
      {type:'branch',value:['1']}
    ]})
    expect(parser.input).toEqual([])
  })
  
  test('1, 2, 1', () => {
    const parser = new Parser();
    const result = parser.parse('1 2 1 $end');
    expect(result).toEqual({type:'multi',value:[{type:'branch',value:['1', '2']}, {type:'branch',value:['1']}]})
  })
  
  test('1, 1, 2', () => {
    const parser = new Parser();
    const result = parser.parse('1 1 2 $end');
    expect(result).toEqual({type:'multi',value:[{type:'branch',value:['1']}, {type:'branch',value:['1', '2']}]})
  })
  
  test('1, 2, 2', () => {
    const parser = new Parser();
    const result = parser.parse('1 2 2 $end');
    expect(result).toEqual(
      {type:'branch',value:[
        '1',
        {type:'multi',value:[
          {type:'branch',value:['2']},
          {type:'branch',value:['2']}
        ]},
      ]})
  })

  test('2, 1, 2', () => {
    const parser = new Parser();
    const result = parser.parse('2 1 2 $end');
    expect(result).toEqual(
      {type:'multi',value:[
        {type:'branch',value:['2']},
        {type:'branch',value:['1', '2']},
      ]})
  })
  
  test('2, 2, 1', () => {
    const parser = new Parser();
    const result = parser.parse('2 2 1 $end');
    expect(result).toEqual({type:'multi',value:[
      {type:'multi',value:[
        {type:'branch',value:['2']},
        {type:'branch',value:['2']}
      ]},
      {type:'branch',value:['1']}
    ]})
  })
  
  test('1, 2, 1, 2', () => {
    const parser = new Parser();
    const result = parser.parse('1 2 1 2 $end');
    expect(result).toEqual({type:'multi',value:[
      {type:'branch',value:['1', '2']},
      {type:'branch',value:['1', '2']}
    ]})
  })

  test('1, 2, 2, 1, 2', () => {
    const parser = new Parser();
    const result = parser.parse('1 2 2 1 2 $end');
    expect(result).toEqual({type:'multi',value:[
      {type:'branch',value:[
        '1',
        {type:'multi',value:[
          {type:'branch',value:['2']},
          {type:'branch',value:['2']}
        ]}
      ]},
      {type:'branch',value:['1', '2']}
    ]})
  })

  test('1, 2, 2, 1, 2, 2', () => {
    const parser = new Parser();
    const result = parser.parse('1 2 2 1 2 2 $end');
    expect(result).toEqual({type:'multi',value:[
      {type:'branch',value:[
        '1',
        {type:'multi',value:[
          {type:'branch',value:['2']},
          {type:'branch',value:['2']}
        ]}
      ]},
      {type:'branch',value:[
        '1',
        {type:'multi',value:[
          {type:'branch',value:['2']},
          {type:'branch',value:['2']}
        ]}
      ]}
    ]})
  })
  
  test('1, 2, 3', () => {
    const parser = new Parser();
    const result = parser.parse('1 2 3 $end');
    expect(result).toEqual({type:'branch',value:['1', '2', '3']})
  })
  
  test('2, 3, 1', () => {
    const parser = new Parser();
    const result = parser.parse('2 3 1 $end');
    expect(result).toEqual({type:'multi',value:[
      {type:'branch',value:['2', '3']},
      {type:'branch',value:['1']}
    ]})
  })

  test('2, 3, 3, 1', () => {
    const parser = new Parser();
    const result = parser.parse('2 3 3 1 $end');
    expect(result).toEqual({type:'multi',value:[
      {type:'branch',value:[
        '2', 
        {type:'multi',value:[
          {type:'branch',value:['3']},
          {type:'branch',value:['3']}
        ]}
      ]},
      {type:'branch',value:['1']}
    ]})
  })
})

describe('parser string', () => {
  test('slot jour', () => {
    const parser = new Parser();
    const result = parser.parse('this_week mardi mercredi next_month');
    expect(result).toEqual({type:'multi',value:[
      {type:'branch',value:[
        'this_week', 
        {type:'multi',value:[
          {type:'branch',value:['mardi']},
          {type:'branch',value:['mercredi']}
        ]}
      ]},
      {type:'branch',value:['next_month']}
    ]})
  })

  test('multi at second position', () => {
    const parser = new Parser();
    const result = parser.parse('this_week mardi jeudi');
    expect(result).toEqual(
      {type:'branch',value:[
        'this_week', 
        {type:'multi',value:[
          {type:'branch',value:['mardi']},
          {type:'branch',value:['jeudi']}
        ]}
      ]})
  })

  test('multi at third position', () => {
    const parser = new Parser();
    const result = parser.parse('this_month this_week mardi jeudi');
    expect(result).toEqual(
      {type:'branch',value:[
        'this_month', 'this_week', 
        {type:'multi',value:[
          {type:'branch',value:['mardi']},
          {type:'branch',value:['jeudi']}
        ]}
      ]})
  })

  test('disable one', () => {
    const parser = new Parser();
    const result = parser.parse('disable this_week mardi');
    expect(result).toEqual({ type:'branch',
    value:[ 'this_week', 'mardi' ],
    flags: ['disable']
  })
  })
  test('disable second', () => {
    const parser = new Parser();
    const result = parser.parse('this_week mardi disable next_week mercredi $end');
    expect(result).toEqual({ type: 'multi',
    value: [
      { type:'branch', value:[ 'this_week', 'mardi' ] },
      { type:'branch', value:[ 'next_week', 'mercredi' ], flags: ['disable'] }
    ]
  })
  })
  
  describe('chaque and every2', () => {
    test('deep 1 chaque at 1', () => {
      const parser = new Parser();
      const result = parser.parse('chaque this_week');
      expect(result).toEqual({ type:'branch', value:[ 'this_week' ], flags: ['chaque'] })
    });
  
    test('deep 2 chaque at 1', () => {
      const parser = new Parser();
      const result = parser.parse('chaque mardi aprem');
      expect(result).toEqual({ type: 'branch', value: ['mardi', 'aprem'], flags: ['chaque'] });    
    })
  
    test('deep 2, chaque at 2', () => {
      const parser = new Parser();
      const result = parser.parse('this_week chaque mardi');
      expect(result).toEqual(
        { type:'branch', value:[ 'this_week', 
          { type:'branch', value:[ 'mardi'  ], flags: ['chaque'] }         
        ]})
    })
    
    test('deep 3, chaque at 1', () => {
      const parser = new Parser();
      const result = parser.parse('chaque this_week mardi aprem');
      expect(result).toEqual(
        { type:'branch', value:[ 'this_week', 'mardi', 'aprem' ], flags: ['chaque'] }
      )
    })
    
    test('deep 3, chaque at 2', () => {
      const parser = new Parser();
      const result = parser.parse('this_week chaque mardi aprem');
      expect(result).toEqual(
        { type:'branch', value:[ 
          'this_week', { type:'branch', value:[ 'mardi', 'aprem' ], flags: ['chaque'] }         
        ]})
    })

    test('deep 3, chaque at 3', () => {
      const parser = new Parser();
      const result = parser.parse('this_week mardi chaque aprem');
      expect(result).toEqual(
        { type:'branch', value:[ 
          'this_week', 'mardi', { type:'branch', value:[ 'aprem' ], flags: ['chaque'] }         
        ]})
    })
  
    test('EVERY2', () => {
      const parser = new Parser();
      const result = parser.parse('EVERY2 mardi');
      expect(result).toEqual({ type: 'branch', value: ['mardi'], flags: ['EVERY2'] });    
    })
    
    test('EVERY2 at middle branch', () => {
      const result = new Parser().parse('this_month EVERY2 next_week jeudi')
      expect(result).toEqual({ type: 'branch', value: ['this_month', { type: 'branch', value: ['next_week', 'jeudi'], flags: ['EVERY2'] }] })
    })
  })

  test('chaque and multi', () => {
    const parser = new Parser();
    const result = parser.parse('chaque mercredi jeudi');
    expect(result).toEqual(
      { type: 'multi', value: [
        { type:'branch', value:[ 'mercredi' ], flags: [ 'chaque' ]  },
        { type:'branch', value:[ 'jeudi' ] }
      ] }
      )
  })
  
  test('disable chaque', () => {
    const parser = new Parser();
    const result = parser.parse('disable chaque next_week mercredi $end');
    expect(result).toEqual({ type:'branch', value:[ 'next_week', 'mercredi' ], flags: ['disable', 'chaque'] })
  });

  test('disable chaque second', () => {
    const parser = new Parser();
    const result = parser.parse('this_week mardi disable chaque next_week mercredi $end');
    expect(result).toEqual({ type: 'multi', value: [
      { type:'branch', value:[ 'this_week', 'mardi' ] },
      { type:'branch', value:[ 'next_week', 'mercredi' ], flags: ['disable', 'chaque'] }
    ]})
  });

  test('disable + multi', () => {
    const parser = new Parser();
    const result = parser.parse('disable vendredi lundi');
    expect(result).toEqual(
      { type: 'multi', value: [
        { type: 'branch', value: ['vendredi'], flags: ['disable'] },
        { type: 'branch', value: ['lundi'] }
      ]}
    )
  })

  test('disable + chaque + multi', () => {
    const parser = new Parser();
    const result = parser.parse('disable chaque lundi aprem this_week mercredi');
    expect(result).toEqual(
      { type: 'multi', value: 
        [
          { type: 'branch', value: ['lundi',     'aprem'],   flags: ['disable', 'chaque'] },
          { type: 'branch', value: ['this_week', 'mercredi'] }
        ]
      }
    );  
  })
});

describe('parse wrong expression', () => {
  test('parse undefined', () => {
    const parser = new Parser();
    const result = parser.parse(undefined);
    expect(result).toEqual(undefined)
  });

  test('parse many spaces middle', () => {
    const parser = new Parser();
    const result = parser.parse('lundi     aprem');
    expect(result).toEqual({ type: 'branch', value: ['lundi', 'aprem'] })
  });

  test('parse unknown keyword', () => {
    const parser = new Parser();
    const result = parser.parse('lundi toto');
    expect(result).toEqual({ type: 'branch', value: ['lundi'] })
  });
});