# Usage

## Running a development server:

To run the dev server you just run:

```
$> npm run dev
```

This will launch the webpack dev server at `http://localhost:8080`.

Make sure to run the server application to if you want to save/load playgrounds.

# To Do:

## Must have (v1)

- Polish UI to edit playground info
 * Obviously styled well
 * Need a good pixi version selector that isn't a text input or combo box with all versions
- Dirty/unsaved tracking
 * There should be an indicator if the playground is changed and unsaved
 * User should be notified when navigated away if the playground is unsaved

## Should Have (v1 or v2)

- Add external js resources in settings dialog
- UI to star a playground
- Add homepage and search results
 * Show highly starred/trending playgrounds on homepage
 * Also use official/features flags for homepage

## Nice to Have (v2+)

- Add github auth integration for login
 * List your own playgrounds
 * Consistent author field
 * Import from gist functionality
- Multi-file support, as well as custom html/css
- Move logic/state out of views and use a pattern (reflux/redux, or something)
- Infinite loop detection (https://github.com/CodePen/InfiniteLoopBuster)
- Add some snippets for monaco, and enable command palette
