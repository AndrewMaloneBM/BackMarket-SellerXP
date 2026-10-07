# Step 28: Move one prototype

## Goal
One existing prototype, "Home page rethink", runs on the dock. This is the trial before moving the rest.

## Do
1. Fill in its card file's `versions`. These lines are a proposal. Show them to Andrew and get a yes before using them:
   - Version A: "Urgent tasks first"
   - Version B: "Money first"
   - Version C: "Sales numbers first"
   - Version D: "Suggestions first"
   - Version E: "A layout you can adjust"
2. Set `hasBefore` to true. The current layout is "Before".
3. Fill in `screens` from the pages the prototype has.
4. Switch this prototype to the dock layout from step 21.
5. Look for anything in this prototype that depended on the old sidebar and fix it. Check for:
   - layout that leaves 288px of space on the left,
   - drawers or panels positioned from the sidebar's edge,
   - keyboard shortcuts the sidebar used to handle.
6. Leave every other prototype on the old sidebar.

## Leave out
Removing the old sidebar. Changing any other prototype.

## Checklist
- Andrew approved the five lines.
- "Home page rethink" opens with the dock and no sidebar.
- All five versions and "Before" can be reached.
- The page uses the full width, with no empty strip on the left.
- Its drawers open in the right place and cover the dock.
- Every other prototype still works with the old sidebar.
- List anything that was hard or surprising, for the next step.
