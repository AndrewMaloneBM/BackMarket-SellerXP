# Step 17: What's new

## Goal
A short page lists changes to the hub itself.

## Read
Picture: `screens/09-whats-new.png`. Source: `source/09-whats-new.html`.

## Do
1. Keep the entries in one list in `/hub`, so every team's hub shows the same ones. Each entry has a date, a title and one line.
2. The page: shared header, an "All prototypes" back link, the title "What's new" (IvarSoft, 28px), and the line "Changes to the Prototype Hub itself, newest first."
3. Content max width is 720.
4. One white card holding the entries, newest first. Each row: the date on the left (96px, 14px quiet text), then the title in bold with the line under it in 14px. 1px quiet border between rows.
5. Start the list with one entry: today's date, "The new Prototype Hub", "Search, filters and one card for every prototype."
6. In the header, show a small lime "New" tag beside the "What's new" link when the newest entry is less than 14 days old. Work it out from the date. Do not store anything about the visitor.

## Leave out
Prototype activity. Filters. Author names. Paging.

## Checklist
- Entries come from one list in `/hub`.
- The same entries show on sellerxp and catalog.
- Newest is first.
- The "New" tag shows when the newest entry is under 14 days old and not otherwise.
- The tag is not underlined, and the link text is.
