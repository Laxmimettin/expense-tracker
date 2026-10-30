# SpendWise – Interactive Expense Tracker

SpendWise is a responsive, browser-based expense tracker built with HTML, CSS and vanilla JavaScript. It lets users record daily expenses, edit or delete entries, filter transactions and view spending summaries.

## Features

- Add expenses with name, amount, category, date and optional notes
- Edit and delete existing expenses
- Filter by category and date
- Search by expense name or notes
- Sort by newest, oldest, highest amount or lowest amount
- Calculate total expenses, transaction count and average expense
- Save records in browser LocalStorage
- Responsive layout for desktop, tablet and mobile
- Input validation and confirmation before deleting records

## Technologies

- HTML5
- CSS3
- JavaScript (ES6+)
- Browser LocalStorage
- Git and GitHub

## Project structure

```text
interactive-expense-tracker/
├── index.html
├── style.css
├── script.js
└── README.md
```

## How to run

1. Download or clone this repository.
2. Open the project folder in Visual Studio Code.
3. Open `index.html` in your browser, or use the VS Code Live Server extension.
4. Add an expense using the form. Your records are saved automatically in the browser.

## Data storage

Expenses are stored as an array of JavaScript objects in LocalStorage under the key `spendwise_expenses_v1`. Data remains in the same browser on the same device until browser storage is cleared.

## GitHub

```bash
git init
git add .
git commit -m "Build interactive expense tracker"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

## Note

This is a front-end learning project. LocalStorage is not cloud storage and does not synchronize data between devices or browsers.
