# Portfolio Starter (HTML · CSS · JavaScript + Chatbot)
A modern, responsive personal portfolio with a floating chatbot.
The sample content is for a fictional student, **Silvernel CArdinal**. Replace it with your own.
**Live site:** https://portfolio-iota-plum-71.vercel.app/ ← ✏️ update after deploying
## Features
- Sticky navbar, mobile hamburger menu, smooth scrolling, active-link highlight
- Hero with gradient accents, About, Skills chips, Education timeline, Project cards, Contact, Footer
- Dark/light mode: follows your system setting, and remembers your choice (localStorage)
- Subtle scroll animations (turned off automatically for "reduce motion" users)
- Floating chatbot with typing dots and quick-reply buttons
- **Basic mode:** a rule-based bot (keywords → answers), always works
- **AI mode (optional):** a free OpenRouter model via a Vercel serverless function (`api/chat.js`)
## Files
| File | What it is | Edit it? |
|---|---|---|
| `index.html` | Page content and structure | ✏️ Yes: your text, projects, links |
| `ojt.html` | Your OJT Journal page (daily entries) | ✏️ Rarely — the content lives in `data/ojt.js` |
| `css/style.css` | All styles. Colors are in `:root` and `[data-theme="dark"]` | ✏️ Colors and fonts |
| `js/main.js` | Theme toggle, menu, animations | Read it; edit only if you want to |
| `js/chatbot.js` | Chat UI, rule-based bot, AI call | ✏️ Keywords in `qa` |
| `js/ojt.js` | Renders the journal page (entries, filters, stats) | No |
| `data/profile.js` | **Your info**. Both bots answer from this | ✏️ Yes, everything |
| `data/ojt.js` | **Your journal entries.** The one file you edit daily | ✏️ Yes, every day |
| `api/chat.js` | Server code that calls OpenRouter (Vercel only) | No |
| `Update-Journal.bat` | Double-click → rebuilds the Markdown files for the GitHub repo | No |
| `scripts/build-journal.ps1` | The script behind `Update-Journal.bat` | No |
| `package.json` | Tells Vercel/Node to use ES modules | No |
| `.gitignore` | Keeps secrets like `.env` out of Git | No |
## 1. Run it on your laptop
1. Open the folder in VS Code.
2. Right-click `index.html` → **Open with Live Server**.
(Double-clicking the file won't work, because the chatbot uses JS modules, which need a server.)
3. The chatbot shows **⚡ Basic mode** locally. That's expected, because `/api/chat` only runs on Vercel.
## 2. Make it yours (checklist)
- [ ] `index.html`: `<title>`, name, tagline, about text, quick facts, skills, timeline, projects, links,
footer
- [ ] `data/profile.js`: every value (name, education, skills, projects, hobbies, goals, contact)
- [ ] `css/style.css`: try new `--accent`, `--accent-2` colors (light **and** dark)
- [ ] `js/chatbot.js`: add more keywords to `qa` (English + Taglish)
- [ ] Logo initials ("JD") and the chat title ("Juan's Assistant")
- [ ] ⚠️ No home address, phone number, birthday, school ID, or private photos. Everything here is public.
## 3. Deploy to Vercel (free Hobby plan)
1. Push this folder to a GitHub repo named `portfolio`.
2. Go to vercel.com → sign up with **Continue with GitHub** → Hobby plan.
3. **Add New… → Project** → Import `portfolio` → Framework Preset: **Other** → **Deploy**.
4. Every `git push` to `main` re-deploys automatically.
## 4. AI mode (the chatbot's brain)

The chatbot always works on its own (**⚡ Basic mode** — keyword matching).
**AI mode** makes it smarter by sending the question to a real AI model.

**Setup (one time):**
1. Go to <https://openrouter.ai/keys> → sign up → **Create key**. (Free models are enough.)
2. In Vercel → your project → **Settings → Environment Variables** → add:
   - Name: `OPENROUTER_API_KEY` · Value: your key (starts with `sk-or-`)
3. Redeploy (Vercel → **Deployments → ⋯ → Redeploy**, or just `git push`).

**Check if it works:** open `https://portfolio-iota-plum-71.vercel.app/api/chat` in the browser.
You should see `{"aiEnabled":true,...}` and, once someone chats, the `workingModel` name.

**If it still says "Basic mode":**
| What you see | Meaning | Fix |
|---|---|---|
| `⏳ AI busy — basic mode` | Every free model is rate-limited right now | Wait a minute and try again — the server tries 8 models in a row |
| `⚠️ AI error — basic mode` | The key was rejected | Check `OPENROUTER_API_KEY` in Vercel, then redeploy |
| `⚡ Basic mode` on your laptop | `/api/chat` only runs on Vercel | Normal — test the live site |

> Free models get busy a lot. That is why `api/chat.js` tries several models and
> remembers the one that answered. `openrouter/free` (OpenRouter's own router) is
> tried first because it automatically picks a free model that is up.

## 5. Your OJT Journal

You have **two** places for the journal, and **one** file to edit:

| Where | What it is | How to update it |
|---|---|---|
| `ojt.html` (on your website) | The pretty journal page with filters and search | Edit `data/ojt.js` → `git push` → Vercel redeploys |
| `../ojt-journal` (GitHub repo) | One Markdown file per day — your Git history | Run `Update-Journal.bat` → `git push` |

**Daily routine (2 minutes):**
1. Open `data/ojt.js`, copy the last entry, and fill in today's tasks + learnings.
2. Double-click **`Update-Journal.bat`** → it writes `days/day-09-2026-10-22.md` etc.
3. `git add . && git commit -m "Day 9: ..." && git push` in the `ojt-journal` folder.
4. `git add . && git commit -m "Add Day 9 journal entry" && git push` in this folder → the site updates.

**First time only:** create the empty repo on GitHub (name: `ojt-journal`, **do not** tick
"Add a README"), then in the `ojt-journal` folder run:
```bash
git push -u origin main
```

> ⚠️ The journal is public. Keep company names, internal URLs, and personal data out of it.
