from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileAllowed
from wtforms import (
    StringField,
    PasswordField,
    SubmitField,
    BooleanField,
    SelectField,
    IntegerField,
    FloatField,
    TextAreaField,
    EmailField,
    DateField,
)
from wtforms.validators import DataRequired, Email, Length, Optional, NumberRange


class SettingsForm(FlaskForm):
    # Account
    username = StringField(
        "Username", validators=[DataRequired(), Length(min=3, max=64)]
    )
    email = StringField("Email", validators=[DataRequired(), Email()])
    # Preferences
    dark_mode = BooleanField("Enable Dark Mode")
    # Security
    current_password = PasswordField("Current Password", validators=[Optional()])
    new_password = PasswordField("New Password", validators=[Optional(), Length(min=6)])
    confirm_password = PasswordField("Confirm New Password", validators=[Optional()])
    submit = SubmitField("Save Changes")
    cancel = SubmitField("Cancel")


class ProcessSaleForm(FlaskForm):
    product_id = SelectField(
        "Product", coerce=str, validators=[DataRequired()]
    )  # Fixed: Changed from int to str
    customer_id = SelectField("Customer", coerce=int, validators=[DataRequired()])
    quantity = IntegerField("Quantity", validators=[DataRequired(), NumberRange(min=1)])
    submit = SubmitField("Process Sale")


class UpdateProductForm(FlaskForm):
    name = StringField("Name", validators=[DataRequired()])
    price = FloatField("Price", validators=[DataRequired()])
    stock_quantity = IntegerField("Stock Quantity", validators=[DataRequired()])
    description = TextAreaField("Description", validators=[DataRequired()])
    submit = SubmitField("Update Product")


class RegisterCustomerForm(FlaskForm):
    customer_id = StringField("Customer ID", validators=[DataRequired()])
    name = StringField("Name", validators=[DataRequired()])
    email = EmailField("Email", validators=[DataRequired(), Email()])
    submit = SubmitField("Register Customer")


class ProfileForm(FlaskForm):
    # Profile Photo
    avatar = FileField(
        "Profile Photo",
        validators=[
            Optional(),
            FileAllowed(["jpg", "jpeg", "png", "gif"], "Images only!"),
        ],
    )

    # Personal Information
    first_name = StringField("First Name", validators=[Optional()])
    last_name = StringField("Last Name", validators=[Optional()])
    job_title = StringField("Job Title", validators=[Optional()])
    department = StringField("Department", validators=[Optional()])
    phone = StringField("Phone Number", validators=[Optional()])
    birth_date = DateField("Date of Birth", validators=[Optional()])

    # Work Information
    employee_id = StringField("Employee ID", validators=[Optional()])
    hire_date = DateField("Hire Date", validators=[Optional()])
    work_location = SelectField(
        "Work Location",
        choices=[
            ("", "Select location..."),
            ("headquarters", "Headquarters"),
            ("branch_north", "North Branch"),
            ("branch_south", "South Branch"),
            ("remote", "Remote"),
        ],
        validators=[Optional()],
    )
    manager = StringField("Direct Manager", validators=[Optional()])
    bio = TextAreaField("Bio / About", validators=[Optional()])

    # Activity & Preferences
    show_status = BooleanField("Show Online Status")
    email_digest = BooleanField("Email Digest")
    profile_visible = BooleanField("Profile Visibility")
    preferred_language = SelectField(
        "Preferred Language",
        choices=[
            ("en", "English"),
            ("es", "Spanish"),
            ("fr", "French"),
            ("de", "German"),
        ],
        default="en",
        validators=[Optional()],
    )
    date_format = SelectField(
        "Date Format",
        choices=[
            ("mm/dd/yyyy", "MM/DD/YYYY"),
            ("dd/mm/yyyy", "DD/MM/YYYY"),
            ("yyyy-mm-dd", "YYYY-MM-DD"),
        ],
        default="mm/dd/yyyy",
        validators=[Optional()],
    )

    submit = SubmitField("Save Profile")
