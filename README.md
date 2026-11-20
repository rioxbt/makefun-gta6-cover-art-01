# makefun-gta6-cover-art-01

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/rioxbt/makefun-gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/rioxbt/makefun-gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Vice Cover Studio: an offline browser app that turns any photos and a caption into cover art in the make.fun GTA 6 cover-art bounty's poster style — a drawn Vice-City sunset backdrop, multi-panel photo layouts with crop, position and zoom per panel, six colour grades, poster lettering with a script subtitle, and one-click PNG export at 1080 × 1080, 1080 × 1350 and 1920 × 1080.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts   # hands the entry in, prints the totals
node serve.ts                                         # then open http://localhost:8080
```

Everything the app loads is a file under `app/`, and the photos are read on your own machine: no build step, no library and no network request.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
