# idristhomasjones.com

Recruiting site for Idris Thomas-Jones, built with [Eleventy](https://www.11ty.dev/) and hosted on GitHub Pages.

All content lives in YAML files in `src/_data/`. To change the site, edit one of those files and push to `main`. GitHub Actions runs the tests, then builds and publishes the site.

```bash
npm install     # once
npm start       # local preview at http://localhost:8080, reloads as you edit
npm test        # builds the site and runs every check, including the privacy checks
```

## Editing content

| File | What it controls |
|---|---|
| `profile.yml` | Profile card: name, class, positions, club, headshot (and its zoom), highlight link, optional attributes (height, foot…) |
| `testimonials.yml` | Coach quotes (homepage and Football page) |
| `football.yml` | Football page: positions, achievements, optional season stats |
| `academics.yml` | Academics page: GPA equivalent, A-levels, GCSEs, honours, optional test scores |
| `videos.yml` | Highlight reel and full-match videos |
| `photos.yml` | Photo gallery |

Every file also has a `summary:` line where it applies. That text appears on the homepage tile.

Anything optional that's left empty (`""` or `[]`) is simply hidden. You never need placeholder text.

Some examples:

```yaml
# academics.yml – add a predicted grade
- {subject: Maths, predicted: "A*"}

# academics.yml – add a test score
tests:
  - {name: SAT, score: "1450"}

# profile.yml – add attributes to the card
attributes:
  - {label: Height, value: "5'10\" / 178 cm"}
  - {label: Preferred foot, value: Right}

# football.yml – add season stats (the table appears automatically)
stats:
  - {season: "2025/26", team: "Chippenham Town Academy", apps: 20, goals: 8, assists: 10}
```

YAML tip: wrap any value containing `:` or `#` in quotes.

## Adding photos

1. Put the original photos in `originals/` at the top of the repo. This folder is gitignored and never uploaded.
2. Run `npm run photos`. Each photo is rotated correctly and its metadata, including GPS location, is removed. It's saved in two sizes to `src/assets/img/`, named by a short code such as `3f9a1c22be`.
3. Paste the lines it prints into `src/_data/photos.yml` and fill in `alt` (a short description for screen readers) and `caption`.
4. For the headshot, put its code in `profile.yml → headshot`.

iPhone HEIC photos may not convert. If the script reports an error, export them as JPEG first.

## Adding videos

Paste a YouTube link (unlisted videos are fine) or a Hudl link into `videos.yml`, either under `highlight.url` or as a new entry under `matches`. Once `highlight.url` is set, the homepage's ▶ Highlights button appears automatically.

Any YouTube link format works (`youtu.be/…`, `watch?v=…`, Shorts). YouTube videos play on the page itself. Hudl videos open on Hudl.

## Replacing the sample quotes

The quotes come word for word from written coach performance evaluations. They're shown anonymously, with a description of the coach and where the words came from. The three in `testimonials.yml` are **samples**, shown with a "Sample quote" badge. To add a real one:

```yaml
- quote: "The exact words from the evaluation."
  coach: "Swindon Town FITC coach"     # describe the coach – never their name
  source: "End-of-season performance evaluation, 2023/24"
  homepage: true        # include in the homepage strip
  placeholder: false    # removes the Sample badge
```

Keep quotes exactly as written – a coach may ask to see the evaluation. Delete any sample you don't replace before you start emailing coaches.

## Deploying

1. Create a **public** repository on GitHub (free Pages needs a public repo) and push this branch as `main`.
2. In the repo, go to **Settings → Pages → Build and deployment** and set **Source** to **GitHub Actions**.
3. In **Settings → Secrets and variables → Actions**, add a repository secret named `PRIVATE_TERMS` with the same lines as your `private-terms.txt`. **Deploys fail until this is set.** That's deliberate, so the school-name check can never be silently skipped.
4. Every push to `main` now runs `.github/workflows/deploy.yml`. If any test fails, nothing is published. Check the **Actions** tab.

## Custom domain

At your domain registrar, add these DNS records for `idristhomasjones.com`:

| Type | Name | Value |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| AAAA | @ | 2606:50c0:8000::153 |
| AAAA | @ | 2606:50c0:8001::153 |
| AAAA | @ | 2606:50c0:8002::153 |
| AAAA | @ | 2606:50c0:8003::153 |
| CNAME | www | `<your-github-username>.github.io` |

Then:

1. In **Settings → Pages**, set **Custom domain** to `idristhomasjones.com` and save.
2. Recommended: verify the domain under your GitHub account's **Settings → Pages → Verified domains**, so nobody else can claim it.
3. Once the DNS check passes, which can take up to a day, tick **Enforce HTTPS**.

## Privacy checklist

Idris is under 18, and this repository is public, including its full history.

- Never write his school's name, his date of birth or his birth month anywhere: content, captions, commit messages or filenames. Use seasons (`2025/26`), not dates.
- Create a file called `private-terms.txt` in the repo root with one term per line: the school's name, real prize names, your street or town, and so on. It's gitignored, and `npm test` fails if any of those terms appear on the site. Put the same lines in the `PRIVATE_TERMS` secret (see Deploying) so GitHub runs the same check. Locally the check shows as *skipped* until the file exists.
- Only add photos through `npm run photos`. Never commit anything in `originals/`.
- Anything ever committed stays in git history, even after you delete it. If something slips in, ask for help rewriting history rather than just deleting the file.
- Set your git author email to your GitHub no-reply address (**GitHub → Settings → Emails**), then run `git config user.email "<id>+<username>@users.noreply.github.com"` in this repo.
- The only contact shown is `idris.2009.soccer@gmail.com`. Don't add phone numbers.
