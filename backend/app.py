from flask import Flask
from flask_jwt_extended import JWTManager


from routes.user_routes import user_bp
from routes.product_routes import products_bp
from routes.auth_routes import auth_bp  # auth blueprint import et
from routes.shopping_routes import shopping_bp
from routes.wishlist_routes import wishlist_bp 
from routes.refunds_routes import refunds_bp
from routes.payment_routes import payment_bp
from routes.discount_routes import discount_bp
from routes.categories_routes import categories_bp
from routes.order_routes    import order_bp 
app = Flask(__name__)

# JWT Secret Key (Auth Blueprint için)
app.config["JWT_SECRET_KEY"] = "supersecretkey"
# JWT Secret Key
jwt = JWTManager(app)

# Blueprintleri Kaydet
app.register_blueprint(user_bp, url_prefix="/users")
app.register_blueprint(products_bp, url_prefix="/products")
app.register_blueprint(auth_bp, url_prefix="/auth")  # /auth ile çağıracağız

app.register_blueprint(shopping_bp, url_prefix="/shopping")
app.register_blueprint(wishlist_bp, url_prefix="/wishlist")
app.register_blueprint(refunds_bp, url_prefix="/refunds")
app.register_blueprint(discount_bp, url_prefix="/discount")

app.register_blueprint(categories_bp, url_prefix="/categories")
app.register_blueprint(payment_bp, url_prefix="/payment")
app.register_blueprint(order_bp, url_prefix="/order")

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
