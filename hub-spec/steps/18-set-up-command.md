# Step 18: Set-up command

## Goal
`npm run setup` gets a new person ready and proves it works.

## Do
1. Install what the project needs.
2. Ask the person to confirm how their name should appear. Suggest the name from their git settings.
3. Ask them to pick their role from: Design, PM, Research, Engineering, Marketing.
4. Add them to the team's `people.ts` if they are not there yet.
5. Check they can publish: build the site, then upload one small test page that is not linked from anywhere.
6. If the upload fails because they have no access, say so plainly and tell them to ask in the team's help channel from `team.ts`.
7. End by printing the next step: run `/new-prototype`.

## Leave out
Connecting Dust. Anything about writing a prototype.

## Checklist
- Running it twice does not add the person twice.
- A role outside the list cannot be entered.
- The person appears in `people.ts` with the confirmed name.
- A missing-access failure gives a plain message, not a stack trace.
- The test page is not listed on the hub.
