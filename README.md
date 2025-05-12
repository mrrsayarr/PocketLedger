
# PocketLedger Pro - Smart Finance Tracker

PocketLedger Pro is a modern, client-side personal finance management application designed to help you track your income and expenses effortlessly. Gain clear insights into your financial health, visualize spending patterns, and manage your finances effectively, all while keeping your data securely stored locally on your device.

## ✨ Features

*   **Transaction Tracking:** Easily add, categorize, and manage income and expenses.
*   **Dashboard Overview:** Get a quick summary of your current balance, total income, and total expenses.
*   **Spending Analysis:** Visualize your spending habits with an interactive pie chart categorized by expenses.
*   **Financial Notes:** Keep detailed notes about your investments, assets, or other financial activities, including asset type, quantity, and purchase price.
*   **Currency Selection:** Choose your preferred display currency (TRY, USD, EUR, GBP, JPY) from the Application Settings. Your preference is saved locally.
*   **Local Data Storage:** All your financial data is stored securely in your browser's IndexedDB (for transactions) and localStorage (for notes, theme, and currency preference), ensuring privacy and offline access. No data is sent to any external server.
*   **Dark/Light Mode:** Choose your preferred theme for comfortable viewing from the Application Settings. Your preference is saved locally.
*   **Responsive Design:** Access and manage your finances on any device.
*   **Data Reset & Backup/Restore:** Option to securely reset all application data from the Application Settings page using a slide-to-confirm button or a keyboard shortcut. Backups are automatically created, and you can restore or delete them.
*   **Multi-language About Page:** Information about the project available in English, Turkish, and Spanish, accessible from Application Settings.
*   **Debt Management:** Track various types of debts, log payments, and view debt reduction strategies.
*   **Modern Tech Stack:** Built with Next.js (App Router), React, TypeScript, Tailwind CSS, and ShadCN UI components.

## 🛠️ Tech Stack

*   **Framework:** Next.js 15 (App Router)
*   **Language:** TypeScript
*   **UI Components:** ShadCN UI
*   **Styling:** Tailwind CSS
*   **Client-side Database:** IndexedDB (for transactions), localStorage (for notes, theme, currency, debts)
*   **Charting:** Recharts
*   **Form Management:** React Hook Form
*   **Toasting/Notifications:** Custom toast implementation
*   **Icons:** Lucide React

## 🚀 Getting Started

Follow these instructions to get a local copy of PocketLedger Pro up and running on your machine.

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm or yarn

### Installation

1.  **Clone the repository (or download the source code):**


    ```bash
    git clone https://mrrsayarr/pocketledger.git
    cd pocketledger
    ```

2.  **Install dependencies:**

    Using npm:
    ```bash
    npm install
    ```
    
    Or using yarn:

    ```bash
    yarn install
    ```

### Running the Development Server

1.  **Start the development server:**
    
    Using npm:
    ```bash
    npm run dev
    ```

    Or using yarn:
    ```bash
    yarn dev
    ```
    
    This will typically start the application on `http://localhost:9002`.

2.  **Open your browser:**

    Navigate to `http://localhost:9002` to view the application.

### Building for Production

1.  **Build the application:**

    Using npm:
    ```bash
    npm run build
    ```

## 📖 How to Use PocketLedger Pro

### Main Dashboard (Home Page)

*   **Overview Cards:** At the top, you'll find cards displaying your **Current Balance**, **Total Income**, and **Total Expenses** in your selected currency.
*   **Add New Transaction:**
    *   **Date:** Select the transaction date using the calendar.
    *   **Category:** Choose an appropriate category from the dropdown list.
    *   **Amount:** Enter the transaction amount (only positive numbers are accepted).
    *   **Type:** Select "Income" or "Expense".
    *   **Notes (Optional):** Add any relevant details about the transaction.
    *   Click "Add Transaction" to save.

*   **Transaction History:** A table displaying all your recorded transactions.
    *   Each row shows the date, category, amount (in selected currency), type, and notes.
    *   You can delete a transaction by clicking the trash icon in the "Actions" column. A confirmation dialog will appear.

*   **Spending by Category:** A pie chart visualizing your expenses by category, with amounts shown in your selected currency.
    *   Hover over a slice to see the category name, amount, and percentage of total spending.
    *   The legend below the chart lists the categories.

*   **Header Controls (Desktop):**
    *   **My Notes Button:** Navigate to the Financial Notes page.
    *   **Debt Plans Button:** Navigate to the Debt Management page.
*   **Header Controls (Mobile):**
    *   **Menu Icon:** Opens a dropdown with links to My Notes, Debt Plans, and Settings.
*   **Footer Controls:**
    *   **Application Settings Button:** Navigate to the Application Settings page.

### Financial Notes Page (`/notes`)

*   **Add New Financial Note:**
    *   **Note Title:** Enter a title for your note (e.g., "Bitcoin Purchase", "Gold Investment").
    *   **Asset Type (Optional):** Select an asset category (e.g., Cryptocurrency, Stocks) or enter a custom one.
    *   **Quantity (Optional):** Enter the quantity of the asset.
    *   **Purchase Price (Optional):** Enter the purchase price of the asset. The currency symbol displayed next to the input field will match your globally selected currency.
    *   **Note Content:** Provide details about the asset, purchase date, strategy, etc.
    *   Click "Add Note" to save.

*   **Saved Notes:** Your notes are displayed in a list format, showing title, creation date, asset details (if provided), and content. Purchase prices are displayed with the currently selected currency symbol.
    *   You can delete a note using the trash icon next to each note, with a confirmation step.

*   **Back to Dashboard Button:** Return to the main dashboard.

### Debt Management Page (`/debt-reduction`)

*   **Add New Debt:** Input details like debt name, lender, amount, interest rate, payment frequency, and due date.
*   **Debt Overview:** View a summary of all active debts, total remaining debt, and minimum payments.
*   **Make/View Payments:** Log payments for specific debts and see payment history.
*   **Debt Reduction Strategies:** Information about common strategies like Debt Snowball and Debt Avalanche.
*   **Language Toggle:** Switch between English and Turkish for this page.

### Application Settings Page (`/settings`)

*   **Appearance:**
    *   **Dark/Light Mode Toggle:** Switch between dark and light themes. Your preference is saved locally.
    *   **Display Currency Selector:** Choose your preferred display currency from a list of popular options (TRY, USD, EUR, GBP, JPY). Your choice is saved locally.
*   **Data Management:**
    *   **Erase All Application Data:** Securely reset all application data (transactions, notes, debts) using a slide-to-confirm button. A backup is automatically created before deletion.
        *   A keyboard shortcut `Shift + S + D` can also be used to reset data without the slider confirmation (use with caution!). A small tip about this shortcut is displayed near the reset button.
    *   **Data Backups & Restoration:** View a list of created backups. You can restore data from a specific backup or delete unwanted backups.
*   **About PocketLedger Pro:**
    *   Links to "About" pages (in English, Turkish, and Spanish) providing information about the project's purpose, data storage, and how it works.

### Data Storage and Privacy

*   **Data Storage:** All data is stored locally in your browser. Transactions are in IndexedDB, while notes, debts, theme preferences, and currency preferences are in localStorage.
*   **Data Privacy:** Your data does not leave your device and is not accessible by any external servers or other websites.
*   **Offline Access:** Since data is local, you can access and manage your finances even without an internet connection (after the initial load).

## 🔒 Data Privacy & Security

PocketLedger Pro prioritizes your privacy. All financial data you enter is stored exclusively on your local device using your web browser's storage capabilities (IndexedDB and localStorage).

*   **No Cloud Sync:** Your data is not uploaded to any server.
*   **Full Control:** You have complete control over your data. It remains on your computer/device unless you explicitly clear your browser's site data or use the "Erase All Application Data" feature.
*   **Offline Access:** Since data is local, you can access and manage your finances even without an internet connection (after the initial load).

## 🤝 Contributing

Contributions are welcome! If you have suggestions for improvements or find any bugs, please feel free to open an issue or submit a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request



## 📜 License

This project is licensed under the MIT License - see the `LICENSE` file for details (if one exists).

---

Thank you for using PocketLedger Pro! We hope it helps you manage your finances more effectively.

