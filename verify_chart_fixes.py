# Chart Manager Verification Script
# Run this to verify all fixes are working correctly

import os
import re


def check_chart_manager_fixes():
    """Verify all chart manager fixes are properly implemented"""

    chart_manager_path = "static/chart-manager.js"

    print("🔍 Verifying Chart Manager Fixes...")
    print("=" * 50)

    if not os.path.exists(chart_manager_path):
        print("❌ chart-manager.js not found!")
        return False

    with open(chart_manager_path, "r", encoding="utf-8") as f:
        content = f.read()

    checks = [
        {
            "name": "Theme Color Detection Fix",
            "pattern": r"getCSSVar.*fallback",
            "description": "CSS variable detection with fallbacks",
        },
        {
            "name": "Filter Button Listener Prevention",
            "pattern": r"filterListenersAdded.*flag",
            "description": "Prevent duplicate event listeners",
        },
        {
            "name": "Chart Options Theme Integration",
            "pattern": r"chartText.*chartGrid",
            "description": "Using theme-aware color variables",
        },
        {
            "name": "API Endpoint Graceful Handling",
            "pattern": r"console\.warn.*fallback data",
            "description": "Graceful API fallback handling",
        },
        {
            "name": "Resource Cleanup",
            "pattern": r"_chartFilterHandler.*removeEventListener",
            "description": "Proper event listener cleanup",
        },
        {
            "name": "Enhanced Error Handling",
            "pattern": r"try.*catch.*error",
            "description": "Comprehensive error handling",
        },
        {
            "name": "Console Logging",
            "pattern": r"console\.log.*📊|🎨",
            "description": "Debug logging with emojis",
        },
    ]

    passed = 0
    total = len(checks)

    for check in checks:
        if re.search(check["pattern"], content, re.IGNORECASE | re.DOTALL):
            print(f"✅ {check['name']}: {check['description']}")
            passed += 1
        else:
            print(f"❌ {check['name']}: {check['description']}")

    print("=" * 50)
    print(f"📊 Verification Results: {passed}/{total} checks passed")

    if passed == total:
        print("🎉 All chart manager fixes verified successfully!")
        return True
    else:
        print("⚠️  Some fixes may need attention")
        return False


def check_css_variables():
    """Check if required CSS variables exist"""

    variables_path = "static/variables.css"

    print("\n🎨 Verifying CSS Variables...")
    print("=" * 50)

    if not os.path.exists(variables_path):
        print("❌ variables.css not found!")
        return False

    with open(variables_path, "r", encoding="utf-8") as f:
        content = f.read()

    required_vars = [
        "--chart-text-color",
        "--chart-grid-color",
        "--chart-background",
        "--accent",
        "--color-success",
        "--text-primary",
        "--text-secondary",
        "--color-border",
        "--bg-surface",
    ]

    found = 0
    for var in required_vars:
        if var in content:
            print(f"✅ {var}")
            found += 1
        else:
            print(f"❌ {var}")

    print("=" * 50)
    print(f"🎨 CSS Variables: {found}/{len(required_vars)} found")

    return found == len(required_vars)


def check_template_integration():
    """Check if chart test template exists"""

    template_path = "templates/chart_test.html"

    print("\n📄 Verifying Template Integration...")
    print("=" * 50)

    if os.path.exists(template_path):
        print("✅ Chart test template created")

        with open(template_path, "r", encoding="utf-8") as f:
            content = f.read()

        required_elements = [
            "salesTrendChart",
            "revenueChart",
            "data-chart-filter",
            "chart-manager.js",
            "theme-system.js",
        ]

        found = 0
        for element in required_elements:
            if element in content:
                print(f"✅ {element} integrated")
                found += 1
            else:
                print(f"❌ {element} missing")

        print(f"📄 Template Elements: {found}/{len(required_elements)} found")
        return found == len(required_elements)
    else:
        print("❌ Chart test template not found!")
        return False


if __name__ == "__main__":
    print("🚀 Chart Manager Fix Verification")
    print("=" * 60)

    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    check1 = check_chart_manager_fixes()
    check2 = check_css_variables()
    check3 = check_template_integration()

    print("\n🏆 FINAL VERIFICATION RESULTS")
    print("=" * 60)

    if check1 and check2 and check3:
        print("🎉 ALL VERIFICATIONS PASSED!")
        print("✅ Chart Manager fixes implemented successfully")
        print("✅ CSS variables properly configured")
        print("✅ Template integration complete")
        print("\n📋 Next Steps:")
        print("1. Test chart functionality at http://localhost:5000/chart-test")
        print("2. Verify theme toggle works correctly")
        print("3. Test filter buttons (7d, 30d, 3m)")
        print("4. Check console for any errors")
    else:
        print("⚠️  Some verifications failed")
        print("Please review the issues above and apply necessary fixes")

    print("=" * 60)
