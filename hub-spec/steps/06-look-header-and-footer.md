# Step 06: Look, header and footer

## Goal
The shared colours, fonts, header and footer exist in `/hub` and read from the team's settings.

## Read
`LOOK.md`. Picture: the top and bottom of `screens/01-home.png`. Source: `source/01-home.html`.

## Do
1. Add the colours, fonts and shapes from `LOOK.md` as shared values in `/hub`.
2. Build the shared header exactly as `LOOK.md` describes. The team name comes from `team.ts`.
3. Build the shared footer exactly as `LOOK.md` describes. The label comes from `team.ts`.
4. Make "What's new", "How to set up" and "Add a prototype" real links, even though those pages come in later steps.

## Leave out
The "New" tag beside "What's new" (step 17). Any page content.

## Checklist
- The header sits on the page background, not on a white bar.
- The wordmark is the horizontal one, 28px high, and links home.
- The team name shows "SellerXP" for sellerxp and "Catalog" for catalog, with no code change.
- Right side order: What's new, How to set up, Add a prototype.
- The footer shows "Internal only" and "Seller Experience".
- Every link and the button show the focus ring when reached by keyboard.
