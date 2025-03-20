from flask import Flask
from flask_jwt_extended import JWTManager

from routes.user_routes import user_bp
from routes.product_routes import products_bp
from routes.auth_routes import auth_bp  
from routes.shopping_routes import shopping_bp
from routes.wishlist_routes import wishlist_bp 
from routes.refunds_routes import refunds_bp
from routes.payment_routes import payment_bp
from routes.discount_routes import discount_bp
from routes.categories_routes import categories_bp
from routes.order_routes import order_bp 
from routes.company_routes import company_bp 
from routes.pm_delivery import pm_delivery_bp
from routes.pm_products_routes import pm_products_bp
from routes.sales_manager_routes import sm_bp
from routes.sm_orders_routes import sm_orders_bp


from routes.review_routes import review_bp  

app = Flask(__name__)

# JWT Secret Key (Auth Blueprint için)
app.config["JWT_SECRET_KEY"] = "supersecretkey"
# JWT Secret Key
jwt = JWTManager(app)

# Blueprintleri Kaydet
app.register_blueprint(user_bp, url_prefix="/users")
app.register_blueprint(products_bp, url_prefix="/products")
app.register_blueprint(auth_bp, url_prefix="/auth") 
app.register_blueprint(review_bp, url_prefix="/reviews")


app.register_blueprint(shopping_bp, url_prefix="/shopping")
app.register_blueprint(wishlist_bp, url_prefix="/wishlist")
app.register_blueprint(refunds_bp, url_prefix="/refunds")
app.register_blueprint(discount_bp, url_prefix="/discount")

app.register_blueprint(categories_bp, url_prefix="/categories")
app.register_blueprint(payment_bp, url_prefix="/payment")
app.register_blueprint(order_bp, url_prefix="/order")


app.register_blueprint(company_bp, url_prefix="/company")
app.register_blueprint(pm_delivery_bp, url_prefix="/delivery")
app.register_blueprint(pm_products_bp, url_prefix="/pm_products")
app.register_blueprint(sm_bp, url_prefix="/sm")
app.register_blueprint(sm_orders_bp, url_prefix="/sm_orders")


@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
