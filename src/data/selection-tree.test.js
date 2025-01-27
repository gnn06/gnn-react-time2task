import { branchToTree, isInsideSelected, selectionToTree, selectionShift, selectionDelete, treetoBranch, treeToSelection, selectionAdd, _makeBranch, selectionMove } from "./selection-tree";

describe('treeToBranch', () => {
  test('undefined ', () => {
    const result = treetoBranch(undefined)  
    expect(result).toEqual(undefined)
  });

  test('simple ', () => {
    const result = treetoBranch('aprem')  
    expect(result).toEqual('aprem')
  });
  
  test('final case ', () => {
    const result = treetoBranch({ value: 'aprem', child: [] })  
    expect(result).toEqual({ type: 'branch', value: ['aprem'] })
  });
  
  test('two simple ', () => {
    const result = treetoBranch({ value: 'mercredi', child: [ { value: 'aprem', child: [] }] })  
    expect(result).toEqual({ type:'branch', value: ['mercredi', 'aprem'] })
  });
  
  test('three simple ', () => {
    const result = treetoBranch({ value: 'this_week', child: [{ value: 'mercredi', child: [ { value: 'aprem', child: [] }] }] })  
    expect(result).toEqual({ type:'branch', value: ['this_week', 'mercredi', 'aprem'] })
  });
  
  test('multi ', () => {
    const result = treetoBranch(
      { value: 'this_week', child: [
        { value: 'mercredi', child: [ ] },
        { value: 'jeudi', child: [ ] }] })  
    expect(result).toEqual(
      { type:'branch', value: ['this_week', 
        { type: 'multi', value: [ 
          { type:'branch', value: ['mercredi' ] }, 
          { type:'branch', value: ['jeudi']}] 
        }] })
  });
  
  test('multi with sub ', () => {
    const result = treetoBranch(
      { value: 'this_week', child: [
        { value: 'mercredi', child: [ 
          { value: 'aprem', child: [] }] },
        { value: 'jeudi', child: [ ] }],
      })  
    expect(result).toEqual(
      { type:'branch', value: ['this_week', 
        { type: 'multi', value: [ 
          { type:'branch', value: ['mercredi', 'aprem'] }, 
          { type:'branch',value: ['jeudi']}] 
        }] })
  });
  
  test('multi inside ', () => {
    const result = treetoBranch(
      { value:'this_month', child: [
        { value: 'this_week', child: [
          { value: 'mercredi', child: [ 
            { value: 'aprem', child: [] }] },
          { value: 'jeudi', child: [ ] }],
        }
      ]})  
    expect(result).toEqual(
      { type:'branch',value: ['this_month', 'this_week', 
        { type:'multi', value: [ 
          { type:'branch',value: ['mercredi', 'aprem'] }, 
          { type:'branch',value: ['jeudi']}] 
        }] })
  });
  
  test('multi inside 2 ', () => {
    const result = treetoBranch(
      { value:'this_month', child: [
        { value: 'this_week', child: [
          { value: 'mercredi', child: [ 
            { value: 'aprem', child: [] }] },
          { value: 'jeudi', child: [ ] }],
        },
        { value: 'next_week', child: [] }
      ]})  
    expect(result).toEqual(
      { type:'branch',value: ['this_month', 
        { type:'multi', value: [
          { type:'branch',value: [ 'this_week', 
            { type:'multi',value: [ 
              { type:'branch',value: ['mercredi', 'aprem'] }, 
              { type:'branch', value: ['jeudi']}] 
            }]},
          { type:'branch',value: ['next_week']}
        ]}
      ]})     
  })
  test('root -1 branch', () => {
    const result = treetoBranch(
      { value:-1, child: [
        { value: 'this_week', child: [] }
      ]})
    expect(result).toEqual(
      { type:'branch', value: [ 'this_week' ]})
    })
    test('root -1 multi', () => {
    const result = treetoBranch(
      { value:-1, child: [
        { value: 'this_week', child: [] },
        { value: 'next_week', child: [] }
      ]})
    expect(result).toEqual(
      { type:'multi', value: [
        { type:'branch',value: [ 'this_week' ]},
        { type:'branch',value: [ 'next_week' ]}
      ]})
    })
  // describe('with properties', () => {
    test('final case ', () => {
      const result = treetoBranch({ value: 'aprem', child: [], repetition: 12, disable: true })  
      expect(result).toEqual({ type:'branch',value: ['aprem'], flags: ['disable'], repetition: 12 })
    });

  //   test('final case debug ', () => {
  //     const given = {
  //       "value": "this_month",
  //       "child": [
  //        {
  //         "value": "this_week",
  //         "child": [],
  //         "disable": true,
  //         "repetition": 12
  //        }
  //       ]
  //      }
  //     const result = treetoBranch(given)  
  //     expect(result).toEqual({ type:'branch',value: ['this_month', { type:'branch',value:['this_week'], flags: ['disable'], repetition: 12}] })
  //   })
  // });
  test('debug', () => {
    const given = 
      { value:'this_month', child: [
        { value: 'this_week', child: [
          { value: 'mercredi', child: [ 
            ] },
          ], repetition: 12
        }
    ]}
    const expected = 
      { type:'branch',value: ['this_month', 
        { type:'branch',value: [ 'this_week', 'mercredi' ], repetition: 12}
      ]}
    const result = treetoBranch(given)  
    expect(result).toEqual(expected)

  });
  test('shift', () => {
    const given = {"value":"this_week","child":[],"shift":3}
    const expected = {"type":"branch","value":["this_week"], shift: 3}
    const result = treetoBranch(given)
    expect(result).toEqual(expected)
    
  });
});

describe('branchToTree', () => {
  test('should ', () => {
    const given = { type: 'branch', value: ['aprem'] }
    const expected = { value: 'aprem', child: [] }
    const result = branchToTree(given)
    expect(result).toEqual(expected)
  });
  test('two node flat', () => {
    const given = { type: 'branch', value: ['mardi', 'aprem'] }
    const expected = { value: 'mardi', child: [ { value: 'aprem', child: [] } ] }
    const result = branchToTree(given)
    expect(result).toEqual(expected)
  });
  test('multi ', () => {
    const given = { type: 'branch', value: ['this_week', 
      { type: 'multi', value: [{ type: 'branch', value: ['mardi'] },
                               { type: 'branch', value: ['mercredi'] }] }] }
    
    const expected = { value: 'this_week', child: [ { value: 'mardi', child: [] },
                                                    { value: 'mercredi', child: [] }] }
    const result = branchToTree(given)
    expect(result).toEqual(expected)
  });
  test('repetition ', () => {
    const given = { type: 'branch', value: ['aprem'], repetition: 12 }
    const expected = { value: 'aprem', child: [], repetition: 12 }
    const result = branchToTree(given)
    expect(result).toEqual(expected)
  });
  test('repetition on child', () => {
    const given = { type: 'branch', value: ['this_month', { type: 'branch', value: ['this_week'], repetition: 2 } ] }
    const expected = { value: 'this_month', child: [{ value: 'this_week', child: [], repetition: 2 }] }
    const result = branchToTree(given)
    expect(result).toEqual(expected)
  });
  test('repetition on first node', () => {
    // every 1 this_week lundi aprem mercredi matin
    const given = { "type": "branch", "value": ["this_month", { "type": "branch", "value": ["this_week", { "type": "multi", "value": [{ "type": "branch", "value": ["lundi", "aprem"] }, { "type": "branch", "value": ["mercredi", "matin"] }] }], "repetition": 1 }] }
    const expected = { "value": "this_month", "child": [{ "value": "this_week", "child": [{ "value": "lundi", "child": [{ "value": "aprem", "child": [] }] }, { "value": "mercredi", "child": [{ "value": "matin", "child": [] }] }], repetition: 1 }] }
    const result = branchToTree(given)
    expect(result).toEqual(expected)
  });
  test('shift', () => {
    const given = {"type":"branch","value":["this_month",{"type":"branch","value":["this_week"],"shift":3}]}
    const expected = {"value":"this_month","child":[{"value":"this_week","child":[], shift: 3}]}
    const result = branchToTree(given)
    expect(result).toEqual(expected)
  });
})

describe('selectionToTree', () => {
  test('simple', () => {
    const flat = new Map([
      ['this_month this_week mercredi', { disable: true }],
      ['this_month this_week jeudi'],
      ['this_month next_week', { repetition: 2 }],
    ]);
    const expected = {
      value: "this_month",
      child: [
        {
          value: "this_week",
          child: [
            {
              value: "mercredi",
              child: [],
              "disable": true,
            },
            {
              value: "jeudi",
              child: [],
            },
          ],
        },
        {
          value: "next_week",
          child: [],
          "repetition": 2,
        },
      ],
    }
    const result = selectionToTree(flat)
    expect(result).toEqual(expected)
  });

  test('selectionToTree', () => {
    const givenMap = new Map([["this_month this_week mercredi",{"selected":true,"repetition":0,"disable":false}]])
    const expected = { value: "this_month", child: [
      { value: "this_week", child: [
        { value: "mercredi", child: [], repetition:0, disable: false }
      ] }
    ] }
    const result = selectionToTree(givenMap)
    expect(result).toEqual(expected)
  });

  test('repetition on week and day selected', () => {
    const given = new Map([["this_month this_week mercredi",{"selected":true,"repetition":0,"disable":false}],
                           ["this_month this_week",{"selected":true,"repetition":12,"disable":false}]])
    const expected = 
      { value: "this_month", child: [
        { value: "this_week", child: [
          { value: "mercredi", child: [], repetition:0, disable: false }
        ], repetition: 12 }
    ] }
    const result = selectionToTree(given)
    expect(result).toEqual(expected)
  });

  test('disable on week and day selected', () => {
    const given = new Map([["this_month this_week mercredi",{"selected":true,"repetition":0,"disable":false}],
                           ["this_month this_week",{"selected":true,"repetition":0,"disable":true}]])
    const expected = 
      { value: "this_month", child: [
        { value: "this_week", child: [
          { value: "mercredi", child: [], repetition:0, disable: false }
        ], disable: true }
    ] }
    const result = selectionToTree(given)
    expect(result).toEqual(expected)
  });
  test('shift', () => {
    const given = new Map([["this_month this_week + 3",{"selected":true,"disable":false}]])
    const expected = {"value":"this_month","child":[{"value":"this_week","child":[],"disable":false, shift: 3}]}
    const result = selectionToTree(given)
    expect(result).toEqual(expected)
  })
});

describe('treeToSelection', () => {
  test('1', () => {
    const given = {"value":"this_month","child":[{"value":"this_week","child":[{"value":"mercredi","child":[]}],"disable":true}]}
    const expected = [["this_month this_week",{"selected":true,"disable":true}],
                      ["this_month this_week mercredi",{"selected":true,"disable":false}],                    
                    ]
    const result = treeToSelection(given)
    expect(result).toEqual(expected)
  })  
  
  test('array of tree', () => {
    // this_month this_week mercredi matin this_month every 2 next_week
    const given = 
    [
      {"value":"this_month","child":[{"value":"this_week","child":[{"value":"mercredi","child":[{"value":"matin","child":[]}]}]}]},{"value":"this_month","child":[{"value":"next_week","child":[],"repetition":2}]}]
    
    const expected = 
    [
      [
        "this_month this_week mercredi matin",
        {
          "disable": false,
          "repetition": undefined,
          "selected": true,
        },
      ],
      [
        "this_month next_week",
        {
          "disable": false,
          "repetition": 2,
          "selected": true,
        },
      ],
    ]

    const result = treeToSelection(given)
    expect(result).toEqual(expected)
  });
  test('shift week', () => {
    const given = {"value":"this_month","child":[{"value":"this_week","child":[],"shift":3}]}
    const expected = [["this_month this_week + 3",{"selected":true,"disable":false}]]
    const result = treeToSelection(given)
    expect(result).toEqual(expected)
  });
  test('shift month with week', () => {
    const given = {"value":"next_month","child":[{"value":"this_week","child":[]}],"shift":1}
    const expected = [["next_month + 1 this_week",{"selected":true,"disable":false}]]
    const result = treeToSelection(given)
    expect(result).toEqual(expected)
  })
});

describe("selection manipulation", () => {
  describe('isInsideSelection', () => {
    const givenSelection = new Map([["this_month this_week mardi", { selected: true }]])
    test('inside', () => {
        const givenPath      = "this_month"
        const expected = true
        const result = isInsideSelected(givenPath, givenSelection)
        expect(result).toEqual(expected)
    });
    test('inside terminal', () => {
        const givenPath      = "this_month this_week mardi"
        const expected = true
        const result = isInsideSelected(givenPath, givenSelection)
        expect(result).toEqual(expected)
    });
    test('outsite from first level', () => {
        const givenPath      = "next_month"
        const expected = false
        const result = isInsideSelected(givenPath, givenSelection)
        expect(result).toEqual(expected)
    });
    test('outsite deeper', () => {
        const givenPath      = "this_month this_week mardi aprem"
        const expected = false
        const result = isInsideSelected(givenPath, givenSelection)
        expect(result).toEqual(expected)
    });
    test('debug', () => {
        const givenSelection = new Map([["this_month this_week mardi aprem", { selected: true }]])
        const givenPath      = "this_month this_week mardi"
        const expected       = true
        const result = isInsideSelected(givenPath, givenSelection)
        expect(result).toEqual(expected)
    });
  });

  describe('selectionShift', () => {
    test('simple', () => {
      const given    = new Map([["this_month this_week mercredi", { selected: true }]])
      const expected = new Map([["this_month this_week jeudi",    { selected: true }]])
      const result = selectionShift(given, "this_month this_week mercredi", 1)
      expect(result).toEqual(expected)
    });
    test('no match', () => {
      const given    = new Map([["this_month",           { selected: true }]])
      const expected = new Map([["this_month",           { selected: true }]])

      const result = selectionShift(given, "next_month", 1)
      expect(result).toEqual(expected)
    })
    test('no match deeper', () => {
      const given    = new Map([["this_month",           { selected: true }]])
      const expected = new Map([["this_month",           { selected: true }]])

      const result = selectionShift(given, "this_month this_week", 1)
      expect(result).toEqual(expected)
    })
    test('complexe', () => {
      const given    = new Map([["this_month this_week",           { selected: true }],
                                ["this_month this_week mercredi",  { selected: true }],
                                ["this_month",                     { selected: true }]])
      const expected = new Map([["this_month next_week",           { selected: true }],
                                ["this_month next_week mercredi",  { selected: true }],
                                ["this_month",                     { selected: true }]])

      const result = selectionShift(given, "this_month this_week", 1)
      expect(result).toEqual(expected)
    })
    test('previous', () => {
      const given    = new Map([["this_month next_week mercredi", { selected: true }]])
      const expected = new Map([["this_month this_week mercredi", { selected: true }]])
      const result = selectionShift(given, "this_month next_week", -1)
      expect(result).toEqual(expected)
    })
    test('2', () => {
      const given    = new Map([["this_month this_week mercredi", { selected: true }]])
      const expected = new Map([["this_month following_week mercredi", { selected: true }]])
      const result = selectionShift(given, "this_month this_week", 2)
      expect(result).toEqual(expected)
    })
  });

  describe('selectionMove', () => {
    test('nominal', () => {
      const given    = new Map([["this_month this_week mardi", { selected: true }],["this_month this_week vendredi", { selected: true }]])
      const expected = new Map([["this_month this_week jeudi", { selected: true }],["this_month this_week vendredi", { selected: true }]])
      const result = selectionMove(given, "this_month this_week mardi", "this_month this_week jeudi")
      expect(result).toEqual(expected)
    });
    test('move upper', () => {
      const given    = new Map([["this_month this_week mardi", { selected: true }]])
      const expected = new Map([["this_month next_week mardi", { selected: true }]])
      const result = selectionMove(given, "this_month this_week", "this_month next_week")
      expect(result).toEqual(expected)
    });
  })

  describe('delete', () => {
    test('should ', () => {
      const given    = new Map([["this_month this_week mercredi", { selected: true }]])
      const expected = new Map([["this_month this_week",          { selected: true }]])
      const result = selectionDelete(given, "this_month this_week mercredi")
      expect(result).toEqual(expected)
    });
    test('with property ', () => {
      const given    = new Map([["this_month this_week mercredi", { selected: true }],
                                ["this_month this_week",          { selected: true, repetition: 12 }]])
      const expected = new Map([["this_month this_week",          { selected: true, repetition: 12 }]])
      const result = selectionDelete(given, "this_month this_week mercredi")
      expect(result).toEqual(expected)
    })
    test('with property on deleted ', () => {
      const given    = new Map([["this_month this_week mercredi aprem", { selected: true }],
                                ["this_month this_week",                { selected: true, repetition: 12 }]])
      const expected = new Map([["this_month",                          { selected: true }]])
      const result = selectionDelete(given, "this_month this_week")
      expect(result).toEqual(expected)
    })
    test('with property upper deleted ', () => {
      const given    = new Map([["this_month this_week",                { selected: true, repetition: 12 }],
                                ["this_month this_week mercredi aprem", { selected: true }]])
      const expected = new Map([["this_month this_week",                { selected: true, repetition: 12 }]])
      const result = selectionDelete(given, "this_month this_week mercredi")
      expect(result).toEqual(expected)
    })
  });

  describe("add", () => {
    test("outside => add", () => {
      const given    = new Map([["this_month this_week", { selected: true }]])
      const result = selectionAdd(given, "this_month this_week mercredi")
      const expected = new Map([["this_month this_week mercredi", { selected: true }]])
      expect(result).toEqual(expected)
    });
    test("inside => don't add", () => {
      const given    = new Map([["this_month this_week mercredi", { selected: true }]])
      const result = selectionAdd(given, "this_month this_week")
      const expected = new Map([["this_month this_week mercredi", { selected: true }]])
      expect(result).toEqual(expected)
    });
    test("equal => don't add", () => {
      const given    = new Map([["this_month this_week", { selected: true }]])
      const result = selectionAdd(given, "this_month this_week")
      const expected = new Map([["this_month this_week", { selected: true }]])
      expect(result).toEqual(expected)
    });
    test("diff => add", () => {
      const given    = new Map([["this_month this_week", { selected: true }]])
      const result = selectionAdd(given, "this_month next_week")
      const expected = new Map([["this_month this_week", { selected: true }],
                                ["this_month next_week", { selected: true }]])
      expect(result).toEqual(expected)
    });
    test("empty => add", () => {
      const given    = new Map([])
      const result = selectionAdd(given, "this_month this_week")
      const expected = new Map([["this_month this_week", { selected: true }]])
      expect(result).toEqual(expected)
    });
    test("add with repeat", () => {
      const given    = new Map([["this_month this_week", { selected: true, repetition: 12 }]])
      const result = selectionAdd(given, "this_month this_week mercredi")
      const expected = new Map([["this_month this_week",          { selected: true, repetition: 12 }],
                                ["this_month this_week mercredi", { selected: true }]])
      expect(result).toEqual(expected)
    });
    test("add with disable", () => {
      const given    = new Map([["this_month this_week", { selected: true, disable: true }]])
      const result = selectionAdd(given, "this_month this_week mercredi")
      const expected = new Map([["this_month this_week",          { selected: true, disable: true }],
                                ["this_month this_week mercredi", { selected: true }]])
      expect(result).toEqual(expected)
    })
  })
})

describe('makeBranch', () => {
  test('multi', () => {
    const givenChild = [1,1]
    const givenTree  = {}
    const expected   = { type: 'multi', value: [1,1] }
    const result = _makeBranch('multi', givenChild, givenTree)
    expect(result).toEqual(expected)
  });
  test('chaque', () => {
    const givenType = 'branch'
    const givenChild = [1]
    const givenTree  = { value: "this_week", child: [], chaque: true, }
    const expected   = { type: 'branch', value: [1], flags:['chaque'] }
    const result = _makeBranch(givenType, givenChild, givenTree)
    expect(result).toEqual(expected)
  });
  test('chaque and disable', () => {
    const givenType = 'branch'
    const givenChild = [1]
    const givenTree  = { value: "this_week", child: [], chaque: true, disable: true }
    const expected   = { type: 'branch', value: [1], flags:['disable','chaque'] }
    const result = _makeBranch(givenType, givenChild, givenTree)
    expect(result).toEqual(expected)
  })  
});