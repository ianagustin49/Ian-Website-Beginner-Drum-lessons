# 🥁 Ian's Beginner Drum Lessons

A fun, colorful, all-ages website that helps complete beginners fall in love with
playing the drums. Built with plain HTML, CSS, and JavaScript — no build step,
no frameworks, works offline.

> Long-term vision: grow this into a hub for learning drums online and eventually
> offer face-to-face drum lessons too.

## ✨ Features

- **Playable drum kit** — click, tap, or use your keyboard. Animated sticks fly to
  whichever drum you hit. All sounds are **synthesized in the browser** with the
  Web Audio API, so there are no audio files to download.
- **Built-in metronome** — adjustable tempo with visual beat lights.
- **Play-along beats** — loop a rock, pop, or dance groove and drum along.
- **Full learning journey** — 8 lessons across 4 levels (Starter → Beat Builder →
  Technique → Play Songs).
- **Progress checklist** — check off lessons; your progress is saved in the browser
  (`localStorage`) and a rainbow progress bar fills up.
- **Embedded video slots** — placeholders ready for Ian to drop in YouTube videos.
- **Fully responsive** — works great on phones, tablets, and desktops.

## 📁 Project structure

```
index.html      Home — hero with a mini playable kit + learning roadmap
play.html       The "Play Room" — full drum kit, metronome, play-along beats
lessons.html    The 4-level course with progress tracking and video slots
about.html      About Ian
css/style.css   All styling (rainbow, all-ages theme)
js/audio.js     Web Audio drum/metronome sound synthesis
js/drumkit.js   Builds the interactive playable kit (click/tap/keyboard + sticks)
js/metronome.js The metronome widget
js/beats.js     Looping play-along beats
js/progress.js  Lesson progress checklist (localStorage)
js/main.js      Navigation menu, collapsible lessons, hero confetti
```

## 🚀 Running it

It's a static site — just open `index.html` in a browser. Or run a tiny local
server so everything (and audio) behaves exactly like production:

```bash
# Python 3
python3 -m http.server 8000
# then visit http://localhost:8000
```

## 🌐 Putting it online (free)

Use **GitHub Pages**:

1. Push this repo to GitHub.
2. Repo **Settings → Pages**.
3. Set the source branch (e.g. `main`) and `/ (root)` folder.
4. Your site goes live at `https://<your-username>.github.io/<repo-name>/`.

## 🎬 Adding your own videos

In `lessons.html`, find a `.video-frame` block and replace the
`.video-placeholder` with a YouTube embed:

```html
<div class="video-frame">
  <iframe src="https://www.youtube.com/embed/VIDEO_ID"
          title="Lesson video" allowfullscreen></iframe>
</div>
```

## 🥁 Drum kit keyboard controls

| Key   | Drum        |
|-------|-------------|
| Q     | Crash       |
| W     | Tom 1       |
| E     | Tom 2       |
| A     | Hi-Hat      |
| S     | Snare       |
| D     | Floor Tom   |
| SPACE | Kick (Bass) |

---

Made with ❤️ by Ian — free beginner drum lessons for everyone.
