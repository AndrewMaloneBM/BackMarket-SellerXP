# Step 14: Empty hub and no results

## Goal
The home page says something useful when there is nothing to show.

## Read
Pictures: `screens/05-empty-hub.png`, `screens/06-no-results.png`. Sources: `source/05-empty-hub.html`, `source/06-no-results.html`.

## Do
Empty hub, when the team has no prototypes at all:
1. Show the page from `05-empty-hub`, with its wording exactly. No search or filters.

No results, when prototypes exist but none match:
1. Keep the search and filters visible, with "0 of 8 prototypes" and "Clear filters".
2. Show one white card with the heading "No prototypes match".
3. Under it, one sentence naming what was filtered, such as: Nothing on Money with status Tested mentions "refund". Try fewer filters or a shorter search.
4. Then "Closest matches": up to three prototypes that match the search or a selected page when the other filters are ignored. Each shows the name as a link and a line such as "On Money, status Ready to test".
5. Then a secondary "Clear filters" button.

## Leave out
Suggestions based on anything other than search and page.

## Checklist
- A team with no card files shows the empty hub page.
- A search with no matches shows "No prototypes match".
- The sentence names the filters that are on.
- Closest matches show at most three, and none when nothing is close.
- "Clear filters" brings the full list back.
