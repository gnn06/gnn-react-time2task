const initialData = {
    tasks : [
        { 
            id: 'id1',
            title: 'task 1'
        },
        {
            id: 'id2',
            title: 'task 2'
        },
        {
            id:    'id3',
            title: 'task 3'
        }
    ],
    slots: [
        {
            id:    'slot3',
            title: 'day',
            inner: [
                {
                    id:    'slot1',
                    title: 'créneau1',
                    start: '10:00',
                    end:   '11:00'
                },
                {
                    id:    'slot2',
                    title: 'créneau2',
                    start: '14:00',
                    end:   '15:00'
                }
            ]
        }
    ]
}

export default initialData;
