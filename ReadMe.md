---
noteId: "cb18405054ea11f082705dbc4ab14f8f"
tags: []

---

# Retail Management System

A web-based application built with Flask for managing retail operations, including products, customers, sales, and analytics.

---

## Features

- **Product Management:** Add, update, and list products with details like name, description, price, and stock.
- **Customer Management:** Register, update, and view customers.
- **Sales Processing:** Record sales transactions, automatically updating product stock and calculating total price.
- **Dashboard:** View dynamic analytics such as total customers, products, sales, and revenue.
- **Reports:** Access comprehensive reports on products, customers, and sales.
- **Responsive UI:** Modern, responsive navigation with a hamburger menu for mobile devices.

---

## Project Structure

```markdown

Retail Management System/
│
├──rms.db                   # SQLite database file
├── app.py                  # Main Flask application and routes
├── models.py               # SQLAlchemy models for Product, Customer, Sale
├── migrations/             # Flask-Migrate migration files
├── static/
│   ├── style.css           # CSS styles
│   └── navbar.js           # JS for responsive navigation
├── templates/
│   ├── base.html           # Base template
│   ├── index.html          # Dashboard/home page
│   ├── add_product.html
│   ├── list_products.html
│   ├── add_customer.html
│   ├── register_customer.html
│   ├── list_customers.html
│   ├── process_sale.html
│   ├── reports.html
│   └── update_customer.html
└── instance/
    └── rms.db         # SQLite database file
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

- **Add more analytics:** Extend the dashboard with charts or additional KPIs.
- **Enhance security:** Add authentication for admin/user roles.
- **Expand features:** Integrate inventory alerts, export reports, etc.

---

## License

This project is for educational purposes. Adapt and extend as needed for your use case.
