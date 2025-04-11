# **App Name**: PocketLedger

## Core Features:

- Dashboard Overview: Home screen to display current balance, total income, and total expenses with a toggle for daily/monthly view.
- Transaction Input: Form to add new income or expense entries, including amount, category (predefined list), date, and notes.
- Transaction History: List of all transactions, filterable by date, with options to edit or delete entries.
- Spending Chart: Basic chart (pie or bar) to visualize spending breakdown by category.
- Theme Toggle: Toggle to switch between light and dark mode for user preference.

## Style Guidelines:

- Use green for income and red for expense to provide clear visual cues.
- Clean, neutral background colors to maintain focus on the data.
- Accent color: Teal (#008080) to highlight key interactive elements.
- Use intuitive icons from Tabler Icons or Heroicons for categories and actions.
- Employ a clean and minimal layout, leveraging Material Design or basic iOS components.
- Subtle animations on data updates or transaction additions.

## Original User Request:
✅ Prompt: Build a Simple Income & Expense Tracking Mobile App

You are a mobile app developer. Create a clean and minimal income and expense tracker mobile app that works on both Android and iOS. Prioritize simplicity, clarity, and offline usability. The app does not need AI or advanced analytics — only the core features for personal budgeting.
📱 Core Features:

    User Authentication (Optional)

        Simple sign-in with email (optional, can be skipped for local use)

    Home Screen

        Show current balance (income - expense)

        Show total income and total expense

        Daily/Monthly view toggle

    Add Income / Expense

        Add amount, category, date, and note

        Toggle switch: is this income or expense?

        Predefined categories (Salary, Food, Transport, etc.)

    Transaction History

        List all past entries with filtering by date

        Tap to edit or delete a transaction

    Basic Chart View

        Simple pie chart or bar chart showing spending breakdown

    Dark Mode Support

        Optional light/dark mode toggle

    Local Data Storage

        Store all data locally on the device (SQLite or local storage)

        No cloud or backup required

🎨 Design Recommendations

    Clean UI using Material Design or basic iOS components

    Use clear colors: green for income, red for expense

    Minimal fonts and intuitive icons (use Tabler Icons or Heroicons)

🛠️ Technology Suggestions

    Use Flutter or React Native

    For charts: fl_chart (Flutter) or react-native-chart-kit

    For local storage: Hive / SQLite / AsyncStorage

🎯 Goal:
A lightweight, user-friendly mobile app to manually track income and expenses. No signup or internet required. Works offline and shows a clear financial summary.
  