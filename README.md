# Marble Mystic

A browser version of **Peg Solitaire** (known as BrainVita in India): a
single-player logic puzzle. Jump one marble over another into an empty space to
remove the jumped marble, and try to finish with a single marble left on the board.

**Play it:** https://heartfelt-llama-fb86f3.netlify.app/

## How to play

- The board starts full of marbles with one empty space.
- Move a marble by jumping it horizontally or vertically over an adjacent marble
  into an empty hole. The jumped marble is removed.
- You win when only one marble remains.

## Tech

Plain **HTML, CSS, and JavaScript**, with no build step or dependencies.

## Run locally

```bash
# clone, then open the file in a browser
open index.html
```

## Structure

```
index.html      markup and entry point
css/            styles
js/             game logic
images/         assets
```

One of my early JavaScript projects, kept here because it still plays well in any browser.
