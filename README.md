# PocketLedger Pro - Smart Finance Tracker

PocketLedger Pro is a modern, client-side personal finance management application designed to help you track your income and expenses effortlessly. Gain clear insights into your financial health, visualize spending patterns, and manage your finances effectively, all while keeping your data securely stored locally on your device.

## ✨ Features

*   **Transaction Tracking:** Easily add, categorize, and manage income and expenses.
*   **Dashboard Overview:** Get a quick summary of your current balance, total income, and total expenses.
*   **Spending Analysis:** Visualize your spending habits with an interactive pie chart categorized by expenses.
*   **Financial Notes:** Keep detailed notes about your investments, assets, or other financial activities, including asset type, quantity, and purchase price.
*   **Local Data Storage:** All your financial data is stored securely in your browser's IndexedDB (for transactions) and localStorage (for notes and preferences), ensuring privacy and offline access. No data is sent to any external server.
*   **Dark/Light Mode:** Choose your preferred theme for comfortable viewing.
*   **Responsive Design:** Access and manage your finances on any device.
*   **Data Reset:** Option to securely reset all application data.
*   **Multi-language About Page:** Information about the project available in English, Turkish, and Spanish.
*   **Modern Tech Stack:** Built with Next.js (App Router), React, TypeScript, Tailwind CSS, and ShadCN UI components.

## 🛠️ Tech Stack

*   **Framework:** Next.js 15 (App Router)
*   **Language:** TypeScript
*   **UI Components:** ShadCN UI
*   **Styling:** Tailwind CSS
*   **Client-side Database:** IndexedDB (for transactions), localStorage (for notes and theme)
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
# PocketLedger Pro - Smart Finance Tracker

PocketLedger Pro is a modern, client-side personal finance management application designed to help you track your income and expenses effortlessly. Gain clear insights into your financial health, visualize spending patterns, and manage your finances effectively, all while keeping your data securely stored locally on your device.

## ✨ Features

*   **Transaction Tracking:** Easily add, categorize, and manage income and expenses.
*   **Dashboard Overview:** Get a quick summary of your current balance, total income, and total expenses.
*   **Spending Analysis:** Visualize your spending habits with an interactive pie chart categorized by expenses.
*   **Financial Notes:** Keep detailed notes about your investments, assets, or other financial activities, including asset type, quantity, and purchase price.
*   **Local Data Storage:** All your financial data is stored securely in your browser's IndexedDB (for transactions) and localStorage (for notes and preferences), ensuring privacy and offline access. No data is sent to any external server.
*   **Dark/Light Mode:** Choose your preferred theme for comfortable viewing.
*   **Responsive Design:** Access and manage your finances on any device.
*   **Data Reset:** Option to securely reset all application data.
*   **Multi-language About Page:** Information about the project available in English, Turkish, and Spanish.
*   **Modern Tech Stack:** Built with Next.js (App Router), React, TypeScript, Tailwind CSS, and ShadCN UI components.

## 🛠️ Tech Stack

*   **Framework:** Next.js 15 (App Router)
*   **Language:** TypeScript
*   **UI Components:** ShadCN UI
*   **Styling:** Tailwind CSS
*   **Client-side Database:** IndexedDB (for transactions), localStorage (for notes and theme)
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

    Or using yarn:
    ```bash
    yarn build
    ```
    
    This command generates an optimized production build in the `.next` folder.

2.  **Start the production server:**

    Using npm:
    ```bash
    npm run start
    ```

    Or using yarn:
    ```bash
    yarn start
    ```
## 📖 How to Use PocketLedger Pro

### Main Dashboard (Home Page)

*   **Overview Cards:** At the top, you'll find cards displaying your **Current Balance**, **Total Income**, and **Total Expenses**.
*   **Add New Transaction:**
    *   **Date:** Select the transaction date using the calendar.
    *   **Category:** Choose an appropriate category from the dropdown list.
    *   **Amount:** Enter the transaction amount (only positive numbers are accepted).
    *   **Type:** Select "Income" or "Expense".
    *   **Notes (Optional):** Add any relevant details about the transaction.
    *   Click "Add Transaction" to save.

*   **Transaction History:** A table displaying all your recorded transactions.
    *   Each row shows the date, category, amount, type, and notes.
    *   You can delete a transaction by clicking the trash icon in the "Actions" column. A confirmation dialog will appear.

*   **Spending by Category:** A pie chart visualizing your expenses by category.
    *   Hover over a slice to see the category name, amount, and percentage of total spending.
    *   The legend below the chart lists the categories.

*   **Dark/Light Mode Toggle:** Switch between dark and light themes using the toggle in the header. Your preference is saved locally.
*   **My Notes Button:** Navigate to the Financial Notes page.

### Financial Notes Page (`/notes`)

*   **Add New Financial Note:**
    *   **Note Title:** Enter a title for your note (e.g., "Bitcoin Purchase", "Gold Investment").
    *   **Asset Type (Optional):** Select an asset category (e.g., Cryptocurrency, Stocks) or enter a custom one.
    *   **Quantity (Optional):** Enter the quantity of the asset.
    *   **Purchase Price (Optional):** Enter the purchase price of the asset. The currency symbol is hardcoded (₺).
    *   **Note Content:** Provide details about the asset, purchase date, strategy, etc.
    *   Click "Add Note" to save.

*   **Saved Notes:** Your notes are displayed in a list format, showing title, creation date, asset details (if provided), and content.
    *   You can delete a note using the trash icon next to each note, with a confirmation step.

*   **Back to Dashboard Button:** Return to the main dashboard

### Data Management

*   **Data Storage:** All data is stored locally in your browser. Transactions are in IndexedDB, while notes and theme preferences are in localStorage.
*   **Data Privacy:** Your data does not leave your device and is not accessible by any external servers or other websites.
*   **Data Reset:**
    *   **Footer Button:** Click the "Reset All Data" button in the footer. A confirmation dialog will appear before deleting all transactions and notes.
    *   **Shortcut:** Press `Shift + S + D` to reset all data without a confirmation dialog (use with caution!). A small tip about this shortcut is displayed near the reset button.

### About Pages

*   Links to "About" pages (in English, Turkish, and Spanish) are available in the footer. These pages provide information about the project's purpose, data storage, and how it works.

## 🔒 Data Privacy & Security

PocketLedger Pro prioritizes your privacy. All financial data you enter is stored exclusively on your local device using your web browser's storage capabilities (IndexedDB and localStorage).

*   **No Cloud Sync:** Your data is not uploaded to any server.
*   **Full Control:** You have complete control over your data. It remains on your computer/device unless you explicitly clear your browser's site data or use the "Reset All Data" feature.
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
    Or using yarn:
    ```bash
    yarn build
    ```
    
    This command generates an optimized production build in the `.next` folder.

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
    Or using yarn:
    ```bash
    yarn build
    ```
    This command generates an optimized production build in the `.next` folder.

2.  **Start the production server:**
    Using npm:
    ```bash
    npm run start
    ```
    Or using yarn:
    ```bash
    yarn start
    ```
## 📖 How to Use PocketLedger Pro

### Main Dashboard (Home Page)

*   **Overview Cards:** At the top, you'll find cards displaying your **Current Balance**, **Total Income**, and **Total Expenses**.
*   **Add New Transaction:**
    *   **Date:** Select the transaction date using the calendar.
    *   **Category:** Choose an appropriate category from the dropdown list.
    *   **Amount:** Enter the transaction amount (only positive numbers are accepted).
    *   **Type:** Select "Income" or "Expense".
    *   **Notes (Optional):** Add any relevant details about the transaction.
    *   Click "Add Transaction" to save.
*   **Transaction History:** A table displaying all your recorded transactions.
    *   Each row shows the date, category, amount, type, and notes.
    *   You can delete a transaction by clicking the trash icon in the "Actions" column. A confirmation dialog will appear.
*   **Spending by Category:** A pie chart visualizing your expenses by category.
    *   Hover over a slice to see the category name, amount, and percentage of total spending.
    *   The legend below the chart lists the categories.
*   **Dark/Light Mode Toggle:** Switch between dark and light themes using the toggle in the header. Your preference is saved locally.
*   **My Notes Button:** Navigate to the Financial Notes page.

### Financial Notes Page (`/notes`)

*   **Add New Financial Note:**
    *   **Note Title:** Enter a title for your note (e.g., "Bitcoin Purchase", "Gold Investment").
    *   **Asset Type (Optional):** Select an asset category (e.g., Cryptocurrency, Stocks) or enter a custom one.
    *   **Quantity (Optional):** Enter the quantity of the asset.
    *   **Purchase Price (Optional):** Enter the purchase price of the asset. The currency symbol is hardcoded (₺).
    *   **Note Content:** Provide details about the asset, purchase date, strategy, etc.
    *   Click "Add Note" to save.
*   **Saved Notes:** Your notes are displayed in a list format, showing title, creation date, asset details (if provided), and content.
    *   You can delete a note using the trash icon next to each note, with a confirmation step.
*   **Back to Dashboard Button:** Return to the main dashboard.

### Data Management

*   **Data Storage:** All data is stored locally in your browser. Transactions are in IndexedDB, while notes and theme preferences are in localStorage.
*   **Data Privacy:** Your data does not leave your device and is not accessible by any external servers or other websites.
*   **Data Reset:**
    *   **Footer Button:** Click the "Reset All Data" button in the footer. A confirmation dialog will appear before deleting all transactions and notes.
    *   **Shortcut:** Press `Shift + S + D` to reset all data without a confirmation dialog (use with caution!). A small tip about this shortcut is displayed near the reset button.

### About Pages

*   Links to "About" pages (in English, Turkish, and Spanish) are available in the footer. These pages provide information about the project's purpose, data storage, and how it works.

## 🔒 Data Privacy & Security

PocketLedger Pro prioritizes your privacy. All financial data you enter is stored exclusively on your local device using your web browser's storage capabilities (IndexedDB and localStorage).

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
