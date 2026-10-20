const homeScreen = document.querySelector("#home-screen");
const repoScreen = document.querySelector("#repo-screen");
const repoForm = document.querySelector("#repo-form");
const repoInput = document.querySelector("#repo-url");
const homeError = document.querySelector("#home-error");
const repoError = document.querySelector("#repo-error");
const appsElement = document.querySelector("#apps");
const searchInput = document.querySelector("#app-search");
let allApps = [];
let repoBaseUrl = location.href;

const params = new URLSearchParams(location.search);
const rawSource = getRawQueryValue("source");
const sourceUrl = /^https?%3a%2f%2f/i.test(rawSource) ? decodeURIComponent(rawSource) : rawSource;
const initialRepo = sourceUrl || params.get("repo") || decodeBase64Repo(params.get("repo64"));

function getRawQueryValue(name) {
  const query = location.search.slice(1);
  const match = new RegExp(`(?:^|&)${name}=`).exec(query);
  return match ? query.slice(match.index + match[0].length).split("#", 1)[0] : "";
}

function decodeBase64Repo(value) {
  if (!value) return "";
  try { return decodeURIComponent(escape(atob(value.replaceAll("-", "+").replaceAll("_", "/")))); }
  catch { return ""; }
}

function showError(element, message) {
  element.textContent = message;
  element.hidden = false;
}

function repoUrl(value) {
  const url = new URL(value);
  if (!/^https?:$/.test(url.protocol)) throw new Error("Use an HTTP or HTTPS link.");
  return url.href;
}

repoForm.addEventListener("submit", event => {
  event.preventDefault();
  homeError.hidden = true;
  try { location.href = `?source=${repoUrl(repoInput.value.trim())}`; }
  catch (error) { showError(homeError, error.message || "Enter a valid URL."); }
});

searchInput.addEventListener("input", renderApps);

if (initialRepo) loadRepo(initialRepo);

async function loadRepo(value) {
  homeScreen.hidden = true;
  repoScreen.hidden = false;
  try {
    const url = repoUrl(value);
    repoBaseUrl = url;
    const livecontainerUrl = new URL("https://altdirect.app/");
    livecontainerUrl.searchParams.set("url", url);
    livecontainerUrl.searchParams.set("r", "livecontainer");
    document.querySelector("#livecontainer-link").href = livecontainerUrl.href;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`The server responded with ${response.status}.`);
    const repo = await response.json();
    if (!repo || !Array.isArray(repo.apps)) throw new Error("The JSON does not contain a valid apps list.");

    document.querySelector("#livecontainer-link").hidden = false;
    document.querySelector("#repo-toolbar").hidden = false;
    document.title = `${repo.name || "Repository"} · LiveContainer Source Viewer`;
    document.querySelector("#repo-name").textContent = repo.name || "Repository";
    const tint = safeColor(repo.tintColor);
    document.documentElement.style.setProperty("--tint", tint);
    if (repo.iconURL) {
      const icon = document.querySelector("#repo-icon");
      icon.src = repo.iconURL;
      icon.hidden = false;
    }
    renderAbout(repo);
    allApps = repo.apps;
    renderApps();
  } catch (error) {
    document.querySelector("#repo-heading").hidden = true;
    document.querySelector("#livecontainer-link").hidden = true;
    document.querySelector("#repo-toolbar").hidden = true;
    document.querySelector("#repo-error-state").hidden = false;
    const detail = error instanceof TypeError
      ? "The server may be blocking browser access with CORS. It must allow https://longopy.github.io in its Access-Control-Allow-Origin response header."
      : error.message || "Check the URL and make sure the server allows CORS requests.";
    showError(repoError, detail);
  }
}

function renderAbout(repo) {
  const section = document.querySelector("#about-section");
  const subtitle = String(repo.subtitle || "").trim();
  const description = String(repo.description || "").trim();
  const author = String(repo.author || "").trim();
  const website = safeLink(repo.website);

  if (subtitle) {
    document.querySelector("#about-subtitle").textContent = subtitle;
    document.querySelector("#about-subtitle-row").hidden = false;
  }
  if (description) {
    document.querySelector("#about-description").textContent = description;
    document.querySelector("#about-description-row").hidden = false;
  }
  if (author) {
    const authorLink = document.querySelector("#about-author");
    authorLink.textContent = author;
    if (website) {
      authorLink.href = website;
      authorLink.target = "_blank";
      authorLink.rel = "noopener noreferrer";
    } else {
      authorLink.removeAttribute("href");
    }
    document.querySelector("#about-author-row").hidden = false;
  }
  section.hidden = !(subtitle || description || author);
}

function renderApps() {
  const query = searchInput.value.trim().toLocaleLowerCase();
  const filtered = allApps.filter(app => [app.name, app.developerName, app.bundleIdentifier, app.bundleID, app.version]
    .some(value => String(value || "").toLocaleLowerCase().includes(query)));
  appsElement.replaceChildren();
  document.querySelector("#app-count").textContent = `${filtered.length} ${filtered.length === 1 ? "app" : "apps"}`;
  document.querySelector("#empty-state").hidden = filtered.length > 0;

  for (const app of filtered) {
    const tint = safeColor(app.tintColor || getComputedStyle(document.documentElement).getPropertyValue("--tint").trim());
    const card = document.createElement("article");
    card.className = "app-card";
    card.style.setProperty("--app-tint", tint);

    const image = document.createElement("img");
    image.className = "app-icon";
    image.alt = "";
    image.loading = "eager";
    image.referrerPolicy = "no-referrer";
    const iconUrl = app.iconURL || app.icon || app.versions?.[0]?.iconURL || app.versions?.[0]?.icon;
    image.src = safeLink(iconUrl, repoBaseUrl) || fallbackIcon(app.name, tint);
    image.onerror = () => { image.onerror = null; image.src = fallbackIcon(app.name, tint); };

    const info = document.createElement("div");
    info.className = "app-info";
    const name = document.createElement("h2");
    name.className = "app-name";
    name.textContent = app.name || "App";
    name.title = name.textContent;
    const meta = document.createElement("p");
    meta.className = "app-meta";
    meta.textContent = [app.developerName, app.version ? `v${app.version}` : ""].filter(Boolean).join(" · ") || app.bundleIdentifier || app.bundleID || "";
    const details = document.createElement("p");
    details.className = "app-details";
    const minimumOS = app.minOSVersion ? `iOS ${app.minOSVersion}+` : "";
    const size = formatSize(app.size);
    details.textContent = [minimumOS, size].filter(Boolean).join(" · ");
    info.append(name, meta, details);
    card.append(image, info);

    const download = safeLink(app.downloadURL || app.versions?.[0]?.downloadURL, repoBaseUrl);
    if (download) {
      const install = document.createElement("a");
      install.className = "install-button";
      install.href = download;
      install.textContent = "Download";
      install.setAttribute("aria-label", `Download ${app.name || "app"}`);
      card.append(install);
    }
    appsElement.append(card);
  }
}

function safeColor(value) {
  return /^#[\da-f]{3}(?:[\da-f]{3})?$/i.test(value || "") ? value : "#087df1";
}

function safeLink(value, base = location.href) {
  if (typeof value !== "string" || !value.trim()) return "";
  try {
    const url = new URL(value, base);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
  } catch { return ""; }
}

function formatSize(bytes) {
  const value = Number(bytes);
  if (!Number.isFinite(value) || value <= 0) return "";
  return `${(value / 1_000_000).toFixed(1)} MB`;
}

function fallbackIcon(name, tint) {
  const initial = String(name || "A").trim().charAt(0).toUpperCase().replace(/[^A-Z0-9]/, "A") || "A";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="${tint}"/><text x="50" y="62" text-anchor="middle" font-family="Arial,sans-serif" font-size="52" font-weight="700" fill="white">${initial}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
