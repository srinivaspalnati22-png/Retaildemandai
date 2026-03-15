# Smart Retail Demand Forecasting AI (NexusAI)

A visually stunning, modern, and interactive prototype built for hackathon demonstrations. This application predicts retail product demand using simulated machine learning models, helping retailers prevent stockouts and optimize inventory.

## Tech Stack
-   **Frontend:** HTML5, Tailwind CSS (via CDN), Custom CSS Animations, Vanilla JavaScript, Chart.js.
-   **Backend:** Python 3, Flask.
-   **Architecture:** Client-Server model with asynchronous REST API communication. No database required for this prototype.

## Features
-   **Modern UI/UX:** Glassmorphism, dark-mode styling, animated gradients, and floating elements.
-   **Interactive Dashboard:** Users can submit store/category data and receive AI insights dynamically.
-   **Data Visualization:** Incorporates Chart.js to render beautiful, animated prediction graphs distinguishing between historical and forecasted data.
-   **Smart Explanations:** Includes a dedicated section explaining the ML methodologies (Seasonal isolation, Time series modeling) designed to impress hackathon judges.

## How to Run Locally in VS Code

1.  **Ensure Python is Installed:** Check that you have Python 3 installed on your machine.
2.  **Open Project:** Open the `smartretailai` folder inside VS Code.
3.  **Install Flask:** Open a new terminal in VS Code (`Terminal -> New Terminal`) and run:
    ```bash
    pip install flask
    ```
4.  **Run Application:** Start the Flask server by running:
    ```bash
    python backend/app.py
    ```
5.  **Access on Browser:** Information on the terminal will display the local host url: typically `http://127.0.0.1:5000/`. CTRL+Click this link to view the app in your browser!

## Usage Guide
1. Scroll to the "Command Center" workspace.
2. Enter a target location.
3. Select a Product Category from the drop-down menu.
4. Click "Generate Forecast".
5. The UI will show a simulated API call, a loading state, and then dynamically reveal the predictions, confidence score, and insights via animated UI components.
