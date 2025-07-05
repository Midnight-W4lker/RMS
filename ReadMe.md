# Retail Management System

A web-based application built with Flask for managing retail operations, including products, customers, sales, and analytics.

---

## Design System

### Typography

- **Font stack:** Uses Inter, Roboto, Segoe UI, Helvetica Neue, Arial, system-ui, sans-serif for a modern, readable, and accessible look.
- **Hierarchy:**
  - `h1` / `.h1`: 2.5rem, bold, tight line-height
  - `h2` / `.h2`: 2rem, bold
  - `h3` / `.h3`: 1.5rem, semi-bold
  - `body`: 1rem (16px), 1.5 line-height for readability
  - `label`, `input`, `button`: 1rem, matching font for accessibility

### Color Palette

| Name         | Variable                | Hex       | Usage                        |
|--------------|-------------------------|-----------|------------------------------|
| Primary      | `--color-primary`       | #23272f   | Main UI, buttons, navbar     |
| Primary Light| `--color-primary-light` | #3a3f47   | Button gradients, hover      |
| Secondary    | `--color-secondary`     | #6c63ff   | Secondary buttons, accents   |
| Accent       | `--color-accent`        | #ffd700   | Highlights, links, focus     |
| Success      | `--color-success`       | #2a9d8f   | Success toasts, badges       |
| Danger       | `--color-danger`        | #e76f51   | Error toasts, danger buttons |
| Warning      | `--color-warning`       | #f4a261   | Warnings, alerts             |
| Info         | `--color-info`          | #6c63ff   | Info toasts, badges          |
| Background   | `--color-bg`            | #f9f9fb   | App background               |
| Surface      | `--color-surface`       | #fff      | Cards, tables, forms         |
| Border       | `--color-border`        | #e0e0e0   | Card/table/form borders      |
| Text         | `--color-text`          | #23272f   | Main text                    |
| Muted        | `--color-muted`         | #adadad   | Disabled, muted text         |

### Spacing System

- All spacing is based on tokens:
  - `--space-1`: 0.5rem
  - `--space-2`: 1rem
  - `--space-3`: 1.5rem
  - `--space-4`: 2rem
  - `--space-5`: 3rem
  - `--space-6`: 4rem
- Use these for margin, padding, and grid gaps for consistent layout.

### Core Classes & Usage

- **Buttons:** `.btn`, `.btn--primary`, `.btn--secondary`, `.btn--danger`, `.btn--small`
  - Example: `<button class="btn btn--primary">Save</button>`
- **Cards:** `.card`, `.card__title`, `.card__content`
  - Example:

    ```html
    <div class="card">
      <h2 class="card__title">Title</h2>
      <div class="card__content">Content here</div>
    </div>

    ```

- **Forms:** `.form`, `.form-group`, `.form-label`, `.form-input`, `.form-textarea`
  - Example:
  
    ```html
    <form class="form">
      <div class="form-group">
        <label class="form-label" for="name">Name</label>
        <input class="form-input" id="name" name="name" required>
      </div>
    </form>

    ```

- **Tables:** `.table`, `.overflow-x-auto`, `.text-right`
  - Example:
  
    ```html
    <div class="overflow-x-auto">
      <table class="table">
        <thead>...</thead>
        <tbody>...</tbody>
      </table>
    </div>

    ```

- **Navbar:** `.navbar`, `.navbar__brand`, `.navbar__links`, `.navbar__hamburger`
  - Example:
  
    ```html
    <nav class="navbar">
      <div class="navbar__brand">Brand</div>
      <ul class="navbar__links">...</ul>
    </nav>
    ```

### Dark/Light Theme System

- All colors use CSS variables, making it easy to add dark mode:
  - Add a `[data-theme="dark"]` attribute to `<body>` and override variables for dark mode.
  - Example:
  
    ```css
    [data-theme="dark"] {
      --color-bg: #181a1b;
      --color-surface: #23272f;
      --color-text: #f4f4f4;
      --color-border: #444;
    }
    ```

- To toggle theme, add a button that sets `document.body.dataset.theme = 'dark'` or `''`.

---

## JS Utilities

- **showToast(message, type):**
  - Shows a toast notification at the bottom of the screen.
  - Types: `success`, `danger`, `info`, `warning`.
  - Example:
  
    ```js
    showToast('Product saved!', 'success');
    ```

- **confirmAction(message, onConfirm):**
  - Shows a confirmation dialog and runs `onConfirm` if accepted.
  - Example:
  
    ```js
    confirmAction('Delete this item?', () => { /* ... */ });
    ```

- **Navbar toggle:**
  - Responsive hamburger menu with ARIA attributes for accessibility.
  - Example: see `navbar.js` and `ui-utils.js`.
- **Theme toggle:**
  - Add a button to toggle `[data-theme="dark"]` on `<body>`.
  - Example:
  
    ```js
    document.getElementById('theme-toggle').onclick = () => {
      document.body.dataset.theme = document.body.dataset.theme === 'dark' ? '' : 'dark';
    };
    ```

---

## Adding New Pages & Components

- **New Pages:**
  - Extend `base.html`.
  - Use `<main class="container">` for standard pages or `<main class="reports-page">` for full-width reports.
  - Use `.card`, `.form`, `.table` classes for structure.
- **New Components:**
  - Add new CSS classes in `components.css` or `layout.css` following the BEM and token system.
  - Use existing tokens for color, spacing, and typography.
- **New Features (e.g., signup/login):**
  - Create a new template extending `base.html`.
  - Use `.form`, `.form-group`, `.btn` for structure and actions.
  - Add any new JS utilities to `ui-utils.js`.

---

## Usage Examples

- **Button:**
  
  ```html
  <button class="btn btn--primary">Save</button>
  <button class="btn btn--secondary">Cancel</button>
  ```

- **Card:**
  
  ```html
  <div class="card">
    <h2 class="card__title">Section</h2>
    <div class="card__content">...</div>
  </div>
  ```

- **Form:**
  
  ```html
  <form class="form">
    <div class="form-group">
      <label class="form-label" for="email">Email</label>
      <input class="form-input" id="email" name="email" required>
    </div>
    <button class="btn btn--primary">Submit</button>
  </form>
  ```

- **Table:**
  
  ```html
  <div class="overflow-x-auto">
    <table class="table">
      <thead>...</thead>
      <tbody>...</tbody>
    </table>
  </div>
  ```

---

## Setup & Usage

1. **Clone the repository and install dependencies:**

    ```sh
    pip install -r requirements.txt
    ```

2. **Set up the database:**
    - Initialize and upgrade migrations:

      ```sh
      flask db init
      flask db migrate -m "Initial migration"
      flask db upgrade
      ```

    - Or, for quick setup in development, use:

      ```python
      with app.app_context():
          db.create_all()
      ```

    - To seed the database with sample data:

      ```sh
      python seed_data.py
      ```

3. **Run the application:**

    ```sh
    flask run
    ```

    or

    ```sh
    python app.py
    ```

4. **Access the app:**  
   Open [http://localhost:5000](http://localhost:5000) in your browser.

---

## Customization

- **Add more analytics:** Extend the dashboard with additional charts or KPIs.
- **Enhance security:** Add authentication for admin/user roles.
- **Expand features:** Integrate inventory alerts, export reports, etc.
- **UI Tweaks:** Adjust CSS utility classes or layout as needed for your brand.

---

## License

This project is for educational purposes. Adapt and extend as needed for your use case.
