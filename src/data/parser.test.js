import { Parser, getLevelNode, reduceFlag, shiftBranchOrFlag, node2Tree } from './parser'

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
})

describe('parseNode parseBranch', () => {
  describe('parseNode', () => {
    test('nominal', () => {
      const parser = new Parser(['disable', 'every', '1', 'lundi', '+', '1','end'],[],[])
      const expected = [{  type: 'node', value: 'lundi', repetition: 1, shift: 1, flags: ['disable'] }]
      const result = parser.parseNode()
      expect(parser.stackNode).toEqual(expected)
    });
    test('chaque', () => {
      const parser = new Parser(['chaque', 'mardi','end'],[],[])
      const expected = [{  type: 'node', value: 'mardi', flags: ['chaque'] }]
      const result = parser.parseNode()
      expect(parser.stackNode).toEqual(expected)
    })
    test('two nodes', () => {
      const parser = new Parser(['lundi', 'mardi','end'], [], [])
      const expected = [{  type: 'node', value: 'lundi' }, { type:'node', value:'mardi'}]
      const result = parser.parseNode()
      expect(parser.stackNode).toEqual(expected)
    });
    test('repetition node', () => {
      const parser = new Parser(['every', '6', 'this_week', 'end'], [], [])
      const expected = [{  type: 'node', value: 'this_week', repetition: 6 } ]
      const result = parser.parseNode()
      expect(parser.stackNode).toEqual(expected)
    });

  })
});

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
    test('multi at second position',        () => {
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
    test('multi at second position which is disabled', () => {
      const parser = new Parser();
      const result = parser.parse('this_week mardi disable jeudi');
      expect(result).toEqual(
        {type:'branch',value:[
          'this_week', 
          {type:'multi',value:[
            {type:'branch',value:['mardi']},
            {type:'branch',value:['jeudi'], flags: ['disable'] }
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
    describe.skip('every2', () => {
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
      test('branch wth repetition multi', () => {
        const parser = new Parser();
        const result = parser.parse('every 2 this_week lundi vendredi');
        const expected = {   type: "branch",
        value: [ "this_week",
          { type: "multi",
            value: [
              { type: "branch", value: [ "lundi" ] },
              { type: "branch", value: [ "vendredi" ] },
            ],
          },
        ],
        repetition: 2
        }
        expect(result).toEqual(expected)
      })
      
      test('every without number', () => {
        const parser = new Parser();
        const result = parser.parse('every this_week');
        expect(result).toEqual({ type: "branch", value: [ "this_week" ], repetition: 1 })
      });
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
    test('disable chaque second', () => {
      const parser = new Parser();
      const result = parser.parse('this_week mardi disable chaque next_week mercredi $end');
      expect(result).toEqual({ type: 'multi', value: [
        { type:'branch', value:[ 'this_week', 'mardi' ] },
        { type:'branch', value:[ 'next_week', 'mercredi' ], flags: ['disable', 'chaque'] }
      ]})
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

  test('parse null', () => {
    const parser = new Parser();
    const result = parser.parse(null);
    expect(result).toEqual(undefined);
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

describe('parseTree', () => {

  function createParser(stackNode, rootTree, currentTree, parentsTree) {
    const Parser = new Parser()
    parser.stackNode = stackNode
    parser.rootTree = rootTree
    parser.currentTree = currentTree
    parser.parentsTree = parentsTree
    return parser
  }
  
  const parser = new Parser()

  describe('node2Tree', () => {
    test('node', () => {
      const given = { value: 5 }
      const expected = { value: 5, child: [] }
      const result = node2Tree(given)
      expect(result).toEqual(expected)
    });
    test('number', () => {
      const given = 5
      const expected = { value: 5, child: [] }
      const result = node2Tree(given)
      expect(result).toEqual(expected)
    });
    test('with flags', () => {
      const given = { type: "node", value: "this_week", flags: [ "disable" ] }
      const expected = { value: 'this_week', child: [], disable: true }
      const result = node2Tree(given)
      expect(result).toEqual(expected)
    })
    test('with repetition', () => {
      const given = { type: "node", value: "this_week", repetition: 12 }
      const expected = { value: 'this_week', child: [], repetition: 12 }
      const result = node2Tree(given)
      expect(result).toEqual(expected)
    })
    test('with shift', () => {
      const given = { type: "node", value: "this_week", shift: 1 }
      const expected = { value: 'this_week', child: [], shift: 1 }
      const result = node2Tree(given)
      expect(result).toEqual(expected)
    })
    test('with chaque', () => {
      const given = { type: "node", value: "this_week", flags:['chaque'] }
      const expected = { value: 'this_week', child: [], chaque: true }
      const result = node2Tree(given)
      expect(result).toEqual(expected)
    })
  });

  test('deeper', () => {
      const parser = new Parser()
      parser.stackNode   = [3,4]
      parser.rootTree    = { value: -1, child : [
                            { value: 1, child: [
                                { value: 2, child: []}
                            ]}
                            ]}
      parser.currentTree = parser.rootTree.child.at(0).child.at(0)
      parser.parentsTree = [parser.rootTree, parser.rootTree.child.at(0)]

      parser.parseTreeOne()

      expect(parser.rootTree).toEqual(
          { value: -1, child : [
              { value: 1, child: [
                  { value: 2, child: [
                      { value: 3, child: []}
                  ]}
              ]}
          ]})
      expect(parser.currentTree).toBe(parser.rootTree.child.at(0).child.at(0).child.at(0))
      expect(parser.parentsTree).toEqual([parser.rootTree, parser.rootTree.child.at(0), parser.rootTree.child.at(0).child.at(0)])
      expect(parser.stackNode).toEqual([4])
  });
  test('same', () => {
      const parser = new Parser()
      parser.stackNode = [2,3]
      parser.rootTree = { value: -1, child: [ 
                  { value: 1, child: [
                      { value: 2, child:[]} 
                  ]}
              ]}
      parser.currentTree = parser.rootTree.child.at(0).child.at(0)
      parser.parentsTree = [parser.rootTree, parser.rootTree.child.at(0)]
      parser.parseTreeOne()
      expect(parser.rootTree).toEqual({ value: -1, child: [ 
          { value: 1, child: [
              { value: 2, child:[]} 
          ]}
      ]})
      expect(parser.currentTree).toBe(parser.rootTree.child.at(0))
      expect(parser.parentsTree).toEqual([parser.rootTree])
      expect(parser.stackNode).toEqual([2,3])
  });
  test('lower', () => {
      const parser = new Parser()
      parser.stackNode = [1]
      parser.rootTree = { value: -1, child: [
                 { value: 1, child: [
                      { value: 2, child: [] }
                  ]}]}
      parser.parentsTree = [parser.rootTree, parser.rootTree.child.at(0)]
      parser.currentTree = parser.rootTree.child.at(0).child.at(0)
      parser.parseTreeOne()
      expect(parser.rootTree).toEqual({ value: -1, child: [
                              { value: 1, child: [ { value: 2, child: [] } ] }
                          ]})
      expect(parser.currentTree).toBe(parser.rootTree.child.at(0))
      expect(parser.parentsTree).toEqual([parser.rootTree])
      expect(parser.stackNode).toEqual([1])
  });
  test('lower++', () => {
      const parser = new Parser()
      parser.stackNode = [1]
      parser.rootTree = { value: -1, child: [
                 { value: 2, child: [
                      { value: 3, child: [] }
                  ]}]}
      parser.parentsTree = [parser.rootTree]
      parser.currentTree = parser.rootTree.child.at(0)
      parser.parseTreeOne()
      expect(parser.rootTree).toEqual({ value: -1, child: [
                              { value: 2, child: [ 
                                  { value: 3, child: [] } ] }
                          ]})
      expect(parser.currentTree).toBe(parser.rootTree)
      expect(parser.parentsTree).toEqual([])
      expect(parser.stackNode).toEqual([1])
  });
  test('empty root', () => {
      const parser = new Parser()
      parser.stackNode= [1]
      parser.rootTree = { value: -1, child: [] }
      parser.currentTree = parser.rootTree
      parser.parentsTree = []
      parser.parseTreeOne()
      expect(parser.rootTree).toEqual({ value: -1, child: [{ value: 1, child: [] }]})
      expect(parser.currentTree).toBe(parser.rootTree.child.at(0))
      expect(parser.parentsTree).toEqual([parser.rootTree])
      expect(parser.stackNode).toEqual([])
  });
  test('empty input', () => {
      const parser = new Parser()
      parser.stackNode= []
      parser.rootTree = { value: -1, child: [] }
      parser.currentTree = parser.rootTree
      parser.parentsTree = []
      parser.parseTreeOne()
      expect(parser.rootTree).toEqual({ value: -1, child: []})
      expect(parser.currentTree).toBe(parser.rootTree)
      expect(parser.parentsTree).toEqual([])
      expect(parser.stackNode).toEqual([])
  });
  test('chain', () => {
      const parser = new Parser()
      parser.stackNode= [1, 2, 3, 2, 3, 3]
      parser.rootTree = { value: -1, child: [] }
      parser.currentTree = parser.rootTree
      parser.parentsTree = []
      parser.parseTree()
      expect(parser.rootTree).toEqual({ value: -1, child: [
                                        { value: 1, child: [
                                            { value: 2, child: [ { value: 3, child: [] } ]},
                                            { value: 2, child: [
                                                { value: 3, child: [] },
                                                { value: 3, child: [] }
                                            ]}
                                        ]}
                                      ]})
      expect(parser.currentTree).toBe(parser.rootTree.child.at(0).child.at(1).child.at(1))
      expect(parser.parentsTree).toEqual([parser.rootTree,
                               parser.rootTree.child.at(0),
                               parser.rootTree.child.at(0).child.at(1)])
      expect(parser.stackNode).toEqual([])
  });
  test('chain2', () => {
      const parser = new Parser()
      parser.stackNode = [2, 3, 2, 3, 3, 1]
      parser.rootTree = { value: -1, child: [] }
      parser.currentTree = parser.rootTree
      parser.parentsTree = []
      parser.parseTree()
      expect(parser.rootTree).toEqual({ value: -1, child: [
                              { value: 2, child: [ { value: 3, child: [] } ]},
                              { value: 2, child: [
                                  { value: 3, child: [] },
                                  { value: 3, child: [] }
                              ]},
                              { value: 1, child: [] }
      ]})
      expect(parser.currentTree).toBe(parser.rootTree.child.at(2))
      expect(parser.parentsTree).toEqual([parser.rootTree])
      expect(parser.stackNode).toEqual([])
  });
})

describe('chain parseNode, parseTree, parseBranch', () => {
  test('lundi', () => {
    const parser = new Parser();
    parser.input = ['lundi']
    parser.stackNode = []
    parser.parseNode();
    parser.parseTree();
    expect(parser.rootTree).toEqual({value:-1, child:[{value:'lundi', child:[]}]})
    parser.parseBranch();
    expect(parser.stackBranch).toEqual({ "type": "branch", "value": [ "lundi" ] })
  })
});