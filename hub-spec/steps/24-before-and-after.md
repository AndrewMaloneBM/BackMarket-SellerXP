# Step 24: Before and After

## Goal
One switch flips the same screen between the current design and the version you are on.

## Read
Picture: `screens/13-dock-before-after.png`. Source: `source/13-dock-before-after.html`, `source/dock-component.html`.

## Do
1. Right after the next arrow, add a two-part switch: "Before" and "After". It is a rounded outline 32px high holding two 28px segments. The selected segment is white with black text in weight 600. The other is white text on black.
2. "After" is selected by default and shows the current version.
3. Choosing "Before" shows the current live design, on the same screen you were on.
4. While "Before" is showing, add a black "Before" tag at the top right of the page, to the left of the "Prototype" tag.
5. Choosing the "Before" card in the version picker flips this same switch. It does not change which version you are on.
6. Changing version always goes back to "After".
7. Keep it in the address, such as `?version=a&view=before`.
8. If the card file says the prototype has no "before", do not show the switch or the "Before" card.

## Leave out
Side-by-side compare.

## Checklist
- Flipping the switch does not change the screen you are on.
- The version label still says the version while "Before" is showing.
- The "Before" tag appears only while "Before" is showing.
- Picking "Before" in the picker and flipping the switch do the same thing.
- Switching version returns to "After".
- A link with `view=before` opens on "Before".
- A prototype with no "before" shows no switch.
