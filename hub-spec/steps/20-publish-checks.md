# Step 20: Publish checks

## Goal
`/publish` puts a prototype live only when its card is complete.

## Do
1. Check the prototype's card file against `DATA.md`.
2. If the name, pages or status is missing, stop and say which.
3. Show the current status and let the person pick a new one from the fixed list, or keep it.
4. Set `updated` to today.
5. Commit the change, then run `scripts/deploy` for the team.
6. Print the link to the prototype on the hub.

## Leave out
Publishing a single prototype on its own. The whole team site is published.

## Checklist
- A card with no pages is refused, with a message naming the missing field.
- The status can only be one from the fixed list.
- `updated` changes on publish.
- The checks in `scripts/deploy` still apply.
- The printed link opens the prototype.
