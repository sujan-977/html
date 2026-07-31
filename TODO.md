# TODO: Fix `room.amenities.map is not a function` error

- [x] **Step 1: API route normalization** — In `app/api/rooms/route.js`, normalize `amenities` to always be an array in the `GET` handler.
- [x] **Step 2: Frontend safety check** — In `app/rooms/page.js`, add `Array.isArray()` guard before calling `.map()` on amenities.
- [x] **Step 3: Test** — Visit the rooms page and verify the error is resolved.

