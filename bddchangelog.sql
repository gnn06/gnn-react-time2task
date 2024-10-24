//  les dates correspondent au moment de l'exécution en prod
// filter 'archivé' without managing null value
alter table tasks alter column "Etat" SET DEFAULT 'A faire';
update tasks set "Etat" = 'A faire' where "Etat" is null;

// 02/03/2024
drop view activetasks

// 08/07/2024
// create activity
alter table tasks add column "Activity" int8 default null;


create table
  public."Activities" (
    id bigint generated by default as identity,
    label text not null,
    "user" uuid null default auth.uid (),
    constraint Activities_pkey primary key (id),
    constraint Activities_user_fkey foreign key ("user") references auth.users (id) on delete set null
  ) tablespace pg_default;

create policy "all, public, authenticated"
on "public"."Activities"
to public
using (
  ("user" = auth.uid())
);

alter table public."tasks"
add constraint tasks_Activity_fkey foreign key ("Activity") references "Activities" (id) on delete set null;
