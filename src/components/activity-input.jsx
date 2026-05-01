import { useEffect, useState } from 'react';
import Select from 'react-select/creatable';
import Color from 'color';
import _ from 'lodash';

import { getActivityColor } from './ui-helper';
import { useGetActivitiesQuery, useAddActivityMutation } from '../features/apiSlice';

const colorStyle = (isInline) => ({
    control: (styles, state) => ({
        ...styles,
        backgroundColor: 'transparent',
        minHeight: isInline ? 'unset' : styles.minHeight,
        border: isInline ? 'none' : ''
    }),
    valueContainer: (styles, {data}) => ({ ...styles,
        padding: 0,
        paddingLeft: 3,
        paddingRight: 0,
        margin: 0
    }),
    dropdownIndicator: (styles) => ({
        ...styles,
        borderRadius: 3,
        padding: 2,
        margin: 2
    }),
    clearIndicator: (base) => ({
      ...base,
      padding: '0',
    }),
    option: (styles, {data}) => {return { ...styles,
        backgroundColor: data.color || '#999999',
        color: data.color ? Color(data.color).luminosity() > 0.5 ? 'black' : 'white' :  'black',
    }},
    singleValue: (baseStyle, {data}) => ({
        ...baseStyle,
        backgroundColor: data.color,
        color: !isInline ? Color(data.color).luminosity() > 0.5 ? 'black' : 'white' : baseStyle.color,
        borderRadius: 4,
        padding: 2
    })
})

export default function ActivityInput({activity, saveHandler, className, isInline}) {
    
    const { data } = useGetActivitiesQuery();
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
    list = list.map((item, index) => (
        {...item, 
            color: getActivityColor(item.id, data),
        }))
                
    const currentOption = (activity !== null) && list && list.find(item => item.id === activity);
    return <Select options={list}
                value={currentOption}
                styles={colorStyle(isInline)}
                onChange={onChange}
                onCreateOption={handleCreate}
                isValidNewOption={() => !isInline}
                isClearable={true}
                placeholder="Activité ..."
                aria-label="activité"
                components={{
                    IndicatorSeparator: () => null,
                    DropdownIndicator: () => null,
                  }}
                  className={className}
            />
}