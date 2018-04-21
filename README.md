# Antz

## What is Antz?
Have you ever looked at a web page and wished there were fewer words... and way more ants? Don't worry, you aren't the only one -- and we've got you covered.

Ants is a Chrome Extension that replaces the text of a web page with tiny characters that move erratically across the page. It comes loaded with a default cast (including some adorable pokemon, a creepy ghost, and the eponymous antz), but you can add new icons and customize the way they infect your web page.

## How does it work?
Antz injects two main scripts into the webpage when you activate it from your Chrome Extension toolbar. The first wraps all words on the page (at least the ones with a 'p' or 'h' tag) in spans, and exports an array of these span elements. The second waits for a character to be chosen from the dropdown menu -- once this happens, it begins to spawn characters on each word of the webpage in order (based on the array of spans), possibly changing the text if certain options are enables. You can change characters at any time, but you also set a limit for how many can be on the screen at once. Click on one to squish it and make room for more!

## Can I contribute?
Antz is an open-source project and labor of love. Feel free to fork it and make any changes you want, or to submit pull requests if you have a new feature or improvement you'd like to merge with the master code. Check out the issues for general ideas.

Download from the chrome extension store at https://chrome.google.com/webstore/detail/ants/dkedeomphfmenkbcpcnkhpkkhiillaka
