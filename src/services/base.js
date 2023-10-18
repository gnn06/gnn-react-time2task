//import Airtable from 'airtable';

//const base = new Airtable({apiKey: 'pateXlE2yDTfJUXSk.3ef63a108889473cb840070c3699ce6edebdfd737e94b57f0ab9c14c409f4f42'})
//    .base('appxxeJDaPUItDFAF');

function getAllTasksP() {
    return new Promise((resolve, reject) => {
        let result = [
            {"id":"recTtpdHYev0FfTxU","title":"migration ubuntu"},
            {"id":"recCZYaSWMNZMrRbl","title":"suivi incident","slotExpr":"mardi"},
            {"id":"reciylo2PpHlXeNo6","title":"poser template suivi transverse exemple projet prévention"},
            {"id":"recS0GWmbnKqTjcTW","title":"suivi projet transverse (dont prévention)"},
            {"id":"recM8xQ21j1dRpCSk","title":"consigner events de la semaine"},
            {"id":"recST8n10wB54U4jF","title":"consigner temps impact","slotExpr":"vendredi"}
            ,{"id":"recoXd4OyDUcru2mJ","title":"préparer semaine prochaine"}
            ,{"id":"recEpoP2owuvd4Zja","title":"suivi poseidon anomalie","slotExpr":"jeudi"}
            ,{"id":"recjy3Nj2ElGbPHoy","title":"suivi poseidon fonctionnement prod","slotExpr":"jeudi"}
            ,{"id":"reczLLeGI4FwJv213","title":"suivi global sécu","slotExpr":"mardi"}
            ,{"id":"recOyZDnf0uplEAFr","title":"transverse / reporting dufaux","slotExpr":"mercredi"}
            ,{"id":"recxJCq03Z9SGVpyD","title":"suivre saisie des temps IMPACT","slotExpr":"lundi aprem"}
            ,{"id":"recGCosJep60Ukuku","title":"transverse / revue mensuelle infra + compte à supprimer"}
            ,{"id":"reccWBbHKc7IAzTGs","title":"saisie anticipée sciforma","slotExpr":"week"}
            ,{"id":"recN1GHjT4sfWaGLj","title":"cablage préprod / lancer action legacy"}
            ,{"id":"recrhJNBT1ijdKFLv","title":"upgrade tridig","slotExpr":"next_week"}
            ,{"id":"rec80dP8GUp02NHqw","title":"relecture matrice OWASP API et adaptation WAF"}
            ,{"id":"recvz3IyTCyI3oXfs","title":"migration des apache 2.2 WS"}
            ,{"id":"recpCPTyVRin7m7Cl","title":"aide Domaine / front / migration witbe"}
            ,{"id":"recphkpYwZCoQq8gs","title":"relecture fiche rgpd"}
            ,{"id":"recDYJOt4W6kg1qzu","title":"project bascule GED","slotExpr":"lundi matin"}];
        resolve(result);
        /*
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
        });*/
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