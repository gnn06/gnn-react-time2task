import Select from 'react-select';

const ACTIVITY_LST = [ 
    { value: 1 ,   label: 'Mes Activités' },
    { value: 2 ,   label: 'Tâche'    },
    { value: 10,   label: 'Mes Objectifs' },
    { value: 20,   label: 'Personnel'},
    { value: 101,  label: 'orga'     },
    { value: 102,  label: 'oddj'     },
    { value: 103,  label: 'méthodo'  },
    { value: 104,  label: 'impact'   },
    { value: 105,  label: 'team'     },
    { value: 106,  label: 'sécu'     },
    { value: 107,  label: 'pca'      },
    { value: 108,  label: 'upgrade'  },
    { value: 109,  label: 'Infra'    },
    { value: 110,  label: 'qualité'  },
    { value: 0 ,   label: 'Aucune' },
]

const colorStyle = {
    control: (styles, state) => ({
        ...styles,
        backgroundColor: 'transparent',
    }),
    valueContainer: (styles, {data}) => ({ ...styles,
        padding: 0,
        paddingLeft: 3,
        paddingRight: 0
    }),
    dropdownIndicator: (styles) => ({
        ...styles,
        borderRadius: 3,
        padding: 2,
        margin: 2
    }),
    option: (styles, {data}) => ({ ...styles,
        
    }),
    singleValue: (baseStyle, {data}) => ({
        ...baseStyle,
        borderRadius: 4,
        paddingTop: 2,
        paddingLeft: 2,
        paddingBottom: 2,
        paddingRight: 2
    })
}

export default function ActivityInput({task, saveHandler, className, isClearable}) {
    const onChange = (value, action) => {
        saveHandler(value && value.value)
    };
    const defaultValue = task && ACTIVITY_LST.find(item => item.value === task.activity);
    return <Select options={ACTIVITY_LST} 
                defaultValue={defaultValue} 
                styles={colorStyle} 
                onChange={onChange}
                isClearable={isClearable}
                placeholder={task && task.id ? "" : "Activité ..."}
                components={{
                    IndicatorSeparator: () => null,
                    DropdownIndicator: () => null,                    
                  }}
                  className={className}
            />
}