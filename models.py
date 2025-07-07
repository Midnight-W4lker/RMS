from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from sqlalchemy import func

db = SQLAlchemy()


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(16), default="user", nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    avatar_filename = db.Column(db.String(100), nullable=True)

    # Profile Information
    first_name = db.Column(db.String(64), nullable=True)
    last_name = db.Column(db.String(64), nullable=True)
    job_title = db.Column(db.String(100), nullable=True)
    department = db.Column(db.String(100), nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    birth_date = db.Column(db.Date, nullable=True)

    # Work Information
    employee_id = db.Column(db.String(20), nullable=True)
    hire_date = db.Column(db.Date, nullable=True)
    work_location = db.Column(db.String(50), nullable=True)
    manager = db.Column(db.String(100), nullable=True)
    bio = db.Column(db.Text, nullable=True)

    # Preferences
    show_status = db.Column(db.Boolean, default=True)
    email_digest = db.Column(db.Boolean, default=False)
    profile_visible = db.Column(db.Boolean, default=True)
    preferred_language = db.Column(db.String(5), default="en")
    date_format = db.Column(db.String(20), default="mm/dd/yyyy")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def is_admin(self):
        return self.role == "admin"


class Product(db.Model):
    product_id = db.Column(db.String(100), primary_key=True)
    name = db.Column(db.String(100))
    description = db.Column(db.String(200))
    price = db.Column(db.Float)
    stock_quantity = db.Column(db.Integer)
    sales = db.relationship("Sale", back_populates="product", lazy=True)


class Customer(db.Model):
    customer_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    sales = db.relationship("Sale", back_populates="customer", lazy=True)


class Sale(db.Model):
    sale_id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(
        db.String(100), db.ForeignKey("product.product_id"), nullable=False
    )
    customer_id = db.Column(
        db.Integer, db.ForeignKey("customer.customer_id"), nullable=False
    )
    quantity = db.Column(db.Integer, nullable=False)
    total_price = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, nullable=False, default=func.now())

    product = db.relationship("Product", back_populates="sales")
    customer = db.relationship("Customer", back_populates="sales")
