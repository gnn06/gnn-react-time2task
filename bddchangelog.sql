// filter 'archivé' without managing null value
alter table tasks alter column "Etat" SET DEFAULT 'A faire';
update tasks set "Etat" = 'A faire' where "Etat" is null;