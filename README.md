# MHGUTree-Revamped
Now Bigger and Better, a new and updated version of my old MHGUTree.
<br><br>
MHGUTree is an interactive companion for Monster Hunter Generations Ultimate,
featuring complete weapon trees for all 14 weapon types and armor
catalog. Detailed filters and search make it easy to compare equipment and find your next
upgrade.
<br><br>
You can watch the site in action [HERE](https://mhgutree.vercel.app/).
<br><br>
And here's an example image, of how the website looks:
![Great Sword Tree example](https://i.imgur.com/LiidfpV.png)

## Acknowledgements
The data used in this project is from the [MHGenDatabase](https://github.com/gatheringhallstudios/MHGenDatabase) App, [mhapi.info](https://mhapi.info/) and from [mhgu.kiranico](https://mhgu.kiranico.com/)

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Requirements

For the standalone desktop version on Windows:

- Rust with the MSVC toolchain
- Microsoft C++ Build Tools with **Desktop development with C++**

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Build the Standalone Version

Weapon and armor visual assets are excluded from Git because of their size. Download the model archive from the matching GitHub Release and extract its contents into `public/models/` before build.

```sh
npm run portable:build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
