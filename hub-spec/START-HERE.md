# Prototype Hub: how to hand this to OpenCode

This folder is the build plan for the first version, cut into 29 small steps.

## How to use it

1. Put this `hub-spec` folder in the root of the repo.
2. For each step, paste this into OpenCode, changing only the step file name:

```
Read hub-spec/RULES.md, then read hub-spec/steps/01-save-what-is-live.md.
Do only that step. Do not start the next one.
When you finish, go through the step's checklist and tell me pass or fail for each line.
```

3. Check the result. If every line passes, commit and move to the next step. If a line fails, tell OpenCode which line and ask it to fix only that.

Start a fresh OpenCode session for each step. Small steps and a clean session are what keep a lighter model accurate.

## The steps

Foundations
- 01 Save what is live
- 02 Split into hub and teams
- 03 Publish command
- 04 Catalog team folder
- 05 Owners and the AI rule

The hub
- 06 Look, header and footer
- 07 Card files and people list
- 08 The card
- 09 Home page grid
- 10 Search
- 11 Page filter
- 12 Status and Built by filters
- 13 Sort and list view
- 14 Empty hub and no results
- 15 Phone layout
- 16 Add a prototype page
- 17 What's new

Adding a prototype
- 18 Set-up command
- 19 Start questions
- 20 Publish checks

The dock
- 21 Dock bar
- 22 Versions
- 23 Version picker
- 24 Before and After
- 25 Screens, Notes and More
- 26 First visit and phone sheet
- 27 Pictures in the picker

Moving over
- 28 Move one prototype
- 29 Move the rest

## What else is in here

- `RULES.md` — read before every step.
- `LOOK.md` — colours, sizes, fonts, components, and the shared header and footer.
- `DATA.md` — the team settings, people list and card file.
- `screens/` — a picture of every screen.
- `source/` — the mock-up each picture came from, with exact values.
- `LATER.md` — what is deliberately not in this version.
- `OPEN.md` — what nobody has decided yet.
