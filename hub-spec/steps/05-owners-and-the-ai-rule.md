# Step 05: Owners and the AI rule

## Goal
Only hub owners can change the hub. The AI is told to leave it alone.

## Do
1. Add a `CODEOWNERS` file so that changes under `/hub` and to any `/teams/*/team.ts` need approval from Andrew's GitHub username and [backup owner's GitHub username].
2. Prototypes under `/teams/*/prototypes` need no owner approval.
3. Turn on branch protection for `main`: owner approval required, no direct pushes.
4. Add this rule to `AGENTS.md`, word for word:

> When building or editing a prototype, only change files inside that team's prototypes folder. Never edit anything under /hub or any team.ts. If a task seems to need a hub change, stop and tell the user to ask a hub owner.

## Leave out
Do not add other reviewers or rules.

## Checklist
- `CODEOWNERS` covers `/hub` and every `team.ts`.
- `CODEOWNERS` does not cover prototypes.
- `main` is protected, or you have told Andrew exactly what blocks it.
- The `AGENTS.md` rule is present, word for word.
