# Security Specification

## Data Invariants
1. A user can only create an entry if `ownerId` matches their `auth.uid`.
2. A user can only read an entry if they are the owner, OR if the entry has `isPublic` set to `true`.
3. A user can only update or delete an entry if they are its owner.
4. An entry must follow the `JournalEntry` schema.
5. All IDs must be valid.

## The Dirty Dozen Payloads
1. Create entry with empty title
2. Create entry with invalid mood
3. Create entry where `ownerId` is someone else's UID
4. Create entry as an unauthenticated user
5. Read private entry as another user
6. Read private entry as unauthenticated user
7. Update someone else's entry
8. Update `ownerId` to someone else's UID
9. Add a ghost field (e.g. `isAdmin: true`)
10. Send a 1.5MB title string (Denial of Wallet)
11. Send a string for `isPublic` instead of boolean
12. Delete someone else's entry
