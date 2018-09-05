# PIXI Playground

The playground application is a server and client that allow you to create, view, save,
and share small Pixi demos.

- Client code is in the [client folder][cf].
- Server code is in the [server folder][sf].

## Usage:

To run the application locally open two terminals, one to the [client folder][cf] and one to the [server folder][sf].

In each of them run `npm install` to install their individual dependencies. Then run `npm run dev` for each to start
locally. Finally, visit http://localhost:8080. Details can be found in the respective READMEs.

[cf]: client/
[sf]: server/

## To Do:

### Must have (v1)

- Polish UI to edit playground info
- Dirty/unsaved tracking
 * There should be an indicator if the playground is changed and unsaved
 * User should be notified when navigated away if the playground is unsaved

### Should Have (v1 or v2)

- Add external js resources in settings dialog
- UI to star a playground
- Add homepage and search results
 * Show highly starred/trending playgrounds on homepage
 * Also use official/features flags for homepage
- Embed view that embeds just the preview with a link back
 * Useful for blog/forums posts and such.

### Nice to Have (v2+)

- Add github auth integration for login
 * List your own playgrounds
 * Consistent author field
 * Import from gist functionality
- Multi-file support, as well as custom html/css
- Move logic/state out of views and use a pattern (reflux/redux, or something)
- Infinite loop detection (https://github.com/CodePen/InfiniteLoopBuster)
- Add some snippets for monaco, and enable command palette
- More editor settings (tabs, theme, etc)
