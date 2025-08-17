# 🎬 Vidzap CLI

The ultimate **YouTube video downloader** for developers and content lovers.

---

## Features

* Download YouTube videos or audio (mp4 / mp3)
* Choose video quality dynamically
* Optionally download subtitles
* Specify save location
* Colorful CLI with gradient banners and progress bars
* Interactive prompts for smooth experience

---

## Installation

```bash
# Using npm
npm install -g vidzap-cli

# Or clone and link locally
git clone https://github.com/vorlaxen/vidzap-cli.git
cd vidzap-cli
npm install
npm link
```

---

## Usage

```bash
vidzap download -n "https://www.youtube.com/watch?v=xxxxxxxx"
```

**Interactive Flow:**

1. Choose container: mp4 / mp3
2. Select video quality (if mp4)
3. Optionally download subtitles
4. Enter save path

---

## Scripts

```bash
npm run dev      # Start development with live reload
npm run build    # Compile TypeScript
npm run test     # Run tests
npm run lint     # Check code style
```

---

## Dependencies

* `commander`      : CLI framework for parsing commands
* `chalk`          : Colored text output
* `figlet`         : ASCII banners
* `gradient-string`: Gradient text for colorful CLI
* `inquirer`       : Interactive prompts
* `fluent-ffmpeg`  : Video/audio rendering
* `cli-progress`   : Progress bars for downloads
* `@distube/ytdl-core`  : YouTube video extraction library

---

## License

MIT © Hakan Kaygusuz
