/* static/js/script.js */
document.addEventListener('DOMContentLoaded', () => {
    /* --- GLOBALS & STATE --- */
    let mainChartInstance = null;
    let weeklyChartInstance = null;
    let monthlyChartInstance = null;
    let whatIfChartInstance = null;
    let isDarkMode = true;
    /* --- V5.0 CORE DATA FOUNDATION --- */
    window.retailDataset = [];
    async function loadRetailDataset() {
        try {
            const response = await fetch('/static/data/retail_dataset_100.csv');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.text();
            if (data.includes('<!doctype html>')) throw new Error("Received HTML instead of CSV (likely 404 page)");
            // Simple CSV Parser
            const rows = data.split('\n').filter(r => r.trim() !== '');
            const headers = rows[0].split(',');
            window.retailDataset = rows.slice(1).map(row => {
                const values = row.split(',');
                if (values.length < 7) return null;
                return {
                    id: parseInt(values[0]),
                    product_name: values[1],
                    category: values[2],
                    daily_sales: parseInt(values[3]),
                    current_stock: parseInt(values[4]),
                    price: parseFloat(values[5]),
                    trend: values[6] ? values[6].replace('\n', '').trim() : "Stable"
                };
            }).filter(item => item !== null);
            console.log(`Loaded ${window.retailDataset.length} items from CSV.`);
            initApp();
            document.dispatchEvent(new CustomEvent('retailDataLoaded'));
        } catch (error) {
            console.error("Failed to load retail dataset CSV. Using robust fallback.", error);
            // Fallback for safety
            window.retailDataset = [
                { id: 1, product_name: "Fresh Whole Milk 1L", category: "Dairy", daily_sales: 145, current_stock: 450, price: 3.50, trend: "+12%" },
                { id: 2, product_name: "Whole Wheat Bread", category: "Bakery", daily_sales: 210, current_stock: 120, price: 2.80, trend: "+5%" },
                { id: 3, product_name: "Premium Coffee Beans", category: "Beverages", daily_sales: 85, current_stock: 200, price: 12.50, trend: "+18%" },
                { id: 4, product_name: "Organic Apples 1kg", category: "Produce", daily_sales: 300, current_stock: 150, price: 4.20, trend: "-2%" },
                { id: 5, product_name: "Eco-Friendly Laundry Detergent", category: "Household", daily_sales: 60, current_stock: 80, price: 15.99, trend: "+25%" },
                { id: 6, product_name: "Wireless Noise-Canceling Headphones", category: "Electronics", daily_sales: 15, current_stock: 45, price: 299.99, trend: "+35%" },
                { id: 7, product_name: "Smart LED TV 55-inch", category: "Electronics", daily_sales: 8, current_stock: 20, price: 450.00, trend: "Stable" },
                { id: 8, product_name: "Mens Cotton T-Shirt", category: "Apparel", daily_sales: 120, current_stock: 500, price: 15.00, trend: "-5%" },
                { id: 9, product_name: "Womens Running Shoes", category: "Apparel", daily_sales: 45, current_stock: 120, price: 89.99, trend: "+10%" },
                { id: 10, product_name: "Organic Bananas 1kg", category: "Produce", daily_sales: 400, current_stock: 300, price: 2.50, trend: "Stable" },
                { id: 11, product_name: "Avocado Hass", category: "Produce", daily_sales: 250, current_stock: 100, price: 1.50, trend: "+20%" },
                { id: 12, product_name: "Greek Yogurt 500g", category: "Dairy", daily_sales: 95, current_stock: 200, price: 4.50, trend: "+8%" },
                { id: 13, product_name: "Cheddar Cheese Block", category: "Dairy", daily_sales: 65, current_stock: 150, price: 6.00, trend: "-3%" },
                { id: 14, product_name: "Spaghetti Pasta 500g", category: "Pantry", daily_sales: 180, current_stock: 400, price: 1.20, trend: "+4%" },
                { id: 15, product_name: "Extra Virgin Olive Oil 1L", category: "Pantry", daily_sales: 50, current_stock: 110, price: 18.00, trend: "+12%" },
                { id: 16, product_name: "Dish Soap Liquid", category: "Household", daily_sales: 110, current_stock: 250, price: 3.50, trend: "Stable" },
                { id: 17, product_name: "Paper Towels 6-Pack", category: "Household", daily_sales: 190, current_stock: 350, price: 8.99, trend: "+15%" },
                { id: 18, product_name: "Sparkling Water 12-Pack", category: "Beverages", daily_sales: 130, current_stock: 240, price: 5.50, trend: "+22%" },
                { id: 19, product_name: "Orange Juice 2L", category: "Beverages", daily_sales: 105, current_stock: 180, price: 4.80, trend: "-6%" },
                { id: 20, product_name: "Gaming Mouse Pad", category: "Electronics", daily_sales: 35, current_stock: 90, price: 12.00, trend: "+5%" }
            ];
            initApp();
            document.dispatchEvent(new CustomEvent('retailDataLoaded'));
        }
    }
    /* --- CORE APP INITIALIZATION --- */
    function initApp() {
        initParticles();
        initThemeToggle();
        // Conditionally render Dashboards based on current page
        if (document.getElementById('healthScoreCounter')) renderHealthScoreCounter();
        if (document.getElementById('heatmapGrid')) renderHeatmap();
        if (document.getElementById('smartInsightsList')) renderSmartInsights();
        if (document.getElementById('analyzerSearchInput')) initProductAnalyzer();
        if (document.getElementById('mainForecastChart')) initForecasting();
        if (document.getElementById('trendsContainer')) renderTrendingProducts();
        if (document.getElementById('promoForm')) initSimulators();
        if (document.getElementById('dropZone')) initDataUpload();
        if (document.getElementById('generateReportBtn')) initReportModal();
        initVoiceAssistant();
        initCopilot();
        // Trigger generic counter animations
        animateCounters();
    }
    // Initiate CSV Load which will then trigger initApp()
    loadRetailDataset();
    document.addEventListener('retailDataLoaded', () => {
        if (document.getElementById('analyzerSearchInput')) initProductAnalyzer();
        if (typeof initRiskIntelligence === 'function') initRiskIntelligence();
    });
    /* --- UI: SIDEBAR NAVIGATION --- */
    // Sidebar behavior is now handled by Jinja templating `current_page` 
    // Just need mobile toggle logic
    const sidebar = document.querySelector('aside');
    const openBtn = document.getElementById('openSidebarBtn');
    const closeBtn = document.getElementById('closeSidebarBtn');
    if (openBtn) openBtn.addEventListener('click', () => sidebar.classList.remove('-translate-x-full'));
    if (closeBtn) closeBtn.addEventListener('click', () => sidebar.classList.add('-translate-x-full'));
    /* --- UI: THEME TOGGLE & PARTICLES --- */
    function initThemeToggle() {
        const btn = document.getElementById('themeToggle');
        const html = document.documentElement;
        btn.addEventListener('click', () => {
            isDarkMode = !isDarkMode;
            html.classList.toggle('dark');
            // Re-render chart colors
            Chart.defaults.color = isDarkMode ? '#94a3b8' : '#64748b';
            if (weeklyChartInstance || monthlyChartInstance) {
                const currentId = document.getElementById('analyzerSearchInput')?.dataset?.selectedId;
                if (currentId) renderDemandChart('both', currentId);
            }
            if (whatIfChartInstance) initSimulators(); // rebuild radar
        });
    }
    function initParticles() {
        const canvas = document.getElementById('particlesCanvas');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const particles = [];
        const config = { // Adjust particle count based on dark/light
            count: 50,
            color: 'rgba(99, 102, 241, 0.4)',
            size: 2,
            speed: 0.5
        };
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * config.speed;
                this.vy = (Math.random() - 0.5) * config.speed;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, config.size, 0, Math.PI * 2);
                ctx.fillStyle = isDarkMode ? config.color : 'rgba(99, 102, 241, 0.1)';
                ctx.fill();
            }
        }
        for (let i = 0; i < config.count; i++) particles.push(new Particle());
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => { p.update(); p.draw(); });
            requestAnimationFrame(animate);
        }
        animate();
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }
    /* --- SHARED ANIMATIONS --- */
    function animateCounters() {
        const counters = document.querySelectorAll('.counter');
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            gsap.to(counter, {
                innerHTML: target,
                duration: 2,
                ease: "power2.out",
                snap: { innerHTML: target % 1 === 0 ? 1 : 0.1 },
                onUpdate: function () {
                    // format comma if big number
                    if (target > 1000) {
                        counter.innerHTML = Math.floor(this.targets()[0].innerHTML).toLocaleString();
                    }
                }
            });
        });
    }
    /* --- FEATURE 5: STORE HEALTH SCORE --- */
    function renderHealthScoreCounter() {
        const score = 86; // AI calculated metric
        const counter = document.getElementById('healthScoreCounter');
        const circle = document.getElementById('healthCircle');
        gsap.to(counter, {
            innerHTML: score,
            duration: 2,
            ease: "circ.out",
            snap: { innerHTML: 1 }
        });
        // SVG circle dash array animation
        setTimeout(() => {
            circle.style.strokeDasharray = `${score}, 100`;
        }, 300);
    }
    /* --- FEATURE 6: SMART INSIGHTS --- */
    function renderSmartInsights() {
        const container = document.getElementById('smartInsightsList');
        if (!container) return;
        const insights = [
            {
                icon: 'fa-bolt', iconBg: 'bg-yellow-500/15', iconColor: 'text-yellow-400',
                title: 'Cold Beverages Surge', badge: '+45%', badgeColor: 'bg-green-500/20 text-green-400',
                text: 'Spike in Cold Beverages detected in Zone 4. Restock recommended by Thursday.',
                action: 'Reorder Now', actionIcon: 'fa-cart-plus'
            },
            {
                icon: 'fa-triangle-exclamation', iconBg: 'bg-red-500/15', iconColor: 'text-red-400',
                title: 'Stockout Risk Alert', badge: '2 days', badgeColor: 'bg-red-500/20 text-red-400',
                text: 'Organic Whole Milk stock critically low. Only 2 days of supply remain at current velocity.',
                action: 'View Stock', actionIcon: 'fa-boxes'
            },
            {
                icon: 'fa-arrow-trend-up', iconBg: 'bg-brand/15', iconColor: 'text-brand-light',
                title: 'Energy Drinks Velocity', badge: '+38%', badgeColor: 'bg-blue-500/20 text-blue-400',
                text: 'Energy drink category demand up 38% vs 30-day baseline. Strong summer correlation.',
                action: 'Full Analysis', actionIcon: 'fa-chart-line'
            },
            {
                icon: 'fa-shield-exclamation', iconBg: 'bg-orange-500/15', iconColor: 'text-orange-400',
                title: 'Festival Demand Window', badge: '4 days', badgeColor: 'bg-orange-500/20 text-orange-400',
                text: 'Festival season demand window opens in 4 days. 8 high-demand SKUs identified for promotion.',
                action: 'Plan Campaign', actionIcon: 'fa-calendar-plus'
            }
        ];
        container.innerHTML = insights.map((ins, i) => `
            <div class="p-3.5 rounded-xl border border-darkBorder bg-darkBg/40 hover:border-brand/30 hover:bg-brand/5 transition-all duration-300 group animate-in" style="animation-delay:${i * 120}ms">
                <div class="flex items-start gap-3">
                    <div class="w-8 h-8 rounded-lg ${ins.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5">
                        <i class="fas ${ins.icon} ${ins.iconColor} text-sm"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between gap-2 mb-1">
                            <span class="text-xs font-bold text-white truncate">${ins.title}</span>
                            <span class="text-[9px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0 ${ins.badgeColor}">${ins.badge}</span>
                        </div>
                        <p class="text-[10px] text-slate-400 leading-relaxed mb-2">${ins.text}</p>
                        <button class="flex items-center gap-1 text-[9px] font-bold text-brand hover:text-brand-light transition-colors">
                            <i class="fas ${ins.actionIcon} text-[8px]"></i> ${ins.action}
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    function renderTrendingProducts() {
        const container = document.getElementById('trendsContainer');
        if (!container || !window.retailDataset) return;
        const trends = window.retailDataset
            .filter(p => (p.trend && p.trend.includes('+')) || p.daily_sales > 100)
            .sort((a, b) => b.daily_sales - a.daily_sales)
            .slice(0, 4);
        container.innerHTML = trends.map(t => `
            <div class="glass-card p-4 rounded-xl border border-darkBorder flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center text-brand text-xs font-bold">
                        ${t.trend}
                    </div>
                    <div>
                        <h4 class="text-xs font-bold text-white">${t.product_name}</h4>
                        <p class="text-[10px] text-slate-400">${t.category}</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="text-xs font-bold text-white">${t.daily_sales}</p>
                    <p class="text-[10px] text-slate-400">units/day</p>
                </div>
            </div>
        `).join('');
    }
    /* --- FEATURE 7: SALES HEATMAP --- */
    const seasonData = {
        'Summer': [
            { name: 'Soft Drinks', emoji: '🥤', img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&auto=format&fit=crop', demand: 'H', score: 95, stock: 78, sales: 420, trend: '+18%' },
            { name: 'Artisanal Gelato', emoji: '🍦', img: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&auto=format&fit=crop', demand: 'H', score: 91, stock: 45, sales: 310, trend: '+24%' },
            { name: 'Watermelon', emoji: '🍉', img: 'https://images.unsplash.com/photo-1563114773-84221bd62daa?w=400&auto=format&fit=crop', demand: 'H', score: 88, stock: 62, sales: 280, trend: '+15%' },
            { name: 'Iced Coffee', emoji: '☕', img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&auto=format&fit=crop', demand: 'H', score: 87, stock: 55, sales: 260, trend: '+31%' },
            { name: 'Sunscreen SPF 50', emoji: '🧴', img: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&auto=format&fit=crop', demand: 'M', score: 64, stock: 82, sales: 145, trend: '+9%' },
            { name: 'Beach Towels', emoji: '🏖️', img: 'https://images.unsplash.com/photo-1524143820042-42171ca53416?w=400&auto=format&fit=crop', demand: 'L', score: 38, stock: 91, sales: 68, trend: '-3%' },
            { name: 'Fruit Juice', emoji: '🧃', img: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&auto=format&fit=crop', demand: 'M', score: 72, stock: 67, sales: 190, trend: '+12%' },
            { name: 'Water Bottles', emoji: '💧', img: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&auto=format&fit=crop', demand: 'M', score: 68, stock: 74, sales: 175, trend: '+7%' },
            { name: 'Energy Drinks', emoji: '⚡', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop', demand: 'H', score: 92, stock: 38, sales: 350, trend: '+45%' }
        ],
        'Winter': [
            { name: 'Gourmet Hot Cocoa', emoji: '☕', img: 'https://images.unsplash.com/photo-1542990253-a781e9374a6e?w=400&auto=format&fit=crop', demand: 'H', score: 93, stock: 52, sales: 380, trend: '+28%' },
            { name: 'Woolen Mittens', emoji: '🧤', img: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=400&auto=format&fit=crop', demand: 'M', score: 61, stock: 70, sales: 140, trend: '+5%' },
            { name: 'Electric Blankets', emoji: '🛏️', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&auto=format&fit=crop', demand: 'H', score: 89, stock: 41, sales: 290, trend: '+34%' },
            { name: 'Instant Porridge', emoji: '🥣', img: 'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=400&auto=format&fit=crop', demand: 'M', score: 67, stock: 79, sales: 160, trend: '+11%' },
            { name: 'Premium Coffee', emoji: '☕', img: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&auto=format&fit=crop', demand: 'H', score: 96, stock: 33, sales: 440, trend: '+38%' },
            { name: 'Peppermint Tea', emoji: '🍵', img: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&auto=format&fit=crop', demand: 'H', score: 84, stock: 58, sales: 240, trend: '+19%' },
            { name: 'Moisturizing Cream', emoji: '🧴', img: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&auto=format&fit=crop', demand: 'M', score: 71, stock: 63, sales: 185, trend: '+14%' },
            { name: 'Furry Boots', emoji: '👢', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop', demand: 'H', score: 86, stock: 46, sales: 265, trend: '+22%' }
        ],
        'Monsoon': [
            { name: 'Raincoats', emoji: '🧥', img: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=400&auto=format&fit=crop', demand: 'H', score: 94, stock: 37, sales: 410, trend: '+42%' },
            { name: 'Masala Tea', emoji: '🍵', img: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&auto=format&fit=crop', demand: 'H', score: 90, stock: 61, sales: 330, trend: '+26%' },
            { name: 'Immunity Boosters', emoji: '💊', img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop', demand: 'M', score: 73, stock: 54, sales: 200, trend: '+17%' },
            { name: 'Phone Pouches', emoji: '📱', img: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&auto=format&fit=crop', demand: 'M', score: 60, stock: 83, sales: 130, trend: '+8%' },
            { name: 'Umbrellas', emoji: '☂️', img: 'https://images.unsplash.com/photo-1534781571-32ffef1abf63?w=400&auto=format&fit=crop', demand: 'H', score: 97, stock: 28, sales: 490, trend: '+55%' },
            { name: 'Fast-Dry T-shirts', emoji: '👕', img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&auto=format&fit=crop', demand: 'M', score: 65, stock: 76, sales: 155, trend: '+10%' },
            { name: 'Mosquito Repellents', emoji: '🦟', img: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&auto=format&fit=crop', demand: 'H', score: 88, stock: 43, sales: 285, trend: '+33%' },
            { name: 'Instant Noodles', emoji: '🍜', img: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&auto=format&fit=crop', demand: 'M', score: 69, stock: 71, sales: 178, trend: '+13%' }
        ],
        'Festival': [
            { name: 'Mithai Box', emoji: '🍬', img: 'https://images.unsplash.com/photo-1548345680-f5475ea5df84?w=400&auto=format&fit=crop', demand: 'H', score: 98, stock: 22, sales: 520, trend: '+62%' },
            { name: 'Diya Sets', emoji: '🪔', img: 'https://images.unsplash.com/photo-1605478371310-a9f1e96b4ff4?w=400&auto=format&fit=crop', demand: 'H', score: 95, stock: 31, sales: 445, trend: '+48%' },
            { name: 'Scented Candles', emoji: '🕯️', img: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=400&auto=format&fit=crop', demand: 'M', score: 74, stock: 58, sales: 205, trend: '+21%' },
            { name: 'Cashew & Almond Mix', emoji: '🥜', img: 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=400&auto=format&fit=crop', demand: 'H', score: 91, stock: 44, sales: 360, trend: '+39%' },
            { name: 'Silk Scarves', emoji: '🧣', img: 'https://images.unsplash.com/photo-1601063458289-77247ba485ec?w=400&auto=format&fit=crop', demand: 'M', score: 66, stock: 68, sales: 158, trend: '+14%' },
            { name: 'Pooja Thali', emoji: '🙏', img: 'https://images.unsplash.com/photo-1578922746465-3a80a228f223?w=400&auto=format&fit=crop', demand: 'L', score: 42, stock: 87, sales: 72, trend: '+4%' },
            { name: 'Gift Hampers', emoji: '🎁', img: 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=400&auto=format&fit=crop', demand: 'H', score: 89, stock: 36, sales: 310, trend: '+36%' },
            { name: 'Celebration Chocs', emoji: '🍫', img: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&auto=format&fit=crop', demand: 'H', score: 87, stock: 49, sales: 280, trend: '+29%' }
        ]
    };
    window.renderHeatmap = function (season = 'Summer') {
        const grid = document.getElementById('heatmapGrid');
        if (!grid) return;
        grid.innerHTML = '';
        const products = seasonData[season] || seasonData['Summer'];
        products.forEach((prod, i) => {
            const cell = document.createElement('div');
            const isHigh = prod.demand === 'H';
            const isMed = prod.demand === 'M';
            const demandLevelText = isHigh ? 'High Demand' : isMed ? 'Medium' : 'Low';
            const borderColor = isHigh ? 'border-red-500/40' : isMed ? 'border-yellow-500/40' : 'border-blue-500/40';
            const badgeBg = isHigh ? 'bg-red-500' : isMed ? 'bg-yellow-500' : 'bg-blue-500';
            const barColor = isHigh ? 'bg-gradient-to-r from-red-600 to-red-400' : isMed ? 'bg-gradient-to-r from-yellow-600 to-yellow-400' : 'bg-gradient-to-r from-blue-600 to-blue-400';
            const scoreColor = isHigh ? 'text-red-400' : isMed ? 'text-yellow-400' : 'text-blue-400';
            const trendUp = prod.trend && prod.trend.startsWith('+');
            const stockColor = prod.stock < 40 ? 'bg-red-500' : prod.stock < 65 ? 'bg-yellow-500' : 'bg-green-500';
            const stockLabel = prod.stock < 40 ? 'Low Stock' : prod.stock < 65 ? 'Medium' : 'In Stock';
            cell.className = `heatmap-cell glass-card rounded-2xl overflow-hidden border ${borderColor} flex flex-col animate-in delay-${(i % 4) + 1} cursor-pointer`;
            cell.style.animationDelay = `${i * 80}ms`;
            cell.innerHTML = `
                <!-- Image Section -->
                <div class="relative overflow-hidden" style="height:130px">
                    <img src="${prod.img}" loading="lazy"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                         alt="${prod.name}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                    <!-- Emoji Fallback -->
                    <div class="w-full h-full hidden items-center justify-center text-5xl" style="background:linear-gradient(135deg,#1e293b,#0f172a)">${prod.emoji}</div>
                    <!-- Overlay gradient -->
                    <div class="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-transparent to-transparent"></div>
                    <!-- Demand Score Badge -->
                    <div class="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-0.5">
                        <span class="text-[9px] font-black ${scoreColor}">${prod.score}</span>
                        <span class="text-[8px] text-slate-400">/ 100</span>
                    </div>
                    <!-- Live dot -->
                    <div class="absolute top-2 right-2">
                        <span class="flex h-2.5 w-2.5">
                            <span class="animate-ping absolute inline-flex h-full w-full rounded-full ${badgeBg} opacity-60"></span>
                            <span class="relative inline-flex rounded-full h-2.5 w-2.5 ${badgeBg}"></span>
                        </span>
                    </div>
                    <!-- Trend badge -->
                    <div class="absolute bottom-2 right-2">
                        <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-full ${trendUp ? 'bg-green-500/80 text-green-50' : 'bg-red-500/80 text-red-50'}">
                            <i class="fas ${trendUp ? 'fa-arrow-up' : 'fa-arrow-down'} text-[7px] mr-0.5"></i>${prod.trend || ''}
                        </span>
                    </div>
                </div>
                <!-- Info Section -->
                <div class="p-3 flex flex-col gap-2 flex-1">
                    <h4 class="text-[12px] font-bold text-white leading-tight" title="${prod.name}">${prod.name}</h4>
                    <!-- Demand Label + Sales -->
                    <div class="flex items-center justify-between">
                        <span class="text-[9px] font-semibold uppercase tracking-wider ${scoreColor}">${demandLevelText}</span>
                        <span class="text-[9px] text-slate-400">${prod.sales} <span class="text-slate-600">units/day</span></span>
                    </div>
                    <!-- Demand Bar -->
                    <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div class="h-full ${barColor} rounded-full transition-all duration-700" style="width:${prod.score}%"></div>
                    </div>
                    <!-- Stock Row -->
                    <div class="flex items-center justify-between mt-0.5">
                        <div class="flex items-center gap-1">
                            <div class="w-1.5 h-1.5 rounded-full ${stockColor}"></div>
                            <span class="text-[8px] text-slate-500">${stockLabel}</span>
                        </div>
                        <span class="text-[8px] font-bold text-slate-400">${prod.stock}% full</span>
                    </div>
                </div>
            `;
            grid.appendChild(cell);
        });
    }
    /* --- SEASON SWITCHER --- */
    window.setHeatmapSeason = function (season) {
        console.log(`Switching heatmap to season: ${season}`);
        if (typeof window.renderHeatmap === 'function') {
            window.renderHeatmap(season);
        } else {
            console.error('renderHeatmap function not found');
        }
    };
    function initProductAnalyzer() {
        const input = document.getElementById('analyzerSearchInput');
        const dropdown = document.getElementById('analyzerDropdown');
        const btnAnalyze = document.getElementById('btnAnalyzeDemand');
        if (!input || !dropdown || !btnAnalyze) return;
        input.addEventListener('focus', () => {
            if (input.value.trim() === '') showDropdown(window.retailDataset);
        });
        input.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase().trim();
            const filtered = window.retailDataset.filter(p => p.product_name.toLowerCase().includes(val));
            showDropdown(filtered);
        });
        function showDropdown(items) {
            if (items.length === 0) {
                dropdown.classList.add('hidden');
                return;
            }
            dropdown.innerHTML = items.map(p => `
                <div class="p-3 hover:bg-brand/10 cursor-pointer border-b border-darkBorder last:border-0 text-sm text-slate-300 transition-colors dropdown-item" data-id="${p.id}">
                    <div class="font-bold text-white">${p.product_name}</div>
                    <div class="text-[10px] text-slate-500">${p.category}</div>
                </div>
            `).join('');
            dropdown.classList.remove('hidden');
            dropdown.querySelectorAll('.dropdown-item').forEach(item => {
                item.addEventListener('click', () => {
                    const id = item.dataset.id;
                    const product = window.retailDataset.find(p => p.id == id);
                    input.value = product.product_name;
                    input.dataset.selectedId = id;
                    dropdown.classList.add('hidden');
                });
            });
        }
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });
        btnAnalyze.addEventListener('click', () => {
            const productId = input.dataset.selectedId;
            if (!productId) {
                alert("Please select a product from the list first.");
                return;
            }
            renderDemandChart('both', productId);
        });
    }
    window.renderDemandChart = function (horizon, productId) {
        const product = window.retailDataset.find(p => p.id == productId);
        if (!product) return;
        const resultsArea = document.getElementById('analyzerResults');
        const loadingArea = document.getElementById('analyzerLoading');
        const statsGrid = document.getElementById('analyzerStatsGrid');
        const stockAlert = document.getElementById('analyzerStockAlert');
        loadingArea.classList.remove('hidden');
        resultsArea.classList.add('hidden');
        // Mock loading delay for effect
        setTimeout(() => {
            loadingArea.classList.add('hidden');
            resultsArea.classList.remove('hidden');
            resultsArea.style.opacity = '1';
            resultsArea.style.transform = 'translateY(0)';
            // Populate Stats
            const monthlyDemand = product.daily_sales * 30;
            const weeklyDemand = product.daily_sales * 7;
            const stockHealth = Math.floor((product.current_stock / monthlyDemand) * 100);
            statsGrid.innerHTML = `
                <div class="bg-darkBg p-4 rounded-xl border border-darkBorder">
                    <p class="text-[10px] text-slate-400 uppercase font-bold mb-1">Daily Base</p>
                    <p class="text-xl font-bold text-white">${product.daily_sales}</p>
                </div>
                <div class="bg-darkBg p-4 rounded-xl border border-darkBorder">
                    <p class="text-[10px] text-slate-400 uppercase font-bold mb-1">Weekly Proj.</p>
                    <p class="text-xl font-bold text-brand-light">${weeklyDemand}</p>
                </div>
                <div class="bg-darkBg p-4 rounded-xl border border-darkBorder">
                    <p class="text-[10px] text-slate-400 uppercase font-bold mb-1">Monthly Proj.</p>
                    <p class="text-xl font-bold text-accent-light">${monthlyDemand}</p>
                </div>
                <div class="bg-darkBg p-4 rounded-xl border border-darkBorder">
                    <p class="text-[10px] text-slate-400 uppercase font-bold mb-1">Stock Health</p>
                    <p class="text-xl font-bold ${stockHealth < 50 ? 'text-red-400' : 'text-green-400'}">${stockHealth}%</p>
                </div>
            `;
            // Stock Alert Logic
            if (product.current_stock < monthlyDemand) {
                stockAlert.classList.remove('hidden');
                document.getElementById('alertMonthlyDemand').innerText = monthlyDemand;
                document.getElementById('alertCurrentStock').innerText = product.current_stock;
            } else {
                stockAlert.classList.add('hidden');
            }
            // Charts
            renderWeeklyChart(product);
            renderMonthlyChart(product);
            // AI Insight
            const insightText = document.getElementById('analyzerInsightText');
            const trendBadge = document.getElementById('analyzerTrendBadge');
            const trendVal = product.trend;
            const isRising = trendVal.includes('+');
            const lang = localStorage.getItem('retail_lang') || 'en';
            const insightKey = isRising ? 'analyzer_insight_pos' : 'analyzer_insight_neg';
            let localizedInsight = translations[lang][insightKey] || translations['en'][insightKey];
            localizedInsight = localizedInsight.replace('%PRODUCT%', product.product_name)
                .replace('%DAILY%', product.daily_sales)
                .replace('%MONTHLY%', Math.floor(monthlyDemand * 1.2));
            insightText.innerText = localizedInsight;
            trendBadge.innerHTML = `
                <div class="flex items-center gap-2 px-3 py-1 rounded-full ${isRising ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} border ${isRising ? 'border-green-500/30' : 'border-red-500/30'} text-xs font-bold">
                    <i class="fas ${isRising ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}"></i> ${trendVal}
                </div>
            `;
        }, 800);
    };
    // Listen for language changes to update existing AI insights
    document.addEventListener('languageChanged', (e) => {
        const input = document.getElementById('analyzerSearchInput');
        if (input && input.dataset.selectedId) {
            renderDemandChart('both', input.dataset.selectedId);
        }
    });
    function renderWeeklyChart(product) {
        const ctx = document.getElementById('weeklyDemandChart').getContext('2d');
        if (weeklyChartInstance) weeklyChartInstance.destroy();
        // Generate mock data points
        const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const data = labels.map(() => product.daily_sales + Math.floor(Math.random() * 20 - 10));
        weeklyChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Predicted Units',
                    data: data,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#6366f1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
                    y: { grid: { color: 'rgba(148, 163, 184, 0.1)' }, ticks: { color: '#94a3b8' } }
                }
            }
        });
    }
    function renderMonthlyChart(product) {
        const ctx = document.getElementById('monthlyDemandChart').getContext('2d');
        if (monthlyChartInstance) monthlyChartInstance.destroy();
        const labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        const baseWeekly = product.daily_sales * 7;
        const data = labels.map(() => baseWeekly + Math.floor(Math.random() * 100 - 50));
        monthlyChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Predicted Units',
                    data: data,
                    backgroundColor: 'rgba(6, 182, 212, 0.6)',
                    borderColor: '#06b6d4',
                    borderWidth: 1,
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
                    y: { grid: { color: 'rgba(148, 163, 184, 0.1)' }, ticks: { color: '#94a3b8' } }
                }
            }
        });
    }
    function initForecasting() {
        // This is the old forecasting init, we can keep it for the legacy chart if needed
        const ctx = document.getElementById('mainForecastChart');
        if (!ctx) return;
        // Render a default aggregate chart
        if (mainChartInstance) mainChartInstance.destroy();
        mainChartInstance = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    label: 'Aggregated Store Demand',
                    data: [1200, 1900, 1500, 2100],
                    borderColor: '#6366f1',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
    }
    function initSimulators() {
        const discountInput = document.getElementById('discountInput');
        const discountVal = document.getElementById('discountVal');
        const promoForm = document.getElementById('promoForm');
        const promoOutcome = document.getElementById('promoOutcome');
        if (!discountInput || !promoForm) return;
        discountInput.addEventListener('input', (e) => {
            discountVal.innerText = `${e.target.value}% `;
        });
        promoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const d = parseInt(discountInput.value);
            const b = parseInt(document.getElementById('adBudgetInput').value);
            const s = document.getElementById('seasonInput').value;
            let baseLift = d * 1.5;
            let budgetLift = (b / 1000) * 2;
            let seasonMultiplier = s === 'none' ? 1.0 : 1.4;
            let finalLift = ((baseLift + budgetLift) * seasonMultiplier).toFixed(1);
            let revImpact = (((finalLift / 100) * 50000) - b).toLocaleString();
            document.getElementById('simResultLift').innerText = `+ ${finalLift}%`;
            document.getElementById('simResultRev').innerText = `$${revImpact}`;
            const bar = document.getElementById('simResultBar');
            if (bar) bar.style.width = Math.min(100, Math.max(0, finalLift)) + '%';
            promoOutcome.classList.remove('hidden');
            gsap.from(promoOutcome, { y: 20, opacity: 0, duration: 0.5 });
        });
        window.updateWhatIf = function () {
            const price = parseInt(document.getElementById('whatIfPriceSlider')?.value || 50);
            const marketing = parseInt(document.getElementById('whatIfMarketingSlider')?.value || 50);
            const demand = Math.max(0, Math.min(100, 100 - (price * 0.8) + (marketing * 0.4)));
            const profit = Math.max(0, Math.min(100, (price * 1.2) - (marketing * 0.3)));
            const equity = Math.max(0, Math.min(100, 20 + (marketing * 0.8)));
            if (whatIfChartInstance) {
                whatIfChartInstance.data.datasets[0].data = [demand, profit, equity];
                whatIfChartInstance.update();
            }
        };
        const ctxRadar = document.getElementById('whatIfCanvas');
        if (ctxRadar) {
            if (whatIfChartInstance) whatIfChartInstance.destroy();
            whatIfChartInstance = new Chart(ctxRadar.getContext('2d'), {
                type: 'radar',
                data: {
                    labels: ['Demand Vol.', 'Net Profit', 'Brand Equity'],
                    datasets: [{ label: 'Strategy Vector', data: [80, 60, 75], backgroundColor: 'rgba(168, 85, 247, 0.2)', borderColor: '#a855f7', pointBackgroundColor: '#a855f7' }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    scales: { r: { min: 0, max: 100, ticks: { display: false }, grid: { color: 'rgba(255,255,255,0.1)' }, pointLabels: { color: '#94a3b8', font: { size: 10 } } } },
                    plugins: { legend: { display: false } }
                }
            });
        }
    }
    function initDataUpload() {
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('csvFileInput');
        const status = document.getElementById('uploadStatus');
        if (!dropZone || !fileInput || !status) return;
        dropZone.addEventListener('click', () => fileInput.click());
        dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('border-brand', 'bg-brand/5'); });
        dropZone.addEventListener('dragleave', () => { dropZone.classList.remove('border-brand', 'bg-brand/5'); });
        dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.classList.remove('border-brand', 'bg-brand/5'); if (e.dataTransfer.files.length) processFileMock(e.dataTransfer.files[0]); });
        fileInput.addEventListener('change', (e) => { if (e.target.files.length) processFileMock(e.target.files[0]); });
        function processFileMock(file) {
            status.classList.add('hidden');
            setTimeout(() => { status.classList.remove('hidden'); }, 1500);
        }
    }
    function initReportModal() {
        const btn = document.getElementById('generateReportBtn');
        const modal = document.getElementById('reportModal');
        const content = document.getElementById('reportModalContent');
        const close = document.getElementById('closeReportBtn');
        const reportArea = document.getElementById('reportContentArea');
        if (!btn || !modal || !close || !reportArea) return;
        btn.addEventListener('click', () => {
            document.getElementById('reportDate').innerText = `Generated: ${new Date().toLocaleDateString()} `;
            modal.classList.remove('hidden'); modal.classList.add('flex');
            requestAnimationFrame(() => { modal.classList.remove('opacity-0'); if (content) content.classList.remove('scale-95'); });
            reportArea.innerHTML = '<div class="flex items-center justify-center h-48 flex-col gap-4 text-brand font-mono"><div class="loader"></div><p class="animate-pulse">Synthesizing multi-variable ML Report...</p></div>';
            setTimeout(() => {
                reportArea.innerHTML = '<div class="space-y-6 text-slate-300"><div class="bg-darkBg p-6 rounded-xl border border-darkBorder"><h3 class="text-brand-light font-bold mb-2 uppercase text-xs tracking-wider">Executive Summary</h3><p class="text-sm leading-relaxed">The RetailMind Neural Engine has analyzed 24 store zones across 3 temporal horizons. Primary finding: <strong>35% surge in cold-weather apparel</strong> suppression, correlating inversely with summer/leisure goods.</p></div><div class="grid grid-cols-2 gap-4"><div class="bg-darkBg p-4 rounded-xl border border-darkBorder"><span class="text-xl font-bold text-white block">86/100</span><span class="text-xs text-slate-500">Aggregate Store Health Score</span></div><div class="bg-darkBg p-4 rounded-xl border border-darkBorder"><span class="text-xl font-bold text-green-400 block">+12.5%</span><span class="text-xs text-slate-500">Predicted Revenue vs. Baseline</span></div></div></div>';
            }, 2000);
        });
        close.addEventListener('click', () => { modal.classList.add('opacity-0'); if (content) content.classList.add('scale-95'); setTimeout(() => { modal.classList.add('hidden'); modal.classList.remove('flex'); }, 300); });
        modal.addEventListener('click', (e) => { if (e.target === modal) close.click(); });
    }
    function initVoiceAssistant() {
        const btn = document.getElementById('aiVoiceBtn');
        const bubble = document.getElementById('aiVoiceBubble');
        const text = document.getElementById('aiVoiceText');
        const ripples = document.getElementById('aiVoiceRipples');
        const avatarContainer = document.getElementById('aiAvatarContainer');
        if (!btn || !('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) { if (btn) btn.style.display = 'none'; return; }
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true; recognition.interimResults = false;
        recognition.lang = getVoiceLocale();
        let isListening = false, isProcessing = false;
        function getVoiceLocale() {
            const lang = localStorage.getItem('retail_lang') || 'en';
            const m = { en:'en-US', hi:'hi-IN', te:'te-IN', ta:'ta-IN', kn:'kn-IN', ml:'ml-IN', bn:'bn-IN', mr:'mr-IN', es:'es-ES', fr:'fr-FR' };
            return m[lang] || 'en-US';
        }
        function setAvatarState(state) { if (!avatarContainer) return; avatarContainer.classList.remove('avatar-listening','avatar-talking'); if (state==='listening') avatarContainer.classList.add('avatar-listening'); if (state==='talking') avatarContainer.classList.add('avatar-talking'); }
        function findVoiceForLocale(locale) {
            const voices = window.speechSynthesis.getVoices(); if (!voices.length) return null;
            let voice = voices.find(v => v.lang === locale); if (voice) return voice;
            const shortLang = locale.split('-')[0];
            voice = voices.find(v => v.lang.startsWith(shortLang)); if (voice) return voice;
            const langNames = { 'en':['english'], 'hi':['hindi'], 'te':['telugu'], 'ta':['tamil'], 'kn':['kannada'], 'ml':['malayalam'], 'bn':['bengali'], 'mr':['marathi'] };
            const searchNames = langNames[shortLang];
            if (searchNames) { voice = voices.find(v => searchNames.some(n => v.name.toLowerCase().includes(n))); }
            return voice || null;
        }
        function speak(message) {
            if (!window.speechSynthesis) return;
            const locale = getVoiceLocale(); window.speechSynthesis.cancel();
            setTimeout(() => {
                const utterance = new SpeechSynthesisUtterance(message);
                utterance.lang = locale; utterance.rate = 1.0; utterance.pitch = 1.0;
                const matchedVoice = findVoiceForLocale(locale);
                if (matchedVoice) utterance.voice = matchedVoice;
                utterance.onstart = () => { setAvatarState('talking'); if (bubble) { bubble.classList.remove('hidden','scale-0','opacity-0'); bubble.classList.add('show'); } if (text) text.innerHTML = '<span class="text-white">' + message + '</span>'; };
                utterance.onend = () => { setAvatarState('idle'); if (isListening && !isProcessing) { setAvatarState('listening'); const langNow = localStorage.getItem('retail_lang') || 'en'; const listeningText = (translations[langNow] && translations[langNow].assistant_listening) || 'Listening...'; if (text) text.innerHTML = '<span class="text-brand-light animate-pulse">' + listeningText + '</span>'; } };
                window.speechSynthesis.speak(utterance);
            }, 100);
        }
        if (window.speechSynthesis) { window.speechSynthesis.getVoices(); window.speechSynthesis.onvoiceschanged = () => { window.speechSynthesis.getVoices(); }; }
        btn.addEventListener('click', () => { if (isListening) stopRecognition(); else startRecognition(); });
        function startRecognition() {
            try { recognition.lang = getVoiceLocale(); recognition.start(); isListening = true;
                const lang = localStorage.getItem('retail_lang') || 'en';
                const greet = (translations[lang] && translations[lang].assistant_greeting) || (translations['en'] && translations['en'].assistant_greeting) || 'Hello!';
                speak(greet);
                if (ripples) ripples.classList.remove('hidden','scale-0','opacity-0');
                if (bubble) { bubble.classList.remove('hidden','scale-0','opacity-0'); bubble.classList.add('show'); }
                btn.classList.add('scale-110'); btn.querySelector('i').classList.replace('fa-microphone','fa-microphone-lines');
            } catch(e) { isListening = false; }
        }
        function stopRecognition() {
            isListening = false; recognition.stop();
            if (ripples) ripples.classList.add('hidden'); btn.classList.remove('scale-110');
            btn.querySelector('i').classList.replace('fa-microphone-lines','fa-microphone');
            setAvatarState('idle'); if (bubble) bubble.classList.remove('show'); window.speechSynthesis.cancel();
        }
        recognition.onresult = function(event) { const transcript = event.results[event.results.length-1][0].transcript.trim().toLowerCase(); processCommand(transcript); };
        function matchesKeywords(cmd, keywords) { if (!keywords) return false; return keywords.some(kw => cmd.includes(kw.toLowerCase())); }
        function processCommand(cmd) {
            isProcessing = true;
            if (text) text.innerHTML = '<i class="text-slate-400">"' + cmd + '"</i><br><span class="text-brand text-[10px] uppercase font-bold animate-pulse">Analyzing...</span>';
            let response = '', action = null;
            const lang = localStorage.getItem('retail_lang') || 'en';
            const t = translations[lang] || translations['en'];
            const vc = typeof voiceCommands !== 'undefined' ? voiceCommands : null;
            const forecastKw = (vc && vc.forecast && vc.forecast[lang]) || (vc && vc.forecast && vc.forecast.en) || [];
            const trendsKw = (vc && vc.trends && vc.trends[lang]) || (vc && vc.trends && vc.trends.en) || [];
            const riskKw = (vc && vc.risk && vc.risk[lang]) || (vc && vc.risk && vc.risk.en) || [];
            const greetingKw = (vc && vc.greeting && vc.greeting[lang]) || (vc && vc.greeting && vc.greeting.en) || [];
            if (matchesKeywords(cmd, forecastKw)) { response = t.voice_redirect_forecast || 'Redirecting to Forecasting'; action = () => window.location.href = '/forecasting'; }
            else if (matchesKeywords(cmd, trendsKw)) { response = t.voice_redirect_trends || 'Opening Trends'; action = () => window.location.href = '/trends'; }
            else if (matchesKeywords(cmd, riskKw)) { response = t.voice_redirect_risk || 'Opening Risk Intelligence'; action = () => window.location.href = '/risk_intelligence'; }
            else if (matchesKeywords(cmd, greetingKw)) { response = t.voice_greeting_simple || 'Hello, how can I help?'; }
            else { response = (t.voice_fallback || 'I heard: %CMD%').replace('%CMD%', cmd); }
            speak(response);
            if (action) setTimeout(action, 4000);
            setTimeout(() => { isProcessing = false; }, 1000);
        }
    }
    window.toggleCopilot = function() { const sidebar = document.getElementById('copilotSidebar'); if (sidebar) sidebar.classList.toggle('translate-x-full'); };
    function initCopilot() {
        const form = document.getElementById('copilotForm');
        const input = document.getElementById('copilotInput');
        const chatArea = document.getElementById('copilotChatArea');
        if (!form || !input || !chatArea) return;
        form.addEventListener('submit', (e) => {
            e.preventDefault(); const query = input.value.trim(); if (!query) return;
            addMessage(query, 'user'); input.value = '';
            const typingId = 'typing-' + Date.now();
            chatArea.insertAdjacentHTML('beforeend', '<div id="' + typingId + '" class="bg-darkBg p-3 rounded-2xl border border-darkBorder text-brand self-start max-w-[85%] text-xs flex items-center gap-2"><i class="fas fa-circle-notch fa-spin"></i> Analyzing...</div>');
            chatArea.scrollTop = chatArea.scrollHeight;
            setTimeout(() => { var el = document.getElementById(typingId); if (el) el.remove(); addMessage(generateCopilotResponse(query), 'ai'); }, 1200);
        });
        function addMessage(txt, sender) {
            const html = sender === 'user' ? '<div class="bg-brand/20 p-3 rounded-2xl text-white self-end text-sm">' + txt + '</div>' : '<div class="bg-darkBg p-4 rounded-2xl text-slate-300 self-start text-sm">' + txt + '</div>';
            chatArea.insertAdjacentHTML('beforeend', html); chatArea.scrollTop = chatArea.scrollHeight;
        }
        function generateCopilotResponse(query) {
            const q = query.toLowerCase(); const dataset = window.retailDataset || [];
            const matched = dataset.find(p => q.includes(p.product_name.toLowerCase()));
            if (matched) return '<b>' + matched.product_name + '</b>: Sales ' + matched.daily_sales + '/day, Stock ' + matched.current_stock + ', Trend ' + matched.trend;
            if (q.includes('stock')) return 'Scanning for stockout risks... All essential SKUs are currently within safe thresholds.';
            return "I'm analyzing your retail data. Try asking about specific products or stock levels.";
        }
    }
    window.initializeForecastingSelector = function() {
        const listContainer = document.getElementById('forecastProductList');
        const items = window.retailDataset || [];
        if (listContainer && items.length > 0) {
            listContainer.innerHTML = '';
            items.forEach((item, index) => {
                const card = document.createElement('div');
                card.className = 'min-w-[150px] bg-darkBg border border-darkBorder hover:border-brand rounded-xl p-3 cursor-pointer text-center group product-card-btn';
                card.dataset.id = item.id || index;
                const imgUrl = 'https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent(item.product_name) + '&backgroundColor=1e293b&textColor=6366f1';
                card.innerHTML = '<div class="w-12 h-12 rounded-full overflow-hidden mx-auto mb-2"><img src="' + imgUrl + '" class="w-full h-full object-cover"></div><p class="text-[11px] font-bold text-white truncate">' + item.product_name + '</p><p class="text-[10px] text-brand truncate">' + item.category + '</p>';
                card.addEventListener('click', () => {
                    const analyzerInput = document.getElementById('analyzerSearchInput');
                    if (analyzerInput) { analyzerInput.value = item.product_name; analyzerInput.dataset.selectedId = card.dataset.id; }
                    document.querySelectorAll('.product-card-btn').forEach(c => c.classList.remove('border-brand', 'bg-brand/10'));
                    card.classList.add('border-brand', 'bg-brand/10');
                    if (window.renderDemandChart) window.renderDemandChart('both', card.dataset.id);
                });
                listContainer.appendChild(card);
            });
        }
    };
});
