(function() {
    'use strict';

    let siteData = null;
    let products = [];
    let cart = [];
    let activeTags = new Set();

    const state = {
        search: '',
        sort: 'name-asc',
    };

    async function init() {
        await loadSiteData();
        await loadProducts();
        setupThemeToggle();
        setupEventListeners();
        applyTheme();
    }

    async function loadSiteData() {
        try {
            const res = await fetch('/api/site');
            siteData = await res.json();
            renderSiteInfo();
        } catch (e) {
            console.error('Failed to load site data:', e);
        }
    }

    function renderSiteInfo() {
        if (!siteData) return;
        
        document.title = siteData.title;
        document.getElementById('store-title').textContent = siteData.title;
        document.getElementById('store-description').textContent = siteData.description;
        
        const emailEl = document.getElementById('contact-email');
        const phoneEl = document.getElementById('contact-phone');
        const socialsEl = document.getElementById('social-links');
        
        if (siteData.contact.email) {
            emailEl.innerHTML = `<a href="mailto:${siteData.contact.email}">${siteData.contact.email}</a>`;
        }
        
        if (siteData.contact.phone) {
            phoneEl.innerHTML = `<a href="tel:${siteData.contact.phone}">${siteData.contact.phone}</a>`;
        }
        
        if (siteData.contact.socials) {
            const socialNames = { twitter: 'Twitter', instagram: 'Instagram', facebook: 'Facebook' };
            for (const [key, url] of Object.entries(siteData.contact.socials)) {
                if (url) {
                    const a = document.createElement('a');
                    a.href = url;
                    a.target = '_blank';
                    a.rel = 'noopener noreferrer';
                    a.textContent = socialNames[key] || key;
                    socialsEl.appendChild(a);
                }
            }
        }
    }

    async function loadProducts() {
        try {
            const res = await fetch('/api/products');
            products = await res.json();
            renderProducts();
            renderTags();
        } catch (e) {
            console.error('Failed to load products:', e);
            document.getElementById('products-grid').innerHTML = 
                '<p class="error">Failed to load products. Please try again later.</p>';
        }
    }

    function renderProducts() {
        const grid = document.getElementById('products-grid');
        let filtered = filterProducts();
        filtered = sortProducts(filtered);
        
        if (filtered.length === 0) {
            grid.innerHTML = '<p class="loading">No products match your search.</p>';
            return;
        }
        
        grid.innerHTML = filtered.map(product => {
            const inCart = cart.some(item => item.id === product.id);
            return `
            <article class="product-card" data-id="${product.id}">
                ${product.image ? `<img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy">` : ''}
                <div class="product-info">
                    <h3 class="product-name">${escapeHtml(product.name)}</h3>
                    <p class="product-description">${escapeHtml(product.description)}</p>
                    <p class="product-price">${formatPrice(product.price, product.currency)}</p>
                    <div class="product-actions">
                        <button class="btn ${inCart ? 'btn-danger' : 'btn-primary'}" onclick="${inCart ? `removeFromCart('${product.id}')` : `addToCart('${product.id}')`}">
                            ${inCart ? 'Remove' : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            </article>
        `}).join('');
    }

    function filterProducts() {
        let filtered = products;
        
        if (state.search) {
            const search = state.search.toLowerCase();
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(search) || 
                p.description.toLowerCase().includes(search)
            );
        }
        
        if (activeTags.size > 0) {
            filtered = filtered.filter(p => {
                const desc = p.description.toLowerCase();
                return Array.from(activeTags).some(tag => desc.includes(tag.toLowerCase()));
            });
        }
        
        return filtered;
    }

    function sortProducts(items) {
        const sorted = [...items];
        switch (state.sort) {
            case 'name-asc':
                return sorted.sort((a, b) => a.name.localeCompare(b.name));
            case 'name-desc':
                return sorted.sort((a, b) => b.name.localeCompare(a.name));
            case 'price-asc':
                return sorted.sort((a, b) => a.price - b.price);
            case 'price-desc':
                return sorted.sort((a, b) => b.price - a.price);
            default:
                return sorted;
        }
    }

    function renderTags() {
        const container = document.getElementById('tags-container');
        const tags = extractTags();
        
        container.innerHTML = tags.map(tag => `
            <button class="tag ${activeTags.has(tag) ? 'active' : ''}" data-tag="${escapeHtml(tag)}">
                ${escapeHtml(tag)}
            </button>
        `).join('');
        
        container.querySelectorAll('.tag').forEach(btn => {
            btn.addEventListener('click', () => {
                const tag = btn.dataset.tag;
                if (activeTags.has(tag)) {
                    activeTags.delete(tag);
                } else {
                    activeTags.add(tag);
                }
                renderTags();
                renderProducts();
            });
        });
    }

    function extractTags() {
        const tagSet = new Set();
        const tagPatterns = ['new', 'sale', 'popular', 'limited', 'featured', 'bestseller'];
        
        products.forEach(p => {
            const desc = p.description.toLowerCase();
            tagPatterns.forEach(pattern => {
                if (desc.includes(pattern)) {
                    tagSet.add(pattern);
                }
            });
        });
        
        return Array.from(tagSet).sort();
    }

    function addToCart(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        
        if (cart.some(item => item.id === productId)) return;
        
        cart.push({ ...product });
        updateCartUI();
        renderProducts();
    }

    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        updateCartUI();
        renderProducts();
    }

    function updateCartUI() {
        const cartItems = document.getElementById('cart-items');
        const cartCount = document.getElementById('cart-count');
        const cartTotal = document.getElementById('cart-total');
        const checkoutBtn = document.getElementById('checkout-btn');
        
        if (cart.length > 0) {
            cartCount.textContent = cart.length;
            cartCount.hidden = false;
            checkoutBtn.disabled = false;
        } else {
            cartCount.hidden = true;
            checkoutBtn.disabled = true;
        }
        
        if (cart.length === 0) {
            cartItems.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--color-text-secondary);">Your cart is empty</p>';
            cartTotal.textContent = formatPrice(0, 'usd');
            return;
        }
        
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                ${item.image ? `<img class="cart-item-image" src="${item.image}" alt="${item.name}">` : ''}
                <div class="cart-item-info">
                    <p class="cart-item-name">${escapeHtml(item.name)}</p>
                    <p class="cart-item-price">${formatPrice(item.price, item.currency)}</p>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart('${item.id}')" aria-label="Remove item">&times;</button>
            </div>
        `).join('');
        
        const total = cart.reduce((sum, item) => sum + item.price, 0);
        cartTotal.textContent = formatPrice(total, cart[0]?.currency || 'usd');
    }

    async function checkout() {
        if (cart.length === 0) return;
        
        const checkoutBtn = document.getElementById('checkout-btn');
        checkoutBtn.disabled = true;
        checkoutBtn.textContent = 'Processing...';
        
        try {
            const items = cart.map(item => ({
                price_id: item.id,
                quantity: 1,
            }));
            
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items }),
            });
            
            const data = await res.json();
            
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No checkout URL returned');
            }
        } catch (e) {
            console.error('Checkout failed:', e);
            alert('Checkout failed. Please try again.');
            checkoutBtn.disabled = false;
            checkoutBtn.textContent = 'Checkout';
        }
    }

    function setupEventListeners() {
        document.getElementById('search-input').addEventListener('input', (e) => {
            state.search = e.target.value;
            renderProducts();
        });
        
        document.getElementById('sort-select').addEventListener('change', (e) => {
            state.sort = e.target.value;
            renderProducts();
        });
        
        document.getElementById('cart-toggle').addEventListener('click', openCart);
        document.getElementById('cart-close').addEventListener('click', closeCart);
        document.getElementById('overlay').addEventListener('click', closeCart);
        document.getElementById('checkout-btn').addEventListener('click', checkout);
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeCart();
        });
    }

    function openCart() {
        document.getElementById('cart-popover').classList.remove('hidden');
        document.getElementById('overlay').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeCart() {
        document.getElementById('cart-popover').classList.add('hidden');
        document.getElementById('overlay').classList.add('hidden');
        document.body.style.overflow = '';
    }

    function setupThemeToggle() {
        const existing = document.querySelector('.theme-toggle');
        if (existing) existing.remove();
        
        const btn = document.createElement('button');
        btn.className = 'theme-toggle';
        btn.textContent = document.documentElement.dataset.theme === 'dark' ? 'Light Mode' : 'Dark Mode';
        btn.addEventListener('click', toggleTheme);
        document.body.appendChild(btn);
    }

    function toggleTheme() {
        const isDark = document.documentElement.dataset.theme === 'dark';
        document.documentElement.dataset.theme = isDark ? 'light' : 'dark';
        localStorage.setItem('theme', document.documentElement.dataset.theme);
        document.querySelector('.theme-toggle').textContent = isDark ? 'Dark Mode' : 'Light Mode';
    }

    function applyTheme() {
        const saved = localStorage.getItem('theme');
        if (saved) {
            document.documentElement.dataset.theme = saved;
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.dataset.theme = 'dark';
        }
    }

    function formatPrice(cents, currency) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase(),
        }).format(cents / 100);
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    window.addToCart = addToCart;
    window.removeFromCart = removeFromCart;
    window.closeCart = closeCart;
    
    init();
})();
