# Step 10: Search

## Goal
A search box on the home page narrows the cards as you type.

## Read
Picture: `screens/01-home.png` (top right of the title). Source: `source/01-home.html`.

## Do
1. Put a search input to the right of the title, 320px wide, with a search icon inside on the left and the placeholder "Search prototypes".
2. It has a label for screen readers: "Search prototypes".
3. As you type, show only prototypes where the text appears in the name, problem, goal, people or pages. Ignore capitals.
4. When searching, the count reads "3 of 8 prototypes".
5. Keep the search text in the address as `?q=`, so the view survives a refresh and can be shared.

## Leave out
The other filters. The "no results" message (step 14).

## Checklist
- Typing part of a name narrows the cards.
- Typing a person's name finds their prototypes.
- Capitals do not matter.
- The count updates.
- Refreshing the page keeps the search.
