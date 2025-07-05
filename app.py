from flask import (
    Flask,
    render_template,
    redirect,
    url_for,
    flash,
    request,
    session,
    abort,
)
from flask_sqlalchemy import SQLAlchemy
from flask_wtf import FlaskForm, CSRFProtect
from flask_login import (
    LoginManager,
    login_user,
    logout_user,
    login_required,
    current_user,
)
from flask_migrate import Migrate
from werkzeug.security import generate_password_hash, check_password_hash
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import DataRequired, Email, Length, EqualTo
from models import db, User, Product, Customer, Sale
from sqlalchemy import func
from datetime import datetime, timedelta

app = Flask(__name__)
app.config["SECRET_KEY"] = "your-secret-key"  # Set securely in production
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///instance/rms.db"
app.config["SESSION_COOKIE_SECURE"] = True  # Set True if behind HTTPS
app.config["SESSION_PERMANENT"] = True
app.config["PERMANENT_SESSION_LIFETIME"] = 60 * 60 * 24 * 7  # 1 week

csrf = CSRFProtect(app)
db.init_app(app)
login_manager = LoginManager(app)
login_manager.login_view = "login"


# --- Flask-Migrate Setup ---
# To use database migrations:
# 1. Set the FLASK_APP environment variable:
#    $env:FLASK_APP = "app.py"   # PowerShell
#    export FLASK_APP=app.py      # Bash
# 2. Initialize migrations (run once):
#    flask db init
# 3. Generate a migration after model changes:
#    flask db migrate -m "Describe changes"
# 4. Apply migrations to the database:
#    flask db upgrade
#
# See: https://flask-migrate.readthedocs.io/en/latest/

migrate = Migrate(app, db)


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


# --- Forms ---
class LoginForm(FlaskForm):
    username = StringField("Username", validators=[DataRequired()])
    password = PasswordField("Password", validators=[DataRequired()])
    submit = SubmitField("Login")


class SignupForm(FlaskForm):
    username = StringField(
        "Username", validators=[DataRequired(), Length(min=3, max=64)]
    )
    email = StringField("Email", validators=[DataRequired(), Email()])
    password = PasswordField("Password", validators=[DataRequired(), Length(min=6)])
    confirm = PasswordField(
        "Confirm Password", validators=[DataRequired(), EqualTo("password")]
    )
    submit = SubmitField("Sign Up")


# --- Decorators ---
def role_required(role):
    def decorator(f):
        @login_required
        def decorated_function(*args, **kwargs):
            if not current_user.is_authenticated or current_user.role != role:
                abort(403)
            return f(*args, **kwargs)

        decorated_function.__name__ = f.__name__
        return decorated_function

    return decorator


@app.route("/")
def dashboard():
    # Get sales per day for the last 30 days
    today = datetime.utcnow().date()
    start_date = today - timedelta(days=29)
    sales_per_day = (
        db.session.query(
            func.strftime("%Y-%m-%d", Sale.date),  # For SQLite
            func.sum(Sale.total_price),
        )
        .filter(Sale.date >= start_date)
        .group_by(func.strftime("%Y-%m-%d", Sale.date))
        .order_by(func.strftime("%Y-%m-%d", Sale.date))
        .all()
    )
    sales_trend_labels = [row[0] for row in sales_per_day]
    sales_trend_data = [float(row[1]) for row in sales_per_day]

    # --- Product Stock Distribution ---
    products = Product.query.all()
    stock_labels = [p.name for p in products]
    stock_data = [p.stock_quantity for p in products]

    return render_template(
        "dashboard.html",
        total_customers=Customer.query.count(),
        total_products=Product.query.count(),
        total_sales=Sale.query.count(),
        total_revenue=db.session.query(func.sum(Sale.total_price)).scalar() or 0,
        sales_trend_labels=sales_trend_labels,
        sales_trend_data=sales_trend_data,
        stock_labels=stock_labels,
        stock_data=stock_data,
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


@app.route("/update_product/<product_id>", methods=["GET", "POST"])
def update_product(product_id):
    product = Product.query.get_or_404(product_id)
    if request.method == "POST":
        product.name = request.form["name"]
        product.price = float(request.form["price"])
        product.stock_quantity = int(request.form["stock_quantity"])
        product.description = request.form["description"]
        db.session.commit()
        return redirect(
            url_for("list_products")
        )  # or wherever you want to go after update
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


# --- Authentication Routes ---
@app.route("/signup", methods=["GET", "POST"])
def signup():
    form = SignupForm()
    if form.validate_on_submit():
        if User.query.filter(
            (User.username == form.username.data) | (User.email == form.email.data)
        ).first():
            flash("Username or email already exists.", "danger")
            return render_template("signup.html", form=form)
        user = User(username=form.username.data, email=form.email.data, role="user")
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.commit()
        flash("Registration successful. Please log in.", "success")
        return redirect(url_for("login"))
    return render_template("signup.html", form=form)


@app.route("/login", methods=["GET", "POST"])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user and user.check_password(form.password.data):
            login_user(user)
            flash("Logged in successfully.", "success")
            return redirect(url_for("dashboard"))
        flash("Invalid username or password.", "danger")
    return render_template("login.html", form=form)


@app.route("/logout")
@login_required
def logout():
    logout_user()
    flash("You have been logged out.", "info")
    return redirect(url_for("login"))


# Example admin-only route
@app.route("/reports")
@role_required("admin")
def reports():
    products = Product.query.all()
    customers = Customer.query.all()
    sales = Sale.query.all()
    return render_template(
        "reports.html",
        products=products,
        customers=customers,
        sales=sales,
        fullwidth=True,
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


if __name__ == "__main__":
    app.run(debug=True)
