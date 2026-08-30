# PlacesWishlist

A travel wishlist in the form of a map. Add the places you want to visit, rate how much you want to go there, keep track of what you have already seen, and share lists with friends.

Click anywhere on the map - a place is born. Add a name, a description, a category and a 1-5 star rating. Later you go there, mark it as visited, and that is it. The whole "some day I will go" pile now lives in one place.

It works without an account: guest data lives in localStorage. Sign in and everything moves to Supabase, available on any device. Auth and cloud storage run on Supabase, so enabling them requires a Supabase project - see [Run your own instance](#run-your-own-instance).

## Live app

[faaazy.github.io/places-wishlist](https://faaazy.github.io/places-wishlist/)

## Features

- Click on the map to open the "add place" form: title, description, category, wish rating.
- Color-coded markers per category. Clicking a marker opens a popup with description, stars, status buttons and delete/edit.
- Sidebar with search, category filters and sorting by date or rating.
- Every place has a link: `?placeId=...` jumps straight to its marker.
- Statuses: wishlist -> visited / skipped. Deletion can be undone.
- Browser geolocation with a single button ("my location").
- Smart search: matches titles, coordinates, and real places/addresses through Nominatim.
- A set of popular places to bootstrap your wishlist in one tap.
- Auth via Supabase (email + password). Guests are full-fledged users except their data stays local.
- Profile: name, bio, avatar (resized client-side before upload).
- Groups: create, invite by link, manage members, admin powers, leave or delete.
- Sharing: a single place or an entire group list behind a public link (`/share/place/:token`, `/share/list/:token`).
- Group owners can grant edit rights on shared places ("can edit") and revoke them.
- Places you shared yourself are not duplicated on the map, but their popup shows which groups they live in.
- Duplicate guards: identical title + description cannot be shared into the same group, and adding an existing place warns first.

## Place categories

| Category  | What it covers                   |
| --------- | -------------------------------- |
| nature    | mountains, parks, landscapes     |
| city      | streets, viewpoints, urban areas |
| food      | cafes, restaurants, local eats   |
| culture   | museums, architecture, events    |
| adventure | outdoor activities, thrill rides |

## Tech stack

| Layer        | Technology                              |
| ------------ | --------------------------------------- |
| Frontend     | React 19, TypeScript, Vite              |
| Routing      | React Router v7                         |
| Map          | Leaflet, react-leaflet, markercluster   |
| Auth + DB    | Supabase (Auth, Postgres, RLS)          |
| Place search | Nominatim (OpenStreetMap)               |
| Icons        | lucide-react                            |
| Styling      | CSS Modules                             |
| Fonts        | Inter Variable, JetBrains Mono Variable |

## Run your own instance

```bash
npm install
npm run dev
```

Guest mode works without any backend - data stays in the browser's localStorage. To enable sign-in, cross-device sync and sharing, the app needs a Supabase project:

1. Create a project, open Settings -> API and copy the URL and publishable key.
2. Add them to the environment:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

3. Open SQL Editor and run `supabase/sharing.sql`. It creates the tables (`users`, `places`, `groups`, `group_members`, `shared_places`), RLS policies, the `create_group` / `join_group` RPCs and the profile trigger. The file is idempotent, so re-running it is safe.

Note: `auth.users` and the `public.users` table are different things. The `handle_new_user()` trigger in `sharing.sql` creates the profile row on registration - a fresh account has no profile until it fires.

## Project structure

Feature-Sliced-Design inspired, but kept pragmatic.

```
src/
  app/          entry point, routing, global styles
  entities/     domain models: auth, place, user, group
  features/     features: add place, markers, sharing, auth form
  pages/        pages: map, profile, auth, groups, share
  widgets/      map, sidebar, header, layout
  shared/       utilities, small UI bits, geocoding
supabase/
  sharing.sql   full DB schema, RLS, RPC, trigger
```
