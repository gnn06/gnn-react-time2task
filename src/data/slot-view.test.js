import { reduceCollapseOnConf, slotViewAdd, slotViewFilter, slotViewFilterSelection, transPathToConf } from "./slot-view";

const defaultConf = {
   collapse: [
      "this_month next_week",
      "this_month following_week",
      "next_month"
   ],
   remove: [],
   levelMin: null,
   levelMaxIncluded: null
}

test('empty conf', () => {
   const conf = {
      collapse: [],
      remove: [],
      levelMin: null,
      levelMaxIncluded: null
   }
   const expected = [
      {
         "id": "this_month",
         "path": "this_month",
         "inner": [
            {
               "id": "this_week",
               "path": "this_month this_week",
               "inner": [
                  {
                     "id": "lundi",
                     "path": "this_month this_week lundi",
                     "inner": [
                        {
                           "id": "matin",
                           "path": "this_month this_week lundi matin",
                           "inner": []
                        },
                        {
                           "id": "aprem",
                           "path": "this_month this_week lundi aprem",
                           "inner": []
                        }
                     ]
                  },
                  {
                     "id": "mardi",
                     "path": "this_month this_week mardi",
                     "inner": [
                        {
                           "id": "matin",
                           "path": "this_month this_week mardi matin",
                           "inner": []
                        },
                        {
                           "id": "aprem",
                           "path": "this_month this_week mardi aprem",
                           "inner": []
                        }
                     ]
                  },
                  {
                     "id": "mercredi",
                     "path": "this_month this_week mercredi",
                     "inner": [
                        {
                           "id": "matin",
                           "path": "this_month this_week mercredi matin",
                           "inner": []
                        },
                        {
                           "id": "aprem",
                           "path": "this_month this_week mercredi aprem",
                           "inner": []
                        }
                     ]
                  },
                  {
                     "id": "jeudi",
                     "path": "this_month this_week jeudi",
                     "inner": [
                        {
                           "id": "matin",
                           "path": "this_month this_week jeudi matin",
                           "inner": []
                        },
                        {
                           "id": "aprem",
                           "path": "this_month this_week jeudi aprem",
                           "inner": []
                        }
                     ]
                  },
                  {
                     "id": "vendredi",
                     "path": "this_month this_week vendredi",
                     "inner": [
                        {
                           "id": "matin",
                           "path": "this_month this_week vendredi matin",
                           "inner": []
                        },
                        {
                           "id": "aprem",
                           "path": "this_month this_week vendredi aprem",
                           "inner": []
                        }
                     ]
                  }
               ]
            },
            {
               "id": "next_week",
               "path": "this_month next_week",
               "inner": [
                  {
                     "id": "lundi",
                     "path": "this_month next_week lundi",
                     "inner": [
                        {
                           "id": "matin",
                           "path": "this_month next_week lundi matin",
                           "inner": []
                        },
                        {
                           "id": "aprem",
                           "path": "this_month next_week lundi aprem",
                           "inner": []
                        }
                     ]
                  },
                  {
                     "id": "mardi",
                     "path": "this_month next_week mardi",
                     "inner": [
                        {
                           "id": "matin",
                           "path": "this_month next_week mardi matin",
                           "inner": []
                        },
                        {
                           "id": "aprem",
                           "path": "this_month next_week mardi aprem",
                           "inner": []
                        }
                     ]
                  },
                  {
                     "id": "mercredi",
                     "path": "this_month next_week mercredi",
                     "inner": [
                        {
                           "id": "matin",
                           "path": "this_month next_week mercredi matin",
                           "inner": []
                        },
                        {
                           "id": "aprem",
                           "path": "this_month next_week mercredi aprem",
                           "inner": []
                        }
                     ]
                  },
                  {
                     "id": "jeudi",
                     "path": "this_month next_week jeudi",
                     "inner": [
                        {
                           "id": "matin",
                           "path": "this_month next_week jeudi matin",
                           "inner": []
                        },
                        {
                           "id": "aprem",
                           "path": "this_month next_week jeudi aprem",
                           "inner": []
                        }
                     ]
                  },
                  {
                     "id": "vendredi",
                     "path": "this_month next_week vendredi",
                     "inner": [
                        {
                           "id": "matin",
                           "path": "this_month next_week vendredi matin",
                           "inner": []
                        },
                        {
                           "id": "aprem",
                           "path": "this_month next_week vendredi aprem",
                           "inner": []
                        }
                     ]
                  }
               ]
            },
            {
               "id": "following_week",
               "path": "this_month following_week",
               "inner": [
                  {
                     "id": "lundi",
                     "path": "this_month following_week lundi",
                     "inner": [
                        {
                           "id": "matin",
                           "path": "this_month following_week lundi matin",
                           "inner": []
                        },
                        {
                           "id": "aprem",
                           "path": "this_month following_week lundi aprem",
                           "inner": []
                        }
                     ]
                  },
                  {
                     "id": "mardi",
                     "path": "this_month following_week mardi",
                     "inner": [
                        {
                           "id": "matin",
                           "path": "this_month following_week mardi matin",
                           "inner": []
                        },
                        {
                           "id": "aprem",
                           "path": "this_month following_week mardi aprem",
                           "inner": []
                        }
                     ]
                  },
                  {
                     "id": "mercredi",
                     "path": "this_month following_week mercredi",
                     "inner": [
                        {
                           "id": "matin",
                           "path": "this_month following_week mercredi matin",
                           "inner": []
                        },
                        {
                           "id": "aprem",
                           "path": "this_month following_week mercredi aprem",
                           "inner": []
                        }
                     ]
                  },
                  {
                     "id": "jeudi",
                     "path": "this_month following_week jeudi",
                     "inner": [
                        {
                           "id": "matin",
                           "path": "this_month following_week jeudi matin",
                           "inner": []
                        },
                        {
                           "id": "aprem",
                           "path": "this_month following_week jeudi aprem",
                           "inner": []
                        }
                     ]
                  },
                  {
                     "id": "vendredi",
                     "path": "this_month following_week vendredi",
                     "inner": [
                        {
                           "id": "matin",
                           "path": "this_month following_week vendredi matin",
                           "inner": []
                        },
                        {
                           "id": "aprem",
                           "path": "this_month following_week vendredi aprem",
                           "inner": []
                        }
                     ]
                  }
               ]
            }
         ]
      },
      {
         "id": "next_month",
         "path": "next_month",
         "inner": [
            {
               "id": "this_week",
               "path": "next_month this_week",
               "inner": [
                  {
                     "id": "lundi",
                     "path": "next_month this_week lundi",
                     "inner": [
                        {
                           "id": "matin",
                           "path": "next_month this_week lundi matin",
                           "inner": []
                        },
                        {
                           "id": "aprem",
                           "path": "next_month this_week lundi aprem",
                           "inner": []
                        }
                     ]
                  },
                  {
                     "id": "mardi",
                     "path": "next_month this_week mardi",
                     "inner": [
                        {
                           "id": "matin",
                           "path": "next_month this_week mardi matin",
                           "inner": []
                        },
                        {
                           "id": "aprem",
                           "path": "next_month this_week mardi aprem",
                           "inner": []
                        }
                     ]
                  },
                  {
                     "id": "mercredi",
                     "path": "next_month this_week mercredi",
                     "inner": [
                        {
                           "id": "matin",
                           "path": "next_month this_week mercredi matin",
                           "inner": []
                        },
                        {
                           "id": "aprem",
                           "path": "next_month this_week mercredi aprem",
                           "inner": []
                        }
                     ]
                  },
                  {
                     "id": "jeudi",
                     "path": "next_month this_week jeudi",
                     "inner": [
                        {
                           "id": "matin",
                           "path": "next_month this_week jeudi matin",
                           "inner": []
                        },
                        {
                           "id": "aprem",
                           "path": "next_month this_week jeudi aprem",
                           "inner": []
                        }
                     ]
                  },
                  {
                     "id": "vendredi",
                     "path": "next_month this_week vendredi",
                     "inner": [
                        {
                           "id": "matin",
                           "path": "next_month this_week vendredi matin",
                           "inner": []
                        },
                        {
                           "id": "aprem",
                           "path": "next_month this_week vendredi aprem",
                           "inner": []
                        }
                     ]
                  }
               ]
            },
            {
               "id": "next_week",
               "path": "next_month next_week",
               "inner": [
                  {
                     "id": "lundi",
                     "path": "next_month next_week lundi",
                     "inner": [
                        {
                           "id": "matin",
                           "path": "next_month next_week lundi matin",
                           "inner": []
                        },
                        {
                           "id": "aprem",
                           "path": "next_month next_week lundi aprem",
                           "inner": []
                        }
                     ]
                  },
                  {
                     "id": "mardi",
                     "path": "next_month next_week mardi",
                     "inner": [
                        {
                           "id": "matin",
                           "path": "next_month next_week mardi matin",
                           "inner": []
                        },
                        {
                           "id": "aprem",
                           "path": "next_month next_week mardi aprem",
                           "inner": []
                        }
                     ]
                  },
                  {
                     "id": "mercredi",
                     "path": "next_month next_week mercredi",
                     "inner": [
                        {
                           "id": "matin",
                           "path": "next_month next_week mercredi matin",
                           "inner": []
                        },
                        {
                           "id": "aprem",
                           "path": "next_month next_week mercredi aprem",
                           "inner": []
                        }
                     ]
                  },
                  {
                     "id": "jeudi",
                     "path": "next_month next_week jeudi",
                     "inner": [
                        {
                           "id": "matin",
                           "path": "next_month next_week jeudi matin",
                           "inner": []
                        },
                        {
                           "id": "aprem",
                           "path": "next_month next_week jeudi aprem",
                           "inner": []
                        }
                     ]
                  },
                  {
                     "id": "vendredi",
                     "path": "next_month next_week vendredi",
                     "inner": [
                        {
                           "id": "matin",
                           "path": "next_month next_week vendredi matin",
                           "inner": []
                        },
                        {
                           "id": "aprem",
                           "path": "next_month next_week vendredi aprem",
                           "inner": []
                        }
                     ]
                  }
               ]
            },
            {
               "id": "following_week",
               "path": "next_month following_week",
               "inner": [
                  {
                     "id": "lundi",
                     "path": "next_month following_week lundi",
                     "inner": [
                        {
                           "id": "matin",
                           "path": "next_month following_week lundi matin",
                           "inner": []
                        },
                        {
                           "id": "aprem",
                           "path": "next_month following_week lundi aprem",
                           "inner": []
                        }
                     ]
                  },
                  {
                     "id": "mardi",
                     "path": "next_month following_week mardi",
                     "inner": [
                        {
                           "id": "matin",
                           "path": "next_month following_week mardi matin",
                           "inner": []
                        },
                        {
                           "id": "aprem",
                           "path": "next_month following_week mardi aprem",
                           "inner": []
                        }
                     ]
                  },
                  {
                     "id": "mercredi",
                     "path": "next_month following_week mercredi",
                     "inner": [
                        {
                           "id": "matin",
                           "path": "next_month following_week mercredi matin",
                           "inner": []
                        },
                        {
                           "id": "aprem",
                           "path": "next_month following_week mercredi aprem",
                           "inner": []
                        }
                     ]
                  },
                  {
                     "id": "jeudi",
                     "path": "next_month following_week jeudi",
                     "inner": [
                        {
                           "id": "matin",
                           "path": "next_month following_week jeudi matin",
                           "inner": []
                        },
                        {
                           "id": "aprem",
                           "path": "next_month following_week jeudi aprem",
                           "inner": []
                        }
                     ]
                  },
                  {
                     "id": "vendredi",
                     "path": "next_month following_week vendredi",
                     "inner": [
                        {
                           "id": "matin",
                           "path": "next_month following_week vendredi matin",
                           "inner": []
                        },
                        {
                           "id": "aprem",
                           "path": "next_month following_week vendredi aprem",
                           "inner": []
                        }
                     ]
                  }
               ]
            }
         ]
      }
   ]
   const result = slotViewFilter(conf)
   expect(result).toEqual(expected)
});

test('collapse', () => {
   const conf = {
      collapse: [
         "this_month next_week",
         "this_month following_week",
         "next_month"
      ],
      remove: [],
      levelMin: null,
      levelMaxIncluded: null
   }
   const expected = [
      {
         "id": "this_month",
         "path": "this_month",
         "inner": [
            {
               "id": "this_week",
               "path": "this_month this_week",
               "inner": [
                  {
                     "id": "lundi",
                     "path": "this_month this_week lundi",
                     "inner": [
                        {
                           "id": "matin",
                           "path": "this_month this_week lundi matin",
                           "inner": []
                        },
                        {
                           "id": "aprem",
                           "path": "this_month this_week lundi aprem",
                           "inner": []
                        }
                     ]
                  },
                  {
                     "id": "mardi",
                     "path": "this_month this_week mardi",
                     "inner": [
                        {
                           "id": "matin",
                           "path": "this_month this_week mardi matin",
                           "inner": []
                        },
                        {
                           "id": "aprem",
                           "path": "this_month this_week mardi aprem",
                           "inner": []
                        }
                     ]
                  },
                  {
                     "id": "mercredi",
                     "path": "this_month this_week mercredi",
                     "inner": [
                        {
                           "id": "matin",
                           "path": "this_month this_week mercredi matin",
                           "inner": []
                        },
                        {
                           "id": "aprem",
                           "path": "this_month this_week mercredi aprem",
                           "inner": []
                        }
                     ]
                  },
                  {
                     "id": "jeudi",
                     "path": "this_month this_week jeudi",
                     "inner": [
                        {
                           "id": "matin",
                           "path": "this_month this_week jeudi matin",
                           "inner": []
                        },
                        {
                           "id": "aprem",
                           "path": "this_month this_week jeudi aprem",
                           "inner": []
                        }
                     ]
                  },
                  {
                     "id": "vendredi",
                     "path": "this_month this_week vendredi",
                     "inner": [
                        {
                           "id": "matin",
                           "path": "this_month this_week vendredi matin",
                           "inner": []
                        },
                        {
                           "id": "aprem",
                           "path": "this_month this_week vendredi aprem",
                           "inner": []
                        }
                     ]
                  }
               ]
            },
            {
               "id": "next_week",
               "path": "this_month next_week",
               "inner": []
            },
            {
               "id": "following_week",
               "path": "this_month following_week",
               "inner": []
            }
         ]
      },
      {
         "id": "next_month",
         "path": "next_month",
         "inner": []
      }
   ]
   const result = slotViewFilter(conf)
   expect(result).toEqual(expected)
});

test('remove', () => {
   const expected = [
      {
         "id": "this_month",
         "path": "this_month",
         "inner": [
            {
               "id": "this_week",
               "path": "this_month this_week",
               "inner": [
                  {
                     "id": "lundi",
                     "path": "this_month this_week lundi",
                     "inner": [
                        {
                           "id": "matin",
                           "path": "this_month this_week lundi matin",
                           "inner": []
                        },
                        {
                           "id": "aprem",
                           "path": "this_month this_week lundi aprem",
                           "inner": []
                        }
                     ]
                  },
                  {
                     "id": "mardi",
                     "path": "this_month this_week mardi",
                     "inner": [
                        {
                           "id": "matin",
                           "path": "this_month this_week mardi matin",
                           "inner": []
                        },
                        {
                           "id": "aprem",
                           "path": "this_month this_week mardi aprem",
                           "inner": []
                        }
                     ]
                  },
                  {
                     "id": "mercredi",
                     "path": "this_month this_week mercredi",
                     "inner": [
                        {
                           "id": "matin",
                           "path": "this_month this_week mercredi matin",
                           "inner": []
                        },
                        {
                           "id": "aprem",
                           "path": "this_month this_week mercredi aprem",
                           "inner": []
                        }
                     ]
                  },
                  {
                     "id": "jeudi",
                     "path": "this_month this_week jeudi",
                     "inner": [
                        {
                           "id": "matin",
                           "path": "this_month this_week jeudi matin",
                           "inner": []
                        },
                        {
                           "id": "aprem",
                           "path": "this_month this_week jeudi aprem",
                           "inner": []
                        }
                     ]
                  },
                  {
                     "id": "vendredi",
                     "path": "this_month this_week vendredi",
                     "inner": [
                        {
                           "id": "matin",
                           "path": "this_month this_week vendredi matin",
                           "inner": []
                        },
                        {
                           "id": "aprem",
                           "path": "this_month this_week vendredi aprem",
                           "inner": []
                        }
                     ]
                  }
               ]
            }
         ]
      }
   ]
   const conf = {
      collapse: [],
      remove: [
         "this_month next_week",
         "this_month following_week",
         "next_month"
      ],
      levelMin: null,
      levelMaxIncluded: null
   }
   const result = slotViewFilter(conf)
   expect(result).toEqual(expected)
})

test('level filter max', () => {
   const expected = [
      {
         "id": "this_month",
         "path": "this_month",
         "inner": [
            {
               "id": "this_week",
               "path": "this_month this_week",
               "inner": [
                  {
                     "id": "lundi",
                     "path": "this_month this_week lundi",
                     "inner": []
                  },
                  {
                     "id": "mardi",
                     "path": "this_month this_week mardi",
                     "inner": []
                  },
                  {
                     "id": "mercredi",
                     "path": "this_month this_week mercredi",
                     "inner": []
                  },
                  {
                     "id": "jeudi",
                     "path": "this_month this_week jeudi",
                     "inner": []
                  },
                  {
                     "id": "vendredi",
                     "path": "this_month this_week vendredi",
                     "inner": []
                  }
               ]
            }
         ]
      }
   ]
   const conf = {
      collapse: [],
      remove: ['this_month next_week', 'this_month following_week', 'next_month'],
      levelMin: null,
      levelMaxIncluded: 3
   }
   const result = slotViewFilter(conf)
   expect(result).toEqual(expected)
})

test('level filter min', () => {
   const conf = {
      collapse: [],
      remove: ['this_month next_week', 'this_month following_week', 'next_month'],
      levelMin: 3,
      levelMaxIncluded: null
   }
   const expected = [
      {
         "id": "lundi",
         "path": "this_month this_week lundi",
         "inner": [
            {
               "id": "matin",
               "path": "this_month this_week lundi matin",
               "inner": []
            },
            {
               "id": "aprem",
               "path": "this_month this_week lundi aprem",
               "inner": []
            }
         ]
      },
      {
         "id": "mardi",
         "path": "this_month this_week mardi",
         "inner": [
            {
               "id": "matin",
               "path": "this_month this_week mardi matin",
               "inner": []
            },
            {
               "id": "aprem",
               "path": "this_month this_week mardi aprem",
               "inner": []
            }
         ]
      },
      {
         "id": "mercredi",
         "path": "this_month this_week mercredi",
         "inner": [
            {
               "id": "matin",
               "path": "this_month this_week mercredi matin",
               "inner": []
            },
            {
               "id": "aprem",
               "path": "this_month this_week mercredi aprem",
               "inner": []
            }
         ]
      },
      {
         "id": "jeudi",
         "path": "this_month this_week jeudi",
         "inner": [
            {
               "id": "matin",
               "path": "this_month this_week jeudi matin",
               "inner": []
            },
            {
               "id": "aprem",
               "path": "this_month this_week jeudi aprem",
               "inner": []
            }
         ]
      },
      {
         "id": "vendredi",
         "path": "this_month this_week vendredi",
         "inner": [
            {
               "id": "matin",
               "path": "this_month this_week vendredi matin",
               "inner": []
            },
            {
               "id": "aprem",
               "path": "this_month this_week vendredi aprem",
               "inner": []
            }
         ]
      }
   ]
   const result = slotViewFilter(conf)
   expect(result).toEqual(expected)
})

describe('add', () => {
   test('empty', () => {
      const given = []
      const expected = [
         {
            "id": "this_month",
            "path": "this_month",
            "inner": []
         }
      ]
      const result = slotViewAdd(given, ["this_month"])
      expect(result).toEqual(expected)
   });
   test('path null', () => {
      const given = []
      const expected = []
      const result = slotViewAdd(given, null)
      expect(result).toEqual(expected)
   });
   describe('at level 1', () => {
      test("have one item", () => {
         const given = [
            {
               "id": "this_month",
               "path": "this_month",
               "inner": []
            }
         ]
         const expected = [
            {
               "id": "this_month",
               "path": "this_month",
               "inner": []
            }
         ]
         const result = slotViewAdd(given, ["this_month"])
         expect(result).toEqual(expected)
      })
      test("have two items", () => {
         const given = [
            {
               "id": "this_month",
               "path": "this_month",
               "inner": []
            },
            {
               "id": "next_month",
               "path": "next_month",
               "inner": []
            }
         ]
         const expected = [
            {
               "id": "this_month",
               "path": "this_month",
               "inner": [{
                  "id": "this_week",
                  "path": "this_month this_week",
                  "inner": []
               }]
            },
            {
               "id": "next_month",
               "path": "next_month",
               "inner": []
            }
         ]
         const result = slotViewAdd(given, ["this_month", "this_week"])
         expect(result).toEqual(expected)
      })
      test("don't have", () => {
         const given = [
            {
               "id": "this_month",
               "path": "this_month",
               "inner": []
            }
         ]
         const expected = [
            {
               "id": "this_month",
               "path": "this_month",
               "inner": []
            },
            {
               "id": "next_month",
               "path": "next_month",
               "inner": []
            }
         ]
         const result = slotViewAdd(given, ["next_month"])
         expect(result).toEqual(expected)
      })
   });
   describe('at level 2, one child', () => {
      test("don't have", () => {
         const given = [
            {
               "id": "this_month",
               "path": "this_month",
               "inner": [{
                  "id": "this_week",
                  "path": "this_month this_week",
                  "inner": []
               }]
            }
         ]
         const expected = [
            {
               "id": "this_month",
               "path": "this_month",
               "inner": [{
                  "id": "this_week",
                  "path": "this_month this_week",
                  "inner": []
               },
               {
                  "id": "next_week",
                  "path": "this_month next_week",
                  "inner": []
               }]
            }
         ]
         const result = slotViewAdd(given, ["this_month", "next_week"])
         expect(result).toEqual(expected)
      })

      test("have one item", () => {
         const given = [
            {
               "id": "this_month",
               "path": "this_month",
               "inner": [{
                  "id": "this_week",
                  "path": "this_month this_week",
                  "inner": []
               }]
            }
         ]
         const expected = [
            {
               "id": "this_month",
               "path": "this_month",
               "inner": [{
                  "id": "this_week",
                  "path": "this_month this_week",
                  "inner": []
               }]
            }
         ]
         const result = slotViewAdd(given, ["this_month", "this_week"])
         expect(result).toEqual(expected)
      })
      test("have two items", () => {
         const given = [
            {
               "id": "this_month",
               "path": "this_month",
               "inner": [{
                  "id": "this_week",
                  "path": "this_month this_week",
                  "inner": []
               },
               {
                  "id": "next_week",
                  "path": "this_month next_week",
                  "inner": []
               }]
            }
         ]
         const expected = [
            {
               "id": "this_month",
               "path": "this_month",
               "inner": [{
                  "id": "this_week",
                  "path": "this_month this_week",
                  "inner": []
               },
               {
                  "id": "next_week",
                  "path": "this_month next_week",
                  "inner": []
               }]
            }
         ]
         const result = slotViewAdd(given, ["this_month", "this_week"])
         expect(result).toEqual(expected)
      })
      test("don't have two items", () => {
         const given = [
            {
               "id": "this_month",
               "path": "this_month",
               "inner": [{
                  "id": "this_week",
                  "path": "this_month this_week",
                  "inner": []
               },
               {
                  "id": "next_week",
                  "path": "this_month next_week",
                  "inner": []
               }]
            }
         ]
         const expected = [
            {
               "id": "this_month",
               "path": "this_month",
               "inner": [{
                  "id": "this_week",
                  "path": "this_month this_week",
                  "inner": []
               },
               {
                  "id": "next_week",
                  "path": "this_month next_week",
                  "inner": []
               },
               {
                  "id": "following_week",
                  "path": "this_month following_week",
                  "inner": []
               }]
            }
         ]
         const result = slotViewAdd(given, ["this_month", "following_week"])
         expect(result).toEqual(expected)
      })
   });
   test("level 3", () => {
      const given = [
         {
            id: "this_month",
            inner: [
               {
                  id: "this_week",
                  inner: [],
                  path: "this_month this_week",
               },
               {
                  id: "next_week",
                  inner: [],
                  path: "this_month next_week",
               },
               {
                  id: "following_week",
                  inner: [],
                  path: "this_month following_week",
               },
            ],
            path: "this_month",
         },
         {
            id: "next_month",
            inner: [],
            path: "next_month",
         },
      ]
      const expected = [
         {
            id: "this_month",
            inner: [
               {
                  id: "this_week",
                  inner: [{
                     id: "mardi",
                     inner: [],
                     path: "this_month this_week mardi",
                  }],
                  path: "this_month this_week",
               },
               {
                  id: "next_week",
                  inner: [],
                  path: "this_month next_week",
               },
               {
                  id: "following_week",
                  inner: [],
                  path: "this_month following_week",
               },
            ],
            path: "this_month",
         },
         {
            id: "next_month",
            inner: [],
            path: "next_month",
         },
      ]
      const result = slotViewAdd(given, ["this_month", "this_week", "mardi"])
      expect(result).toEqual(expected)
   })
   test('add two levels', () => {
      const given = [
         {
            id: "this_month",
            path: "this_month",
            inner: []
         }
      ]
      const expected = [
         {
            id: "this_month",
            path: "this_month",
            inner: []
         },
         {
            id: "next_month",
            path: "next_month",
            inner: [{
               id: "this_week",
               path: "next_month this_week",
               inner: [{
                  id: "mardi",
                  path: "next_month this_week mardi",
                  inner: []
               }]
            }]
         }
      ]
      const result = slotViewAdd(given, ["next_month", "this_week", "mardi"])
      expect(result).toEqual(expected)
   });
});

describe('create slotView with selection', () => {
   test('nominal', () => {
      const givenConf = {
         collapse: [ "next_month", ],
         remove: [],
         levelMin: null,
         levelMaxIncluded: 2
      }
      const givenPaths = [["this_month", "next_week", "mardi"]]
      const expected = [
         {
            id: "this_month",
            inner: [
               {
                  id: "this_week",
                  inner: [],
                  path: "this_month this_week",
               },
               {
                  id: "next_week",
                  inner: [{
                     id: "mardi",
                     inner: [],
                     path: "this_month next_week mardi",
                  }],
                  path: "this_month next_week",
               },
               {
                  id: "following_week",
                  inner: [],
                  path: "this_month following_week",
               },
            ],
            path: "this_month",
         },
         {
            id: "next_month",
            inner: [],
            path: "next_month",
         },
      ]
      const result = slotViewFilterSelection(givenConf, givenPaths)
      expect(result).toEqual(expected)
   });

   test('selection level 1', () => {
      const givenConf = { collapse: [ "next_month", ], remove: [], levelMin: null, levelMaxIncluded: 2 }
      const givenPaths = [["this_month"]]
      const expected = [
         {
            id: "this_month",
            inner: [
               {
                  id: "this_week", inner: [], path: "this_month this_week",
               },
               {
                  id: "next_week", inner: [], path: "this_month next_week",
               },
               {
                  id: "following_week", inner: [], path: "this_month following_week",
               },
            ],
            path: "this_month",
         },
         {
            id: "next_month", inner: [], path: "next_month",
         },
      ]
      const result = slotViewFilterSelection(givenConf, givenPaths)
      expect(result).toEqual(expected)
   })
});


describe('reduceCollapseOnConf', () => {
   test('empty', () => {
      const givenConf = { collapse:[] }
      const givenPath = "this_month this_week vendredi"
      const expectedConf = { collapse: ["this_month this_week day"] }
      const result = reduceCollapseOnConf(givenConf, givenPath)
      expect(result).toEqual(expectedConf)
   });
   test('add shorter', () => {
      const givenConf = { collapse: ["this_month this_week vendredi"] }
      const givenPath = "this_month this_week"
      const expectedConf = { collapse: ["this_month this_week vendredi", "this_month this_week"] }
      const result = reduceCollapseOnConf(givenConf, givenPath)
      expect(result).toEqual(expectedConf)
   });
   test('add longer', () => {
      const givenConf = { collapse: ["this_month this_week"] }
      const givenPath = "this_month this_week vendredi"
      const expectedConf = { collapse: ["this_month this_week", "this_month this_week day"] }
      const result = reduceCollapseOnConf(givenConf, givenPath)
      expect(result).toEqual(expectedConf)
   })
   test("remove", () => {
      const givenConf = { collapse: ["this_month this_week"] }
      const givenPath = "this_month this_week"
      const expectedConf = { collapse: [] }
      const result = reduceCollapseOnConf(givenConf, givenPath)
      expect(result).toEqual(expectedConf)
   })
   test('aprem', () => {
      const givenConf = { collapse:[] }
      const givenPath = "this_month this_week vendredi aprem"
      const expectedConf = { collapse: ["this_month this_week day"] }
      const result = reduceCollapseOnConf(givenConf, givenPath)
      expect(result).toEqual(expectedConf)
   });
   describe('transPathToConf', () => {
      test('month', () => {
         const given = "this_month"
         const expected = "this_month"
         const result = transPathToConf(given)
         expect(result).toEqual(expected)
      });
      test('week', () => {
         const given = "this_month this_week"
         const expected = "this_month this_week"
         const result = transPathToConf(given)
         expect(result).toEqual(expected)
      })
      test('day', () => {
         const given = "this_month this_week vendredi"
         const expected = "this_month this_week day"
         const result = transPathToConf(given)
         expect(result).toEqual(expected)
      })
      test('aprem', () => {
         const given = "this_month this_week vendredi aprem"
         const expected = "this_month this_week day"
         const result = transPathToConf(given)
         expect(result).toEqual(expected)
      })
   });
});