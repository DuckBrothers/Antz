# Ants

## For Users

### What is Ants?
Have you ever looked at a web page and wished there were fewer words... and way more ants? Don't worry, you aren't the only one -- and we've got you covered.

Ants is a Chrome Extension that replaces the text of a web page with tiny characters that move erratically across the page. It comes loaded with a default cast (adorable pokemon, a spooooky ghost, and the eponymous ants), but you can add new characters and customize the way they infest your web page.

### How do I use it?
Choosing the extension opens the `infest` tab, from which you can kick off waves of characters that spawn on your screen. Click on a character icon to squish (or catch, or exorcise) it and make room for more! Meanwhile, you can choose more characters to invade, freeze them in their tracks to pick 'em off on-by-one, or clear the whole screen of invaders.

The charmingly minimalist UI facilitates a breadth of character and behavior customization via the `configuration` tab. If you feel stuck, be sure to read the corresponding instructions at the bottom of the popup -- or consider hovering your mouse over an option to see a more in-depth explination.

In general, you can do three things:
1. Add new custom characters! You'll specify various icons to represent them in different states, and configure the way they move around the webpage. Then they'll join the preset options on the `infest` tab! They'll persist as options between sessions, but can be removed permanantly with a right-click.
2. Configure spawn behavior! Characters can show up randomly across the board, or appear from the words in the screen. If the latter, then can replace, detroy, or leave their spawning word as-is. This tends to work pretty well for text-heavy pages (wikipedia, etc), but gets a little clunky for other sites where most of the text might not even be user visible. YMMV.
3. Configure the character size and speed! Do you want them tiny and elusive or big and slow - either way, you can save your preferences.

### Where can I get it?
Download it from the Chrome Extension store at https://chrome.google.com/webstore/detail/ants/dkedeomphfmenkbcpcnkhpkkhiillaka

## For Devs

### How does it work?
The initial extension popup opens a relatively simple (but messy) HTML page that runs the extension background script.

The background script tracks any extension UI interaction and config changes -- but it also injects two main scipts (and a few helpers) into the current webpage. The first wraps all words on the page (at least the ones within a 'p' or 'h' tag) in spans, and exports an array of these span elements. The second waits for a character to be chosen from the dropdown menu and controls character spawning and movement. Helper scripts and methods on both the extension and injection side keep state in sync.

### What libraries does it use
It's all written in Javascript (and HTML). The injected-side (on webpage) code makes heavy use of jquery and the extension-side (pupop UI) uses raw Javascript.

Most important, though, is the [Chrome Extension API](https://developer.chrome.com/docs/extensions/mv3/getstarted/extensions-101/). In particular, this lets us [inject our scripts](https://developer.chrome.com/docs/extensions/reference/scripting/#method-executeScript) and [send messages between them](https://developer.chrome.com/docs/extensions/mv3/messaging/). Persistant storage is handled by local storage rather than the similar [chrome.storage extensions API](https://developer.chrome.com/docs/extensions/reference/storage/)

### Does the codebase spark joy?

No. The UI logic is organized in a (roughly) rational way, but lacks an overall design paradigm and thus is a little too interconnected. Between the various behavior options, the extension-injection interaction, and the fact that spawning icons from words and moving them organically across a screen is a pretty weird goal -- it's complicated overall. Things aren't quite held together with duct tape and chewing gum, but seemlingly safe changes in one area have a non-zero chance of breaking stuff somewhere else. Modify things at your own risk.

### How can I play around with it on my own?
1. Clone it to your computer. There's lots of guides online for "cloning a repo from github".
2. Follow [these instructions](https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacke) to add it to your chrome extension list as a developer extension. The rest of the info on that page is helpful. You'll likely want to pin it for easy access. It'll reload whenever you change the underlying code and refresh.
3. Mess around with the code, break things, and see what went wrong by opening the `Developer tools console` on both the extension popup and current webpage.

### Can I contribute?
Ants is an open-source project -- but more of a work of infrequent infatuation than a labor of love. Feel free to fork it and make any changes you want. You can also submit pull requests if you have a new feature or improvement you'd like to merge into the master branch -- although it's not likely to be looked at any time soon.
