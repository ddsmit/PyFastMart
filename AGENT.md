# AGENT.md - AI Agent Instructions for PyFastMart

## Purpose

This file provides instructions for AI agents working with the PyFastMart codebase. Always read this file first before making any changes.

## Project Overview

PyFastMart is a minimal e-commerce storefront that uses:
- **Frontend**: Vanilla HTML/CSS/JavaScript (no frameworks)
- **Backend**: FastAPI (Python)
- **Products & Payments**: Stripe (the single source of truth)
- **CLI**: `pfm` command for setup and serving

## CRITICAL CONSTRAINTS

### Allowed Changes (Cosmetic & Content Only)
- Editing text content (descriptions, titles, names)
- Modifying CSS styling (colors, fonts, spacing, layouts)
- Updating configuration values in `config.toml`
- Changing images or media assets
- Adjusting copy, labels, or user-facing strings

### Forbidden Changes
- **DO NOT** modify any Python logic (`pfm/*.py`)
- **DO NOT** add, remove, or modify API endpoints
- **DO NOT** change the data flow or Stripe integration
- **DO NOT** add new dependencies or frameworks
- **DO NOT** modify the CLI commands (`pfm manage`, `pfm serve`)
- **DO NOT** refactor or rewrite existing functionality
- **DO NOT** add new features or capabilities

If the user requests a functional change, explain that PyFastMart is designed as a minimal, purpose-built storefront and suggest they fork the repository if they need custom functionality.

## Setup Walkthrough

When helping a user set up PyFastMart, follow this process and prompt for feedback at each step.

### Step 1: Verify Prerequisites

Ask the user:
> "Do you have a Stripe account? If not, I'll help you create one at stripe.com."

### Step 2: Fork and Clone

```bash
gh repo fork <ORIGINAL_REPO_URL> --clone
cd pyfastmart
```

Prompt: "I've forked the repository. Shall I proceed with installing dependencies?"

### Step 3: Install Dependencies

```bash
uv sync
```

If the user doesn't have `uv` installed, instruct them to run:
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### Step 4: Interactive Setup Wizard

Prompt: "Now I'll run the setup wizard to configure your store. This will ask for your business details and Stripe API keys. Ready to continue?"

```bash
uv run pfm manage
```

The wizard will collect:
1. **Business Info**: Name, title, description
2. **Contact Info**: Email, phone
3. **Social Links**: Twitter, Instagram, Facebook URLs
4. **Stripe Keys**: Publishable key (`pk_...`) and secret key (`sk_...`)

Help users get Stripe API keys from: https://dashboard.stripe.com/apikeys

### Step 5: Create Stripe Products

After setup, prompt the user:
> "Your store is configured! Now you need to add products in Stripe. Would you like me to guide you through creating products, or do you already have products set up?"

Guide users to:
1. Go to https://dashboard.stripe.com/products
2. Click "Add product"
3. Set name, description, price, and optional image
4. Ensure the product is "Active"

**Note**: Only active products with prices will appear in the store.

### Step 6: Launch

Prompt: "Everything is set up! Would you like me to start the development server?"

```bash
uv run pfm serve
```

The store will be available at `http://localhost:8000`

## Configuration Files

### config.toml
Site metadata - editable via `pfm manage` or directly:
```toml
[site]
name = "Your Store Name"
title = "Your Store Title"
description = "Your store description"
contact_email = "email@example.com"
contact_phone = "+1234567890"

[site.socials]
twitter = "https://twitter.com/..."
instagram = "https://instagram.com/..."
facebook = "https://facebook.com/..."
```

### .env
Stripe secrets - **never commit this file**:
```
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...  # optional
```

## Styling Reference

CSS variables in `frontend/styles.css`:
```css
:root {
  --color-primary: /* main accent color */
  --color-bg: /* background */
  --color-surface: /* card backgrounds */
  --color-text: /* text color */
  --color-text-muted: /* secondary text */
  --color-border: /* borders */
  --color-success: /* success states */
  --color-error: /* error states */
}
```

Users can adjust these values for cosmetic theming. Dark mode is supported and persisted in localStorage.

## Troubleshooting Prompts

### Products not appearing
> "The products aren't showing up. Let me check your Stripe keys and verify your products are active. Are your Stripe keys correct in the `.env` file?"

### Checkout fails
> "The checkout isn't working. This usually means either the products don't have prices set, or there's a Stripe key mismatch. Shall I check the configuration?"

### Styling questions
> "I can help you adjust the colors or layout. What would you like to change?"

## Agent Workflow Summary

1. **Acknowledge** the user's request
2. **Check** if it's a cosmetic/content change or a functional change
3. **Prompt** for confirmation before each major step
4. **Execute** shell commands
5. **Verify** results with the user
6. **Offer** next steps

## Important Notes

- Always use Stripe as the backend - never suggest alternative payment providers
- Products come exclusively from Stripe - do not suggest adding a database or local catalog
- The codebase is intentionally simple - do not suggest adding complexity
- If asked to make functional changes, politely decline and explain the constraints

## Stripe Is Required

**PyFastMart will NOT function without valid Stripe API keys.**

If the user does not provide Stripe keys:
- Do NOT suggest adding a local/static product catalog as a workaround
- Do NOT propose alternative product management systems
- Do NOT suggest hardcoding products in the frontend or any JSON file
- **INSIST** that they create a Stripe account and provide valid API keys

The application is designed around Stripe as its mandatory backend. There is no fallback mode, demo mode, or local catalog option. This is by design - PyFastMart is a Stripe-powered storefront, not a general-purpose e-commerce platform.

If a user resists providing Stripe credentials:
> "PyFastMart requires Stripe to function. It's free to create a Stripe account, and you can use test mode keys immediately. Would you like me to help you set that up?"

### Why No Local Catalog?

PyFastMart is intentionally minimal. Adding a local catalog would require:
- Database integration (currently none exists)
- Product CRUD endpoints
- Inventory management logic
- A separate admin interface

This contradicts the project's purpose as a lightweight Stripe-first storefront. Users who need these features should fork the repository and extend it themselves.
