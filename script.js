class POS {
    constructor() {
        this.cart = [];
        this.activeCategory = 'All';
        this.taxRate = 0.05;
        this.isTouch = false;
        
        this.settings = { storeName: "NEXUS POS", tableCount: 10, setupDone: false, language: "en", currency: "USD" };
        
        // Demo System
        this.idleTime = 40000; // 40s
        this.idleTimer = null;
        this.demoInterval = null;
        this.ghostInterval = null;
        this.isDemoActive = false;

        // Init Data
        try {
            const savedData = localStorage.getItem('nexus_products');
            this.products = savedData ? JSON.parse(savedData) : this.getDefaultProducts();
            const savedSettings = localStorage.getItem('nexus_settings');
            if(savedSettings) this.settings = JSON.parse(savedSettings);
        } catch (e) { this.products = this.getDefaultProducts(); }
        
        this.init();
    }

    getDefaultProducts() {
        return [
            { id: 1, name: "Surface Burger", price: 15.00, category: "Food" },
            { id: 2, name: "Fluent Fries", price: 6.00, category: "Food" },
            { id: 3, name: "Azure Mist", price: 4.50, category: "Drinks" },
            { id: 4, name: "Cloud Coffee", price: 5.00, category: "Drinks" },
            { id: 5, name: "Bloom Cake", price: 8.00, category: "Dessert" },
        ];
    }

    init() {
        if (!document.getElementById('productGrid')) return;
        this.detectDevice();
        this.handleSplashScreen();
        this.renderProducts();
        this.renderCart();
        this.setupIdleDetection();
    }

    // --- DEMO / CINEMATIC MODE ---
    setupIdleDetection() {
        const reset = () => {
            if(this.isDemoActive) this.stopDemoMode();
            clearTimeout(this.idleTimer);
            this.idleTimer = setTimeout(() => this.startDemoMode(), this.idleTime);
        };
        ['mousemove','mousedown','touchstart','click','keypress','scroll'].forEach(e => window.addEventListener(e, reset));
    }

    startDemoMode() {
        if(!this.settings.setupDone) return;
        this.isDemoActive = true;
        
        // 1. Activate Visuals
        document.getElementById('demoOverlay').style.display = 'block';
        document.getElementById('demoOverlay').classList.add('demo-active');
        document.getElementById('cameraRig').classList.add('cinematic-active'); // Starts the tilt
        
        // 2. Start Commercial Text Loop (Windows 11 Style Reveal)
        const phrases = ["Effortless", "Fluid Design", "Cloud Ready", "Experience Nexus"];
        let i = 0;
        const hero = document.getElementById('heroText');
        
        const showPhrase = () => {
            hero.innerText = phrases[i];
            hero.style.animation = 'none';
            hero.offsetHeight; // trigger reflow
            hero.style.animation = 'revealText 4s forwards';
            i = (i + 1) % phrases.length;
        };
        showPhrase();
        this.demoInterval = setInterval(showPhrase, 4000);

        // 3. Start Ghost AI
        this.runGhostDemo();
    }

    runGhostDemo() {
        this.cart = []; this.renderCart(); this.filterCategory('All');
        
        // Ghost logic runs faster/smoother
        this.ghostInterval = setInterval(() => {
            const rand = Math.random();
            const cards = document.querySelectorAll('.product-card');
            
            if (rand < 0.7 && cards.length > 0) {
                // Click Item
                const card = cards[Math.floor(Math.random() * cards.length)];
                
                // Add class for visual 'pressed' state from CSS
                card.classList.add('ghost-active');
                setTimeout(() => card.classList.remove('ghost-active'), 200);
                
                // Add to cart logic
                const name = card.querySelector('.product-name').innerText;
                const product = this.products.find(p => p.name === name);
                if(product) this.addToCart(product.id);
                
            } else if (rand < 0.85) {
                // Switch Tab
                const tabs = document.querySelectorAll('.tab-btn');
                const tab = tabs[Math.floor(Math.random() * tabs.length)];
                // Visual feedback only, then trigger logic
                tab.style.transform = "scale(0.9)";
                setTimeout(() => tab.style.transform = "scale(1)", 200);
                tab.click();
            } else {
                // Checkout (reset)
                if(this.cart.length > 4) {
                    this.cart = []; this.renderCart();
                }
            }
        }, 800); // Fast, fluid interactions
    }

    stopDemoMode() {
        this.isDemoActive = false;
        document.getElementById('demoOverlay').style.display = 'none';
        document.getElementById('demoOverlay').classList.remove('demo-active');
        document.getElementById('cameraRig').classList.remove('cinematic-active'); // Stop tilt
        document.getElementById('cameraRig').style.transform = 'none'; // Snap back to flat
        
        clearInterval(this.demoInterval);
        clearInterval(this.ghostInterval);
        
        // Clean up ghost leftovers
        document.querySelectorAll('.ghost-active').forEach(el => el.classList.remove('ghost-active'));
        document.getElementById('customDialogOverlay').style.display = 'none';
    }

    // --- STANDARD POS LOGIC ---
    detectDevice() { this.isTouch = ('ontouchstart' in window); }
    
    handleSplashScreen() {
        const splash = document.getElementById('splashScreen');
        const loader = document.getElementById('splashLoader');
        const wizard = document.getElementById('setupWizard');
        
        if(!this.settings.setupDone) {
            setTimeout(() => { loader.style.display='none'; wizard.style.display='block'; }, 1000);
        } else {
            setTimeout(() => { splash.style.opacity='0'; setTimeout(()=>splash.style.display='none',500); }, 1000);
        }
    }

    finishSetup() {
        this.settings.setupDone = true;
        localStorage.setItem('nexus_settings', JSON.stringify(this.settings));
        location.reload();
    }

    renderProducts() {
        const grid = document.getElementById('productGrid');
        if(!grid) return;
        grid.innerHTML = '';
        const filtered = this.activeCategory === 'All' ? this.products : this.products.filter(p=>p.category===this.activeCategory);
        
        filtered.forEach(p => {
            const el = document.createElement('div');
            el.className = 'product-card';
            el.innerHTML = `<div class="product-name">${p.name}</div><div class="product-price">$${p.price.toFixed(2)}</div>`;
            
            const evt = this.isTouch ? 'touchstart' : 'mousedown';
            el.addEventListener(evt, (e) => {
                if(this.isTouch) e.preventDefault();
                this.addToCart(p.id);
            });
            grid.appendChild(el);
        });
    }

    filterCategory(cat) {
        this.activeCategory = cat;
        document.querySelectorAll('.tab-btn').forEach(b => {
            b.classList.toggle('active', b.innerText.includes(cat) || (cat==='All' && b.innerText.includes('All')));
        });
        this.renderProducts();
    }

    addToCart(id) {
        const p = this.products.find(x => x.id === id);
        const item = this.cart.find(x => x.id === id);
        if(item) item.qty++; else this.cart.push({...p, qty:1});
        this.renderCart();
    }

    renderCart() {
        const box = document.getElementById('cartItems');
        if(!box) return;
        box.innerHTML = '';
        let total = 0;
        this.cart.forEach(i => {
            total += i.price * i.qty;
            const row = document.createElement('div');
            row.className = 'cart-item';
            row.innerHTML = `<div><b>${i.name}</b><br><small>$${i.price}</small></div><div>x${i.qty}</div>`;
            box.appendChild(row);
        });
        document.getElementById('finalTotal').innerText = '$' + (total * 1.05).toFixed(2);
        document.getElementById('mobileTotal').innerText = '$' + (total * 1.05).toFixed(2);
    }
    
    toggleAdmin() { document.getElementById('adminModal').style.display = document.getElementById('adminModal').style.display === 'flex' ? 'none' : 'flex'; }
    toggleMobileCart() { /* No-op for demo visuals */ }
    addProduct() { /* Stub */ }
    processPayment() { if(!this.isDemoActive) alert("Payment Processed"); }
}

document.addEventListener('DOMContentLoaded', () => { window.app = new POS(); });
