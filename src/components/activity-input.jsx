import { useEffect, useState } from 'react';
import Select from 'react-select/creatable';
import { useGetActivitiesQuery } from '../features/apiSlice';
import Color from 'color';
import { getActivityColor } from './ui-helper';
import _ from 'lodash';

import { useAddActivityMutation } from "../features/apiSlice.js";

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
    option: (styles, {data}) => {return { ...styles,
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

export default function ActivityInput({activity, saveHandler, className, isFilter}) {
    
    const { data, isLoading, isSuccess } = useGetActivitiesQuery();
    const [ addActivity ]                = useAddActivityMutation();

    const onChange = (value, action) => {
        saveHandler(value && value.id);
    };

    const handleCreate = async (inputValue) => {
        const ApIargument = { label: inputValue };
        // requires the API to return the new ID. For this, use the 'Prefer' header.
        const result = await addActivity(ApIargument).unwrap();
        const newId = result[0].id;
        console.log('Created activity with id ', newId);
        saveHandler(newId);
    };

    if (data === undefined) return <div></div>;

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
                
    const currentOption = (activity !== null) && list && list.find(item => item.id === activity);
    console.log(currentOption)
    return <Select options={list} 
                value={currentOption}
                styles={colorStyle(isFilter)} 
                onChange={onChange}
                onCreateOption={handleCreate}
                isValidNewOption={() => !isFilter}
                isClearable={true}
                placeholder="Activité ..."
                components={{
                    IndicatorSeparator: () => null,
                    DropdownIndicator: () => null,         
                  }}
                  className={className}
            />
}