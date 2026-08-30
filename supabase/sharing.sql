create extension if not exists "pgcrypto" with schema extensions;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid() references auth.users (id) on delete cascade,
  name text not null default 'User',
  avatar_url text not null default '',
  bio text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  id_user uuid references public.users (id) on delete cascade,
  title text not null default '',
  description text default '',
  lat double precision not null,
  lng double precision not null,
  category text not null,
  wish_rating smallint not null,
  status text not null default 'wishlist',
  share_token uuid unique,
  created_at timestamptz not null default now()
);

create index if not exists places_id_user_idx on public.places (id_user);

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text default '',
  created_by uuid references public.users (id) on delete set null,
  invite_token uuid unique,
  share_token uuid unique,
  created_at timestamptz not null default now()
);

create table if not exists public.group_members (
  group_id uuid not null references public.groups (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  role text not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create index if not exists group_members_user_id_idx on public.group_members (user_id);

create table if not exists public.shared_places (
  place_id uuid not null references public.places (id) on delete cascade,
  group_id uuid not null references public.groups (id) on delete cascade,
  shared_by uuid references public.users (id) on delete set null,
  can_edit boolean not null default false,
  shared_at timestamptz not null default now(),
  primary key (place_id, group_id)
);

create index if not exists shared_places_group_id_idx on public.shared_places (group_id);

alter table public.users enable row level security;
alter table public.places enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.shared_places enable row level security;

create or replace function public.is_group_member(target_group uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.group_members
    where group_id = target_group and user_id = auth.uid()
  )
$$;

create or replace function public.is_group_admin(target_group uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.group_members
    where group_id = target_group and user_id = auth.uid() and role = 'admin'
  )
$$;

create or replace function public.create_group(group_name text, group_description text default '')
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_group_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.groups (name, description, created_by)
  values (group_name, group_description, auth.uid())
  returning id into new_group_id;

  insert into public.group_members (group_id, user_id, role)
  values (new_group_id, auth.uid(), 'admin');

  return new_group_id;
end;
$$;

create or replace function public.join_group(group_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_group uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select id into target_group
  from public.groups
  where invite_token::text = group_token
  limit 1;

  if target_group is null then
    raise exception 'Invalid invite token';
  end if;

  insert into public.group_members (group_id, user_id, role)
  values (target_group, auth.uid(), 'member')
  on conflict (group_id, user_id) do nothing;

  return target_group;
end;
$$;

create policy "users_select_own" on public.users
  for select using (id = auth.uid());

create policy "users_select_group" on public.users
  for select using (
    auth.uid() is not null and exists (
      select 1 from public.group_members gm
      where gm.user_id = public.users.id and public.is_group_member(gm.group_id)
    )
  );

create policy "users_update_own" on public.users
  for update using (id = auth.uid()) with check (id = auth.uid());

create policy "places_select_own" on public.places
  for select using (id_user = auth.uid());

create policy "places_select_shared" on public.places
  for select using (
    auth.uid() is not null and exists (
      select 1 from public.shared_places sp
      where sp.place_id = public.places.id and public.is_group_member(sp.group_id)
    )
  );

create policy "places_select_public" on public.places
  for select using (
    share_token is not null or exists (
      select 1
      from public.shared_places sp
      join public.groups g on g.id = sp.group_id
      where sp.place_id = public.places.id and g.share_token is not null
    )
  );

create policy "places_insert_own" on public.places
  for insert with check (id_user = auth.uid());

create policy "places_update_own" on public.places
  for update using (id_user = auth.uid()) with check (id_user = auth.uid());

create policy "places_update_shared_edit" on public.places
  for update using (
    exists (
      select 1 from public.shared_places sp
      where sp.place_id = public.places.id and sp.can_edit and public.is_group_member(sp.group_id)
    )
  );

create policy "places_delete_own" on public.places
  for delete using (id_user = auth.uid());

create policy "groups_select_member" on public.groups
  for select using (public.is_group_member(id) or created_by = auth.uid());

create policy "groups_select_public" on public.groups
  for select using (share_token is not null);

create policy "groups_insert_own" on public.groups
  for insert with check (created_by = auth.uid());

create policy "groups_update_admin" on public.groups
  for update using (public.is_group_admin(id) or created_by = auth.uid());

create policy "groups_delete_admin" on public.groups
  for delete using (public.is_group_admin(id) or created_by = auth.uid());

create policy "group_members_select_member" on public.group_members
  for select using (public.is_group_member(group_id));

create policy "group_members_insert_member" on public.group_members
  for insert with check (public.is_group_member(group_id));

create policy "group_members_update_admin" on public.group_members
  for update using (public.is_group_admin(group_id));

create policy "group_members_delete" on public.group_members
  for delete using (user_id = auth.uid() or public.is_group_admin(group_id));

create policy "shared_places_select_member" on public.shared_places
  for select using (public.is_group_member(group_id));

create policy "shared_places_select_public" on public.shared_places
  for select using (
    exists (
      select 1 from public.groups g
      where g.id = shared_places.group_id and g.share_token is not null
    )
  );

create policy "shared_places_insert_member" on public.shared_places
  for insert with check (public.is_group_member(group_id));

create policy "shared_places_update" on public.shared_places
  for update using (public.is_group_admin(group_id) or shared_by = auth.uid());

create policy "shared_places_delete_member" on public.shared_places
  for delete using (public.is_group_admin(group_id) or shared_by = auth.uid());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', 'User'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into public.users (id, name)
select u.id, coalesce(u.raw_user_meta_data->>'name', 'User')
from auth.users u
on conflict (id) do nothing;