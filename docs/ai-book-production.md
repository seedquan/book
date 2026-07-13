# AI Generated Books production flow

## Start a book

1. Decide the audience, premise, format, and author name.
2. Create the source folder:

   ```bash
   npm run new-book -- --slug moon-garden --title 《月亮花园》 --audience 小学中年级
   ```

3. Replace the placeholder metadata and write the first chapter.

## Continue a serial

1. Read `book.json` and the previous chapter.
2. Write the next chapter as original text; preserve the established characters and unresolved event.
3. Add the chapter in `chapters/` with the next zero-padded number.
4. Update `chapter_count`, `status`, and public `reading_url` in `book.json` once a public page exists.

## Publish

1. Run `npm run build:catalog`.
2. Run `npm run check`.
3. Review the generated `public/catalog.json` and the intended publication page.
4. Commit, push, and run `npm run deploy`.

The catalogue is source-controlled. It contains only public book metadata; never place prompts containing private information, API keys, or unpublished personal notes in it.
