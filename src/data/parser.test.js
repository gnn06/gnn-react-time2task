import { Parser, getLevelNode, reduceConcatBranch, reduceConcatBranchMulti, reduceConcatBranchMulti2Multi, reduceMulti, reduceFlag, shiftBranchOrFlag, reduceNode } from './parser'

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

  test('node', () => {
    expect(getLevelNode({type:'node', value:'mardi'})).toEqual(3)
  })
})

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
  
    test('chaque on second', () => {
      const result = reduceConcatBranch(
        {type:'branch', value:['previous'] },
        {type:'branch', value:['last'],     flags:['chaque']})
      expect(result).toEqual(
        { type: 'branch',
          value: [ 'previous', 
                    {type:'branch',value:['last'], flags:['chaque']} ],
        })
    });
    
    test('chaque on first', () => {
      const result = reduceConcatBranch(
        {type:'branch', value:['previous'], flags:['chaque']},
        {type:'branch', value:['last']})
      expect(result).toEqual(
        { type: 'branch',
          value: [ 'previous', 'last' ],
          flags:['chaque']
        })
    })    
  
    test('shift on first', () => {
      const result = reduceConcatBranch(
        {type:'branch', value:['previous'], shift: 4},
        {type:'branch', value:['last']})
      expect(result).toEqual(
        { type: 'branch',
          value: [ 'previous', 'last' ],
          shift: 4
        })
    })
  
    test('shift on second', () => {
      const result = reduceConcatBranch(
        {type:'branch', value:['previous'] },
        {type:'branch', value:['last'],     shift: 4})
      expect(result).toEqual(
        { type: 'branch',
          value: [ 'previous', 
                    {type:'branch',value:['last'], shift: 4} ]
        })
    });
  
    test('shift on two', () => {
      const result = reduceConcatBranch(
        {type:'branch', value:['previous'], shift: 2 },
        {type:'branch', value:['last'],     shift: 4})
      expect(result).toEqual(
        { type: 'branch',
          value: [ 'previous', 
                    {type:'branch',value:['last'], shift: 4} ],
          shift: 2
        })
    });
  
    test('shift and disable', () => {
      const result = reduceConcatBranch(
        {type:'branch', value:['previous'], shift: 2, flags: [ 'disable' ] },
        {type:'branch', value:['last'],     shift: 4, flags: [ 'chaque' ]})
      expect(result).toEqual(
        { type: 'branch',
          value: [ 'previous', 
                    {type:'branch',value:['last'], shift: 4, flags: ['chaque']} ],
          shift: 2,
          flags: ['disable']
        })
    });
  
    test('repetition on second', () => {
      const result = reduceConcatBranch(
        {type:'branch', value:['previous'] },
        {type:'branch', value:['last'],     repetition: 4})
      expect(result).toEqual(
        { type: 'branch',
          value: [ 'previous', 
                    {type:'branch',value:['last'], repetition: 4} ]
        })
    });
  
    test('branch and node', () => {
      const result = reduceConcatBranch(
        { type: 'branch', value: ['previous'] },
        { type: 'node',   value: 'last',    flags: ['chaque'] })
      expect(result).toEqual(
        { type: 'branch',
          value: [ 'previous', 
                    {type:'branch',value:['last'], flags: ['chaque']} ]
        })
    });
  })
  
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

  test('reduceNode', () => {
    expect(reduceNode({type:'node', value:'mardi', repetition: 2, shift: 2, flags: ['disable']}))
      .toEqual({ type: 'branch', value: ['mardi'], repetition: 2, shift: 2, flags: ['disable']})
  });
})

describe('shiftReduce functions', () => {
    describe('shiftReduceBranch', () => {  
        test('node', () => {
          const parser = new Parser([ '$end' ], 
            [ { type: 'node',   value: 'mardi' } ]);
          parser.shiftReduceBranch();
          expect(parser.stack).toEqual([{ type: 'branch', value: [ 'mardi' ] }])
          expect(parser.input).toEqual(['$end'])
        })

        test('node X ID', () => {
            const parser = new Parser([ 'aprem', '$end' ], 
              [ { type: 'node',   value: 'mardi' } ]);
            parser.shiftReduceBranch();
            expect(parser.stack).toEqual([{ type: 'branch', value: [ 'mardi' ] }])
            expect(parser.input).toEqual(['aprem', '$end'])
          })
        
        test('branch node sub level', () => {
          const parser = new Parser([ '$end' ], 
            [ { type: 'branch', value: [ 'this_week' ] },
              { type: 'node',   value: 'mardi' }
            ]);
          parser.shiftReduceBranch();
          expect(parser.stack).toEqual([{ type: 'branch', value: [ 'this_week', 'mardi' ] }])
          expect(parser.input).toEqual(['$end'])
        })

        test('branch and node sub level with flag', () => {
          const parser = new Parser([ '$end' ], 
            [ { type: 'branch', value: [ 'this_week' ] },
              { type: 'node',   value: 'mardi', flags: ['chaque'] }
            ]);
          parser.shiftReduceBranch();
          expect(parser.stack).toEqual([{ type: 'branch', value: [ 'this_week', { type: 'branch', value: [ 'mardi' ], flags: ['chaque']} ] }])
          expect(parser.input).toEqual(['$end'])
        })

        test('branch node same level', () => {
            const parser = new Parser([ '$end' ], 
              [ { type: 'branch', value: [ 'this_week' ] },
                { type: 'node',   value: 'next_week' }
              ]);
            parser.shiftReduceBranch();
            expect(parser.stack).toEqual([{ type: 'branch', value: [ 'this_week' ] }, { type: 'branch', value: [ 'next_week'  ] }])
            expect(parser.input).toEqual(['$end'])
          })
      
        test('branch branch', () => {
          const parser = new Parser([ '$end' ], 
            [ { type: 'branch', value: [ 'this_week' ] },
              { type: 'branch', value: [ 'next_week' ] }
            ]);
          parser.shiftReduceBranch();
          expect(parser.stack).toEqual([{ type: 'multi', value: [ { type: 'branch', value: [ 'this_week' ] }, { type: 'branch', value: [ 'next_week' ] } ] }])
          expect(parser.input).toEqual(['$end'])
        })
      
        test('branch multi', () => {
          const parser = new Parser([ '$end' ], 
            [ { type: 'branch', value: [ 'this_week' ] },
              { type: 'multi',  value: [ { type: 'branch', value: [ 'mardi' ] }, { type: 'branch', value: [ 'mercredi' ] } ] }
            ]);
          parser.shiftReduceBranch();
          expect(parser.stack).toEqual([{ type: 'branch', value: [ 'this_week', { type: 'multi',  value: [ { type: 'branch', value: [ 'mardi' ] }, { type: 'branch', value: [ 'mercredi' ] } ] } ] }])
          expect(parser.input).toEqual(['$end'])
        })
      
        test('change parsing on ID', () => {
          const parser = new Parser([ 'this_week', '$end'], []);
          parser.shiftReduceBranch();
          expect(parser.stack).toEqual([])
          expect(parser.input).toEqual(['this_week', '$end'])
          expect(parser.parsing).toEqual('node')
        })

        test('change parsing on flag', () => {
          const parser = new Parser([ 'disable', 'mardi', '$end'], []);
          parser.shiftReduceBranch();
          expect(parser.stack).toEqual([])
          expect(parser.input).toEqual(['disable', 'mardi', '$end'])
          expect(parser.parsing).toEqual('node')
        })

        test('change parsing on EVERY2', () => {
          const parser = new Parser([ 'EVERY2', 'mardi', '$end'], [], 'branch');
          parser.shiftReduceBranch();
          expect(parser.stack).toEqual([])
          expect(parser.input).toEqual(['EVERY2', 'mardi', '$end'])
          expect(parser.parsing).toEqual('node')
        })
      })

      describe('shiftReduceNode', () => {
        test('flag', () => {
          const parser = new Parser([ 'disable', '$end'], []);
          parser.shiftReduceNode();
          expect(parser.stack).toEqual([ { type: 'flag', value: 'disable' } ])
          expect(parser.input).toEqual(['$end'])
          expect(parser.parsing).toEqual('node')
        })
        test('repetition', () => {
          const parser = new Parser([ 'every', '2', '$end'],
                                    [  ]);
          parser.shiftReduceNode();
          expect(parser.stack).toEqual([ { type: 'repetition', value: 2 } ])
          expect(parser.input).toEqual(['$end'])
          expect(parser.parsing).toEqual('node')
        })
        test('id', () => {
          const parser = new Parser([ 'this_week', '$end'],
                                    [  ]);
          parser.shiftReduceNode();
          expect(parser.stack).toEqual([ { type: 'node', value: 'this_week' } ])
          expect(parser.input).toEqual(['$end'])
          expect(parser.parsing).toEqual('node')
        })
        test('week', () => {
          const parser = new Parser([ 'week', '$end'], [], 'node');
          parser.shiftReduceNode();
          expect(parser.stack).toEqual([ { type: 'node', value: 'week' } ])
          expect(parser.input).toEqual(['$end'])
          expect(parser.parsing).toEqual('node')
        })
        test('shift', () => {
          const parser = new Parser([ '+', '2', '$end'],
                                    [ { type: 'node', value: 'this_week' } ]);
          parser.shiftReduceNode();
          expect(parser.stack).toEqual([ { type: 'node', value: 'this_week', shift: 2 } ])
          expect(parser.input).toEqual(['$end'])
          expect(parser.parsing).toEqual('node')
        })
        test('repetition id', () => {
          const parser = new Parser([ 'every', '2', 'this_week', '$end'], [])
          parser.shiftReduceNode();
          parser.shiftReduceNode();
          parser.shiftReduceNode();
          expect(parser.stack).toEqual([ { type: 'node', value: 'this_week', repetition: 2 } ])
          expect(parser.input).toEqual([ '$end' ])
          expect(parser.parsing).toEqual('node')
        });
        test('disable repetition id', () => {
          const parser = new Parser([ 'disable', 'every', '2', 'this_week', '$end'], [])
          parser.shiftReduceNode();
          parser.shiftReduceNode();
          parser.shiftReduceNode();
          parser.shiftReduceNode();
          parser.shiftReduceNode();
          expect(parser.stack).toEqual([ { type: 'node', value: 'this_week', repetition: 2, flags: ['disable'] } ])
          expect(parser.input).toEqual([ '$end' ])
          expect(parser.parsing).toEqual('node')
        })
        test('change parsing end', () => {
          const parser = new Parser([ '$end'], [{ type: 'node' }])
          parser.shiftReduceNode();
          expect(parser.stack).toEqual([ { type: 'node' } ])
          expect(parser.input).toEqual([ '$end' ])
          expect(parser.parsing).toEqual('branch')
        });
        test('change parsing ID', () => {
          const parser = new Parser([ 'jeudi'], [{ type: 'node' }])
          parser.shiftReduceNode();
          expect(parser.stack).toEqual([ { type: 'node' } ])
          expect(parser.input).toEqual([ 'jeudi' ])
          expect(parser.parsing).toEqual('branch')
        })
        test('change parsing every', () => {
          const parser = new Parser([ 'every', '2' ], [{ type: 'node' }])
          parser.shiftReduceNode();
          expect(parser.stack).toEqual([ { type: 'node' } ])
          expect(parser.input).toEqual([ 'every', '2' ])
          expect(parser.parsing).toEqual('branch')
        })
        test('change parsing disable', () => {
          const parser = new Parser([ 'disable'], [{ type: 'node' }])
          parser.shiftReduceNode();
          expect(parser.stack).toEqual([ { type: 'node' } ])
          expect(parser.input).toEqual([ 'disable' ])
          expect(parser.parsing).toEqual('branch')
        })
        test('chaque', () => {
          const parser = new Parser([ 'chaque', 'week', '$end'], []);
          parser.shiftReduceNode();
          expect(parser.stack).toEqual([ { type: 'flag', value: 'chaque' } ])
          expect(parser.input).toEqual(['week', '$end'])
          expect(parser.parsing).toEqual('node')
        })
        test('disable repetition id shift', () => {
          const parser = new Parser([ 'disable', 'every', '2', 'this_week', '+', '3', '$end'], [])
          parser.shiftReduceNode();
          parser.shiftReduceNode();
          parser.shiftReduceNode();
          parser.shiftReduceNode();
          parser.shiftReduceNode();
          parser.shiftReduceNode();
          parser.shiftReduceNode();
          expect(parser.stack).toEqual([ { type: 'node', value: 'this_week', repetition: 2, flags: ['disable'], shift: 3 } ])
          expect(parser.input).toEqual([ '$end' ])
          expect(parser.parsing).toEqual('branch')
        })
        test('EVERY2', () => {
          const parser = new Parser([ 'EVERY2', 'this_week', '$end'], [], '');
          parser.shiftReduceNode();
          expect(parser.stack).toEqual([ { type: 'repetition', value: 2 } ])
          expect(parser.input).toEqual(['this_week', '$end'])
          expect(parser.parsing).toEqual('')
        })
      })
});


describe('chain of reduce', () => {
    test('lundi', () => {
      const parser = new Parser([ 'lundi', '$end'], []);
      parser.shiftReduceBranch();
      expect(parser.stack).toEqual([  ])
      expect(parser.input).toEqual(['lundi', '$end'])
      expect(parser.parsing).toEqual('node')
      parser.shiftReduceNode();
      expect(parser.stack).toEqual([ { type: 'node', value: 'lundi' }])
      expect(parser.input).toEqual([ '$end'])
      expect(parser.parsing).toEqual('node')
      parser.shiftReduceNode();
      expect(parser.stack).toEqual([ { type: 'node', value: 'lundi' }])
      expect(parser.input).toEqual([ '$end'])
      expect(parser.parsing).toEqual('branch')
      parser.shiftReduceBranch();
      expect(parser.stack).toEqual([ { type: 'branch', value: ['lundi'] }])
      expect(parser.input).toEqual([ '$end'])
      expect(parser.parsing).toEqual('branch')
      parser.shiftReduceBranch();
      expect(parser.stack).toEqual([ { type: 'branch', value: ['lundi'] }])
      expect(parser.input).toEqual([])    
    })
  
    test('lundi X mardi', () => {
      const parser = new Parser([ 'mardi', '$end'], [{ type: 'branch', value: ['lundi'] }], 'branch');
      parser.shiftReduceBranch();
      expect(parser.parsing).toEqual('node')    
      parser.shiftReduceNode();
      expect(parser.input).toEqual([ '$end'])
      expect(parser.stack).toEqual([ { type: 'branch', value: ['lundi'] }, { type: 'node', value: 'mardi'}])
      parser.shiftReduceNode();
      expect(parser.input).toEqual([ '$end'])
      expect(parser.stack).toEqual([ { type: 'branch', value: ['lundi'] }, { type: 'node', value: 'mardi'}])
      expect(parser.parsing).toEqual('branch')    
      parser.shiftReduceBranch();
      expect(parser.input).toEqual([ '$end'])
      expect(parser.stack).toEqual([ { type: 'branch', value: ['lundi'] }, { type: 'branch', value: ['mardi']}])
      parser.shiftReduceBranch();
      expect(parser.input).toEqual([ '$end'])
      expect(parser.stack).toEqual([ { type: 'multi', value: [{ type: 'branch', value: ['lundi'] }, { type: 'branch', value: ['mardi']}]} ])
      parser.shiftReduceBranch();
      expect(parser.input).toEqual([])
      expect(parser.stack).toEqual([ { type: 'multi', value: [{ type: 'branch', value: ['lundi'] }, { type: 'branch', value: ['mardi']}]} ])
    }) 

    test('X mardi aprem', () => {
        const parser = new Parser([ 'mardi', 'aprem', '$end'], [], '');
        parser.shiftReduceNode();
        expect(parser.input).toEqual([ 'aprem', '$end'])
        expect(parser.stack).toEqual([ { type: 'node', value: 'mardi' }])
        
        parser.shiftReduceNode();
        expect(parser.input).toEqual([ 'aprem', '$end'])
        expect(parser.stack).toEqual([ { type: 'node', value: 'mardi' }])
        expect(parser.parsing).toEqual('branch')
        
        parser.shiftReduceBranch();
        expect(parser.input).toEqual([ 'aprem', '$end'])
        expect(parser.stack).toEqual([ { type: 'branch', value: ['mardi'] }])
        expect(parser.parsing).toEqual('branch')    
        
        parser.shiftReduceBranch();
        expect(parser.input).toEqual([ 'aprem', '$end'])
        expect(parser.stack).toEqual([ { type: 'branch', value: ['mardi'] }])
        expect(parser.parsing).toEqual('node')
        
        parser.shiftReduceNode();
        expect(parser.input).toEqual([ '$end'])
        expect(parser.stack).toEqual([ { type: 'branch', value: ['mardi'] }, { type: 'node', value: 'aprem' }])
        
        parser.shiftReduceNode();
        expect(parser.input).toEqual([ '$end'])
        expect(parser.stack).toEqual([ { type: 'branch', value: ['mardi'] }, { type: 'node', value: 'aprem' }])
        expect(parser.parsing).toEqual('branch')
        
        parser.shiftReduceBranch();
        expect(parser.input).toEqual([ '$end'])
        expect(parser.stack).toEqual([ { type: 'branch', value: ['mardi', 'aprem'] }])

        parser.shiftReduceBranch();
        expect(parser.input).toEqual([])
        expect(parser.stack).toEqual([ { type: 'branch', value: ['mardi', 'aprem'] }])
    }) 
  })

describe('parser string', () => {
    test('lundi', () => {
        const parser = new Parser();
        const result = parser.parse('lundi');
        expect(result).toEqual({type:'branch',value:['lundi']})
    })
    
    test('lundi aprem', () => {
        const parser = new Parser();
        const result = parser.parse('lundi aprem');
        expect(result).toEqual({type:'branch',value:['lundi', 'aprem']})
    })

    test('lundi mardi', () => {
        const parser = new Parser();
        const result = parser.parse('lundi mardi');
        expect(result).toEqual({type:'multi', value: [{type:'branch',value:['lundi']}, {type:'branch',value:['mardi']}]})
    })
    test('multi upper node', () => {
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
        const result = parser.parse('this_week mardi disable next_week mercredi');
        expect(result).toEqual({ type: 'multi',
        value: [
          { type:'branch', value:[ 'this_week', 'mardi' ] },
          { type:'branch', value:[ 'next_week', 'mercredi' ], flags: ['disable'] }
        ]
      })
    })
    describe('chaque', () => {
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
      })
  describe('every', () => {
    describe('every2', () => {
      test('EVERY2', () => {
        const parser = new Parser();
        const result = parser.parse('EVERY2 mardi');
        expect(result).toEqual({ type: 'branch', value: ['mardi'], repetition: 2 });    
      })
  
      test('EVERY2 at middle branch', () => {
        const result = new Parser().parse('this_month EVERY2 next_week jeudi')
        expect(result).toEqual({ type: 'branch', value: ['this_month', { type: 'branch', value: ['next_week', 'jeudi'], repetition: 2 }] })
      })
    })
    describe('every', () => {
      test('smple', () => {
        const parser = new Parser();
        const result = parser.parse('every 6 this_month');
        expect(result).toEqual({ type: 'branch', value: ['this_month'], repetition: 6 })
      });
    
      test('every at middle', () => {
        const parser = new Parser();
        const result = parser.parse('this_month every 4 this_week mardi');
        expect(result).toEqual({ type: 'branch', 
                                 value: ['this_month', 
                                         { type: 'branch', value: ['this_week', 'mardi'], repetition: 4 }]  })
      });
  
      test('every at begining', () => {
        const parser = new Parser();
        const result = parser.parse('every 4 this_month this_week mardi');
        expect(result).toEqual({ type: 'branch', 
                                 value: ['this_month', 'this_week', 'mardi'], 
                                 repetition: 4  })
      });
      test('every before a multi', () => {
        const parser = new Parser();
        const result = parser.parse('every 2 next_week this_week');
        // problem, stack repetition branch branch => repetition multi
        // devrait être repeition branch => branch with repetition before branch
        expect(result).toEqual(
          { type: 'multi', value: [
            { type: 'branch', value: ['next_week'], repetition: 2 },
            { type: 'branch', value: ['this_week'] }
          ]}
        )
      })
    })
  });

  describe('many flags', () => {
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
  describe('shift', () => {
    test('next_week + 1', () => {
      const parser = new Parser();
      const result = parser.parse('next_week + 1');
      expect(result).toEqual({ type: 'branch', value: ['next_week'], shift: 1 })
    })
  
    const parser = new Parser();
      
    test('next_week + 1 mardi', () => {
      const result = parser.parse('next_week + 1 mardi');
      expect(result).toEqual({ type: 'branch', value: [ 'next_week', 'mardi' ], shift: 1 })
    })

    test('shift on second node', () => {
      const given =  'next_month this_week + 4 jeudi aprem'
      const expected = {  type: 'branch',
                          value: [ 'next_month', 
                                    { type: 'branch',
                                      value: [ 'this_week', 'jeudi', 'aprem' ],
                                      shift: 4
                                    } ]
                      }
      const result = parser.parse(given)
      expect(result).toEqual(expected)
    })
  })
  test('week', () => {
    const parser = new Parser();
    const result = parser.parse('week');
    expect(result).toEqual({ type: 'branch', value: ['week'] })
  })
})

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