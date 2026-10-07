# Step 08: The card

## Goal
One card component that shows a prototype.

## Read
Picture: `screens/02-card-states.png`. Source: `source/02-card-states.html`. `LOOK.md` for the card shape and status tags.

## Do
Build the card, top to bottom:

1. A row with the status tag on the left and "Updated Sep 2026" on the right (month and year, 12px quiet text).
2. The name: BMDupletDSP, 20px with 28px line height, weight 600. At most 2 lines, then cut off.
3. The problem: 14px normal text. At most 3 lines.
4. A "Goal" row: quiet label 48px wide, then the goal. At most 2 lines.
5. A "Pages" row: the same label width, then the pages joined by commas. Show the first three, then "+N" for the rest. The label word comes from `team.ts`.
6. A footer line above a 1px quiet border: a 20px round avatar with the first person's initial, then the byline.

Rules:
- The byline is the first person's name, then "+N" if there are more people, then a comma and the first person's role. Example: "Andrew Malone +2, Design".
- The name is the link. The whole card is clickable and opens the prototype.
- Hide the problem when it is empty. Hide the Goal row when it is empty.
- An Archived card shows its name in quiet text.
- Gap between blocks is 12px. Padding is 16px.

## Leave out
The "Details" link, the round label beside the status, the blue "New" tag, and dates such as "3 days ago".

## Checklist
- All six statuses show the right tag colours.
- A card with only a name, pages and status looks tidy, with no empty rows.
- A very long name stops at 2 lines.
- Five pages show as three names and "+2".
- Three people show as "Name +2, Role".
- Clicking anywhere on the card opens the prototype.
- The card shows the hover shadow and the keyboard focus ring.
