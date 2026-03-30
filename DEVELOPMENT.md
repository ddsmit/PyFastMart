# DEVELOPMENT.md - Developer Guide

Welcome to PyFastMart development! This guide covers setup, customization, and development workflows.

## Prerequisites

- Python 3.10+
- [uv](https://github.com/astral-sh/uv) package manager
- A Stripe account (for payment processing)

### Installing uv

If you don't have `uv` installed:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

## Initial Setup

### 1. Install Dependencies

```bash
uv sync
```

### 2. Run the Setup Wizard

```bash
uv run pfm manage
```

The wizard will prompt for:
- **Business Information**: Name, title, description
- **Contact Details**: Email, phone number
- **Social Links**: Twitter/X, Instagram, Facebook URLs
- **Stripe API Keys**: Get these from https://dashboard.stripe.com/apikeys

After setup, two files will be created:
- `config.toml` - Your store configuration
- `.env` - Stripe secrets (never commit this!)

### 3. Create Products in Stripe

Products are managed entirely through Stripe:
1. Go to https://dashboard.stripe.com/products
2. Click "Add product"
3. Set the name, description, price, and optional image
4. Ensure the product status is "Active"

**Important**: Only active products with prices will appear in your store.

### 4. Start Development Server

```bash
uv run pfm serve
```

Your store will be available at http://localhost:8000

## Customization

### Editing Store Information

Re-run the setup wizard:
```bash
uv run pfm manage
```

Or edit `config.toml` directly:
```toml
[site]
name = "My Awesome Store"
title = "My Store - Best Products"
description = "Welcome to my store"
contact_email = "hello@mystore.com"
contact_phone = "+1234567890"

[site.socials]
twitter = "https://twitter.com/mystore"
instagram = "https://instagram.com/mystore"
facebook = "https://facebook.com/mystore"
```

### Styling

Edit `frontend/styles.css` to customize the look and feel.

#### CSS Variables

The theme uses CSS custom properties for easy customization:

```css
:root {
  /* Primary accent color */
  --color-primary: #3b82f6;
  
  /* Background colors */
  --color-bg: #ffffff;
  --color-surface: #f8fafc;
  
  /* Text colors */
  --color-text: #1e293b;
  --color-text-muted: #64748b;
  
  /* Utility colors */
  --color-border: #e2e8f0;
  --color-success: #22c55e;
  --color-error: #ef4444;
  
  /* Spacing scale */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  
  /* Border radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}
```

Dark mode is automatically supported based on system preferences and persisted in localStorage.

#### Common Styling Changes

**Change primary color:**
```css
:root {
  --color-primary: #8b5cf6; /* Purple */
}
```

**Change background:**
```css
:root {
  --color-bg: #fafafa;
  --color-surface: #ffffff;
}
```

**Adjust spacing:**
```css
:root {
  --space-lg: 2rem;
  --space-xl: 3rem;
}
```

### Editing Content

#### Store Name and Description
Edit `config.toml`:
```toml
[site]
name = "Your Store Name"
description = "Your store description"
```

#### Contact Information
Edit `config.toml`:
```toml
[site]
contact_email = "support@yourstore.com"
contact_phone = "+1234567890"
```

#### Footer Links
Edit `config.toml`:
```toml
[site.socials]
twitter = "https://twitter.com/yourstore"
instagram = "https://instagram.com/yourstore"
facebook = "https://facebook.com/yourstore"
```

### Changing Product Display

Product cards are rendered by JavaScript in `frontend/app.js`. The template structure is:
- Product image
- Product name
- Description
- Price
- Add to cart button

To adjust card styling, edit the CSS in `frontend/styles.css`.

## Development Server

### Running Locally

```bash
uv run pfm serve
```

Options:
```bash
uv run pfm serve --host 127.0.0.1 --port 3000
```

### Hot Reload

The development server auto-reloads when Python files change. For frontend changes, simply refresh your browser.

## Production Deployment

PyFastMart can be deployed to any platform that supports Python:

### Environment Variables

Set these in your deployment platform:
```
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...  # optional
```

### Recommended Platforms

- **Railway**: `uv run pfm serve`
- **Render**: Configure build command and start command
- **Fly.io**: Use a Dockerfile or fly.toml

### Static vs Dynamic

PyFastMart serves the frontend dynamically. For purely static hosting, you would need to pre-render the HTML and proxy API calls to a hosted instance.

## Troubleshooting

### Products not showing

1. Verify Stripe keys are correct in `.env`
2. Check that products are "Active" in Stripe dashboard
3. Ensure products have prices set
4. Check browser console for API errors

### Checkout not working

1. Verify Stripe secret key is correct
2. Ensure products have valid prices
3. Check Stripe mode matches your keys (test vs live)
4. For webhook issues, verify webhook secret

### Styling changes not applying

1. Clear browser cache (Ctrl+Shift+R / Cmd+Shift+R)
2. Check for JavaScript errors in console
3. Verify CSS syntax is valid

## File Structure Reference

```
PyFastMart/
├── pfm/                      # Python package (DO NOT MODIFY)
│   ├── __init__.py
│   ├── __main__.py          # CLI commands
│   ├── config.py            # Config loading
│   ├── main.py              # FastAPI app
│   └── stripe_client.py     # Stripe wrapper
├── frontend/                # Frontend assets (customize here)
│   ├── index.html           # Main page
│   ├── styles.css           # Styles
│   └── app.js               # Storefront JS
├── config.toml              # Store configuration
├── .env                     # Stripe secrets (gitignored)
├── pyproject.toml           # Dependencies
└── uv.lock                  # Locked dependencies
```

## Architecture Notes

- **Products**: Managed in Stripe dashboard, fetched via API
- **Payments**: Stripe Checkout handles all payment flows
- **No Database**: Stripe is the single source of truth
- **No Build Step**: Vanilla JS/CSS, served directly by FastAPI

## Stripe Is Required

PyFastMart is designed around Stripe as its **mandatory** backend. The application will not display products or process payments without valid Stripe API keys configured in the `.env` file.

### No Local or Static Catalog

This project does not support:
- Local product databases
- Static JSON product files
- Hardcoded product arrays in frontend code
- Demo mode or fallback modes

If you need a store without Stripe, this is not the right project for you. PyFastMart is intentionally minimal and Stripe-focused.

### Getting Started with Stripe

1. Create a free account at https://stripe.com
2. Go to https://dashboard.stripe.com/apikeys
3. Copy your test API keys (prefixed with `pk_test_` and `sk_test_`)
4. Run `uv run pfm manage` and enter the keys when prompted

Stripe test mode is free to use and does not require any payment information.

## Getting Help

- Stripe Documentation: https://stripe.com/docs
- FastAPI Documentation: https://fastapi.tiangolo.com/
- PyFastMart Issues: https://github.com/your-repo/issues
