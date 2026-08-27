# Logo asset attribution

The SVG icons in this directory are sourced from the
[Simple Icons](https://simpleicons.org) project
(https://github.com/simple-icons/simple-icons), fetched from the project's
`develop` branch on GitHub
(`https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/<slug>.svg`).

Simple Icons distributes its SVG markup under the
[CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/) license — the
icon *files* are effectively public domain. The brand names, logos, and
marks they depict remain the trademarks of their respective owners; use of
a mark here does not imply endorsement by, or affiliation with, that owner.

These files are shipped as monochrome source shapes and are recolored at
render time by the plugin's QML `MultiEffect` colorization, so the fill
color baked into each file is not meaningful.

## Slug mapping

| File                  | Simple Icons slug |
|------------------------|--------------------|
| youtube.svg             | youtube            |
| youtubemusic.svg        | youtubemusic       |
| vimeo.svg                | vimeo              |
| twitch.svg               | twitch             |
| tiktok.svg               | tiktok             |
| spotify.svg              | spotify            |
| soundcloud.svg           | soundcloud         |
| bandcamp.svg             | bandcamp           |
| applepodcasts.svg        | applepodcasts      |
| medium.svg               | medium             |
| substack.svg             | substack           |
| arxiv.svg                | arxiv              |
| wikipedia.svg            | wikipedia          |
| hackernews.svg           | ycombinator *(see note)* |
| reddit.svg               | reddit             |
| netflix.svg               | netflix            |
| hbomax.svg                | hbomax             |
| appletv.svg               | appletv            |
| paramountplus.svg         | paramountplus      |
| crunchyroll.svg           | crunchyroll        |
| tubi.svg                  | tubi               |
| dailymotion.svg           | dailymotion        |
| applemusic.svg            | applemusic         |
| pandora.svg               | pandora            |
| iheartradio.svg           | iheartradio        |
| audible.svg               | audible            |
| deezer.svg                | deezer             |
| tidal.svg                 | tidal              |
| pocketcasts.svg           | pocketcasts        |
| x.svg                     | x                  |
| theguardian.svg           | theguardian        |
| goodreads.svg             | goodreads          |
| webtoon.svg               | webtoon            |
| wattpad.svg                | wattpad            |
| archiveofourown.svg       | archiveofourown    |
| nytimes.svg               | newyorktimes *(see note)* |

**Note on `hackernews.svg`:** Simple Icons does not currently publish a
standalone "Hacker News" icon slug (a `hackernews` slug returned HTTP 404
at fetch time). Hacker News is a Y Combinator property, so
`hackernews.svg` uses the `ycombinator` slug's artwork instead.

**Note on `nytimes.svg`:** Simple Icons publishes The New York Times' icon
under the `newyorktimes` slug rather than `nytimes`, so `nytimes.svg` uses
that slug's artwork.

## Original generic glyphs

Some brand owners have asked Simple Icons to remove their marks from the
project, so no CC0 source artwork exists for them there. Rather than draw
lookalikes of those brand marks ourselves, the following six files are
original, generic category glyphs created for this project: a
play-triangle-in-circle for the watch-kind providers without a distinct
mark available (`primevideo.svg`, `disneyplus.svg`, `hulu.svg`,
`peacock.svg`), a simple headphones glyph for `amazonmusic.svg`, and an
open-book glyph for `kindle.svg`. These six files are original work, not
derived from any brand's logo or trademarked artwork, and are released
under CC0-1.0 the same as the rest of this directory.
