# Tsundoku

積ん読 — the pile of books you bought and haven't read yet. Tsundoku is that
pile as an Omarchy shell plugin: one list for everything you want to read,
listen to, or watch later. Save a link from wherever you found it, see it
again with a real title and thumbnail instead of a bare URL, and open it in
the right native app with one click.

## Install

```bash
omarchy plugin add https://github.com/wryanp/tsundoku.git
omarchy plugin enable wryanp.tsundoku
```

The bar widget shows an unread count. Click it to open the popup: a list of
everything you've saved, filterable by All, Watch, Listen, Read, and Done.

To remove it again:

```bash
omarchy plugin remove wryanp.tsundoku
```

Your saved library under `~/.local/share/tsundoku/` is left in place (see
Storage below); delete that directory too if you want nothing left behind.

Everything Tsundoku needs at runtime ships with a stock Omarchy install:
`curl`, `jq`, and `sha256sum` for link resolution, `wl-paste` and
`notify-send` for the capture hotkey. `mpv` (plus `yt-dlp`) is optional —
when present, watch links open in it instead of the browser.

## Capture

Two ways in:

- **Hotkey.** Copy a URL anywhere and press `SUPER+SHIFT+U`.
  `scripts/tsundoku-add` reads the clipboard with `wl-paste`, saves it over
  IPC, and confirms with a "Saved to Tsundoku" notification. A non-URL
  clipboard, a duplicate, or an unreachable shell each produce a clear error
  toast instead — a keypress never fails silently.
- **Popup.** Click the bar icon and paste into the add field. Enter or the
  add button submits, the field clears on success, and an invalid or
  duplicate URL shows inline feedback under the field.

Bind the hotkey in `~/.config/hypr/bindings.lua`:

```lua
o.bind("SUPER + SHIFT + U", "Tsundoku capture",
  os.getenv("HOME") .. "/.config/omarchy/plugins/wryanp.tsundoku/scripts/tsundoku-add")
```

Pick any free chord — on a stock Omarchy install `SUPER+SHIFT+U` is
unclaimed. Run `omarchy menu keybindings --print` to check yours.

## The panel

The popup is built to live in without a mouse:

- **Tabs.** All / Watch / Listen / Read / Done, each with a live count.
  All is everything unread; Done is everything you've finished.
- **Keyboard.** The add field has focus the moment the popup opens. `Down`
  moves onto the list and `Up`/`Down` walk it; `Enter` opens the selected
  row (the same mpv/browser routing as a click), `Del` deletes it,
  and `Up` from the top row returns to the add field. `Esc` closes the
  popup. Typing anything drops you back into the add field.
- **Notes.** The 󰎞 button on a row opens an inline note field — a line
  about why you saved the thing. Notes persist in the library, and a row
  with a note shows a small 󰎞 next to its caption. `Esc` in the note field
  collapses it without closing the popup.

## Previews

A saved link resolves into a real title, author, and thumbnail in the
background — the item appears instantly and upgrades in place. Resolution
tries three tiers in order: the platform's official oEmbed endpoint
(YouTube, Vimeo, Spotify, SoundCloud, TikTok), then OpenGraph tags scraped
from the page, then the bare hostname. Every request runs a 5-second
timeout, a size cap, and an honest User-Agent, and nothing ever fails to
save because resolution failed — a link that can't be resolved keeps its
hostname title and shows a retry button.

Items from recognized platforms show that platform's logo, tinted to your
theme's foreground color. Everything else gets a watch/listen/read glyph.

## Supported providers

Tsundoku recognizes links from these platforms and shows their logo, real
title, and thumbnail. Anything else still saves fine — it just falls back to
a bare hostname and a watch/listen/read glyph.

**Watch**

- [Netflix](https://www.netflix.com)
- [Prime Video](https://www.primevideo.com)
- [Disney+](https://www.disneyplus.com)
- [HBO Max](https://www.hbomax.com)
- [Hulu](https://www.hulu.com)
- [Apple TV](https://tv.apple.com)
- [Paramount+](https://www.paramountplus.com)
- [Peacock](https://www.peacocktv.com)
- [Crunchyroll](https://www.crunchyroll.com)
- [Tubi](https://tubitv.com)
- [Dailymotion](https://www.dailymotion.com)
- [YouTube](https://www.youtube.com)
- [Vimeo](https://vimeo.com)
- [Twitch](https://www.twitch.tv)
- [TikTok](https://www.tiktok.com)
- [Pluto TV](https://pluto.tv)
- [The Roku Channel](https://therokuchannel.roku.com)
- [Plex](https://plex.tv)
- [Sling TV](https://sling.com)
- [Fubo](https://fubo.tv)
- [ESPN](https://espn.com)
- [DAZN](https://dazn.com)
- [NBA](https://nba.com)
- [NFL](https://nfl.com)
- [MLB](https://mlb.com)
- [NHL](https://nhl.com)
- [Formula 1](https://formula1.com)
- [Nebula](https://nebula.tv)
- [CuriosityStream](https://curiositystream.com)
- [MUBI](https://mubi.com)
- [Criterion Channel](https://criterionchannel.com)
- [Shudder](https://shudder.com)
- [AMC+](https://amcplus.com)
- [Starz](https://starz.com)
- [BritBox](https://britbox.com)
- [Discovery+](https://discoveryplus.com)
- [Rakuten Viki](https://viki.com)
- [iQIYI](https://iqiyi.com)
- [Bilibili](https://bilibili.com)
- [Niconico](https://nicovideo.jp)
- [JioHotstar](https://hotstar.com)
- [ZEE5](https://zee5.com)
- [PBS](https://pbs.org)
- [ITVX](https://itv.com)
- [TED](https://ted.com)
- [Vevo](https://vevo.com)
- [Dropout](https://dropout.tv)
- [Instagram](https://instagram.com)

**Listen**

- [Apple Music](https://music.apple.com)
- [Amazon Music](https://music.amazon.com)
- [Pandora](https://www.pandora.com)
- [iHeartRadio](https://www.iheart.com)
- [Audible](https://www.audible.com)
- [Deezer](https://www.deezer.com)
- [Tidal](https://tidal.com)
- [Pocket Casts](https://pocketcasts.com)
- [Spotify](https://www.spotify.com)
- [SoundCloud](https://soundcloud.com)
- [Bandcamp](https://www.bandcamp.com)
- [Apple Podcasts](https://podcasts.apple.com)
- [YouTube Music](https://music.youtube.com)
- [Qobuz](https://qobuz.com)
- [Napster](https://napster.com)
- [Overcast](https://overcast.fm)
- [Castbox](https://castbox.fm)
- [Podbean](https://podbean.com)
- [Acast](https://acast.com)
- [TuneIn](https://tunein.com)
- [Audiomack](https://audiomack.com)
- [Mixcloud](https://mixcloud.com)
- [Last.fm](https://last.fm)
- [JioSaavn](https://jiosaavn.com)
- [Anghami](https://anghami.com)
- [LibriVox](https://librivox.org)
- [Shazam](https://shazam.com)

**Read**

- [X](https://x.com)
- [The New York Times](https://www.nytimes.com)
- [The Guardian](https://www.theguardian.com)
- [Goodreads](https://www.goodreads.com)
- [Webtoon](https://www.webtoons.com)
- [Wattpad](https://www.wattpad.com)
- [Archive of Our Own](https://archiveofourown.org)
- [Kindle](https://read.amazon.com)
- [Medium](https://medium.com)
- [Substack](https://substack.com)
- [arXiv](https://arxiv.org)
- [Wikipedia](https://www.wikipedia.org)
- [Hacker News](https://news.ycombinator.com)
- [Reddit](https://www.reddit.com)
- [GitHub](https://github.com)
- [The Washington Post](https://washingtonpost.com)
- [The Wall Street Journal](https://wsj.com)
- [Bloomberg](https://bloomberg.com)
- [Reuters](https://reuters.com)
- [AP News](https://apnews.com)
- [CNN](https://cnn.com)
- [Fox News](https://foxnews.com)
- [NBC News](https://nbcnews.com)
- [ABC News](https://abcnews.go.com)
- [CBS News](https://cbsnews.com)
- [USA Today](https://usatoday.com)
- [Los Angeles Times](https://latimes.com)
- [The Atlantic](https://theatlantic.com)
- [The New Yorker](https://newyorker.com)
- [The Economist](https://economist.com)
- [Financial Times](https://ft.com)
- [Time](https://time.com)
- [Newsweek](https://newsweek.com)
- [Politico](https://politico.com)
- [Axios](https://axios.com)
- [Vox](https://vox.com)
- [HuffPost](https://huffpost.com)
- [Business Insider](https://businessinsider.com)
- [Forbes](https://forbes.com)
- [Fortune](https://fortune.com)
- [CNBC](https://cnbc.com)
- [ProPublica](https://propublica.org)
- [NPR](https://npr.org)
- [Al Jazeera](https://aljazeera.com)
- [DW](https://dw.com)
- [Yahoo News](https://news.yahoo.com)
- [Globo](https://globo.com)
- [The Independent](https://independent.co.uk)
- [The Telegraph](https://telegraph.co.uk)
- [Daily Mail](https://dailymail.co.uk)
- [Sky News](https://news.sky.com)
- [BBC](https://bbc.com)
- [CBC](https://cbc.ca)
- [ABC News (Australia)](https://abc.net.au)
- [The Times of India](https://timesofindia.indiatimes.com)
- [NDTV](https://ndtv.com)
- [South China Morning Post](https://scmp.com)
- [Le Monde](https://lemonde.fr)
- [Der Spiegel](https://spiegel.de)
- [El País](https://elpais.com)
- [The Verge](https://theverge.com)
- [TechCrunch](https://techcrunch.com)
- [Ars Technica](https://arstechnica.com)
- [Wired](https://wired.com)
- [Engadget](https://engadget.com)
- [Gizmodo](https://gizmodo.com)
- [CNET](https://cnet.com)
- [404 Media](https://404media.co)
- [MIT Technology Review](https://technologyreview.com)
- [Slashdot](https://slashdot.org)
- [DEV Community](https://dev.to)
- [Stack Overflow](https://stackoverflow.com)
- [Quora](https://quora.com)
- [Nature](https://nature.com)
- [Science](https://science.org)
- [Scientific American](https://scientificamerican.com)
- [New Scientist](https://newscientist.com)
- [Quanta Magazine](https://quantamagazine.org)
- [National Geographic](https://nationalgeographic.com)
- [Smithsonian Magazine](https://smithsonianmag.com)
- [bioRxiv](https://biorxiv.org)
- [Rolling Stone](https://rollingstone.com)
- [Variety](https://variety.com)
- [The Hollywood Reporter](https://hollywoodreporter.com)
- [People](https://people.com)
- [Vanity Fair](https://vanityfair.com)
- [Vogue](https://vogue.com)
- [Vulture](https://vulture.com)
- [The Ringer](https://theringer.com)
- [Pitchfork](https://pitchfork.com)
- [Billboard](https://billboard.com)
- [Rotten Tomatoes](https://rottentomatoes.com)
- [IMDb](https://imdb.com)
- [Letterboxd](https://letterboxd.com)
- [Metacritic](https://metacritic.com)
- [IGN](https://ign.com)
- [Kotaku](https://kotaku.com)
- [Polygon](https://polygon.com)
- [PC Gamer](https://pcgamer.com)
- [The Athletic](https://theathletic.com)
- [Sports Illustrated](https://si.com)
- [Bleacher Report](https://bleacherreport.com)
- [Sky Sports](https://skysports.com)
- [Bon Appétit](https://bonappetit.com)
- [Serious Eats](https://seriouseats.com)
- [Allrecipes](https://allrecipes.com)
- [Eater](https://eater.com)
- [Atlas Obscura](https://atlasobscura.com)
- [wikiHow](https://wikihow.com)
- [Royal Road](https://royalroad.com)
- [FanFiction.Net](https://fanfiction.net)
- [MANGA Plus](https://mangaplus.shueisha.co.jp)
- [Kobo](https://kobo.com)
- [Project Gutenberg](https://gutenberg.org)
- [Internet Archive](https://archive.org)
- [Everand](https://everand.com)
- [The StoryGraph](https://thestorygraph.com)
- [Britannica](https://britannica.com)
- [Bluesky](https://bsky.app)
- [Threads](https://threads.com)
- [Tumblr](https://tumblr.com)
- [Mastodon](https://mastodon.social)
- [Facebook](https://facebook.com)
- [Pinterest](https://pinterest.com)
- [The Onion](https://theonion.com)
- [xkcd](https://xkcd.com)
- [Genius](https://genius.com)

## Contributing

Provider requests and bug reports are welcome as issues. Adding a provider
yourself is a small, well-marked change — see
[CONTRIBUTING.md](CONTRIBUTING.md). Releases are listed in
[CHANGELOG.md](CHANGELOG.md).

## IPC

The service answers on the `tsundoku` IPC target:

```bash
omarchy-shell tsundoku add <url>       # prints "ok", "duplicate", or "invalid"
omarchy-shell tsundoku open <id>       # opens an item, prints the method used
omarchy-shell tsundoku count           # prints the unread count
omarchy-shell tsundoku list            # prints the whole library as JSON
omarchy-shell tsundoku setNote <id> <text>  # sets an item's note ("" clears)
omarchy-shell tsundoku ping            # prints "ok" — is the service alive?
```

`add` always exits 0 when the shell is reachable; what happened is in the
printed result. A non-zero exit means the shell itself wasn't running.

## Storage

Your library lives outside the plugin, in your data directory, not your
config:

- `~/.local/share/tsundoku/library.json` — the list itself
- `~/.local/share/tsundoku/thumbs/` — cached thumbnail images

Nothing runtime is stored in the plugin's own git checkout.

## Theming

Tsundoku has no hardcoded colors. Every surface, fill, and text color comes
from the shell's `Color` and `Style` singletons, so the widget and popup
follow whatever Omarchy theme you're running, including a theme switch while
the popup is open.

## Development

The working tree is `~/.config/omarchy/plugins/wryanp.tsundoku`. Edit it in
place — saving any file under `~/.config/omarchy/plugins/` reloads the plugin,
but run `omarchy-restart-shell` after QML edits: the reload can re-instantiate
widgets from stale compiled components. Validate the manifest before
committing:

```bash
omarchy plugin validate .
```

See [docs/FOUNDATION.md](docs/FOUNDATION.md) for the product vision and
roadmap, and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for how it's built.

## License

MIT. The provider logos under `assets/logos/` come from
[Simple Icons](https://simpleicons.org) (CC0); the brand marks themselves
remain the property of their respective owners — see
`assets/logos/ATTRIBUTION.md`.
