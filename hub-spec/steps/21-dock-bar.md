# Step 21: Dock bar

## Goal
A floating bar sits at the bottom of a prototype page. In this step it only goes back to the hub and hides.

## Read
Pictures: `screens/10-dock-in-a-prototype.png`, `screens/12-dock-states.png`. Source: `source/dock-component.html`.

## Do
1. Build the dock in `/hub` as a new layout for prototype pages. Keep the old sidebar layout working for now. Do not switch any existing prototype yet.
2. The dock is a black pill, 48px high, fully rounded, padding 0 8, fixed at the bottom centre, 24px from the bottom. White 14px text. Shadow `0 8px 16px rgba(0,0,0,.12)` plus a thin light ring.
3. First item: a back arrow and "All prototypes" in weight 600. It links to the hub home.
4. Last item: a hide button showing a short horizontal line. Before it, a 1px by 20px divider `hsl(223,5%,28%)`.
5. Hiding collapses the dock to one 40px round black button at the bottom centre with an up arrow. Clicking it brings the dock back.
6. Add a small "Prototype" tag at the top right of the page: background `hsl(38,90%,84%)`, text `hsl(42,75%,27%)`. It stays even when the dock is hidden.
7. The dock sits beneath the prototype's own drawers, dialogs and overlays.

## Leave out
Versions, Before and After, Screens, Notes and More. They are the next steps.

## Checklist
- The dock is centred at the bottom and stays there when the page scrolls.
- "All prototypes" goes to the hub home.
- Hide and show both work by mouse and keyboard.
- The "Prototype" tag is visible with the dock shown and hidden.
- A drawer opened by a prototype covers the dock.
- No existing prototype changed.
