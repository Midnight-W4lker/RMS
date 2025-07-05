from app import app, db, Product, Customer, Sale
from datetime import datetime, timedelta
import random

with app.app_context():
    # Generate 10 products
    products = []
    for i in range(1, 11):
        p = Product(
            product_id=f"{i:03}",
            name=f"Product {i}",
            description=f"Description for product {i}",
            price=round(random.uniform(10, 100), 2),
            stock_quantity=random.randint(10, 100),
        )
        products.append(p)
        db.session.add(p)

    # Generate 10 customers
    customers = []
    for i in range(1, 11):
        c = Customer(
            customer_id=f"{i:03}",
            name=f"Customer {i}",
            email=f"customer{i}@example.com",
        )
        customers.append(c)
        db.session.add(c)

    db.session.commit()

    # Generate 38 sales with varying dates in the past two months
    now = datetime.utcnow()
    sales = []
    for i in range(38):
        product = random.choice(products)
        customer = random.choice(customers)
        quantity = random.randint(1, 5)
        total_price = product.price * quantity
        sale_date = now - timedelta(days=random.randint(0, 60))
        s = Sale(
            product_id=product.product_id,
            customer_id=customer.customer_id,
            quantity=quantity,
            total_price=total_price,
            date=sale_date,
        )
        sales.append(s)
        db.session.add(s)

    db.session.commit()

    print("Database seeded with 10 products, 10 customers, and 38 sales.")
