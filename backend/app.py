from flask import Flask, render_template, request, jsonify, redirect, url_for
import random
import time
from datetime import datetime, timedelta

app = Flask(__name__, template_folder='../templates', static_folder='../static')

# --- V3.0 MULTI-PAGE ROUTES ---

@app.route('/')
def landing():
    """Renders the public facing landing page"""
    return render_template('landing.html')

@app.route('/login')
def login():
    """Renders the authentication portal"""
    return render_template('login.html')

@app.route('/dashboard')
def dashboard():
    """Renders the main overview dashboard"""
    return render_template('dashboard.html', current_page='overview')

@app.route('/forecasting')
def forecasting():
    """Renders the dedicated Advanced Demand Prediction page"""
    return render_template('forecasting.html', current_page='forecasting')

@app.route('/trends')
def trends():
    """Renders the dedicated Trending Products page"""
    return render_template('trends.html', current_page='trends')

@app.route('/simulators')
def simulators():
    """Renders the dedicated Strategy Simulators page"""
    return render_template('simulators.html', current_page='simulators')

@app.route('/inventory')
def inventory():
    """Renders the dedicated Inventory Optimization page"""
    return render_template('inventory.html', current_page='inventory')

@app.route('/competitors')
def competitors():
    """Renders the dedicated Competitor Tracking page"""
    return render_template('competitors.html', current_page='competitors')

@app.route('/data')
def data_management():
    """Renders the data import page"""
    return render_template('data.html', current_page='data')

# --- V4.0 ADVANCED AI FEATURES ROUTES ---

@app.route('/risk_intelligence')
def risk_intelligence():
    """Renders the Risk Intelligence AI page"""
    return render_template('risk.html', current_page='risk')

@app.route('/customer_insights')
def customer_insights():
    """Renders the Customer Behavior Analysis page"""
    return render_template('customer.html', current_page='customers')

@app.route('/geo_map')
def geo_map():
    """Renders the Geo Demand Mapping page"""
    return render_template('geo.html', current_page='geo')

@app.route('/game')
def retail_game():
    """Renders the WOW Feature: Retail Business Game Simulator"""
    return render_template('game.html', current_page='game')


# --- MOCK API ENDPOINTS (Legacy/V1 but kept for structure) ---
@app.route('/process', methods=['POST'])
def process_data():
    return jsonify({"status": "success", "message": "Ready"})

@app.route('/analyze', methods=['POST'])
def analyze_data():
    return jsonify({"status": "success", "confidence_score": 98.2})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
