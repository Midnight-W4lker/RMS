# Product Class
class Product:
    def __init__(self, product_id, name, description, price, stock_quantity):
        self.__product_id = product_id
        self.__name = name
        self.__description = description
        self.__price = price
        self.__stock_quantity = stock_quantity
        
    #Accessors and Mutators
    def get_product_id(self):
        return self.__product_id
    
    def get_name(self):
        return self.__name
    
    def set_name(self, name):
        self.__name = name

    def get_description(self):
        return self.__description

    def set_description(self, description):
        self.__description = description

    def get_price(self):
        return self.__price

    def set_price(self, price):
        self.__price = price

    def get_stock_quantity(self):
        return self.__stock_quantity

    def set_stock_quantity(self, stock_quantity):
        self.__stock_quantity = stock_quantity

    def add_stock(self, quantity):
        self.__stock_quantity += quantity

    def deduct_stock(self, quantity):
        if quantity <= self.__stock_quantity:
            self.__stock_quantity -= quantity
        else:
            print("Not enough stock available.")
    
    def __str__(self):
        return f"Product ID: {self.__product_id}, Name: {self.__name}, Description: {self.__description}, Price: Rs.{self.__price}, Stock: {self.__stock_quantity}"

# Customer Class
class Customer:
    def __init__(self, customer_id, name, email):
        self.__customer_id = customer_id
        self.__name = name
        self.__email = email
        self.__purchase_history = []
    
    def get_customer_id(self):
        return self.__customer_id
    
    def get_name(self):
        return self.__name
    
    def set_name(self, name):
        self.__name = name

    def get_email(self):
        return self.__email

    def set_email(self, email):
        self.__email = email

    def get_purchase_history(self):
        return self.__purchase_history

    def add_purchase(self, purchase):
        self.__purchase_history.append(purchase)
    
    def __str__(self):
        return f"Customer ID: {self.__customer_id}, Name: {self.__name}, Email: {self.__email}"

# Sale Class
class Sale:
    def __init__(self, sale_id, customer, product, quantity):
        self.__sale_id = sale_id
        self.__customer = customer
        self.__product = product
        self.__quantity = quantity
        self.__total_price = product.get_price() * quantity
    
    def get_sale_id(self):
        return self.__sale_id
    
    def get_customer(self):
        return self.__customer
    
    def set_customer(self, customer):
        self.__customer = customer

    def get_product(self):
        return self.__product

    def set_product(self, product):
        self.__product = product

    def get_quantity(self):
        return self.__quantity

    def set_quantity(self, quantity):
        self.__quantity = quantity

    def get_total_price(self):
        return self.__total_price

    def __str__(self):
        return f"Sale ID: {self.__sale_id}, Customer: {self.__customer.get_name()}, Product: {self.__product.get_name()}, Quantity: {self.__quantity}, Total Price: {self.__total_price}"

# Inventory Management
class Inventory:
    def __init__(self):
        self.products = []
        self.customers = []
        self.sales = []

    def add_product(self, product):
        self.products.append(product)
    
    def find_product(self, product_id):
        for product in self.products:
            if product.get_product_id() == product_id:
                return product
        return None
    
    def update_product(self, product_id, name, description, price, stock_quantity):
        product = self.find_product(product_id)
        if product:
            product.set_name(name)
            product.set_description(description)
            product.set_price(price)
            product.set_stock_quantity(stock_quantity)
    
    def list_products(self):
        for product in self.products:
            print(product)

    def add_customer(self, customer):
        self.customers.append(customer)
    
    def find_customer(self, customer_id):
        for customer in self.customers:
            if customer.get_customer_id() == customer_id:
                return customer
        return None
    
    def update_customer(self, customer_id, name, email):
        customer = self.find_customer(customer_id)
        if customer:
            customer.set_name(name)
            customer.set_email(email)

    def list_customers(self):
        for customer in self.customers:
            print(customer)
    
    def process_sale(self, sale_id, customer_id, product_id, quantity):
        customer = self.find_customer(customer_id)
        product = self.find_product(product_id)
        if customer and product and quantity <= product.get_stock_quantity():
            sale = Sale(sale_id, customer, product, quantity)
            self.sales.append(sale)
            product.deduct_stock(quantity)
            customer.add_purchase(sale)
            print(f"Sale processed: {sale}")
        else:
            print("Sale could not be processed.")
    
    def generate_product_report(self):
        print("Product Report")
        print("==============")
        self.list_products()
    
    def generate_sales_report(self):
        print("Sales Report")
        print("============")
        for sale in self.sales:
            print(sale)

    def generate_customer_report(self):
        print("Customer Report")
        print("===============")
        self.list_customers()

# Simple Text-Based User Interface
def display_menu():
    menu = """
    Retail Management System
    ========================
    1. Add Product
    2. Update Product
    3. List Products
    4. Register Customer
    5. Update Customer
    6. List Customers
    7. Process Sale
    8. Generate Product Report
    9. Generate Sales Report
    10. Generate Customer Report
    0. Exit
    """
    print(menu)

def main():
    inventory = Inventory()
    display_menu()
    
    while True:
        choice = input("Enter your choice: ").strip()
        
        if choice == "1":
            try:
                print("\nAdd Product")
                print("-----------")
                product_id = input("Enter Product ID: ").strip()
                name = input("Enter Product Name: ").strip()
                description = input("Enter Product Description: ").strip()
                price = float(input("Enter Product Price: ").strip())
                stock_quantity = int(input("Enter Stock Quantity: ").strip())
                product = Product(product_id, name, description, price, stock_quantity)
                inventory.add_product(product)
                print("Product added successfully.")
            except ValueError:
                print("Invalid input. Please enter numeric values for price and stock quantity.")
        
        elif choice == "2":
            try:
                print("\nUpdate Product")
                print("--------------")
                product_id = input("Enter Product ID to Update: ").strip()
                name = input("Enter New Product Name: ").strip()
                description = input("Enter New Product Description: ").strip()
                price = float(input("Enter New Product Price: ").strip())
                stock_quantity = int(input("Enter New Stock Quantity: ").strip())
                inventory.update_product(product_id, name, description, price, stock_quantity)
                print("Product updated successfully.")
            except ValueError:
                print("Invalid input. Please enter numeric values for price and stock quantity.")
        
        elif choice == "3":
            print("\nList of Products")
            print("----------------")
            inventory.list_products()
        
        elif choice == "4":
            print("\nRegister Customer")
            print("-----------------")
            customer_id = input("Enter Customer ID: ").strip()
            name = input("Enter Customer Name: ").strip()
            email = input("Enter Customer Email: ").strip()
            customer = Customer(customer_id, name, email)
            inventory.add_customer(customer)
            print("Customer registered successfully.")
        
        elif choice == "5":
            print("\nUpdate Customer")
            print("---------------")
            customer_id = input("Enter Customer ID to Update: ").strip()
            name = input("Enter New Customer Name: ").strip()
            email = input("Enter New Customer Email: ").strip()
            inventory.update_customer(customer_id, name, email)
            print("Customer updated successfully.")
        
        elif choice == "6":
            print("\nList of Customers")
            print("-----------------")
            inventory.list_customers()
        
        elif choice == "7":
            try:
                print("\nProcess Sales")
                print("------------")
                sale_id = input("Enter Sale ID: ").strip()
                customer_id = input("Enter Customer ID: ").strip()
                product_id = input("Enter Product ID: ").strip()
                quantity = int(input("Enter Quantity: ").strip())
                inventory.process_sale(sale_id, customer_id, product_id, quantity)
            except ValueError:
                print("Invalid input. Please enter a numeric value for quantity.")
        
        elif choice == "8":
            print("\nProduct Report")
            print("==============")
            inventory.generate_product_report()
        
        elif choice == "9":
            print("\nSales Report")
            print("============")
            inventory.generate_sales_report()
        
        elif choice == "10":
            print("\nCustomer Report")
            print("===============")
            inventory.generate_customer_report()
        
        elif choice == "0":
            print("Exiting the system. Goodbye!")
            break
        
        else:
            print("Invalid choice, please try again.")
        
        display_menu()


if __name__ == "__main__":
    main()
