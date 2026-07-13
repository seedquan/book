# AI Book Factory

This repository publishes original AI-assisted books to `book.seedquan.com`.

## Content source

- Put each book in `books/<slug>/`.
- Keep its public metadata in `book.json`.
- Put chapters in `chapters/` and use zero-padded filenames, for example `01-a-new-friend.md`.
- Keep the published copy original. Never add personal information, credentials, internal material, or unlicensed images/fonts.

## Writing rules

- Read the existing `book.json` and previous chapter before continuing a serial.
- Preserve the book's stated audience, tone, characters, and continuity.
- Do not call an outline a completed chapter.
- When a chapter is accepted, add it to `chapters/`, update `book.json`, and run `npm run build:catalog`.

## Publishing rules

1. Run `npm run build:catalog` and `npm run check`.
2. Inspect the intended diff; do not publish unrelated changes.
3. Commit and push `main`, then run `npm run deploy` for production.
4. Confirm the deployed URL before reporting success.

## New books

Run `npm run new-book -- --slug <slug> --title <title> --audience <audience>` to create a clean book source folder. Fill in the generated metadata and first chapter before adding it to the public catalogue.
