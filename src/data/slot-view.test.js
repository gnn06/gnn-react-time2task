import { slotViewAdd, slotViewFilter, slotViewFilterSelection } from "./slot-view";

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
                           "inner": null
                        },
                        {
                           "id": "aprem",
                           "path": "this_month this_week lundi aprem",
                           "inner": null
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
                           "inner": null
                        },
                        {
                           "id": "aprem",
                           "path": "this_month this_week mardi aprem",
                           "inner": null
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
                           "inner": null
                        },
                        {
                           "id": "aprem",
                           "path": "this_month this_week mercredi aprem",
                           "inner": null
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
                           "inner": null
                        },
                        {
                           "id": "aprem",
                           "path": "this_month this_week jeudi aprem",
                           "inner": null
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
                           "inner": null
                        },
                        {
                           "id": "aprem",
                           "path": "this_month this_week vendredi aprem",
                           "inner": null
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
                           "inner": null
                        },
                        {
                           "id": "aprem",
                           "path": "this_month next_week lundi aprem",
                           "inner": null
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
                           "inner": null
                        },
                        {
                           "id": "aprem",
                           "path": "this_month next_week mardi aprem",
                           "inner": null
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
                           "inner": null
                        },
                        {
                           "id": "aprem",
                           "path": "this_month next_week mercredi aprem",
                           "inner": null
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
                           "inner": null
                        },
                        {
                           "id": "aprem",
                           "path": "this_month next_week jeudi aprem",
                           "inner": null
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
                           "inner": null
                        },
                        {
                           "id": "aprem",
                           "path": "this_month next_week vendredi aprem",
                           "inner": null
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
                           "inner": null
                        },
                        {
                           "id": "aprem",
                           "path": "this_month following_week lundi aprem",
                           "inner": null
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
                           "inner": null
                        },
                        {
                           "id": "aprem",
                           "path": "this_month following_week mardi aprem",
                           "inner": null
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
                           "inner": null
                        },
                        {
                           "id": "aprem",
                           "path": "this_month following_week mercredi aprem",
                           "inner": null
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
                           "inner": null
                        },
                        {
                           "id": "aprem",
                           "path": "this_month following_week jeudi aprem",
                           "inner": null
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
                           "inner": null
                        },
                        {
                           "id": "aprem",
                           "path": "this_month following_week vendredi aprem",
                           "inner": null
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
                           "inner": null
                        },
                        {
                           "id": "aprem",
                           "path": "next_month this_week lundi aprem",
                           "inner": null
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
                           "inner": null
                        },
                        {
                           "id": "aprem",
                           "path": "next_month this_week mardi aprem",
                           "inner": null
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
                           "inner": null
                        },
                        {
                           "id": "aprem",
                           "path": "next_month this_week mercredi aprem",
                           "inner": null
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
                           "inner": null
                        },
                        {
                           "id": "aprem",
                           "path": "next_month this_week jeudi aprem",
                           "inner": null
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
                           "inner": null
                        },
                        {
                           "id": "aprem",
                           "path": "next_month this_week vendredi aprem",
                           "inner": null
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
                           "inner": null
                        },
                        {
                           "id": "aprem",
                           "path": "next_month next_week lundi aprem",
                           "inner": null
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
                           "inner": null
                        },
                        {
                           "id": "aprem",
                           "path": "next_month next_week mardi aprem",
                           "inner": null
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
                           "inner": null
                        },
                        {
                           "id": "aprem",
                           "path": "next_month next_week mercredi aprem",
                           "inner": null
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
                           "inner": null
                        },
                        {
                           "id": "aprem",
                           "path": "next_month next_week jeudi aprem",
                           "inner": null
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
                           "inner": null
                        },
                        {
                           "id": "aprem",
                           "path": "next_month next_week vendredi aprem",
                           "inner": null
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
                           "inner": null
                        },
                        {
                           "id": "aprem",
                           "path": "next_month following_week lundi aprem",
                           "inner": null
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
                           "inner": null
                        },
                        {
                           "id": "aprem",
                           "path": "next_month following_week mardi aprem",
                           "inner": null
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
                           "inner": null
                        },
                        {
                           "id": "aprem",
                           "path": "next_month following_week mercredi aprem",
                           "inner": null
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
                           "inner": null
                        },
                        {
                           "id": "aprem",
                           "path": "next_month following_week jeudi aprem",
                           "inner": null
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
                           "inner": null
                        },
                        {
                           "id": "aprem",
                           "path": "next_month following_week vendredi aprem",
                           "inner": null
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
                           "inner": null
                        },
                        {
                           "id": "aprem",
                           "path": "this_month this_week lundi aprem",
                           "inner": null
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
                           "inner": null
                        },
                        {
                           "id": "aprem",
                           "path": "this_month this_week mardi aprem",
                           "inner": null
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
                           "inner": null
                        },
                        {
                           "id": "aprem",
                           "path": "this_month this_week mercredi aprem",
                           "inner": null
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
                           "inner": null
                        },
                        {
                           "id": "aprem",
                           "path": "this_month this_week jeudi aprem",
                           "inner": null
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
                           "inner": null
                        },
                        {
                           "id": "aprem",
                           "path": "this_month this_week vendredi aprem",
                           "inner": null
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
                           "inner": null
                        },
                        {
                           "id": "aprem",
                           "path": "this_month this_week lundi aprem",
                           "inner": null
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
                           "inner": null
                        },
                        {
                           "id": "aprem",
                           "path": "this_month this_week mardi aprem",
                           "inner": null
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
                           "inner": null
                        },
                        {
                           "id": "aprem",
                           "path": "this_month this_week mercredi aprem",
                           "inner": null
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
                           "inner": null
                        },
                        {
                           "id": "aprem",
                           "path": "this_month this_week jeudi aprem",
                           "inner": null
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
                           "inner": null
                        },
                        {
                           "id": "aprem",
                           "path": "this_month this_week vendredi aprem",
                           "inner": null
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
               "inner": null
            },
            {
               "id": "aprem",
               "path": "this_month this_week lundi aprem",
               "inner": null
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
               "inner": null
            },
            {
               "id": "aprem",
               "path": "this_month this_week mardi aprem",
               "inner": null
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
               "inner": null
            },
            {
               "id": "aprem",
               "path": "this_month this_week mercredi aprem",
               "inner": null
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
               "inner": null
            },
            {
               "id": "aprem",
               "path": "this_month this_week jeudi aprem",
               "inner": null
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
               "inner": null
            },
            {
               "id": "aprem",
               "path": "this_month this_week vendredi aprem",
               "inner": null
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


