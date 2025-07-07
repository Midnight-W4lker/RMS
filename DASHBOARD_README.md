# Core Eminance - Modern SaaS Dashboard

A beautifully designed, accessible, and responsive retail management system dashboard inspired by modern SaaS applications like Stripe, Linear, and Vercel.

## 🎨 Design System

### Features

- **Modern UI/UX**: Clean, minimal design with professional styling
- **Dark/Light Theme**: Automatic theme switching with localStorage persistence
- **Responsive Design**: Mobile-first approach with optimized layouts
- **Accessibility**: WCAG AA+ compliant with proper ARIA attributes
- **Interactive Components**: Smooth animations and hover effects

### Color Palette

```css
/* Light Theme */
--bg-primary: #fafbfc
--bg-surface: #ffffff
--card-bg: #ffffff
--text-primary: #0f172a
--text-secondary: #475569
--accent: #0ea5e9

/* Dark Theme */
--bg-primary: #0a0a0b
--bg-surface: #111111
--card-bg: #1a1a1b
--text-primary: #f8fafc
--text-secondary: #cbd5e1
--accent: #38bdf8
```

## 🏗️ Architecture

### File Structure

```/
templates/
├── base.html           # Main layout with sidebar & navbar
├── dashboard.html      # Dashboard page with cards & charts
├── reports.html        # Reports page
└── settings.html       # Settings page

static/
├── variables.css       # CSS variables & design tokens
├── components.css      # Reusable UI components
├── pages.css          # Page-specific layouts
├── layout.css         # Layout utilities
└── style.css          # Global styles
```

### Components

#### 1. Dashboard Cards

```html
<div class="dashboard-card">
  <div class="dashboard-card__header">
    <h3 class="dashboard-card__title">Total Revenue</h3>
    <div class="dashboard-card__icon">
      <i data-lucide="dollar-sign"></i>
    </div>
  </div>
  <div class="dashboard-card__value">$12,345</div>
  <p class="dashboard-card__subtitle">Revenue this month</p>
  <div class="dashboard-card__trend dashboard-card__trend--positive">
    <i data-lucide="trending-up"></i>
    +18% from last month
  </div>
</div>
```

#### 2. Floating Label Forms

```html
<div class="form-floating">
  <input type="text" class="form-floating-input" id="email" placeholder=" ">
  <label for="email" class="form-floating-label">Email Address</label>
</div>
```

#### 3. Modern Buttons

```html
<button class="btn btn--primary">
  <i data-lucide="plus"></i>
  Add Product
</button>

<button class="btn btn--secondary">Cancel</button>
<button class="btn btn--success">Save</button>
<button class="btn btn--danger">Delete</button>
```

#### 4. Navigation & Sidebar

- **Desktop**: Fixed sidebar with navigation links
- **Mobile**: Collapsible hamburger menu overlay
- **Responsive**: Automatic layout switching at 768px breakpoint

#### 5. Dropdown Menu

```html
<div class="dropdown">
  <button class="dropdown-toggle" aria-haspopup="true" aria-expanded="false">
    <i data-lucide="user"></i>
  </button>
  <ul class="dropdown-menu" role="menu">
    <li><a href="#" class="dropdown-item">Profile</a></li>
    <li><a href="#" class="dropdown-item">Settings</a></li>
    <li><a href="#" class="dropdown-item">Logout</a></li>
  </ul>
</div>
```

## 📱 Responsive Design

### Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Optimizations

- Cards stack in single column
- Sidebar becomes overlay with hamburger menu
- Touch-friendly button sizes (min 44px)
- Larger font sizes for form inputs (16px+)
- Optimized table layouts with horizontal scroll

## ♿ Accessibility Features

### Keyboard Navigation

- **Tab**: Navigate through interactive elements
- **Enter/Space**: Activate buttons and links
- **Escape**: Close dropdowns and modals
- **Arrow Keys**: Navigate dropdown menus

### Screen Reader Support

- Semantic HTML structure
- ARIA labels and roles
- Visually hidden content for context
- Focus management for dynamic content

### Visual Accessibility

- High contrast ratios (WCAG AA+)
- Focus indicators for keyboard users
- Reduced motion support for users with vestibular disorders
- Scalable typography and layouts

## 🎭 Theme System

### Theme Toggle

The theme toggle button automatically:

- Detects system preference on first visit
- Saves user choice to localStorage
- Updates all CSS custom properties
- Changes icon (moon ↔ sun)
- Maintains state across sessions

### Implementation

```javascript
function updateTheme(isDarkMode) {
  const theme = isDarkMode ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}
```

## 📊 Chart Integration

### Chart.js Setup

Charts automatically adapt to the current theme:

```javascript
function getThemeColors() {
  const style = getComputedStyle(document.documentElement);
  return {
    primary: style.getPropertyValue('--accent').trim(),
    textPrimary: style.getPropertyValue('--text-primary').trim(),
    // ... more colors
  };
}
```

### Chart Types

- **Line Charts**: Sales trends, analytics
- **Doughnut Charts**: Category distribution
- **Bar Charts**: Comparative data

## 🚀 Performance

### Optimizations

- CSS custom properties for theme switching
- Minimal JavaScript for interactions
- Efficient animations with `transform` and `opacity`
- Lazy loading for chart libraries
- Compressed icon fonts (Lucide)

### Loading Strategy

1. Critical CSS inlined in `<head>`
2. Non-critical CSS loaded asynchronously
3. JavaScript modules loaded at page end
4. Chart.js loaded only on dashboard pages

## 🔧 Customization

### Adding New Components

1. Define component in `components.css`
2. Add CSS variables for theming
3. Include responsive breakpoints
4. Add accessibility attributes
5. Document usage in this README

### Color Customization

Update CSS variables in `variables.css`:

```css
:root {
  --accent: #your-brand-color;
  --accent-hover: #your-brand-color-darker;
  --accent-light: #your-brand-color-lighter;
}
```

### Adding Icons

Using Lucide icons:

```html
<i data-lucide="icon-name"></i>
```Initialize after DOM load:
```javascript
lucide.createIcons();
```

## 🎭 Enhanced Microinteractions

The dashboard features sophisticated microinteractions for a premium user experience:

### Card Interactions

- **Hover Effect**: Cards scale up (1.02x) and lift with enhanced shadow (--shadow-xl)
- **Glow Effect**: Subtle accent gradient background on hover
- **Smooth Transitions**: 0.2s ease-in-out transforms

### Button Interactions

- **Press Effect**: Scale down (0.98x) on click with instant feedback
- **Ripple Effect**: Material Design-inspired ripple animation on click
- **Hover States**: Smooth color transitions and subtle shadow changes
- **Focus Rings**: Clear accessibility indicators

### Navigation Interactions

- **Navbar Links**: Sliding underline animation on hover with accent color
- **Sidebar Links**: Left accent border highlight with slide transform
- **Active States**: Clear visual indicators with accent colors
- **Horizontal Layout**: Navbar links arranged horizontally for modern UX

### Dropdown Animations

- **Slide-in Effect**: Opacity and translateY(-8px) animation
- **Smooth Transitions**: 0.2s ease-out transitions
- **Focus Management**: Keyboard navigation and focus trapping

### Theme Transitions

- **Smooth Switching**: All CSS custom properties transition smoothly
- **Preserved State**: Theme preference saved to localStorage
- **System Respect**: Follows user's system theme preference

## 🧪 Browser Support

### Supported Browsers

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Progressive Enhancement

- Core functionality works without JavaScript
- Enhanced interactions with JavaScript enabled
- Graceful degradation for older browsers

## 📝 Development Guidelines

### CSS Methodology

- **BEM**: Block Element Modifier naming convention
- **CSS Custom Properties**: For theming and consistency
- **Mobile-First**: Start with mobile styles, enhance for desktop
- **Component-Based**: Reusable, modular components

### JavaScript Patterns

- **IIFE**: Immediately Invoked Function Expressions for isolation
- **Event Delegation**: Efficient event handling
- **Progressive Enhancement**: Core functionality without JS
- **Accessibility First**: Keyboard navigation and screen readers

### Code Organization

```\
components.css    # Reusable UI components
pages.css        # Page-specific layouts  
variables.css    # Design tokens & CSS custom properties
layout.css       # Layout utilities & grid systems
```

## 🎯 Best Practices

### Design

- Consistent spacing using design tokens
- Meaningful color usage (success, warning, danger)
- Clear visual hierarchy with typography scale
- Sufficient contrast ratios for accessibility

### Development

- Semantic HTML for better SEO and accessibility
- CSS custom properties for maintainable theming
- Minimal JavaScript for better performance
- Progressive enhancement for broader compatibility

### Performance

- Optimize images and icons
- Minify CSS and JavaScript for production
- Use CSS transforms for animations
- Avoid layout thrashing with `transform` and `opacity`

## 🚀 Getting Started

1. **Clone the repository**
2. **Install dependencies** (if any)
3. **Run the Flask application**
4. **Open dashboard** at `http://localhost:5000`

The dashboard will automatically adapt to your system's theme preference and provide a modern, accessible interface for your retail management needs.

## 🛠️ Database Schema & Error Fixes

### SQLAlchemy IntegrityError Fix

**Issue**: `NOT NULL constraint failed: customer.customer_id`

**Root Cause**: The Customer model was using a String primary key without auto-increment, but the application wasn't providing customer_id values when creating new customers.

**Solution**: Updated Customer model to use auto-incrementing integer primary key:

```python
class Customer(db.Model):
    customer_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
```

**Database Migration**:

```bash
# Option 1: Reset database (recommended for development)
python reset_database.py
python seed_data.py

# Option 2: Complex migration (if you have important data)
python migrate_customer_id.py
```

## 📄 Settings & Profile Pages Implementation

### Features Implemented

**Settings Page (`/settings`)**:

- **Account Section**: Username and email management with floating labels
- **Preferences Section**: Modern toggle switches for:
  - Dark mode integration with global theme toggle
  - Email notifications
  - Push notifications  
  - Analytics tracking
- **Security Section**: Password change functionality with validation
- **Actions**: Reset to defaults, cancel, and save buttons

**Profile Page (`/profile`)**:

- **Profile Overview**: Avatar, user info, badges, and quick stats
- **Personal Information**: Basic details with floating label forms
- **Work Information**: Job title, department, work location
- **Activity & Preferences**: Online status and availability toggles
- **Account Management**: Profile photo change and account deletion

### Design System Implementation

**Card-Based Layout**:

```html
<section class="settings-card">
  <div class="settings-card__header">
    <div class="settings-card__title">
      <div class="settings-card__icon">
        <i data-lucide="user"></i>
      </div>
      <div>
        <h3>Section Title</h3>
        <p>Section description</p>
      </div>
    </div>
  </div>
  <div class="settings-card__content">
    <!-- Content -->
  </div>
</section>
```

**Modern Toggle Switches**:

```html
<div class="setting-item">
  <div class="setting-item__info">
    <div class="setting-item__icon">
      <i data-lucide="moon"></i>
    </div>
    <div>
      <h4>Dark Mode</h4>
      <p>Toggle between light and dark themes</p>
    </div>
  </div>
  <div class="toggle-switch">
    <input type="checkbox" id="dark_mode" class="toggle-input">
    <label for="dark_mode" class="toggle-label">
      <span class="toggle-slider"></span>
    </label>
  </div>
</div>
```

**Responsive Form Grid**:

```html
<div class="form-grid">
  <div class="form-group">
    <input type="text" class="form-control" placeholder=" ">
    <label class="form-label">Field Label</label>
  </div>
</div>
```

### Mobile-First Responsive Design

**Breakpoint Strategy**:

- Mobile: < 768px (single column, stacked layout)
- Tablet: 768px - 1024px (adaptive grid)
- Desktop: > 1024px (full grid layout)

**Key Responsive Features**:

- Profile card becomes single column on mobile
- Form grids collapse to single column
- Touch-friendly toggle switches (44px minimum)
- Optimized padding and spacing
- Horizontal scroll for overflow content

### Accessibility Features

**Keyboard Navigation**:

- All toggle switches accessible via keyboard
- Focus indicators for all interactive elements
- Logical tab order throughout forms

**Screen Reader Support**:

- Semantic HTML with proper headings hierarchy
- ARIA labels for toggle switches
- Role attributes for interactive elements
- Clear form validation messages

**Visual Accessibility**:

- High contrast ratios for all text and backgrounds
- Clear focus indicators with 2px outlines
- Sufficient spacing between interactive elements
- Color not used as the only means of conveying information

### JavaScript Enhancements

**Dark Mode Integration**:

```javascript
// Auto-sync settings page dark mode toggle with global theme
const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
const darkModeToggle = document.getElementById('dark_mode');
if (darkModeToggle) {
    darkModeToggle.checked = isDarkMode;
}
```

**Form Validation**:

- Real-time password confirmation matching
- Minimum password length enforcement
- Required field validation with visual feedback
- Account deletion double-confirmation

**Enhanced UX**:

- Smooth toggle animations
- Loading states for form submissions
- Toast notifications for successful actions
- Progressive enhancement (works without JavaScript)

### Navigation Integration

**Sidebar Links**:

- Profile link in sidebar footer with active state
- Settings link in main navigation
- Proper route highlighting

**User Dropdown**:

- Quick access to profile and settings
- Consistent with overall navigation patterns

### Recent UI/UX Fixes

#### 1. Dashboard Chart Expansion Fix

**Issue**: Sales charts were expanding beyond container boundaries and breaking layout.

**Solution**:

- Added `maintainAspectRatio: true` with specific aspect ratios
- Set chart container CSS with `overflow: hidden` and `max-width: 100%`
- Removed fixed width/height from canvas elements
- Added responsive canvas styling

```css
.chart-container canvas {
  max-width: 100% !important;
  height: auto !important;
  display: block;
}
```

#### 2. Dark Theme Button Visibility Fix

**Issue**: Primary buttons were using inconsistent colors and weren't visible in dark theme.

**Solution**: Updated button styles to use CSS custom properties:

```css
.btn--primary {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

.btn--secondary {
  background: var(--bg-surface);
  color: var(--text-primary);
  border-color: var(--color-border);
}
```

#### 3. Form Label Overlap Fix

**Issue**: Form labels were overlapping with user input text.

**Solution**: Implemented proper floating labels that move out of the way:

```css
.form-control::placeholder,
.form-input::placeholder {
  color: transparent;
}

.form-label {
  position: absolute;
  top: var(--space-3);
  /* Moves to top when input has content */
}
```

### Model Improvements Made

1. **Customer Model**:
   - Changed `customer_id` from String to auto-incrementing Integer
   - Added `nullable=False` constraints for data integrity
   - Added `unique=True` for email field
   - Added `created_at` timestamp

2. **Sale Model**:
   - Updated foreign key reference to use Integer
   - Maintained referential integrity

3. **Error Handling**:
   - Added defensive programming to prevent JavaScript conflicts
   - Implemented global error handlers for robustness

## 🔐 Authentication & Security

### Route Protection

The application implements robust authentication using Flask-Login with the following protected routes:

**Login Required Routes**:

- `/profile` - User profile management
- `/settings` - Account and application settings  
- `/reports` - Sales and analytics reports (admin only)

**Authentication Implementation**:

```python
from flask_login import login_required

@app.route("/profile")
@login_required
def profile():
    return render_template("profile.html")

@app.route("/settings", methods=["GET", "POST"])
@login_required  
def settings():
    return render_template("settings.html", form=form)
```

**Role-Based Access Control**:

```python
def role_required(role):
    def decorator(f):
        @login_required
        def decorated_function(*args, **kwargs):
            if not current_user.is_authenticated or current_user.role != role:
                abort(403)
            return f(*args, **kwargs)
        return decorated_function
    return decorator

@app.route("/reports")
@role_required("admin")
def reports():
    # Admin-only content
```

### Login Manager Configuration

```python
login_manager = LoginManager(app)
login_manager.login_view = "login"
login_manager.login_message = "Please log in to access this page."
login_manager.login_message_category = "info"
```

### Security Features

**Automatic Redirects**:

- Anonymous users accessing protected routes are automatically redirected to login
- Original destination preserved with `?next=` parameter
- Users redirected back to intended page after successful authentication

**Flash Messaging**:

- Clear feedback when login is required: "Please log in to access this page."
- Success/error messages for authentication actions
- Consistent messaging throughout the application

**Session Management**:

- Secure session handling with Flask-Login
- Persistent login state across browser sessions
- Automatic session cleanup on logout

**Template Security**:

- All user data properly escaped in templates
- CSRF protection on all forms
- Authenticated user context available in templates

### Authentication Flow

1. **Anonymous Access**: User attempts to visit protected route
2. **Redirect**: Flask-Login automatically redirects to login page
3. **Flash Message**: "Please log in to access this page." displayed
4. **Authentication**: User provides credentials
5. **Validation**: Flask-Login validates and creates session
6. **Redirect Back**: User redirected to originally requested page

### User Model Integration

```python
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(16), default="user", nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def is_admin(self):
        return self.role == "admin"
```

### Testing Authentication

**Protected Route Access**:

```bash
# Without authentication - redirects to login
curl -i http://localhost:5000/profile
# Returns: 302 Found, Location: /login?next=%2Fprofile

# With authentication - returns page content  
curl -i http://localhost:5000/profile -H "Cookie: session=..."
# Returns: 200 OK with profile page content
```

**Security Best Practices**:

- All sensitive routes require authentication
- Admin routes require admin role verification
- Clear user feedback for authentication requirements
- Proper session management and cleanup
- CSRF protection on forms
- Secure password hashing
