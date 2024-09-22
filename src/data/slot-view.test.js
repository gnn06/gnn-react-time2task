import { slotViewFilter } from "./slot-view";

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
                 "inner": null
              },
              {
                 "id": "following_week",
                 "path": "this_month following_week",
                 "inner": null
              }
           ]
        },
        {
           "id": "next_month",
           "path": "next_month",
           "inner": null
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
      remove: [ 'this_month next_week', 'this_month following_week', 'next_month' ],
      levelMin: null,
      levelMaxIncluded: 3
   }
   const result = slotViewFilter(conf)
   expect(result).toEqual(expected)
})

test('level filter min', () => {
   const conf = {
      collapse: [],
      remove: [ 'this_month next_week', 'this_month following_week', 'next_month' ],
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