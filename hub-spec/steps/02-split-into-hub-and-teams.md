# Step 02: Split into hub and teams

## Goal
Shared code in `/hub`. SellerXP's content in `/teams/sellerxp`. The site looks and works exactly as before.

## Read
`screens/19-one-hub-every-team.png`, `DATA.md` (team settings only).

## Do
1. Move the shared code (hub pages, shared components, styles, layouts) into `/hub`.
2. Create `/teams/sellerxp/team.ts` with the SellerXP column from `DATA.md`.
3. Move SellerXP's prototypes into `/teams/sellerxp/prototypes`.
4. Make the build take a team name and produce only that team's site.
5. Build SellerXP and compare the output with the build from before this step.

## Leave out
Any visual change. Any new feature. Do not touch how prototypes look.

## Checklist
- `/hub` holds no SellerXP-only content.
- `/teams/sellerxp` holds no shared hub code.
- Building SellerXP works with one command that names the team.
- The built site is the same as before. List every difference, or say there are none.
- Every existing prototype still opens.
