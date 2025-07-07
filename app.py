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
import os
import random
from werkzeug.utils import secure_filename
import uuid

try:
    from PIL import Image
except ImportError:
    Image = None
from forms import (
    SettingsForm,
    ProcessSaleForm,
    UpdateProductForm,
    RegisterCustomerForm,
    ProfileForm,
)

app = Flask(__name__)
app.config["SECRET_KEY"] = "your-secret-key"  # Set securely in production
# Use absolute path for SQLite DB
basedir = os.path.abspath(os.path.dirname(__file__))
app.config["SQLALCHEMY_DATABASE_URI"] = (
    f"sqlite:///{os.path.join(basedir, 'instance', 'rms.db')}"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SESSION_COOKIE_SECURE"] = True  # Set True if behind HTTPS
app.config["SESSION_PERMANENT"] = True
app.config["PERMANENT_SESSION_LIFETIME"] = 60 * 60 * 24 * 7  # 1 week

# File upload configuration
app.config["UPLOAD_FOLDER"] = os.path.join(basedir, "static", "uploads", "avatars")
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16MB max file size
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}


# Helper functions for file upload
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def save_avatar(form_picture):
    """Save and process uploaded avatar image"""
    if not form_picture:
        return None

    # Generate unique filename
    random_hex = str(uuid.uuid4().hex)
    _, f_ext = os.path.splitext(form_picture.filename)
    picture_fn = random_hex + f_ext
    picture_path = os.path.join(app.config["UPLOAD_FOLDER"], picture_fn)

    # Create upload directory if it doesn't exist
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    if Image:
        # Resize and save image with PIL
        output_size = (200, 200)
        img = Image.open(form_picture)

        # Convert RGBA to RGB if necessary
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")

        # Resize maintaining aspect ratio and center crop
        img.thumbnail(output_size, Image.Resampling.LANCZOS)

        # Create a square image with white background
        square_img = Image.new("RGB", output_size, (255, 255, 255))

        # Center the image
        x = (output_size[0] - img.width) // 2
        y = (output_size[1] - img.height) // 2
        square_img.paste(img, (x, y))

        # Save the image
        square_img.save(picture_path, quality=85, optimize=True)
    else:
        # Just save the file directly if PIL is not available
        form_picture.save(picture_path)

    return picture_fn


def delete_avatar(filename):
    """Delete avatar file from uploads folder"""
    if filename:
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        if os.path.exists(file_path):
            os.remove(file_path)


# User Statistics Helper Functions
def get_user_sales_count(user_id):
    """Get total number of sales processed by user"""
    # This would be linked to actual sales data once we have user tracking in sales
    # For now, return a mock count based on user creation time
    user = User.query.get(user_id)
    if user and user.created_at:
        days_since_creation = (datetime.utcnow() - user.created_at).days
        return min(245 + (days_since_creation * 2), 500)  # Mock progressive increase
    return 0


def get_user_days_active(user_id):
    """Get number of days user has been active"""
    user = User.query.get(user_id)
    if user and user.created_at:
        return (datetime.utcnow() - user.created_at).days + 1
    return 0


def get_user_accuracy_rate(user_id):
    """Get user's accuracy rate (mock for now)"""
    # This would be calculated from actual performance metrics
    # For now, return a consistent high rate with slight variation
    user = User.query.get(user_id)
    if user:
        # Use user ID to create consistent but varied rates
        base_rate = 95 + (user.id % 5)  # 95-99%
        return f"{base_rate}%"
    return "N/A"


csrf = CSRFProtect(app)
db.init_app(app)
login_manager = LoginManager(app)
login_manager.login_view = "login"
login_manager.login_message = "Please log in to access this page."
login_manager.login_message_category = "info"


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
    form = UpdateProductForm(obj=product)
    if form.validate_on_submit():
        form.populate_obj(product)
        db.session.commit()
        return redirect(url_for("list_products"))
    return render_template("update_product.html", product=product, form=form)


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
    form = RegisterCustomerForm()
    if form.validate_on_submit():
        new_customer = Customer(name=form.name.data, email=form.email.data)
        db.session.add(new_customer)
        db.session.commit()
        return redirect(url_for("list_customers"))
    return render_template("register_customer.html", form=form)


@app.route("/list_customers")
def list_customers():
    customers = Customer.query.all()  # or your ORM logic
    return render_template("list_customers.html", customers=customers)


@app.route("/process_sale", methods=["GET", "POST"])
def process_sale():
    form = ProcessSaleForm()
    products = Product.query.all()
    customers = Customer.query.all()

    # Debug: Check if we have products and customers
    if not products:
        flash("No products available. Please add products first.", "warning")
        return redirect(url_for("add_product"))

    if not customers:
        flash("No customers available. Please add customers first.", "warning")
        return redirect(url_for("register_customer"))

    form.product_id.choices = [(p.product_id, p.name) for p in products]
    form.customer_id.choices = [(c.customer_id, c.name) for c in customers]

    if form.validate_on_submit():
        # Enhanced debugging for product lookup
        product_id = form.product_id.data
        customer_id = form.customer_id.data

        print(
            f"DEBUG: Looking for product_id: '{product_id}' (type: {type(product_id)})"
        )
        print(
            f"DEBUG: Available products: {[(p.product_id, type(p.product_id)) for p in products]}"
        )

        product = Product.query.filter_by(product_id=product_id).first()
        customer = Customer.query.filter_by(customer_id=customer_id).first()

        if product is None:
            flash(
                f"Product with ID '{product_id}' not found. Available products: {[p.product_id for p in products]}",
                "error",
            )
            return render_template(
                "process_sale.html", products=products, customers=customers, form=form
            )

        if customer is None:
            flash(
                f"Customer with ID '{customer_id}' not found. Available customers: {[c.customer_id for c in customers]}",
                "error",
            )
            return render_template(
                "process_sale.html", products=products, customers=customers, form=form
            )

        # Check stock availability
        if product.stock_quantity < form.quantity.data:
            flash(
                f"Insufficient stock. Available: {product.stock_quantity}, Requested: {form.quantity.data}",
                "error",
            )
            return render_template(
                "process_sale.html", products=products, customers=customers, form=form
            )

        total_price = product.price * form.quantity.data
        sale = Sale(
            product_id=product_id,
            customer_id=customer_id,
            quantity=form.quantity.data,
            total_price=total_price,
        )

        # Update stock quantity
        product.stock_quantity -= form.quantity.data

        db.session.add(sale)
        db.session.commit()

        flash(
            f"Sale processed successfully! {form.quantity.data} x {product.name} sold to {customer.name}",
            "success",
        )
        return redirect(url_for("dashboard"))

    return render_template(
        "process_sale.html", products=products, customers=customers, form=form
    )


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


@app.route("/delete_customer/<int:customer_id>", methods=["POST", "GET"])
def delete_customer(customer_id):
    customer = Customer.query.get_or_404(customer_id)
    db.session.delete(customer)
    db.session.commit()
    flash("Customer deleted successfully.", "success")
    return redirect(url_for("list_customers"))


@app.route("/settings", methods=["GET", "POST"])
@login_required
def settings():
    form = SettingsForm()
    if form.validate_on_submit():
        # Account section
        # (Update user info here, e.g. current_user.username = form.username.data)
        # Preferences section
        # (Update preferences, e.g. theme)
        # Security section
        # (Handle password change logic)
        flash("Settings saved successfully!", "success")
        return redirect(url_for("settings"))
    return render_template("settings.html", form=form)


@app.route("/profile", methods=["GET", "POST"])
@login_required
def profile():
    """Profile page route"""
    form = ProfileForm()

    if form.validate_on_submit():
        # Handle avatar upload
        if form.avatar.data:
            # Delete old avatar if exists
            if current_user.avatar_filename:
                delete_avatar(current_user.avatar_filename)

            # Save new avatar
            avatar_filename = save_avatar(form.avatar.data)
            current_user.avatar_filename = avatar_filename

        # Update user profile with form data
        current_user.first_name = form.first_name.data
        current_user.last_name = form.last_name.data
        current_user.job_title = form.job_title.data
        current_user.department = form.department.data
        current_user.phone = form.phone.data
        current_user.birth_date = form.birth_date.data

        current_user.employee_id = form.employee_id.data
        current_user.hire_date = form.hire_date.data
        current_user.work_location = form.work_location.data
        current_user.manager = form.manager.data
        current_user.bio = form.bio.data

        current_user.show_status = form.show_status.data
        current_user.email_digest = form.email_digest.data
        current_user.profile_visible = form.profile_visible.data
        current_user.preferred_language = form.preferred_language.data
        current_user.date_format = form.date_format.data

        # Save to database
        db.session.commit()

        flash("Profile updated successfully!", "success")
        return redirect(url_for("profile"))

    # Pre-populate form with current user data
    if request.method == "GET":
        form.first_name.data = current_user.first_name
        form.last_name.data = current_user.last_name
        form.job_title.data = current_user.job_title
        form.department.data = current_user.department
        form.phone.data = current_user.phone
        form.birth_date.data = current_user.birth_date

        form.employee_id.data = current_user.employee_id
        form.hire_date.data = current_user.hire_date
        form.work_location.data = current_user.work_location
        form.manager.data = current_user.manager
        form.bio.data = current_user.bio

        form.show_status.data = current_user.show_status
        form.email_digest.data = current_user.email_digest
        form.profile_visible.data = current_user.profile_visible
        form.preferred_language.data = current_user.preferred_language
        form.date_format.data = current_user.date_format

    return render_template(
        "profile.html",
        form=form,
        sales_count=get_user_sales_count(current_user.id),
        days_active=get_user_days_active(current_user.id),
        accuracy_rate=get_user_accuracy_rate(current_user.id),
    )


@app.route("/api/chart-data")
@login_required
def chart_data():
    """API endpoint for chart data with time period filtering"""
    period = request.args.get("period", "30d")  # Default to 30 days

    # Generate mock data based on period
    if period == "7d":
        days = 7
        labels = [
            "6 days ago",
            "5 days ago",
            "4 days ago",
            "3 days ago",
            "2 days ago",
            "Yesterday",
            "Today",
        ]
    elif period == "30d":
        days = 30
        labels = [f"{30-i} days ago" if i < 29 else "Today" for i in range(30)]
    elif period == "3m":
        days = 90
        labels = [f"{90-i} days ago" if i < 89 else "Today" for i in range(0, 90, 3)]
    else:
        days = 30
        labels = [f"{30-i} days ago" if i < 29 else "Today" for i in range(30)]

    # Generate mock sales data (in real app, query from database)
    import random

    sales_data = [random.randint(5, 50) for _ in range(len(labels))]
    revenue_data = [sales * random.uniform(20, 100) for sales in sales_data]

    return {
        "period": period,
        "labels": labels,
        "datasets": {
            "sales": {
                "label": "Daily Sales",
                "data": sales_data,
                "backgroundColor": "rgba(59, 130, 246, 0.1)",
                "borderColor": "rgb(59, 130, 246)",
                "borderWidth": 2,
                "fill": True,
                "tension": 0.4,
            },
            "revenue": {
                "label": "Daily Revenue",
                "data": revenue_data,
                "backgroundColor": "rgba(16, 185, 129, 0.1)",
                "borderColor": "rgb(16, 185, 129)",
                "borderWidth": 2,
                "fill": True,
                "tension": 0.4,
            },
        },
    }


@app.route("/chart-test")
def chart_test():
    """Test page for chart manager functionality - simplified for debugging"""
    try:
        return render_template("chart_test.html")
    except Exception as e:
        # Return error details for debugging
        return f"<h1>Error in chart-test route</h1><pre>{str(e)}</pre>", 500


@app.route("/ui-demo")
def ui_demo():
    """Demo page showcasing all UI/UX enhancements"""
    return render_template("ui_demo.html")


@app.route("/test-simple")
def test_simple():
    """Simple test endpoint to verify Flask is working"""
    return {"status": "success", "message": "Flask app is working correctly"}


@app.route("/test-charts")
def test_charts():
    """Test chart data endpoint without authentication"""
    period = request.args.get("period", "30d")

    # Generate simple test data
    if period == "7d":
        labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        sales_data = [12, 19, 8, 15, 22, 18, 25]
        revenue_data = [240, 380, 160, 300, 440, 360, 500]
    elif period == "3m":
        labels = ["Month 1", "Month 2", "Month 3"]
        sales_data = [250, 320, 380]
        revenue_data = [5000, 6400, 7600]
    else:  # 30d
        labels = [f"Day {i+1}" for i in range(30)]
        sales_data = [random.randint(5, 50) for _ in range(30)]
        revenue_data = [sales * random.uniform(20, 100) for sales in sales_data]

    return {
        "period": period,
        "labels": labels,
        "datasets": {
            "sales": {
                "label": "Daily Sales",
                "data": sales_data,
                "backgroundColor": "rgba(59, 130, 246, 0.1)",
                "borderColor": "rgb(59, 130, 246)",
                "borderWidth": 2,
                "fill": True,
                "tension": 0.4,
            },
            "revenue": {
                "label": "Daily Revenue",
                "data": revenue_data,
                "backgroundColor": "rgba(16, 185, 129, 0.1)",
                "borderColor": "rgb(16, 185, 129)",
                "borderWidth": 2,
                "fill": True,
                "tension": 0.4,
            },
        },
    }


@app.route("/test-responsive")
def test_responsive():
    """Test page for responsive navbar and sidebar layout"""
    return render_template("responsive_test.html")
