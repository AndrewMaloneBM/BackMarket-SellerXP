# Step 07: Card files and people list

## Goal
Every prototype has a card file. The hub can load them all as one list.

## Read
`DATA.md`.

## Do
1. Define the card file format from `DATA.md`.
2. Create `/teams/sellerxp/people.ts` with Andrew Malone, role Design.
3. Create a card file for each existing SellerXP prototype. Take name, pages, status, problem and goal from what the current hub shows. Leave `versions` empty for now.
4. Write one function in `/hub` that loads every card file for the current team.
5. Check each card file when building. If one breaks a rule in `DATA.md`, stop the build with a message that names the file and the rule.

## Leave out
Version names (step 28 and 29). Anything visual.

## Checklist
- Every existing prototype has a card file.
- A name longer than 40 characters stops the build with a clear message.
- Two prototypes with the same name stop the build.
- A page that is not in the team's list stops the build.
- A status that is not in the fixed list stops the build.
- A person who is not in the people list stops the build.
- No value was invented. Anything unknown is left empty.
