from flask import Flask, render_template, request, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from models import Product, Customer, Sale, db
from sqlalchemy import func

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///rms.db"
db = SQLAlchemy(app)
migrate = Migrate(app, db)


class Product(db.Model):
    product_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200), nullable=False)
    price = db.Column(db.Float, nullable=False)
    stock_quantity = db.Column(db.Integer, nullable=False)
    sales = db.relationship("Sale", back_populates="product")


class Customer(db.Model):
    customer_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    sales = db.relationship("Sale", back_populates="customer")


class Sale(db.Model):
    sale_id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(
        db.Integer, db.ForeignKey("product.product_id"), nullable=False
    )
    customer_id = db.Column(
        db.Integer, db.ForeignKey("customer.customer_id"), nullable=False
    )
    quantity = db.Column(db.Integer, nullable=False)
    total_price = db.Column(db.Float, nullable=False)

    product = db.relationship("Product", back_populates="sales")
    customer = db.relationship("Customer", back_populates="sales")


@app.route("/")
def index():
    total_customers = Customer.query.count()
    total_products = Product.query.count()
    total_sales = Sale.query.count()
    total_revenue = db.session.query(func.sum(Sale.total_price)).scalar() or 0
    return render_template(
        "index.html",
        total_customers=total_customers,
        total_products=total_products,
        total_sales=total_sales,
        total_revenue=total_revenue,
    )


@app.route("/add_product", methods=["GET", "POST"])
def add_product():
    if request.method == "POST":
        name = request.form["name"]
        description = request.form["description"]
        price = float(request.form["price"])
        stock_quantity = int(request.form["stock_quantity"])
        new_product = Product(
            name=name,
            description=description,
            price=price,
            stock_quantity=stock_quantity,
        )
        db.session.add(new_product)
        db.session.commit()
        return redirect(url_for("list_products"))
    return render_template("add_product.html")


@app.route("/update_product/<int:product_id>", methods=["GET", "POST"])
def update_product(product_id):
    product = Product.query.get_or_404(product_id)
    if request.method == "POST":
        product.name = request.form["name"]
        product.price = request.form["price"]
        product.quantity = request.form["quantity"]
        db.session.commit()
        return redirect(url_for("list_products"))
    return render_template("update_product.html", product=product)


@app.route("/list_products")
def list_products():
    products = Product.query.all()
    return render_template("list_products.html", products=products)


@app.route("/add_customer", methods=["GET", "POST"])
def add_customer():
    if request.method == "POST":
        name = request.form["name"]
        email = request.form["email"]
        new_customer = Customer(name=name, email=email)
        db.session.add(new_customer)
        db.session.commit()
        return redirect(url_for("list_customers"))
    return render_template("add_customer.html")


# Example registration route
@app.route("/register_customer", methods=["GET", "POST"])
def register_customer():
    if request.method == "POST":
        name = request.form["name"]
        email = request.form["email"]
        # ...other fields...
        new_customer = Customer(name=name, email=email)
        db.session.add(new_customer)
        db.session.commit()
        return redirect(url_for("list_customers"))
    return render_template("register_customer.html")


@app.route("/list_customers")
def list_customers():
    customers = Customer.query.all()  # or your ORM logic
    return render_template("list_customers.html", customers=customers)


@app.route("/process_sale", methods=["GET", "POST"])
def process_sale():
    if request.method == "POST":
        product_id = request.form["product_id"]
        customer_id = request.form["customer_id"]
        quantity = int(request.form["quantity"])

        product = Product.query.filter_by(product_id=product_id).first()
        customer = Customer.query.filter_by(customer_id=customer_id).first()

        if product is None:
            return "Product not found", 404
        if customer is None:
            return "Customer not found", 404

        total_price = product.price * quantity

        sale = Sale(
            product_id=product_id,
            customer_id=customer_id,
            quantity=quantity,
            total_price=total_price,
        )
        db.session.add(sale)
        db.session.commit()
        return redirect(url_for("dashboard"))

    products = Product.query.all()
    customers = Customer.query.all()
    return render_template("process_sale.html", products=products, customers=customers)


@app.route("/reports")
def reports():
    products = Product.query.all()
    customers = Customer.query.all()
    sales = Sale.query.all()
    return render_template(
        "reports.html", products=products, customers=customers, sales=sales
    )


@app.route("/update_customer/<int:customer_id>", methods=["GET", "POST"])
def update_customer(customer_id):
    customer = Customer.query.get_or_404(customer_id)
    if request.method == "POST":
        customer.name = request.form["name"]
        customer.email = request.form["email"]
        db.session.commit()
        return redirect(url_for("list_customers"))
    return render_template("update_customer.html", customer=customer)


@app.route("/dashboard")
def dashboard():
    total_customers = Customer.query.count()
    total_products = Product.query.count()
    total_sales = Sale.query.count()
    total_revenue = db.session.query(db.func.sum(Sale.total_price)).scalar() or 0
    return render_template(
        "dashboard.html",
        total_customers=total_customers,
        total_products=total_products,
        total_sales=total_sales,
        total_revenue=total_revenue,
    )


if __name__ == "__main__":
    app.run(debug=True)
