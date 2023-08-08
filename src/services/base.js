import Airtable from 'airtable';

const base = new Airtable({apiKey: 'pateXlE2yDTfJUXSk.3ef63a108889473cb840070c3699ce6edebdfd737e94b57f0ab9c14c409f4f42'})
    .base('appxxeJDaPUItDFAF');

function getAllTasksP() {
    return new Promise((resolve, reject) => {
        const result = [];
        base('Taches').select({
                view: "Toutes les taches"
            }).eachPage(function page(records, fetchNextPage) {
                // This function (`page`) will get called for each page of records.
    
                records.forEach(function(record) {
                    const id = record.getId();
                    const title = record.get('Sujet')
                    const slotExpr = record.get('slotExpr')
                    const item = { id, title, slotExpr }
                    result.push(item);
                });
    
                // To fetch the next page of records, call `fetchNextPage`.
                // If there are more records, `page` will get called again.
                // If there are no more records, `done` will get called.
                fetchNextPage();
    
            }, function done(err) {
                if (err) { reject(err) }
                console.debug('retrieve tasks from DB done (' + result.length + ')')
                resolve(result)
        });
    });
};

// base('Taches').create([
//     {
//       "fields": {
//         "Sujet": "testtoto",
//         "Catégorie": "aide Domaine / back / ",
//         "Créneau Semaine": "cette semaine",
//         "Créneau Jour": "demain",
//         "Créneau Heure": "matin",
//         "Etat": "A faire"
//       }
//     }
//   ], function(err, records) {
//     if (err) {
//       console.error(err);
//       return;
//     }
//     records.forEach(function (record) {
//       console.log(record.getId());
//     });
//   });

// base('Taches').update([
//     {
//       "id": "rechBXN3CWuCQbHy1",
//       "fields": {
//         "Etat": "A faire"
//       }
//     }
//   ], function(err, records) {
//     if (err) {
//       console.error(err);
//       return;
//     }
//     records.forEach(function(record) {
//       console.log('done');
//     });
//   });

// base('Taches').destroy(['recYVOxvc89elq139'], function(err, deletedRecords) {
//     if (err) {
//       console.error(err);
//       return;
//     }
//     console.log('Deleted', deletedRecords.length, 'records');
//   });

export { getAllTasksP }