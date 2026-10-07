# Step 19: Start questions

## Goal
`/new-prototype` asks a few controlled questions, then creates the prototype with its card file.

## Read
Picture: `screens/18-questions.png`. `DATA.md`.

## Do
Ask these one at a time, in this order:

1. "Got a PRD or research? Paste the link." Two optional links: brief or PRD, research findings. Reject anything that is not a link.
2. "What is it called?" Max 40 characters. Must not match an existing name.
3. "Which pages is it about?" Show every value from the team's list, including the "all" value. They pick one or more. No typing.
4. "Who is working on it with you?" Show the people list. They pick any number. Offer "Add someone", which asks for a name and a role and adds that person to `people.ts`.
5. "What is the problem for sellers?" Optional. Max 140 characters.
6. "What is the goal?" Optional. Max 100 characters.
7. "What do you want to try?" Free text. Use it as the brief for building. Do not put it in the card file.

Then:
- Create the prototype's folder under the team's `prototypes`, starting from the team's shell in `team.ts`.
- Write the card file. Add the person running the command as the first person. Set status to Exploring.
- Open a preview.

Add these building rules to `AGENTS.md`:
- Start from the real page, never a blank one.
- Use Revolve components.
- Once a first version exists, offer to make a second one to compare.
- Name versions as in `DATA.md`: a letter and one plain line. Add a line to `changes` for each change made.

## Leave out
Reading the PRD to prefill answers. The links are only stored.

## Checklist
- The questions come in the order above.
- Pages and people are picked from lists, never typed.
- A 41-character name is refused with a clear message.
- A duplicate name is refused.
- Skipping problem and goal still creates a valid card file.
- The answer to "What do you want to try?" is not in the card file.
- The new prototype starts from the team's shell.
