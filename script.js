class POS {
    constructor() {
        this.cart = [];
        this.activeCategory = 'All';
        this.taxRate = 0.05;
        this.isTouch = false;
        
        // Demo Settings
        this.settings = { 
            storeName: "NEXUS POS", 
            tableCount: 10, 
            setupDone: false,
            language: "en",
            currency: "USD"
        };
        
        // Idle System
        this.idleTime = 40000; 
        this.idleTimer = null;
        this.demoInterval = null;
        this.ghostInterval = null;
        this.iconInterval = null;
        this.isDemoActive = false;
        
        this.ghostCartTotal = 0;

        try {
            const savedData = localStorage.getItem('nexus_products');
            this.products = savedData ? JSON.parse(savedData) : this.getDefaultProducts();
            const savedSettings = localStorage.getItem('nexus_settings');
            if(savedSettings) this.settings = JSON.parse(savedSettings);
        } catch (e) {
            this.products = this.getDefaultProducts();
        }
        
        this.init();
    }

    getDefaultProducts() {
        return [
            { id: 1, name: "Neon Burger", price: 12.50, category: "Food" },
            { id: 2, name: "Cyber Fries", price: 5.00, category: "Food" },
            { id: 3, name: "Quantum Cola", price: 3.50, category: "Drinks" },
            { id: 4, name: "Void Coffee", price: 4.00, category: "Drinks" },
            { id: 5, name: "Plasma Cake", price: 6.00, category: "Dessert" },
        ];
    }

    getCurrencySymbol() {
        const symbols = { 'USD': '$', 'PHP': '₱', 'EUR': '€', 'JPY': '¥' };
        return symbols[this.settings.currency] || '$';
    }

    init() {
        if (!document.getElementById('productGrid')) return;
        this.detectDevice();
        this.handleSplashScreen();
        this.renderProducts();
        this.renderCart();
        this.applySettings();
        this.setupIdleDetection();
    }
    
    setupIdleDetection() {
        const reset = () => this.resetIdleTimer();
        window.onload = reset;
        window.onmousemove = reset;
        window.onmousedown = reset; 
        window.ontouchstart = reset;
        window.onclick = reset;
        window.onkeypress = reset;
        window.addEventListener('scroll', reset, true); 
    }

    resetIdleTimer() {
        if(this.isDemoActive) return; 
        clearTimeout(this.idleTimer);
        this.idleTimer = setTimeout(() => this.startDemoMode(), this.idleTime);
    }

    startDemoMode() {
        if(this.settings.setupDone === false) return; 
        this.isDemoActive = true;
        const overlay = document.getElementById('demoOverlay');
        overlay.style.display = 'flex';
        
        // Initialize Commercial Text Loop
        this.startTextLoop();

        // SCENE CONTROLLER: Switch between Ghost App and Icon Ballet every 8 seconds
        let sceneToggle = false;
        
        const switchScene = () => {
            if(!this.isDemoActive) return;

            if(!sceneToggle) {
                // SCENE 1: GHOST APP
                document.getElementById('demoIconStage').classList.remove('active');
                document.getElementById('demoSimulation').style.opacity = '0.6';
                this.stopIconBallet();
                this.startGhostApp();
            } else {
                // SCENE 2: ICON BALLET
                document.getElementById('demoSimulation').style.opacity = '0'; // Hide app
                document.getElementById('demoIconStage').classList.add('active');
                clearInterval(this.ghostInterval); // Pause ghost
                this.startIconBallet();
            }
            sceneToggle = !sceneToggle;
        };

        // Run Scene 1 immediately, then loop
        switchScene(); 
        this.demoInterval = setInterval(switchScene, 8000); 
    }

    startTextLoop() {
        const features = [
            { main: "ULTRA FAST", sub: "Instant Touch Response" },
            { main: "3D UI", sub: "Immersive Experience" },
            { main: "CLOUD SYNC", sub: "Real-time Data" },
            { main: "SATISFYING", sub: "Tactile Physics" }
        ];
        let i = 0;
        const mainText = document.getElementById('demoFeatureText');
        const subText = document.getElementById('demoSubText');
        
        mainText.innerText = features[0].main;
        subText.innerText = features[0].sub;
        
        // Loop text separately from scenes
        setInterval(() => {
            if(!this.isDemoActive) return;
            i = (i + 1) % features.length;
            mainText.style.opacity = 0;
            setTimeout(() => {
                mainText.innerText = features[i].main;
                subText.innerText = features[i].sub;
                mainText.style.opacity = 1;
                mainText.style.animation = 'none';
                mainText.offsetHeight; 
                mainText.style.animation = 'slideUpFade 0.8s ease-out';
            }, 200);
        }, 4000);
    }

    // --- SCENE 1: GHOST APP ---
    startGhostApp() {
        const appContent = document.querySelector('.app-container').innerHTML;
        const simulationContainer = document.getElementById('demoSimulation');
        simulationContainer.innerHTML = appContent;
        
        const simCartItems = simulationContainer.querySelector('.cart-items');
        if(simCartItems) simCartItems.innerHTML = '';
        this.ghostCartTotal = 0;
        this.updateFakeTotal(0);

        this.ghostInterval = setInterval(() => {
            const rand = Math.random();
            const cards = simulationContainer.querySelectorAll('.product-card');
            
            if (rand < 0.7 && cards.length > 0) {
                const randomCard = cards[Math.floor(Math.random() * cards.length)];
                randomCard.style.transform = 'scale(0.95)';
                randomCard.style.boxShadow = 'var(--shadow-in)';
                
                const name = randomCard.querySelector('.product-name').innerText;
                const priceTxt = randomCard.querySelector('.product-price').innerText;
                const price = parseFloat(priceTxt.replace(/[^0-9.]/g, ''));
                this.addFakeItemToDemo(name, price);
                
                setTimeout(() => { randomCard.style.transform = ''; randomCard.style.boxShadow = ''; }, 150);
            } else if (rand < 0.9) {
                const tabs = simulationContainer.querySelectorAll('.tab-btn');
                const randomTab = tabs[Math.floor(Math.random() * tabs.length)];
                tabs.forEach(t => t.classList.remove('active'));
                randomTab.classList.add('active');
            } else {
                const cart = simulationContainer.querySelector('.cart-items');
                if(cart && cart.children.length > 3) { cart.innerHTML = ''; this.ghostCartTotal = 0; this.updateFakeTotal(0); }
            }
        }, 1200); 
    }

    // --- SCENE 2: ICON BALLET ---
    startIconBallet() {
        const icons = [
            document.getElementById('dIcon1'),
            document.getElementById('dIcon2'),
            document.getElementById('dIcon3'),
            document.getElementById('dIcon4')
        ];
        const payBtn = document.getElementById('dPayBtn');
        let beat = 0;

        this.iconInterval = setInterval(() => {
            // Rhythmic Wave: 1, 2, 3, 4, Big Button
            if (beat < 4) {
                // Pulse icon
                const icon = icons[beat];
                icon.classList.add('press');
                setTimeout(() => icon.classList.remove('press'), 300);
            } else if (beat === 4) {
                // Pulse Big Button
                payBtn.style.transform = 'scale(0.9)';
                payBtn.style.boxShadow = 'inset 0 0 20px rgba(0,0,0,0.5)';
                setTimeout(() => {
                     payBtn.style.transform = 'scale(1)';
                     payBtn.style.boxShadow = '';
                }, 300);
            }
            
            beat = (beat + 1) % 6; // 6 beats total (1 pause at end)
        }, 600); // 600ms rhythm
    }

    stopIconBallet() {
        clearInterval(this.iconInterval);
    }

    addFakeItemToDemo(name, price) {
        const demoContainer = document.getElementById('demoSimulation');
        const simCartItems = demoContainer.querySelector('.cart-items');
        const sym = this.getCurrencySymbol();
        if(!simCartItems) return;

        const el = document.createElement('div');
        el.className = 'cart-item';
        el.innerHTML = `<div class="item-info"><h4>${name}</h4><p>${sym}${price.toFixed(2)}</p></div><div>1</div>`;
        simCartItems.appendChild(el);
        this.ghostCartTotal += price;
        this.updateFakeTotal(this.ghostCartTotal);
    }

    updateFakeTotal(amount) {
        const demoContainer = document.getElementById('demoSimulation');
        const totalEl = demoContainer.querySelector('#finalTotal');
        const mobileEl = demoContainer.querySelector('#mobileTotal');
        const subTotalEl = demoContainer.querySelector('#subTotal');
        const sym = this.getCurrencySymbol();
        const str = sym + (amount * 1.05).toFixed(2);
        
        if(totalEl) totalEl.innerText = str;
        if(mobileEl) mobileEl.innerText = str;
        if(subTotalEl) subTotalEl.innerText = sym + amount.toFixed(2);
    }

    stopDemoMode() {
        this.isDemoActive = false;
        document.getElementById('demoOverlay').style.display = 'none';
        document.getElementById('demoSimulation').innerHTML = '';
        
        // Stop all loops
        clearInterval(this.demoInterval); // Scene switcher
        clearInterval(this.ghostInterval); // Ghost app
        this.stopIconBallet(); // Icon ballet
        
        // Clean up global text loop (it uses setInterval but we need reference, simplistic approach: reload page or use flag)
        // Since we check `this.isDemoActive` inside text loop, it will stop logically.

        this.resetIdleTimer();
    }

    // --- STANDARD LOGIC ---
    detectDevice() {
        this.isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    }

    nextStep(stepNumber) {
        document.querySelectorAll('.wizard-step').forEach(el => el.classList.remove('active'));
        document.getElementById(`step${stepNumber}`).classList.add('active');
    }

    handleSplashScreen() {
        const splash = document.getElementById('splashScreen');
        const loader = document.getElementById('splashLoader');
        const text = document.getElementById('splashText');
        const wizard = document.getElementById('setupWizard');

        if (!this.settings.setupDone) {
            setTimeout(() => {
                loader.style.display = 'none';
                text.style.display = 'none';
                wizard.style.display = 'block';
            }, 1000);
        } else {
            setTimeout(() => {
                splash.style.opacity = '0';
                setTimeout(() => splash.style.display = 'none', 500);
            }, 1500); 
        }
    }

    finishSetup() {
        const name = document.getElementById('setupStoreName').value;
        const tables = parseInt(document.getElementById('setupTableCount').value);
        const lang = document.getElementById('setupLang').value;
        const region = document.getElementById('setupRegion').value;

        if(name && tables > 0) {
            this.settings.storeName = name;
            this.settings.tableCount = tables;
            this.settings.language = lang;
            this.settings.currency = region;
            this.settings.setupDone = true;
            this.saveData(); 
            location.reload();
        } else {
            this.show3DDialog("Error", "Please complete all fields.", "alert");
        }
    }

    show3DDialog(title, message, type, onConfirm) {
        const overlay = document.getElementById('customDialogOverlay');
        const box = document.getElementById('customDialogBox');
        const titleEl = document.getElementById('dialogTitle');
        const msgEl = document.getElementById('dialogMessage');
        const btnsEl = document.getElementById('dialogBtns');

        titleEl.innerText = title;
        msgEl.innerText = message;
        btnsEl.innerHTML = '';

        const closeDialog = () => { overlay.style.display = 'none'; };

        if (type === 'confirm') {
            const btnCancel = document.createElement('button');
            btnCancel.className = 'btn-secondary';
            btnCancel.innerText = 'Cancel';
            btnCancel.onclick = closeDialog;
            
            const btnOk = document.createElement('button');
            btnOk.className = 'pay-btn';
            btnOk.innerText = 'Confirm';
            btnOk.style.margin = '0';
            btnOk.onclick = () => { closeDialog(); if(onConfirm) onConfirm(); };
            
            btnsEl.appendChild(btnCancel);
            btnsEl.appendChild(btnOk);
        } else {
            const btnOk = document.createElement('button');
            btnOk.className = 'pay-btn';
            btnOk.innerText = 'OK';
            btnOk.style.margin = '0';
            btnOk.onclick = closeDialog;
            btnsEl.appendChild(btnOk);
        }

        overlay.style.display = 'flex';
        box.style.animation = 'none';
        box.offsetHeight; 
        box.style.animation = 'dialogPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    }

    applySettings() {
        if(this.settings.storeName) {
            document.getElementById('brandName').innerHTML = this.settings.storeName;
            document.getElementById('storeSubtitle').innerText = `${this.settings.currency} DEMO UNIT`;
        }
        const selector = document.getElementById('tableSelector');
        selector.innerHTML = '<option value="0">Select Table...</option>';
        for(let i=1; i<=this.settings.tableCount; i++) {
            const opt = document.createElement('option');
            opt.value = i; opt.innerText = `Table ${i}`;
            selector.appendChild(opt);
        }
    }

    saveData() {
        localStorage.setItem('nexus_products', JSON.stringify(this.products));
        localStorage.setItem('nexus_settings', JSON.stringify(this.settings));
    }

    resetSystem() {
        this.show3DDialog("Factory Reset", "Wipe all data?", "confirm", () => {
            localStorage.clear();
            location.reload();
        });
    }

    renderProducts() {
        const grid = document.getElementById('productGrid');
        if (!grid) return;
        grid.innerHTML = '';
        const sym = this.getCurrencySymbol();
        
        const filtered = this.activeCategory === 'All' ? this.products : this.products.filter(p => p.category === this.activeCategory);

        filtered.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            const eventType = this.isTouch ? 'touchstart' : 'mousedown';
            
            card.innerHTML = `
                <div>
                    <div class="product-name">${product.name}</div>
                    <div class="product-stock">${product.category}</div>
                </div>
                <div class="product-price">${sym}${product.price.toFixed(2)}</div>
            `;
            
            card.addEventListener(eventType, (e) => {
                if(this.isTouch) e.preventDefault(); 
                this.addToCart(product.id);
            });
            grid.appendChild(card);
        });
    }

    filterCategory(category) {
        this.activeCategory = category;
        document.querySelectorAll('.tab-btn').forEach(t => {
            t.classList.remove('active');
            if(t.textContent.includes(category) || (category === 'All' && t.textContent.includes('All'))) {
                t.classList.add('active');
            }
        });
        this.renderProducts();
    }

    addToCart(id) {
        const product = this.products.find(p => p.id === id);
        const existingItem = this.cart.find(i => i.id === id);
        if (existingItem) existingItem.qty++;
        else this.cart.push({ ...product, qty: 1 });
        this.renderCart();
    }

    updateQty(id, change) {
        const item = this.cart.find(i => i.id === id);
        if (!item) return;
        item.qty += change;
        if (item.qty <= 0) this.cart = this.cart.filter(i => i.id !== id);
        this.renderCart();
    }

    renderCart() {
        const container = document.getElementById('cartItems');
        const subTotalEl = document.getElementById('subTotal');
        const taxEl = document.getElementById('taxAmount');
        const totalEl = document.getElementById('finalTotal');
        const mobileTotal = document.getElementById('mobileTotal');
        const sym = this.getCurrencySymbol();

        if (!container) return;
        container.innerHTML = '';
        
        if (this.cart.length === 0) {
            container.innerHTML = `<div style="text-align:center; color:var(--text-muted); margin-top:50px; opacity:0.5;">Cart Empty</div>`;
            subTotalEl.innerText = `${sym}0.00`; taxEl.innerText = `${sym}0.00`; totalEl.innerText = `${sym}0.00`; mobileTotal.innerText = `${sym}0.00`;
            return;
        }

        let subTotal = 0;
        this.cart.forEach(item => {
            subTotal += item.price * item.qty;
            const el = document.createElement('div');
            el.className = 'cart-item';
            el.innerHTML = `
                <div class="item-info"><h4>${item.name}</h4><p>${sym}${item.price.toFixed(2)} x ${item.qty}</p></div>
                <div style="display:flex; gap:10px; align-items:center;">
                    <button class="qty-btn" onclick="window.app.updateQty(${item.id}, -1)">-</button>
                    <span style="font-weight:bold; min-width:20px; text-align:center;">${item.qty}</span>
                    <button class="qty-btn" onclick="window.app.updateQty(${item.id}, 1)">+</button>
                </div>
            `;
            container.appendChild(el);
        });

        const tax = subTotal * this.taxRate;
        const total = subTotal + tax;
        subTotalEl.innerText = `${sym}${subTotal.toFixed(2)}`;
        taxEl.innerText = `${sym}${tax.toFixed(2)}`;
        totalEl.innerText = `${sym}${total.toFixed(2)}`;
        mobileTotal.innerText = `${sym}${total.toFixed(2)}`;
    }

    toggleAdmin() { document.getElementById('adminModal').classList.toggle('active'); }
    toggleMobileCart() { if(window.innerWidth <= 768) document.getElementById('cartPanel').classList.toggle('expanded'); }

    addProduct() {
        const name = document.getElementById('newProdName').value;
        const price = parseFloat(document.getElementById('newProdPrice').value);
        const cat = document.getElementById('newProdCat').value;
        if(name && price) {
            this.products.push({ id: Date.now(), name, price, category: cat });
            this.saveData(); this.renderProducts(); this.toggleAdmin();
            document.getElementById('newProdName').value = ''; document.getElementById('newProdPrice').value = '';
        } else {
            this.show3DDialog("Missing Info", "Enter valid name and price.", "alert");
        }
    }

    processPayment() {
        if(this.cart.length === 0) return this.show3DDialog("Empty", "Cart is empty!", "alert");
        const table = document.getElementById('tableSelector').value;
        if(table === "0") return this.show3DDialog("Table Required", "Select a Table", "alert");
        const total = document.getElementById('finalTotal').innerText;
        
        this.show3DDialog("Confirm Payment", `Process ${total} for Table ${table}?`, "confirm", () => {
            this.show3DDialog("Success", `Sent to Kitchen (Table ${table}).`, "alert");
            this.cart = []; this.renderCart();
            document.getElementById('tableSelector').value = "0";
            document.getElementById('cartPanel').classList.remove('expanded');
        });
    }
}

document.addEventListener('DOMContentLoaded', () => { window.app = new POS(); });
