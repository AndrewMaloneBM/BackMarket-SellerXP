# Step 22: Versions

## Goal
The dock shows which version you are on and steps between versions.

## Read
Picture: `screens/11-dock-versions.png` (first and third sections). Source: `source/dock-component.html`. `DATA.md` (versions).

## Do
1. After "All prototypes", add a divider, a previous arrow, the version label, and a next arrow.
2. The version label shows "Version A" in weight 600, then the plain line in normal weight, then a small up caret.
3. The arrows step through the versions in letter order and wrap around.
4. Keep the current version in the address, such as `?version=a`. Opening that link shows that version.
5. Everything comes from the prototype's card file. The prototype's author writes no dock code.
6. If the prototype has only one version, do not show the divider, arrows or label.

## Leave out
Opening the picker when the label is clicked (step 23).

## Checklist
- The label shows the letter name and the plain line from the card file.
- Next and previous change the version and the address.
- Opening a link with `?version=b` shows Version B.
- A one-version prototype shows a shorter dock with no arrows.
- No code name appears anywhere.
