// data/ojt.js — YOUR work immersion (OJT) journal entries live here. ✏️ EDIT ME
//
// This ONE file feeds two places:
//   1. the journal page on the website  →  ojt.html
//   2. the Markdown files in the ojt-journal GitHub repo  →  npm run journal:sync
//
// HOW TO ADD A NEW DAY
//   1. Copy an object at the end of the list.
//   2. Set `day` to the next number and `date` to "YYYY-MM-DD".
//   3. Fill in the tasks / learnings with what actually happened.
//   4. Run `npm run journal:sync` to update the GitHub repo files.
//
// ⚠️ THIS FILE IS PUBLIC (it is inside the website). Never put private company
//    data, client names, credentials, internal URLs, or personal addresses here.

export const ojtMeta = {
title: "OJT Journal",
author: "Silvernel Cardinal",
role: "Developer Intern",
team: "Software & AI Development Team",
period: "October 12 – 30, 2026",
intro: "A daily log of my work immersion. Every entry shows what I did, what I learned, the tools I used, and what I plan to do next. Each entry is also committed to Git and pushed to GitHub — one commit per day.",
repoUrl: "https://github.com/silvernelcardinal-crypto/ojt-journal",
pageUrl: "https://portfolio-iota-plum-71.vercel.app/ojt.html",
// Shown at the bottom of the page until the immersion ends.
note: "Days 9–15 (Oct 22–30) are still ongoing. A new entry is added and pushed to GitHub at the end of each day."
};

// ✏️ TEMPLATE ENTRIES — replace the text with your real notes.
export const ojtEntries = [
{
day: 1,
date: "2026-10-12",
title: "Orientation and Team Setup",
focus: "Getting to know the team, the tools, and the daily workflow.",
tasks: [
"Attended the team orientation and met the software and AI developers.",
"Set up my work laptop: VS Code, Git, and a GitHub account.",
"Learned the team's folder structure and how the daily stand-up works."
],
learnings: [
"Git is a version control system — it records every change made to the code.",
"“Push” and “pull” just move my work between my PC and GitHub.",
"Real teams work on branches so nobody breaks the main code by accident."
],
tools: ["VS Code", "Git", "GitHub", "Slack"],
next: "Practise the basic Git commands in a practice repository."
},
{
day: 2,
date: "2026-10-13",
title: "Git Basics — init, add, commit",
focus: "Learning the daily Git loop: status, add, commit, push.",
tasks: [
"Created my first practice repository with `git init`.",
"Used `git status` and `git add` to stage files before committing.",
"Wrote clear commit messages and pushed my first commit to GitHub."
],
learnings: [
"`git status` shows exactly what Git sees right now — I check it before every commit.",
"A good commit message says what changed and why it changed.",
"Committing often makes it easy to undo mistakes later."
],
tools: ["Git", "GitHub", "Terminal"],
next: "Try branches, merging, and Pull Requests."
},
{
day: 3,
date: "2026-10-14",
title: "Branches, Merge and Pull Requests",
focus: "Working safely on branches and getting my code reviewed.",
tasks: [
"Created a branch using `git branch` and switched to it with `git switch`.",
"Opened a Pull Request and asked a teammate to review my code.",
"Applied the reviewer's requested changes and merged the branch."
],
learnings: [
"A branch is a safe copy of the code where I can experiment freely.",
"A Pull Request is how a team reviews code before it goes live.",
"Reviewer feedback is normal and makes the code better — it is not a criticism."
],
tools: ["Git", "GitHub", "VS Code"],
next: "Start the HTML structure for the team project."
},
{
day: 4,
date: "2026-10-15",
title: "HTML Structure and Semantic Layout",
focus: "Writing clean, semantic HTML instead of a wall of divs.",
tasks: [
"Built a page with header, nav, main, section, and footer elements.",
"Replaced generic divs with the correct semantic tags.",
"Found and fixed broken links and missing images using Chrome DevTools."
],
learnings: [
"Semantic HTML (`<header>`, `<main>`, `<footer>`) makes a page easier to read and to search.",
"The DevTools inspector shows exactly which element I am hovering over.",
"Accessibility starts with correct tags and proper alt text."
],
tools: ["HTML", "VS Code", "Chrome DevTools"],
next: "Style the page with CSS."
},
{
day: 5,
date: "2026-10-16",
title: "CSS Layout — Flexbox, Grid and Responsiveness",
focus: "Styling the page and making it work on a phone.",
tasks: [
"Applied Flexbox to the navigation bar and to the row of cards.",
"Used CSS Grid for the main two-column project layout.",
"Added media queries so the layout adapts to smaller screens."
],
learnings: [
"Flexbox arranges things in one direction; Grid handles rows and columns together.",
"Media queries let one website look right on both desktop and mobile.",
"Consistent spacing is what separates a amateur design from a clean one."
],
tools: ["CSS", "Chrome DevTools"],
next: "Add interactivity with JavaScript."
},
{
day: 6,
date: "2026-10-19",
title: "JavaScript Basics — DOM and Events",
focus: "Making the page respond when the user clicks.",
tasks: [
"Practised variables, functions, arrays, and objects.",
"Selected elements with `document.querySelector` and changed their text.",
"Added a click event that opens and closes the mobile menu."
],
learnings: [
"The DOM is the live version of the HTML that JavaScript is allowed to change.",
"`addEventListener` connects an action, like a click, to a piece of code.",
"Small functions that do one thing each are much easier to debug."
],
tools: ["JavaScript", "Chrome DevTools", "VS Code"],
next: "Build the chatbot widget for the portfolio."
},
{
day: 7,
date: "2026-10-20",
title: "Building the Chatbot Widget",
focus: "Building the rule-based chatbot that lives inside the portfolio.",
tasks: [
"Built the chat launcher, the message list, and the input form.",
"Matched keywords to answers using a simple `qa` object.",
"Added a typing indicator and quick-reply buttons."
],
learnings: [
"A rule-based bot is predictable and always works, even without internet.",
"Scoring how many keywords match is a simple way to pick the best answer.",
"`textContent` is safer than `innerHTML` because it cannot inject HTML."
],
tools: ["JavaScript", "HTML", "CSS"],
next: "Connect the bot to a real AI API through a server function."
},
{
day: 8,
date: "2026-10-21",
title: "AI API and Serverless Function",
focus: "Connecting the chatbot to an AI model without exposing the API key.",
tasks: [
"Set up a Vercel serverless function that calls the OpenRouter API.",
"Moved the API key into environment variables instead of the code.",
"Added a fallback to the rule-based bot whenever the API is unavailable."
],
learnings: [
"An API key must stay on the server — never inside public JavaScript.",
"A fallback rule-based bot means the chatbot never goes fully silent.",
"HTTP status codes explain the problem: 404 = not found, 500 = server error."
],
tools: ["Vercel", "OpenRouter", "JavaScript"],
next: "Deploy the site and start writing the journal entries in Git."
}
];

// The Markdown filename used in the ojt-journal repo.
// Shared by the website (js/ojt.js) and the generator (scripts/build-journal.mjs)
// so the links never drift apart.
export const ojtFileName = (entry) =>
`day-${String(entry.day).padStart(2, "0")}-${entry.date}.md`;

export default ojtEntries;
