import Select from 'react-select';
import { useGetActivitiesQuery } from '../features/apiSlice';

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
    const { data, isLoading, isSuccess } = useGetActivitiesQuery()
    const onChange = (value, action) => {
        saveHandler(value && value.id)
    };
    //const defaultValue = task && ACTIVITY_LST.find(item => item.value === task.activity);
    const list = isClearable ? data && data.concat({ id: 0, label: 'Aucune' }) : data
    const defaultValue = task && list && list.find(item => item.id === task.activity);

    return <Select options={list} 
                defaultValue={defaultValue} 
                styles={colorStyle} 
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