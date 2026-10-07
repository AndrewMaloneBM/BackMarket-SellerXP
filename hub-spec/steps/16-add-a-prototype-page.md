# Step 16: Add a prototype page

## Goal
One page tells anyone how to set up, build and publish.

## Read
Picture: `screens/08-add-a-prototype.png`. Source: `source/08-add-a-prototype.html`. Copy the wording from the source exactly.

## Do
1. Shared header without the black "Add a prototype" button.
2. An "All prototypes" link with a back arrow, above the title.
3. Title "Add a prototype" (IvarSoft, 28px) and the intro line.
4. Two cards side by side, wrapping on narrow screens:
   - "Every time": three numbered steps, Start, Build, Publish. Start shows the command `/new-prototype`. Publish shows `/publish`.
   - "First time? Set up once": three numbered steps, Get access, Install OpenCode, Run setup. Run setup shows `npm run setup`.
5. Each command sits in a neutral box with a small "Copy" button that copies it and shows a "Copied" toast.
6. A third card, "What you're asked at the start", with six items: Name, Pages, People, Problem, Goal, Links.
7. A last line with the help channel from `team.ts` and a link to the hub template guide.
8. "How to set up" in the header jumps to the "First time?" card.

## Leave out
A "Connect Dust" step. Any form on this page. People do not enter answers here.

## Checklist
- The wording matches the source file.
- The three commands are exactly `/new-prototype`, `/publish` and `npm run setup`.
- Each "Copy" button copies its command.
- [#channel] and the guide links are still placeholders.
- The two cards stack on a narrow screen.
- "How to set up" from any page lands on the set-up card.
