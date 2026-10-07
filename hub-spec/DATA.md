# Data

## Team settings: `/teams/<team>/team.ts`

Picture: `screens/17-team-settings.png`.

| Field | SellerXP | Catalog |
| --- | --- | --- |
| Team name, beside the logo | SellerXP | Catalog |
| Hub address | sellerxp-prototypes.backmarket.io | catalog-prototypes.backmarket.io |
| Name of the main filter | Pages | [Catalog's word] |
| Filter values, in order | Home, Insights, Customer Care, Listings, Orders, Opportunities, Money, Options, Seller Support, Onboarding, Seller Guide | [Catalog's list] |
| Value meaning "all of them" | Cross-page | [Catalog's word] |
| Footer label | Seller Experience | [Catalog's label] |
| Shell that prototypes start from | The Seller Back Office shell | [Catalog's shell, or none] |
| Help channel shown on the Add page | [#channel] | [#channel] |

Statuses and roles are the same for every team. They are not team settings.

## People: `/teams/<team>/people.ts`

One entry per person: `name`, `role`.

Roles, fixed list: Design, PM, Research, Engineering, Marketing.

## Card file: one per prototype

Lives in the prototype's own folder. It is the only source for the hub card, the filters and the dock.

| Field | Rule |
| --- | --- |
| `name` | Required. Max 40 characters. Unique within the team. |
| `pages` | Required. One or more values from the team's filter list, or the "all" value. |
| `status` | Required. One of: Exploring, Ready to test, In testing, Tested, Shipped, Archived. Starts at Exploring. |
| `people` | Required. One or more names from the people list. The first one is the creator. |
| `problem` | Optional. One sentence, max 140 characters. |
| `goal` | Optional. One line, max 100 characters. |
| `links.brief` | Optional. A valid link to the brief or PRD. |
| `links.research` | Optional. A valid link to research findings. |
| `added` | Set automatically when created. |
| `updated` | Set automatically on every publish. |
| `hasBefore` | True when the prototype includes the current live design. |
| `versions` | List. See below. |
| `screens` | List of the prototype's screens: `name` and where it is. |

No free-text tags. Only a hub owner can add a new page value or role.

## Versions

Each version has:

- `letter`: A, B, C and so on.
- `line`: one plain line saying what is different, such as "Urgent tasks first". Max 40 characters.
- `changes`: a short list of plain sentences saying what changed in this version.

Shown to users as "Version A" with the line beside it. Never show a code name.

The current live design is not a version. It is called "Before", with the line "What sellers see today".

A prototype can have just one version.

## Status order

When sorting by status: Exploring, Ready to test, In testing, Tested, Shipped, Archived.
