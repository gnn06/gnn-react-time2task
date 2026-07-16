import { vi } from "vitest";
import { DEFAULT_CONF, isCleanSlotPath, reduceCollapseOnConf, slotFind, slotViewAdd, slotViewFilter, slotViewFilterSelection, slotViewList, slotViewPicker, transPathToConf, slotHasImpreciseIcon, truncatePathAtAnchorDay, getRollingDayColumnId, slotViewTreeSelection, slotViewListDaySections, slotViewListSelection } from "./slot-view";
import { getSlotsForRow, getHourSlotsForRow } from "./slot-view";
import { getSlotIdLevel } from "./slot-id";

vi.useFakeTimers()
vi.setSystemTime(new Date('2023-12-20')) // mercredi

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

test('levelMaxIncluded: 2 - les slots semaine ont inner vide (bubble up vers le niveau visible le plus profond)', () => {
   const conf = { collapse: [], remove: [], levelMin: null, levelMaxIncluded: 2 }
   const result = slotViewFilter(conf)
   const thisMonth = result.find(s => s.id === 'this_month')
   thisMonth.inner.forEach(weekSlot => {
      expect(weekSlot.inner).toEqual([])
   })
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

describe('isCleanSlotPath', () => {
   test('chemin valide simple', () => {
      expect(isCleanSlotPath(['this_month'])).toBe(true)
      expect(isCleanSlotPath(['this_month', 'this_week'])).toBe(true)
      expect(isCleanSlotPath(['this_month', 'this_week', 'lundi'])).toBe(true)
   })

   test('chemin valide avec offset', () => {
      expect(isCleanSlotPath(['this_month', 'following_week + 1'])).toBe(true)
      expect(isCleanSlotPath(['next_month', 'following_week + 2'])).toBe(true)
   })

   test('rejet : keyword every', () => {
      expect(isCleanSlotPath(['every', '1', 'this_month', 'this_week'])).toBe(false)
   })

   test('rejet : nombre pur', () => {
      expect(isCleanSlotPath(['1', 'this_month'])).toBe(false)
   })

   test('rejet : séparateur multi-slot |', () => {
      expect(isCleanSlotPath(['this_month', 'this_week', '|', 'this_month', 'next_week'])).toBe(false)
   })

   test('rejet : deux slots de même niveau (this_month, next_month)', () => {
      expect(isCleanSlotPath(['this_month', 'next_month'])).toBe(false)
   })

   test('rejet : null ou vide', () => {
      expect(isCleanSlotPath(null)).toBe(false)
      expect(isCleanSlotPath([])).toBe(false)
   })
})

describe('slots offset (following_week + N) — bug: nœud absent dans la vue', () => {
   test('slotViewFilterSelection injecte following_week (sans offset) dans l\'arbre tree', () => {
      const result = slotViewFilterSelection(defaultConf, [['this_month', 'following_week']])
      const thisMonth = result.find(s => s.id === 'this_month')
      const node = thisMonth.inner.find(s => s.id === 'following_week')
      expect(node).toBeDefined()
      expect(node.path).toBe('this_month following_week')
   })

   test('slotViewFilter avec defaultConf ne produit pas de nœud following_week + 1 — une tâche avec ce slot remonte vers this_month', () => {
      const result = slotViewFilter(defaultConf)
      const thisMonth = result.find(s => s.id === 'this_month')
      expect(thisMonth.inner.some(s => s.id === 'following_week + 1')).toBe(false)
   })

   test('slotViewFilterSelection injecte following_week + 1 dans l\'arbre — la mécanique existe mais n\'est pas utilisée dans la vue', () => {
      const result = slotViewFilterSelection(defaultConf, [['this_month', 'following_week + 1']])
      const thisMonth = result.find(s => s.id === 'this_month')
      const node = thisMonth.inner.find(s => s.id === 'following_week + 1')
      expect(node).toBeDefined()
      expect(node.path).toBe('this_month following_week + 1')
   })

   test('slotViewFilterSelection injecte plusieurs offsets simultanément', () => {
      const result = slotViewFilterSelection(defaultConf, [
         ['this_month', 'following_week + 1'],
         ['this_month', 'following_week + 2'],
      ])
      const thisMonth = result.find(s => s.id === 'this_month')
      const ids = thisMonth.inner.map(s => s.id)
      expect(ids).toContain('following_week + 1')
      expect(ids).toContain('following_week + 2')
   })
})

describe('slotViewList — following_week injection dynamique', () => {
   test('slotViewList sans tâche n\'inclut pas following_week', () => {
      const result = slotViewList()
      const allIds = result.flatMap(row => row.filter(Boolean).map(s => s.id))
      expect(allIds).not.toContain('following_week')
   })
   test('slotViewList avec une tâche following_week injecte le slot', () => {
      const taskPaths = [['this_month', 'following_week']]
      const result = slotViewList(null, undefined, taskPaths)
      const allIds = result.flatMap(row => row.filter(Boolean).map(s => s.id))
      expect(allIds).toContain('following_week')
   })
})

describe('create slotView with selection', () => {
   test('nominal - collapse et chemin sélectionné', () => {
      const givenConf = { collapse: [ "next_month" ], remove: [], levelMin: null, levelMaxIncluded: 2 }
      const givenPaths = [["this_month", "next_week", "mardi"]]
      const result = slotViewFilterSelection(givenConf, givenPaths)
      // next_month est collapsé
      const nextMonth = result.find(s => s.id === 'next_month')
      expect(nextMonth.inner).toEqual([])
      // le chemin sélectionné est présent
      const thisMonth = result.find(s => s.id === 'this_month')
      const nextWeek = thisMonth.inner.find(s => s.id === 'next_week')
      expect(nextWeek.inner.some(s => s.id === 'mardi')).toBe(true)
   });

   test('selection level 1 - collapse respecté', () => {
      const givenConf = { collapse: [ "next_month" ], remove: [], levelMin: null, levelMaxIncluded: 2 }
      const givenPaths = [["this_month"]]
      const result = slotViewFilterSelection(givenConf, givenPaths)
      expect(result.find(s => s.id === 'this_month')).toBeDefined()
      expect(result.find(s => s.id === 'next_month').inner).toEqual([])
   })

   test('levelMaxIncluded: 2 — les nœuds de niveau 3+ sont exclus', () => {
      const givenConf = { collapse: [], remove: [], levelMin: null, levelMaxIncluded: 2 }
      const result = slotViewFilterSelection(givenConf, [])
      const thisMonth = result.find(s => s.id === 'this_month')
      const thisWeek = thisMonth.inner.find(s => s.id === 'this_week')
      expect(thisWeek.inner.length).toBe(0)
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

describe('slotFind', () => {
   test('this_week', () => {
      const givenSlot = {
         id: "root", path: "", inner: [
            {
               id: "this_month", path: "this_month", inner: [
                  {
                     id: "this_week", path: "this_month this_week", inner: [
                        {
                           id: "mercredi", path: `this_month this_week mercredi`, inner: [
                              { id: "matin", path: `this_month this_week mercredi matin`, inner: [] },
                              { id: "aprem", path: `this_month this_week mercredi aprem`, inner: [] }
                           ]
                        },
                        { id: "jeudi", path: `this_month this_week jeudi`, inner: [] },
                        { id: "mardi", path: `this_month this_week mardi`, inner: [] }]
                  },
                  { id: "next_week", path: "this_month next_week", inner: [] }
               ]
            },
            { id: "next_month", path: "next_month", inner: [] }
         ]
      };
      const result = slotFind(givenSlot, "this_month this_week");
      const expected = {
         id: "this_week", path: "this_month this_week", inner: [
            {
               id: "mercredi", path: `this_month this_week mercredi`, inner: [
                  { id: "matin", path: `this_month this_week mercredi matin`, inner: [] },
                  { id: "aprem", path: `this_month this_week mercredi aprem`, inner: [] }
               ]
            },
            { id: "jeudi", path: `this_month this_week jeudi`, inner: [] },
            { id: "mardi", path: `this_month this_week mardi`, inner: [] }]
      };
      expect(result).toEqual(expected);
   });
   test('this_month this_week mercredi aprem', () => {
      const givenSlot = {
         id: "root", path: "", inner: [
            {
               id: "this_month", path: "this_month", inner: [
                  {
                     id: "this_week", path: "this_month this_week", inner: [
                        {
                           id: "mercredi", path: `this_month this_week mercredi`, inner: [
                              { id: "matin", path: `this_month this_week mercredi matin`, inner: [] },
                              { id: "aprem", path: `this_month this_week mercredi aprem`, inner: [] }
                           ]
                        },
                        { id: "jeudi", path: `this_month this_week jeudi`, inner: [] },
                        { id: "mardi", path: `this_month this_week mardi`, inner: [] }]
                  },
                  { id: "next_week", path: "this_month next_week", inner: [] }
               ]
            },
            { id: "next_month", path: "next_month", inner: [] }
         ]
      };
      const result = slotFind(givenSlot, "this_month this_week mercredi aprem");
      const expected = { id: "aprem", path: `this_month this_week mercredi aprem`, inner: [] };
      expect(result).toEqual(expected);
   });
});

describe('slotViewList', () => {
   test('without filter — C1b axe relatifPresent (today/tomorrow)', () => {
      const result = slotViewList();
      const hours = [
         { id: "matin", inner: [], path: "today matin" },
         { id: "aprem", inner: [], path: "today aprem" },
      ];
      const todaySlot  = { id: "today",    path: "today",    inner: hours };
      const tomorrowSlot = { id: "tomorrow", path: "tomorrow", inner: [] };
      const thisWeek = { id: "this_week", path: "this_month this_week", inner: [todaySlot, tomorrowSlot] };
      const nextWeek = { id: "next_week", path: "this_month next_week", inner: [] };
      const expected = [
         hours,
         [todaySlot, tomorrowSlot],
         [thisWeek, nextWeek],
         [
            { id: "this_month", path: "this_month", inner: [thisWeek, nextWeek] },
            { id: "next_month", path: "next_month", inner: [] },
         ],
      ];
      expect(result).toEqual(expected);
   });
   test('with filter this_week — C1b axe relatifPresent', () => {
      const givenPath = "this_month this_week";
      const result = slotViewList(givenPath);
      const hours = [
         { id: "matin", inner: [], path: "today matin" },
         { id: "aprem", inner: [], path: "today aprem" },
      ];
      const todaySlot  = { id: "today",    path: "today",    inner: hours };
      const tomorrowSlot = { id: "tomorrow", path: "tomorrow", inner: [] };
      const thisWeek = { id: "this_week", path: "this_month this_week", inner: [todaySlot, tomorrowSlot] };
      const expected = [
         hours,
         [todaySlot, tomorrowSlot],
         [thisWeek],
      ];
      expect(result).toEqual(expected);
   });
   test('with filter today — C1b : filtre sur path standalone "today"', () => {
      const givenPath = "today";
      const result = slotViewList(givenPath);
      const hours = [
         { id: "matin", inner: [], path: "today matin" },
         { id: "aprem", inner: [], path: "today aprem" },
      ];
      const todaySlot = { id: "today", path: "today", inner: hours };
      const expected = [
         hours,
         [todaySlot],
      ];
      expect(result).toEqual(expected);
   });
   test('with filter next_week', () => {
      const givenPath = "this_month next_week";
      const result = slotViewList(givenPath);
      const expected = [
         [
            {
               "id": "next_week",
               "inner": [],
               "path": "this_month next_week",
            },
         ],
      ];
      expect(result).toEqual(expected);
   })

   test('levelMaxIncluded: 2 exclut les niveaux jour et heure', () => {
      const conf = { levelMaxIncluded: 2 }
      const result = slotViewList(null, conf)
      const allIds = result.flatMap(row => row.map(slot => slot.id))
      expect(allIds).not.toContain('lundi')
      expect(allIds).not.toContain('matin')
   })

   test('levelMaxIncluded: 1 - les slots mois ont inner vide pour absorber les tâches sous-jacentes', () => {
      const conf = { levelMaxIncluded: 1 }
      const result = slotViewList(null, conf)
      expect(result.length).toBe(1)
      result[0].forEach(slot => {
         if (slot) expect(slot.inner).toEqual([])
      })
   })

   test('levelMaxIncluded: 2 - les slots semaine ont inner vide, les slots mois gardent leurs enfants semaine', () => {
      const conf = { levelMaxIncluded: 2 }
      const result = slotViewList(null, conf)
      const weekRow = result.find(row => row[0] && getSlotIdLevel(row[0].id) === 2)
      weekRow.forEach(slot => {
         if (slot) expect(slot.inner).toEqual([])
      })
      const monthRow = result.find(row => row[0] && getSlotIdLevel(row[0].id) === 1)
      const thisMonth = monthRow.find(slot => slot?.id === 'this_month')
      expect(thisMonth.inner.length).toBeGreaterThan(0)
   })
});

describe('getSlotsForRow', () => {
   test('mardi mercredi jeudi ', () => {
      const given = [
         {
            "id": "mardi",
            "path": "this_month this_week mardi",
            "inner": [],
         },{
            "id": "mercredi",
            "path": "this_month this_week mercredi",
            "inner": [],
         },
         {
            "id": "jeudi",
            "path": "this_month this_week jeudi",
            "inner": [],
         }
      ];
      const expected = [
         {
            "id": "mardi",
            "path": "this_month this_week mardi",
            "inner": [],
         },{
            "id": "mercredi",
            "path": "this_month this_week mercredi",
            "inner": [],
         },
         [{
            "id": "jeudi",
            "path": "this_month this_week jeudi",
            "inner": [],
         }]
      ];
      const result = getSlotsForRow(given);
      expect(result).toEqual(expected);
   });
    test('mercredi jeudi ', () => {
        const given = [
            {
                "id": "mercredi",
                "path": "this_month this_week mercredi",
                "inner": [],
            },
            {
                "id": "jeudi",
                "path": "this_month this_week jeudi",
                "inner": [],
            }
        ];
        const expected = [
            null,
            {
                "id": "mercredi",
                "path": "this_month this_week mercredi",
                "inner": [],
            },
            [{
                "id": "jeudi",
                "path": "this_month this_week jeudi",
                "inner": [],
            }]
        ];
        const result = getSlotsForRow(given);
        expect(result).toEqual(expected);
   });
    test('mardi mercredi ', () => {
        const given = [
            {
                "id": "mardi",
                "path": "this_month this_week mardi",
                "inner": [],
            }, {
                "id": "mercredi",
                "path": "this_month this_week mercredi",
                "inner": [],
            }
        ];
        const expected = [
            {
                "id": "mardi",
                "path": "this_month this_week mardi",
                "inner": [],
            }, {
                "id": "mercredi",
                "path": "this_month this_week mercredi",
                "inner": [],
            },
            []
        ];
        const result = getSlotsForRow(given);
        expect(result).toEqual(expected);
    });
});

describe('getHourSlotsForRow', () => {
    const matin = { id: 'matin', path: 'today matin', inner: [] };
    const aprem = { id: 'aprem', path: 'today aprem', inner: [] };
    const dayNode = { id: 'today', path: 'today', inner: [matin, aprem] };

    afterEach(() => vi.setSystemTime(new Date('2023-12-20'))); // restaure 00:00 (matin)

    test('heure courante = matin : matin en Present, aprem en Future', () => {
        const result = getHourSlotsForRow(dayNode);
        expect(result).toEqual([null, matin, aprem]);
    });

    test('heure courante = aprem : matin en Past, aprem en Present', () => {
        vi.setSystemTime(new Date('2023-12-20T14:00:00'));
        const result = getHourSlotsForRow(dayNode);
        expect(result).toEqual([matin, aprem, null]);
    });

    test('jour sans inner (Past/Future stripped) : rien à répartir', () => {
        const result = getHourSlotsForRow({ id: 'lundi', path: 'this_month this_week lundi', inner: [] });
        expect(result).toEqual([null, null, null]);
    });

    test('jour null : rien à répartir', () => {
        const result = getHourSlotsForRow(null);
        expect(result).toEqual([null, null, null]);
    });
});

describe('slotViewList — truncateToFirstMissing limite de profondeur', () => {
    test('une tâche today matin déjà dans l\'arbre n\'injecte rien (today.inner reste 2)', () => {
        // today est dans this_week avec matin+aprem — rien à injecter
        const taskPaths = [['this_month', 'this_week', 'today', 'matin']]
        const result = slotViewList(null, undefined, taskPaths)
        const dayRow = result.find(row => row.some(s => s?.id === 'today'))
        const today = dayRow?.find(s => s?.id === 'today')
        expect(today?.inner).toHaveLength(2) // matin + aprem, pas de doublon
    })

    test('une tâche this_month following_week+1 injecte le slot sous this_month', () => {
        const taskPaths = [['this_month', 'following_week + 1']]
        const result = slotViewList(null, undefined, taskPaths)
        const allIds = result.flatMap(row => row.filter(Boolean).map(s => s.id))
        expect(allIds).toContain('following_week + 1')
    })

    test('une tâche next_month following_week+1 injecte le slot sous next_month', () => {
        const taskPaths = [['next_month', 'following_week + 1']]
        const result = slotViewList(null, undefined, taskPaths)
        const allIds = result.flatMap(row => row.filter(Boolean).map(s => s.id))
        expect(allIds).toContain('following_week + 1')
    })
})

describe('slotViewList — C1b axe relatifPresent (today/tomorrow)', () => {
    test('l\'arbre de base contient today et tomorrow à la place des weekdays', () => {
        const result = slotViewList()
        const allIds = result.flatMap(row => row.map(s => s.id))
        expect(allIds).toContain('today')
        expect(allIds).toContain('tomorrow')
        expect(allIds).not.toContain('mardi')
        expect(allIds).not.toContain('mercredi')
        expect(allIds).not.toContain('vendredi')
    })

    test('today a pour path "today" (ancre standalone)', () => {
        const result = slotViewList()
        const dayRow = result.find(row => row.some(s => s?.id === 'today'))
        const today = dayRow?.find(s => s?.id === 'today')
        expect(today?.path).toBe('today')
    })

    test('today a matin et aprem comme inner avec paths standalone', () => {
        const result = slotViewList()
        const dayRow = result.find(row => row.some(s => s?.id === 'today'))
        const today = dayRow?.find(s => s?.id === 'today')
        expect(today?.inner.map(s => s.id)).toEqual(['matin', 'aprem'])
        expect(today?.inner[0].path).toBe('today matin')
    })

    test('tomorrow a pour path "tomorrow" (ancre standalone)', () => {
        const result = slotViewList()
        const dayRow = result.find(row => row.some(s => s?.id === 'tomorrow'))
        const tomorrow = dayRow?.find(s => s?.id === 'tomorrow')
        expect(tomorrow?.path).toBe('tomorrow')
    })

    test('today et tomorrow sont enfants directs de this_week', () => {
        const result = slotViewList()
        const weekRow = result.find(row => row.some(s => s?.id === 'this_week'))
        const thisWeek = weekRow?.find(s => s?.id === 'this_week')
        const innerIds = thisWeek?.inner.map(s => s.id)
        expect(innerIds).toContain('today')
        expect(innerIds).toContain('tomorrow')
    })

    test('une tâche today est trouvable via slotFind', () => {
        const result = slotViewList()
        const dayRow = result.find(row => row.some(s => s?.id === 'today'))
        expect(dayRow).toBeDefined()
        const today = dayRow.find(s => s?.id === 'today')
        expect(today).toBeDefined()
    })
})

describe('slotHasImpreciseIcon', () => {
    // date mockée : mercredi 2023-12-20 → this_month = 'this_month', this_week = 'this_week'
    test('this_month (niveau 1) → true', () => {
        expect(slotHasImpreciseIcon('this_month', 1)).toBe(true)
    })
    test('this_month this_week (niveau 2) → true', () => {
        expect(slotHasImpreciseIcon('this_month this_week', 2)).toBe(true)
    })
    test('this_month this_week mercredi (niveau 3) → true', () => {
        expect(slotHasImpreciseIcon('this_month this_week mercredi', 3)).toBe(true)
    })
    test('this_month this_week mercredi matin (niveau 4, heure) → false', () => {
        expect(slotHasImpreciseIcon('this_month this_week mercredi matin', 4)).toBe(false)
    })
    test('this_month next_week (niveau 2, hors this_week) → false', () => {
        expect(slotHasImpreciseIcon('this_month next_week', 2)).toBe(false)
    })
    test('next_month (niveau 1, hors this_month) → false', () => {
        expect(slotHasImpreciseIcon('next_month', 1)).toBe(false)
    })
    test('next_month following_week (niveau 2) → false', () => {
        expect(slotHasImpreciseIcon('next_month following_week', 2)).toBe(false)
    })
});

describe('slotViewPicker — injecte les ancres relatifPresent sous this_week', () => {
    const findThisWeek = (roots) =>
        roots.find(s => s.id === 'this_month').inner.find(s => s.id === 'this_week');

    test('this_week contient today/tomorrow en tête, devant les weekdays', () => {
        const thisWeek = findThisWeek(slotViewPicker(DEFAULT_CONF));
        expect(thisWeek.inner.map(s => s.id)).toEqual(
            ['today', 'tomorrow', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi']
        );
    });

    test('today porte un path standalone avec ses créneaux matin/aprem', () => {
        const thisWeek = findThisWeek(slotViewPicker(DEFAULT_CONF));
        const today = thisWeek.inner.find(s => s.id === 'today');
        expect(today.path).toBe('today');
        expect(today.inner).toEqual([
            { id: 'matin', path: 'today matin', inner: [] },
            { id: 'aprem', path: 'today aprem', inner: [] },
        ]);
        const tomorrow = thisWeek.inner.find(s => s.id === 'tomorrow');
        expect(tomorrow.path).toBe('tomorrow');
        expect(tomorrow.inner).toEqual([
            { id: 'matin', path: 'tomorrow matin', inner: [] },
            { id: 'aprem', path: 'tomorrow aprem', inner: [] },
        ]);
    });

    test('les weekdays conservent leurs paths absolus', () => {
        const thisWeek = findThisWeek(slotViewPicker(DEFAULT_CONF));
        expect(thisWeek.inner.find(s => s.id === 'lundi').path).toBe('this_month this_week lundi');
    });
});

describe('getRollingDayColumnId — colonne weekday d\'alignement d\'un jour rolling', () => {
    test('today → la colonne du jour courant', () => {
        expect(getRollingDayColumnId('today', 'mercredi')).toBe('mercredi');
        expect(getRollingDayColumnId('today', 'lundi')).toBe('lundi');
        expect(getRollingDayColumnId('today', 'vendredi')).toBe('vendredi');
    });
    test('tomorrow → la colonne du lendemain calendaire', () => {
        expect(getRollingDayColumnId('tomorrow', 'mercredi')).toBe('jeudi');
        expect(getRollingDayColumnId('tomorrow', 'lundi')).toBe('mardi');
    });
    test('tomorrow un vendredi → samedi hors plage → overflow (null)', () => {
        expect(getRollingDayColumnId('tomorrow', 'vendredi')).toBe(null);
    });
    test('today un week-end → hors plage → overflow (null)', () => {
        expect(getRollingDayColumnId('today', 'samedi')).toBe(null);
        expect(getRollingDayColumnId('today', 'dimanche')).toBe(null);
    });
    test('tomorrow un samedi → dimanche hors plage → overflow (null)', () => {
        expect(getRollingDayColumnId('tomorrow', 'samedi')).toBe(null);
    });
});

describe('slotViewTreeSelection — injecte today/tomorrow sous this_week (section rollingDays)', () => {
    const findThisWeek = (roots) =>
        roots.find(s => s.id === 'this_month').inner.find(s => s.id === 'this_week');

    test('this_week contient today/tomorrow (avec matin/aprem) devant les weekdays', () => {
        const thisWeek = findThisWeek(slotViewTreeSelection(DEFAULT_CONF, []));
        expect(thisWeek.inner.map(s => s.id)).toEqual(
            ['today', 'tomorrow', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi']
        );
        const today = thisWeek.inner.find(s => s.id === 'today');
        expect(today.inner.map(s => s.id)).toEqual(['matin', 'aprem']);
    });

    test('next_week n\'a pas de section rollingDays (weekdays only)', () => {
        const roots = slotViewTreeSelection(DEFAULT_CONF, []);
        const nextWeek = roots.find(s => s.id === 'this_month').inner.find(s => s.id === 'next_week');
        expect((nextWeek?.inner ?? []).some(s => s.id === 'today' || s.id === 'tomorrow')).toBe(false);
    });

    test('this_week sous next_month (semaine non courante) n\'a PAS de rollingDays', () => {
        const roots = slotViewTreeSelection({ ...DEFAULT_CONF, collapse: [] }, []);
        const nextMonthWeek = roots.find(s => s.id === 'next_month')?.inner.find(s => s.id === 'this_week');
        expect((nextMonthWeek?.inner ?? []).some(s => s.id === 'today' || s.id === 'tomorrow')).toBe(false);
    });

    test('niveau max = semaine (2) : pas d\'injection rollingDays', () => {
        const conf = { ...DEFAULT_CONF, levelMaxIncluded: 2 };
        const thisWeek = findThisWeek(slotViewTreeSelection(conf, []));
        expect((thisWeek.inner ?? []).some(s => s.id === 'today')).toBe(false);
    });

    test('niveau max = jour (3) : today/tomorrow présents mais sans matin/aprem', () => {
        const conf = { ...DEFAULT_CONF, levelMaxIncluded: 3 };
        const thisWeek = findThisWeek(slotViewTreeSelection(conf, []));
        const today = thisWeek.inner.find(s => s.id === 'today');
        expect(today).toBeTruthy();
        expect(today.inner).toEqual([]);
    });
});

describe('truncatePathAtAnchorDay (grille tree : colonnes = weekdays)', () => {
    test('tronque un jour ancre (today) → remonte à la semaine', () => {
        expect(truncatePathAtAnchorDay(['this_month', 'this_week', 'today'])).toEqual(['this_month', 'this_week']);
    });
    test('tronque today et son heure (today aprem)', () => {
        expect(truncatePathAtAnchorDay(['this_month', 'this_week', 'today', 'aprem'])).toEqual(['this_month', 'this_week']);
    });
    test('tomorrow est aussi tronqué', () => {
        expect(truncatePathAtAnchorDay(['this_month', 'this_week', 'tomorrow'])).toEqual(['this_month', 'this_week']);
    });
    test('un weekday (vendredi) est conservé', () => {
        expect(truncatePathAtAnchorDay(['this_month', 'this_week', 'vendredi'])).toEqual(['this_month', 'this_week', 'vendredi']);
    });
    test('weekday + heure conservés', () => {
        expect(truncatePathAtAnchorDay(['this_month', 'this_week', 'vendredi', 'aprem'])).toEqual(['this_month', 'this_week', 'vendredi', 'aprem']);
    });
    test('chemin sans jour inchangé', () => {
        expect(truncatePathAtAnchorDay(['this_month', 'this_week'])).toEqual(['this_month', 'this_week']);
    });
});

describe('slotViewListDaySections — 2 sections rollingDays / weekDays (vue list)', () => {
    test('rolling : today en present avec matin/aprem ; tomorrow en future sans inner (heure bubble vers le jour)', () => {
        const { rolling } = slotViewListDaySections('mercredi');
        expect(rolling.present.id).toBe('today');
        expect(rolling.present.path).toBe('today');
        expect(rolling.present.inner.map(s => s.id)).toEqual(['matin', 'aprem']);
        expect(rolling.present.inner[0].path).toBe('today matin');
        expect(rolling.future.id).toBe('tomorrow');
        expect(rolling.future.path).toBe('tomorrow');
        expect(rolling.future.inner).toEqual([]);
    });

    test('weekday : today=mercredi → present=mercredi ; future=[jeudi, vendredi] ; past=[lundi, mardi]', () => {
        const { weekday } = slotViewListDaySections('mercredi');
        expect(weekday.present.id).toBe('mercredi');
        expect(weekday.present.path).toBe('this_month this_week mercredi');
        expect(weekday.present.inner.map(s => s.id)).toEqual(['matin', 'aprem']);
        expect(weekday.present.inner[0].path).toBe('this_month this_week mercredi matin');
        expect(weekday.future.map(s => s.id)).toEqual(['jeudi', 'vendredi']);
        expect(weekday.future[0].path).toBe('this_month this_week jeudi');
        expect(weekday.past.map(s => s.id)).toEqual(['lundi', 'mardi']);
        expect(weekday.past[0].path).toBe('this_month this_week lundi');
    });

    test('weekday.past/future n\'ont pas de matin/aprem en inner : les tâches heure de ces jours bubblent sur la case jour (Past/Future), pas sur une ligne heure dédiée', () => {
        const { weekday } = slotViewListDaySections('mercredi');
        expect(weekday.past.every(s => s.inner.length === 0)).toBe(true);
        expect(weekday.future.every(s => s.inner.length === 0)).toBe(true);
        // le jour présent (équivalent weekDay de today) garde matin/aprem : seul lui alimente la ligne heure.
        expect(weekday.present.inner.map(s => s.id)).toEqual(['matin', 'aprem']);
    });

    test('weekday : today=vendredi → future vide, past=[lundi..jeudi]', () => {
        const { weekday } = slotViewListDaySections('vendredi');
        expect(weekday.present.id).toBe('vendredi');
        expect(weekday.future).toEqual([]);
        expect(weekday.past.map(s => s.id)).toEqual(['lundi', 'mardi', 'mercredi', 'jeudi']);
    });

    test('weekday : today=lundi → past vide, future=[mardi..vendredi]', () => {
        const { weekday } = slotViewListDaySections('lundi');
        expect(weekday.present.id).toBe('lundi');
        expect(weekday.past).toEqual([]);
        expect(weekday.future.map(s => s.id)).toEqual(['mardi', 'mercredi', 'jeudi', 'vendredi']);
    });

    test('week-end (today=samedi) : present null, tous les weekdays en past, rolling présent', () => {
        const { rolling, weekday } = slotViewListDaySections('samedi');
        expect(weekday.present).toBeNull();
        expect(weekday.past.map(s => s.id)).toEqual(['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi']);
        expect(weekday.future).toEqual([]);
        expect(rolling.present.id).toBe('today');
        expect(rolling.future.id).toBe('tomorrow');
    });
});

describe('slotViewListSelection — option B : tous les weekdays visibles (plus de bubbling vers this_week)', () => {
    // Les 5 weekdays de la semaine courante ont désormais une case propre (Past/Present/Future) :
    // ils sont injectés sous this_week pour que son bubbling les exclue. this_week ne reçoit
    // donc plus que les tâches réellement imprécises (assignées à this_week sans jour).
    function currentWeekNode(rows) {
        const weekRow = rows.find(r => r.some(s => s.id === 'this_week'));
        return weekRow.find(s => s.id === 'this_week');
    }

    test('today=mercredi : les 5 weekdays sont injectés sous la semaine courante', () => {
        const thisWeek = currentWeekNode(slotViewListSelection('mercredi'));
        const ids = thisWeek.inner.map(s => s.id);
        expect(ids).toEqual(expect.arrayContaining(['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi']));
    });

    test('vendredi (postérieur à today=mercredi) est un nœud visible → ne remonte plus à this_week', () => {
        const thisWeek = currentWeekNode(slotViewListSelection('mercredi'));
        expect(thisWeek.inner.some(s => s.id === 'vendredi')).toBe(true);
    });
});