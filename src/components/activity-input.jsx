import Select from 'react-select';
import { useGetActivitiesQuery } from '../features/apiSlice';
import Color from 'color';
import { getActivityColor } from './ui-helper';
import _ from 'lodash';

const colorStyle = (isFilter) => ({
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
    option: (styles, {data}) => {console.log(styles.color, styles.backgroundColor); return { ...styles,
        backgroundColor: data.color || '#999999',
        color: data.color ? Color(data.color).luminosity() > 0.5 ? 'black' : 'white' :  'black',
    }},
    singleValue: (baseStyle, {data}) => ({
        ...baseStyle,
        backgroundColor: data.color,
        color: !isFilter ? Color(data.color).luminosity() > 0.5 ? 'black' : 'white' : baseStyle.color,
        borderRadius: 4,
        paddingTop: 2,
        paddingLeft: 2,
        paddingBottom: 2,
        paddingRight: 2
    })
})

export default function ActivityInput({task, saveHandler, className, isFilter}) {
    const { data, isLoading, isSuccess } = useGetActivitiesQuery()
    const onChange = (value, action) => {
        saveHandler(value && value.id)
    };
    
    if (data === undefined) return <div></div>

    let list = _.orderBy(data, ['label'])
    if (isFilter) {
            list = list.concat({ id: 0, label: 'Aucune activité' })    
    }
    if (!isFilter) {
        list = list.map((item, index) => (
            {...item, 
                color: getActivityColor(item.id, data),
            }))
    }
                
    const defaultValue = task && list && list.find(item => item.id === task.activity);
    
    return <Select options={list} 
                defaultValue={defaultValue} 
                styles={colorStyle(isFilter)} 
                onChange={onChange}
                isClearable={true}
                placeholder={task && task.id ? "" : "Activité ..."}
                components={{
                    IndicatorSeparator: () => null,
                    DropdownIndicator: () => null,         
                  }}
                  className={className}
            />
}