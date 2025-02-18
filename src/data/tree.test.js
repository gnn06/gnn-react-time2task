import { SlotPath } from "./slot-path";
import { _makeBranch, branchToTree, treeAdd, treetoBranch } from "./tree";

describe('branchToTree', () => {
  test('should', () => {
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
  test('multi', () => {
    const given = { type: 'branch', value: ['this_week', 
      { type: 'multi', value: [{ type: 'branch', value: ['mardi'] },
                               { type: 'branch', value: ['mercredi'] }] }] }
    
    const expected = { value: 'this_week', child: [ { value: 'mardi', child: [] },
                                                    { value: 'mercredi', child: [] }] }
    const result = branchToTree(given)
    expect(result).toEqual(expected)
  });
  test('repetition', () => {
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

describe('treeToBranch', () => {
  test('undefined', () => {
    const result = treetoBranch(undefined)  
    expect(result).toEqual(undefined)
  });

  test('simple', () => {
    const result = treetoBranch('aprem')  
    expect(result).toEqual('aprem')
  });
  
  test('final case', () => {
    const result = treetoBranch({ value: 'aprem', child: [] })  
    expect(result).toEqual({ type: 'branch', value: ['aprem'] })
  });
  
  test('two simple', () => {
    const result = treetoBranch({ value: 'mercredi', child: [ { value: 'aprem', child: [] }] })  
    expect(result).toEqual({ type:'branch', value: ['mercredi', 'aprem'] })
  });
  
  test('three simple', () => {
    const result = treetoBranch({ value: 'this_week', child: [{ value: 'mercredi', child: [ { value: 'aprem', child: [] }] }] })  
    expect(result).toEqual({ type:'branch', value: ['this_week', 'mercredi', 'aprem'] })
  });
  
  test('multi', () => {
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
  
  test('multi with sub', () => {
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
  
  test('multi inside', () => {
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
  
  test('multi inside 2', () => {
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
  test('all propreties', () => {
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
})

describe('treeAdd', () => {
    test('empty', () => {
        const givenTree = { value: '', child: [] }
        const givenPath = new SlotPath("this_month")
        const expected  = { value: '', child: [{ value: 'this_month', child: [] }] }
        treeAdd(givenTree, givenPath)
        expect(givenTree).toEqual(expected)
    });
    test('noadd', () => {
        const givenTree = { value: '', child: [{ value: 'this_month', child: [] }] }
        const givenPath = new SlotPath("this_month")
        const expected  = { value: '', child: [{ value: 'this_month', child: [] }] }
        treeAdd(givenTree, givenPath)
        expect(givenTree).toEqual(expected)
    });
    test('addsibbling', () => {
        const givenTree = { value: '', child: [{ value: 'this_month', child: [] }] }
        const givenPath = new SlotPath("next_month")
        const expected  = { value: '', child: [{ value: 'this_month', child: [] },{ value: 'next_month', child: [] }] }
        treeAdd(givenTree, givenPath)
        expect(givenTree).toEqual(expected)
    });
    test('addchild', () => {
        const givenTree = { value: '', child: [{ value: 'this_month', child: [] }] }
        const givenPath = new SlotPath("this_month this_week")
        const expected  = { value: '', child: [{ value: 'this_month', child: [{ value: 'this_week', child: [] }] },] }
        treeAdd(givenTree, givenPath)
        expect(givenTree).toEqual(expected)
    });
    test('addbranch', () => {
        const givenTree = { value: '', child: [{ value: 'this_month', child: [] }] }
        const givenPath = new SlotPath("next_month this_week")
        const expected  = { value: '', child: [{ value: 'this_month', child: [] },{ value: 'next_month', child: [{ value: 'this_week', child: [] }] }] }
        treeAdd(givenTree, givenPath)
        expect(givenTree).toEqual(expected)
    });
    test('addbranch2', () => {
        const givenTree = { value: '', child: [{ value: 'this_month', child: [{ value: 'this_week', child: [] }] }] }
        const givenPath = new SlotPath("this_month next_week")
        const expected  = { value: '', child: [{ value: 'this_month', child: [{ value: 'this_week', child: [] },{ value: 'next_week', child: [] }] }] }
        treeAdd(givenTree, givenPath)
        expect(givenTree).toEqual(expected)
    })
});

