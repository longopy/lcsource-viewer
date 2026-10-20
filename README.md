# LCSource Viewer

<p align="center">
  <img src="assets/logo.webp" alt="LCSource Viewer logo" width="120">
</p>

<p align="center">
  <a href="https://longopy.github.io/lcsource-viewer/?source=https://raw.githubusercontent.com/longopy/peoples-repository/main/repo.json">
    <img alt="View the sample repository" src="https://img.shields.io/badge/View%20sample%20repository-Open%20demo-10ADEB?style=for-the-badge">
  </a>
</p>

<p align="center">
  <a href="https://github.com/longopy/lcsource-viewer/actions/workflows/deploy-pages.yml">
    <img alt="GitHub Pages deployment status" src="https://github.com/longopy/lcsource-viewer/actions/workflows/deploy-pages.yml/badge.svg?branch=main">
  </a>
  <img alt="Static site" src="https://img.shields.io/badge/site-static-222?logo=html5">
  <a href="https://pages.github.com/">
    <img alt="Hosted on GitHub Pages" src="https://img.shields.io/badge/hosted%20on-GitHub%20Pages-222?logo=github">
  </a>
</p>

LCSource Viewer is a lightweight, static web app for browsing AltStore-compatible repositories. Enter a repository URL to view its apps, search the list, and download app packages directly from their repository links.

## Features

- Browse repositories in the AltStore source format.
- Search apps by name, developer, bundle identifier, or version.
- Show app icons, repository and app tint colors, minimum iOS version, and package size.
- Download apps directly through each app’s `downloadURL`.
- Open a repository directly with a `source` query parameter.
- Run as a static GitHub Pages site with no build step or server-side code.

## Try the demo

<p>
  <a href="https://longopy.github.io/lcsource-viewer/?source=https://raw.githubusercontent.com/longopy/peoples-repository/main/repo.json">
    <img alt="Open the People's Repository demo" src="https://img.shields.io/badge/Open%20People's%20Repository-View%20apps-10ADEB?style=for-the-badge">
  </a>
</p>

Or open the URL directly:

```text
https://longopy.github.io/lcsource-viewer/?source=https://raw.githubusercontent.com/longopy/peoples-repository/main/repo.json
```

## Use another repository

Open the site and paste a repository JSON URL, or pass it directly using `source`:

```text
https://longopy.github.io/lcsource-viewer/?source=https://example.com/repo.json
```

The source URL can be provided as plain text without URL encoding. The page also accepts `repo` with an encoded URL and `repo64` with a Base64 URL for compatibility.

The repository host must allow browser requests from other websites through CORS, for example by returning `Access-Control-Allow-Origin: https://longopy.github.io` (or `*` for a public JSON file). The viewer reads repository JSON in the browser and does not upload or store it. Repositories without CORS support need to be served through a CORS-enabled proxy.

## Add a badge to your website

Add a **View in LCSource Viewer** badge to your website so visitors can open your repository directly in the viewer. Replace the example repository URL with your own URL:

```html
<a href="https://longopy.github.io/lcsource-viewer/?source=<source_url>">
  <img
    alt="View in LCSource Viewer"
    src="https://raw.githubusercontent.com/longopy/lcsource-viewer/main/assets/view_in_badge.webp" width="180">
</a>
```

For example:
<p align="center">
  <a href="https://longopy.github.io/lcsource-viewer/?source=https://raw.githubusercontent.com/longopy/peoples-repository/main/repo.json">
    <img
      alt="View in LCSource Viewer"
      src="https://raw.githubusercontent.com/longopy/lcsource-viewer/main/assets/view_in_badge.webp", width="180">
  </a>
</p>

The repository must be accessible from browsers and allow cross-origin requests through CORS.

## Run locally

Serve the project directory with any static web server, then open its local URL. For example:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000/` and enter a repository URL. A local HTTP server is recommended because browser security rules may restrict requests from pages opened with the `file:` protocol.

## GitHub Pages deployment

The workflow in `.github/workflows/deploy-pages.yml` publishes the site when `index.html`, `style.css`, `app.js`, files in `assets/`, or the workflow changes on `main`. It can also be started manually from the **Actions** tab. The sample `repo.json` is not included in the published site.

In the repository settings, choose **Settings → Pages → Build and deployment → Source → GitHub Actions**. The workflow publishes the static site to:

```text
https://longopy.github.io/lcsource-viewer/
```

## Repository format

The viewer expects a JSON document with an `apps` array. It reads common AltStore source fields such as:

- Repository: `name`, `subtitle`, `description`, `author`, `website`, `iconURL`, `tintColor`
- App: `name`, `developerName`, `version`, `minOSVersion`, `size`, `iconURL`, `tintColor`, `downloadURL`

App cards use `downloadURL` for the **Download** action. When an app icon cannot load, the viewer displays a color-matched fallback.
