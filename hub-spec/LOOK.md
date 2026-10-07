# Look and feel

## Fonts

- IvarSoft, weight 600: page titles.
- BMDupletDSP, weight 600: section and card headings.
- BMDupletTXT, weights 400 and 600: everything else.

Body text is 16px with 24px line height. Small text is 14px with 20px. Tiny text is 12px with 16px.

## Colours

| Use | Value |
| --- | --- |
| Page background | `hsl(228,24%,96%)` |
| Strong text | `hsl(225,21%,7%)` |
| Normal text | `hsl(223,7%,20%)` |
| Quiet text | `hsl(223,4%,37%)` |
| Quiet border | `hsl(225,15%,89%)` |
| Control border | `hsl(223,3%,52%)` |
| Neutral fill | `hsl(220,19%,94%)` |
| White | `hsl(0,0%,100%)` |
| Lime tag | `hsl(70,88%,73%)` with strong text |

## Status tags

| Status | Background | Text |
| --- | --- | --- |
| Exploring | `hsl(220,19%,94%)` | `hsl(225,21%,7%)` |
| Ready to test | `hsl(221,86%,92%)` | `hsl(219,27%,40%)` |
| In testing | `hsl(38,90%,84%)` | `hsl(42,75%,27%)` |
| Tested | `hsl(145,83%,77%)` | `hsl(156,100%,21%)` |
| Shipped | `hsl(70,88%,73%)` | `hsl(225,21%,7%)` |
| Archived | transparent, 1px border `hsl(223,4%,68%)` | `hsl(225,21%,7%)` |

A tag has radius 2, padding 0 4, text 14px with 20px line height, weight 600.

## Shapes

| Thing | Values |
| --- | --- |
| Card | white, 1px quiet border, radius 12, padding 16, shadow `0 2px 4px rgba(0,0,0,.05)`, hover shadow `0 8px 16px rgba(0,0,0,.12)` |
| Primary button | black, white text, radius 6, padding 12, weight 600 |
| Secondary button | transparent, 1px border `hsl(223,7%,20%)`, radius 6, padding 11 by 15; small size padding 5 by 11 |
| Chip | height 40, padding 0 16, fully rounded, 1px control border, white. Selected: black with white text |
| Text input | 1px control border, radius 6, padding 12 16, white |
| Menu | white, radius 8, 1px quiet border, shadow `0 8px 16px rgba(0,0,0,.12)`, items padding 12 16 |

On phones, every control you tap is at least 48px high.

## Revolve components

RevButton, RevButtonIcon, RevCard, RevChip, RevTag, RevInputText, RevContextualMenu, RevCheckbox, RevAvatar (small, 20px), RevInfoBlock, RevBanner, RevToast.

Picture: `screens/16-components.png`. Each one is shown with its states.

## Shared header

Sits on the page background, not on white. Max width 1240, centred, padding 16 24.

- Left: the horizontal Back Market wordmark, 28px high, linking to the hub home. Then a 1px by 24px divider `hsl(223,4%,68%)`. Then the team name in weight 600.
- Right, in this order with 24px between them: a "What's new" link, a "How to set up" link, a black "Add a prototype" button with a plus icon.
- Both links are underlined, weight 600, at least 44px high.
- On the Add a prototype page itself, leave the black button out.

## Shared footer

Max width 1240, centred, padding 24, 14px quiet text. "Internal only" on the left. The team's footer label on the right.
