# Step 03: Publish command

## Goal
One command builds a team's site and uploads it to that team's bucket, safely.

## Do
1. Add `scripts/deploy <team>`.
2. It builds that team, then syncs the output to that team's bucket.
3. Before uploading, it must stop with a clear message if:
   - the working copy has uncommitted changes, or
   - the working copy is behind `main`.
4. It must show what it will upload and ask for a yes before doing it.
5. It must not delete files in the bucket unless the person confirms.
6. When done, it prints the team's hub address.

## Leave out
Do not run a real upload in this step unless Andrew says so. Do not set up automatic publishing.

## Checklist
- Running it with uncommitted changes stops with a clear message.
- Running it while behind `main` stops with a clear message.
- It asks for a yes before uploading.
- It never deletes bucket files without a second yes.
- It works for `sellerxp`.
