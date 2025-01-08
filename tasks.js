var fs = require('fs');
const toInsert = {
    "id": 344,
    "Sujet": "nettoyage FQDN infogreffe",
    "slotExpr": "this_month this_week mercredi matin",
    "Etat": "A faire",
    "ordre": null,
    "user": "9880d938-26b4-452b-8820-76dd73197bbe",
    "Activity": 9,
    "created_at": "2025-01-06T13:43:57.547993"
}
const inputBis = [
    {
        "id": 247,
        "Sujet": "sécu / renvoyer synthèse sujets sécurité",
        "slotExpr": "every 6 this_month + 4",
        "Etat": "A faire",
        "ordre": 2,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 6,
        "created_at": "2024-10-13T07:25:45.492621"
    }
]
const input = [
    {
        "id": 42,
        "Sujet": "impact / check JIRA perso",
        "slotExpr": "this_month every 1 this_week jeudi aprem",
        "Etat": "A faire",
        "ordre": 30,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 4,
        "created_at": "2024-10-13T07:25:45.492621"
    },
    {
        "id": 135,
        "Sujet": "béa / préparer réu passage relai béatrice",
        "slotExpr": "this_month every 4 next_week mardi aprem",
        "Etat": "A faire",
        "ordre": 29,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 5,
        "created_at": "2024-10-13T07:25:45.492621"
    },
    {
        "id": 13,
        "Sujet": "impact / surveiller infra prod impact",
        "slotExpr": "this_month every 2 this_week jeudi aprem",
        "Etat": "A faire",
        "ordre": 45,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 4,
        "created_at": "2024-10-13T07:25:45.492621"
    },
    {
        "id": 205,
        "Sujet": "infra / réduction nb core proc oracle",
        "slotExpr": "this_month every 1 this_week mercredi aprem",
        "Etat": "A faire",
        "ordre": 30,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 9,
        "created_at": "2024-10-13T07:25:45.492621"
    },
    {
        "id": 30,
        "Sujet": "confirmer COPRO",
        "slotExpr": "every 2 this_week vendredi matin",
        "Etat": "A faire",
        "ordre": 4,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 7,
        "created_at": "2024-10-13T07:25:45.492621"
    },
    {
        "id": 255,
        "Sujet": "contrôle saisie tempo",
        "slotExpr": "this_month every 2 next_week vendredi matin",
        "Etat": "A faire",
        "ordre": 50,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 1,
        "created_at": "2024-10-13T07:25:45.492621"
    },
    {
        "id": 198,
        "Sujet": "qualité / matrice compétence",
        "slotExpr": "every 2 this_week vendredi aprem",
        "Etat": "A faire",
        "ordre": 50,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 10,
        "created_at": "2024-10-13T07:25:45.492621"
    },
    {
        "id": 28,
        "Sujet": "maj COPRO hebdomadaire perso et autres",
        "slotExpr": "every 2 this_week vendredi matin",
        "Etat": "A faire",
        "ordre": 4,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 7,
        "created_at": "2024-10-13T07:25:45.492621"
    },
    {
        "id": 199,
        "Sujet": "fde / modelio / formation",
        "slotExpr": "every 1 this_week mardi aprem ",
        "Etat": "fait",
        "ordre": 25,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 5,
        "created_at": "2024-10-13T07:25:45.492621"
    },
    {
        "id": 244,
        "Sujet": "oddj / suivi global ODDJ - oddj sync",
        "slotExpr": "this_month every 1 this_week lundi matin jeudi aprem",
        "Etat": "A faire",
        "ordre": 17,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 2,
        "created_at": "2024-10-13T07:25:45.492621"
    },
    {
        "id": 275,
        "Sujet": "débrief réunion transverse",
        "slotExpr": "every 1 this_week vendredi matin",
        "Etat": "A faire",
        "ordre": 20,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 7,
        "created_at": "2024-10-13T07:25:45.492621"
    },
    {
        "id": 128,
        "Sujet": "fde/ suivi françois",
        "slotExpr": "every 1 this_week mardi aprem ",
        "Etat": "fait",
        "ordre": 25,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 5,
        "created_at": "2024-10-13T07:25:45.492621"
    },
    {
        "id": 19,
        "Sujet": "[formation] suivi formation",
        "slotExpr": "every 1 this_month this_week vendredi aprem",
        "Etat": "A faire",
        "ordre": 40,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 10,
        "created_at": "2024-10-13T07:25:45.492621"
    },
    {
        "id": 259,
        "Sujet": "infra / organiser réu migration ged php  (septempbre)",
        "slotExpr": "this_month next_week",
        "Etat": "A faire",
        "ordre": 25,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 9,
        "created_at": "2024-10-13T07:25:45.492621"
    },
    {
        "id": 291,
        "Sujet": "suivi PIP (réal et suivi actions via oddj sync)",
        "slotExpr": "this_month every 4 this_week lundi matin",
        "Etat": "terminé",
        "ordre": 30,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 2,
        "created_at": "2024-10-13T07:25:45.492621"
    },
    {
        "id": 267,
        "Sujet": "expiration mdp",
        "slotExpr": "every 3 this_month + 2",
        "Etat": "A faire",
        "ordre": 5,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": null,
        "created_at": "2024-10-13T07:25:45.492621"
    },
    {
        "id": 211,
        "Sujet": "méthodo / check besoin interco JIRA",
        "slotExpr": "every 1 this_month this_week vendredi aprem",
        "Etat": "A faire",
        "ordre": 40,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 3,
        "created_at": "2024-10-13T07:25:45.492621"
    },
    {
        "id": 208,
        "Sujet": "débrief réunion sécurité du mercredi",
        "slotExpr": "every 2 next_week mercredi aprem",
        "Etat": "A faire",
        "ordre": 20,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 6,
        "created_at": "2024-10-13T07:25:45.492621"
    },
    {
        "id": 337,
        "Sujet": "activer double auth doca",
        "slotExpr": "this_month this_week mercredi aprem",
        "Etat": "A faire",
        "ordre": 45,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": null,
        "created_at": "2024-12-13T08:37:06.740546"
    },
    {
        "id": 328,
        "Sujet": "émission facture gaia",
        "slotExpr": "every 1 this_month next_week",
        "Etat": "A faire",
        "ordre": null,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 1,
        "created_at": "2024-12-03T10:09:27.437754"
    },
    {
        "id": 341,
        "Sujet": "maj DAT pour hassen",
        "slotExpr": "this_month this_week mercredi aprem",
        "Etat": "A faire",
        "ordre": 5,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 1,
        "created_at": "2024-12-19T09:25:48.616724"
    },
    {
        "id": 292,
        "Sujet": "suivre fusion gaia-athéna-poséidon",
        "slotExpr": "this_month this_week mercredi matin",
        "Etat": "A faire",
        "ordre": 15,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 11,
        "created_at": "2024-10-13T07:25:45.492621"
    },
    {
        "id": 10,
        "Sujet": "impact / suivi anomalie impact équipe et perso",
        "slotExpr": "this_month every 2 this_week jeudi aprem",
        "Etat": "A faire",
        "ordre": 45,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 4,
        "created_at": "2024-10-13T07:25:45.492621"
    },
    {
        "id": 306,
        "Sujet": "réduction cout DSI (sabrina)",
        "slotExpr": "this_month this_week mercredi matin",
        "Etat": "A faire",
        "ordre": 40,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 9,
        "created_at": "2024-11-04T09:06:50.324291"
    },
    {
        "id": 277,
        "Sujet": "méthode facturation athéna-poséidon & tempo",
        "slotExpr": "this_month every 2 this_week mardi matin",
        "Etat": "terminé",
        "ordre": 30,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 1,
        "created_at": "2024-10-13T07:25:45.492621"
    },
    {
        "id": 318,
        "Sujet": "répartition techlead",
        "slotExpr": "this_month next_week",
        "Etat": "A faire",
        "ordre": 10,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 11,
        "created_at": "2024-11-21T17:09:54.823866"
    },
    {
        "id": 340,
        "Sujet": "filtrage IP suivi_si (move to suivi SSI)",
        "slotExpr": "this_week mardi aprem",
        "Etat": "terminé",
        "ordre": 30,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 6,
        "created_at": "2024-12-19T08:37:27.564761"
    },
    {
        "id": 221,
        "Sujet": "oddj / prépa réu ODDJ du vendredi",
        "slotExpr": "this_month every 1 this_week jeudi aprem vendredi matin",
        "Etat": "A faire",
        "ordre": 20,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 2,
        "created_at": "2024-10-13T07:25:45.492621"
    },
    {
        "id": 335,
        "Sujet": "pca / orga PCA BDD T1 2025",
        "slotExpr": "this_month next_week",
        "Etat": "A faire",
        "ordre": 6,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 9,
        "created_at": "2024-12-11T13:52:55.943268"
    },
    {
        "id": 330,
        "Sujet": "debrief suivi atelier fusion gaia",
        "slotExpr": "this_month this_week mercredi matin",
        "Etat": "A faire",
        "ordre": 15,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 11,
        "created_at": "2024-12-04T16:12:59.760819"
    },
    {
        "id": 188,
        "Sujet": "suivi reuse titane3/4",
        "slotExpr": "this_month every 1 this_week jeudi matin",
        "Etat": "A faire",
        "ordre": 30,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 9,
        "created_at": "2024-10-13T07:25:45.492621"
    },
    {
        "id": 40,
        "Sujet": "sécu / prépa réu SSI, suivi sécu, action pers, ",
        "slotExpr": "every 2 next_week mardi aprem",
        "Etat": "A faire",
        "ordre": 24,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 6,
        "created_at": "2024-10-13T07:25:45.492621"
    },
    {
        "id": 324,
        "Sujet": "répartition ppo",
        "slotExpr": "this_month next_week",
        "Etat": "A faire",
        "ordre": 16,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 11,
        "created_at": "2024-12-02T15:13:11.35846"
    },
    {
        "id": 21,
        "Sujet": "travailler sur les upgrade",
        "slotExpr": "every 1 this_month this_week mercredi aprem",
        "Etat": "A faire",
        "ordre": 50,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 6,
        "created_at": "2024-10-13T07:25:45.492621"
    },
    {
        "id": 251,
        "Sujet": "déplacement archivage SES",
        "slotExpr": "this_month every 1 this_week mercredi aprem",
        "Etat": "A faire",
        "ordre": 31,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 9,
        "created_at": "2024-10-13T07:25:45.492621"
    },
    {
        "id": 323,
        "Sujet": "déplacement filerepo baie jdc",
        "slotExpr": "this_month every 1 this_week mercredi aprem",
        "Etat": "A faire",
        "ordre": 31,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 9,
        "created_at": "2024-12-02T15:10:14.495772"
    },
    {
        "id": 342,
        "Sujet": "problème réseau oddj",
        "slotExpr": "this_month this_week mercredi matin",
        "Etat": "A faire",
        "ordre": 10,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 2,
        "created_at": "2024-12-19T09:44:39.656725"
    },
    {
        "id": 332,
        "Sujet": "actions COPIL",
        "slotExpr": "this_month every 2 next_week mardi aprem",
        "Etat": "A faire",
        "ordre": 12,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 1,
        "created_at": "2024-12-06T16:39:58.348557"
    },
    {
        "id": 24,
        "Sujet": "saisie anticipée temps sciforma",
        "slotExpr": "every 1 this_month following_week",
        "Etat": "A faire",
        "ordre": 5,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 1,
        "created_at": "2024-10-13T07:25:45.492621"
    },
    {
        "id": 329,
        "Sujet": "suivi chantier infra",
        "slotExpr": "this_month every 1 this_week mercredi aprem",
        "Etat": "A faire",
        "ordre": 20,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 9,
        "created_at": "2024-12-03T14:44:13.833524"
    },
    {
        "id": 270,
        "Sujet": "fde / mailing-list support centralisation",
        "slotExpr": "every 1 this_week mardi aprem ",
        "Etat": "fait",
        "ordre": 25,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 5,
        "created_at": "2024-10-13T07:25:45.492621"
    },
    {
        "id": 37,
        "Sujet": "orga / débrief action COPRO",
        "slotExpr": "every 2 next_week lundi matin",
        "Etat": "A faire",
        "ordre": 0,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 7,
        "created_at": "2024-10-13T07:25:45.492621"
    },
    {
        "id": 239,
        "Sujet": "pca / ping des équipes sur les PCA",
        "slotExpr": "every 2 this_week + 2",
        "Etat": "A faire",
        "ordre": 21,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 9,
        "created_at": "2024-10-13T07:25:45.492621"
    },
    {
        "id": 142,
        "Sujet": "orga / faire formations obligatoires",
        "slotExpr": "every 2 this_week vendredi aprem",
        "Etat": "A faire",
        "ordre": 60,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 10,
        "created_at": "2024-10-13T07:25:45.492621"
    },
    {
        "id": 343,
        "Sujet": "capacity planning disk",
        "slotExpr": "this_month this_week mercredi aprem",
        "Etat": "A faire",
        "ordre": 30,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 9,
        "created_at": "2024-12-20T07:44:59.692869"
    },
    {
        "id": 38,
        "Sujet": "envoyer TEMPO",
        "slotExpr": "every 1 this_month this_week mercredi aprem",
        "Etat": "A faire",
        "ordre": 15,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 1,
        "created_at": "2024-10-13T07:25:45.492621"
    },
    {
        "id": 12,
        "Sujet": "sécu / suivi sécu, action perso",
        "slotExpr": "this_month every 2 this_week mardi aprem",
        "Etat": "fait",
        "ordre": 30,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 6,
        "created_at": "2024-10-13T07:25:45.492621"
    },
    {
        "id": 31,
        "Sujet": "pca / prépa réunion PCA mensuelle (janvier)",
        "slotExpr": "every 1 this_month this_week mercredi aprem",
        "Etat": "A faire",
        "ordre": 5,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 9,
        "created_at": "2024-10-13T07:25:45.492621"
    },
    {
        "id": 9,
        "Sujet": "qualité / revue \"annuelle\" documentaire",
        "slotExpr": "every 2 this_week vendredi aprem",
        "Etat": "A faire",
        "ordre": 50,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 10,
        "created_at": "2024-10-13T07:25:45.492621"
    },
    {
        "id": 238,
        "Sujet": "oddj / cr réunion oddj réseau",
        "slotExpr": "every 1  this_week vendredi matin",
        "Etat": "A faire",
        "ordre": 20,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 2,
        "created_at": "2024-10-13T07:25:45.492621"
    },
    {
        "id": 55,
        "Sujet": "qualité / (6mois/juillet) contrôle matrice habilitation présence départ/arrivée",
        "slotExpr": "every 1 this_month this_week vendredi aprem",
        "Etat": "A faire",
        "ordre": 50,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 10,
        "created_at": "2024-10-13T07:25:45.492621"
    },
    {
        "id": 16,
        "Sujet": "php / upgrade php et fermeture TLS dgfip",
        "slotExpr": "this_month every 2 next_week mardi aprem",
        "Etat": "A faire",
        "ordre": 50,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 9,
        "created_at": "2024-10-13T07:25:45.492621"
    },
    {
        "id": 331,
        "Sujet": "béa / travailler sur passage relai béatrice",
        "slotExpr": "this_month every 4 this_week + 3 mardi aprem vendredi aprem",
        "Etat": "A faire",
        "ordre": 30,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 5,
        "created_at": "2024-12-05T09:00:04.833748"
    },
    {
        "id": 249,
        "Sujet": "team / respect télétravail",
        "slotExpr": "every 1 this_month following_week",
        "Etat": "A faire",
        "ordre": 20,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 5,
        "created_at": "2024-10-13T07:25:45.492621"
    },
    {
        "id": 14,
        "Sujet": "[impact] surveiller migration du stock",
        "slotExpr": "every 1 this_month this_week jeudi",
        "Etat": "A faire",
        "ordre": 44,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 4,
        "created_at": "2024-10-13T07:25:45.492621"
    },
    {
        "id": 182,
        "Sujet": "fde / revue SLA mensuel (début janvier)",
        "slotExpr": "every 1 this_month this_week jeudi",
        "Etat": "A faire",
        "ordre": 4,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": 9,
        "created_at": "2024-10-13T07:25:45.492621"
    },
    {
        "id": 336,
        "Sujet": "création docaged philippe cuisinaud",
        "slotExpr": "this_month this_week vendredi aprem",
        "Etat": "terminé",
        "ordre": 45,
        "user": "9880d938-26b4-452b-8820-76dd73197bbe",
        "Activity": null,
        "created_at": "2024-12-12T15:02:44.510341"
    },
]
const output = input.map(el => `update "tasks" set "Sujet" = '${el.Sujet}', "slotExpr" = '${el.slotExpr}', "Etat" = '${el.Etat}', "ordre" = ${el.ordre}, "Activity" = ${el.Activity} where "id" = ${el.id}`)


var file = fs.createWriteStream('output.txt');
file.on('error', function(err) { /* error handling */ });
output.forEach(function(v) { file.write(v + ';\n'); });
file.end();
