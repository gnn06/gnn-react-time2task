import Select from 'react-select';
import { useGetActivitiesQuery } from '../features/apiSlice';
import Color from 'color';
import { getActivityColor } from './ui-helper';

const colorStyle = (isClearable) => ({
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
        backgroundColor: data.color,
        color: !isClearable ? Color(data.color).luminosity() > 0.5 ? 'black' : 'white' :  styles.color,
    }),
    singleValue: (baseStyle, {data}) => ({
        ...baseStyle,
        backgroundColor: data.color,
        color: !isClearable ? Color(data.color).luminosity() > 0.5 ? 'black' : 'white' : baseStyle.color,
        borderRadius: 4,
        paddingTop: 2,
        paddingLeft: 2,
        paddingBottom: 2,
        paddingRight: 2
    })
})

export default function ActivityInput({task, saveHandler, className, isClearable}) {
    const { data, isLoading, isSuccess } = useGetActivitiesQuery()
    const onChange = (value, action) => {
        saveHandler(value && value.id)
    };
    //const defaultValue = task && ACTIVITY_LST.find(item => item.value === task.activity);
    const list = 
        data === undefined ? []
        : (isClearable ? 
              data.concat({ id: 0, label: 'Aucune' })
            : data.map((item, index) => (
                {...item, 
                    color: getActivityColor(item.id, data),
                })))
    const defaultValue = task && list && list.find(item => item.id === task.activity);

    console.log(data)

    return <Select options={list} 
                defaultValue={defaultValue} 
                styles={colorStyle(isClearable)} 
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