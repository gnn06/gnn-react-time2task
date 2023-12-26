import { useSetEtatMutation } from "../features/apiSlice.js";
import Select from 'react-select';
import Color from 'color';

function myColor(color) {
    return Color(color).lighten(0.4).string()
}

const statusReferentiel = [
    {value: 'A faire' , color: myColor('#ef4444') },
    {value: 'en cours', color: myColor('#eab308') },
    {value: 'fait'    , color: myColor('#22c55e')  },
    {value: 'terminé' , color: myColor('#14b8a6')  },
    {value: 'reprendre aujourd\'hui', color: myColor('#a855f7') },
    {value: 'reprendre demain'      , color: myColor('#d946ef') },
    {value: 'reprendre semaine'     , color: myColor('#ec4899') },
].map((item) => { return { ...item, label: item.value }});

export default function SyntaxInput({task}) {
    const [
        setStatus,
        { isLoading: isUpdating }, // This is the destructured mutation result
      ] = useSetEtatMutation()
    
    
    const onChange = (value, action) => {
        const taskId = task.id;
        const taskStatus = value.value;
        setStatus({id:taskId, status: taskStatus})
    };
    
    const onClick = e => {
        e.stopPropagation();
    };

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
            color: 'black',
            backgroundColor: 'rgb(156, 163, 175)',
            borderRadius: 3,
            padding: 2,
            margin: 2
        }),
        option: (styles, {data}) => ({ ...styles,
            backgroundColor: data.color
        }),
        singleValue: (baseStyle, {data}) => ({
            ...baseStyle,
            backgroundColor: data.color,
            borderRadius: 4,
            paddingTop: 2,
            paddingLeft: 2,
            paddingBottom: 2,
            paddingRight: 2
        })
    }

    // return <select defaultValue={task.status}
    //     onClick={onClick} onChange={onChange}
    //     className="bg-transparent">
    //     { statusReferentiel.map(st => <option value={st} key={st}>{st}</option>)}
    // </select>
    const defaultValue = statusReferentiel.find(item => item.value === task.status);
    return <Select options={statusReferentiel} defaultValue={defaultValue}
                    styles={colorStyle} onChange={onChange}
                    components={{
                        IndicatorSeparator: () => null
                    }}/>
}
