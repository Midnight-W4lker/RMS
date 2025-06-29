from flask_sqlalchemy import SQLAlchemy
from flask import abort

db = SQLAlchemy()


class Product(db.Model):
    product_id = db.Column(db.String(100), primary_key=True)
    name = db.Column(db.String(100))
    description = db.Column(db.String(200))
    price = db.Column(db.Float)
    stock_quantity = db.Column(db.Integer)



class Customer(db.Model):
    customer_id = db.Column(db.String(100), primary_key=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(100))
    purchase_history = db.relationship("Sale", backref="customer", lazy=True)


class Sale(db.Model):
    sale_id = db.Column(db.String(100), primary_key=True)
    product_id = db.Column(db.String(100), db.ForeignKey("product.product_id"))
    customer_id = db.Column(db.String(100), db.ForeignKey("customer.customer_id"))
    quantity = db.Column(db.Integer)
    total_price = db.Column(db.Float)




