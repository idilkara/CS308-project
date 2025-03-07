from flask import Flask
from routes.user_routes import user_bp  # Import the user blueprint
from routes.product_routes import products_bp  # Import the user blueprint
app = Flask(__name__)

# Register Blueprints
app.register_blueprint(user_bp, url_prefix="/users")
app.register_blueprint(products_bp, url_prefix='/products')

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
