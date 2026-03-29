# PyFastMart - Agent Setup Guide

This document provides instructions for an AI agent to help a user set up PyFastMart.

## Prerequisites

The agent should:
1. Have access to a Stripe account (or help the user create one)
2. Be able to execute shell commands (`uv`, `python`)
3. Have write access to a git repository

## Setup Process

### Step 1: Fork the Repository

```bash
gh repo fork <original-repo-url> --clone
cd pyfastmart
```

### Step 2: Install Dependencies

```bash
uv sync
```

### Step 3: Run the Setup Wizard

```bash
uv run pfm manage
```

The wizard will guide the user through:

1. **Business Information**
   - Business name (displayed in header)
   - Store title (browser tab title)
   - Store description

2. **Contact Information**
   - Email address
   - Phone number

3. **Social Links**
   - Twitter/X URL
   - Instagram URL
   - Facebook URL

4. **Stripe Configuration**
   - Publishable key (pk_test_...)
   - Secret key (sk_test_...)
   
   Help the user get these from https://dashboard.stripe.com/apikeys

### Step 4: Create Stripe Products

The agent should guide the user to create products in their Stripe dashboard:

1. Go to https://dashboard.stripe.com/products
2. Click "Add product"
3. Fill in:
   - Name
   - Description (can include tags like "new", "sale", "featured")
   - Price
   - Image (optional)
4. Repeat for all products

### Step 5: Run Locally

```bash
uv run pfm serve
```

The site will be available at http://localhost:8000

## Customization Guide

The agent can help customize:

### Content Changes
- Edit `config.toml` directly
- Or run `pfm manage` again

### Styling Changes
- Edit `frontend/styles.css`
- CSS variables for easy theming:
  - `--color-primary` - Main accent color
  - `--color-bg` - Background color
  - `--color-text` - Text color

### Adding Features
- The code is intentionally simple for easy modification
- Components use semantic HTML for accessibility
- JavaScript is vanilla (no frameworks)

## Troubleshooting

### Products not showing
- Check Stripe keys are correct in `.env`
- Verify products are "active" in Stripe dashboard
- Check browser console for API errors

### Checkout not working
- Ensure products have prices set
- Verify webhook secret if using webhooks
- Check Stripe mode (test vs live)

### Styling issues
- Clear browser cache
- Check for JavaScript errors
- Verify CSS variables are supported
