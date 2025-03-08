from flask import Flask
from routes.user_routes import user_bp
from routes.product_routes import products_bp
from routes.auth_routes import auth_bp  # auth blueprint import et

app = Flask(__name__)

# JWT Secret Key (Auth Blueprint için)
app.config["JWT_SECRET_KEY"] = "supersecretkey"

# Blueprintleri Kaydet
app.register_blueprint(user_bp, url_prefix="/users")
app.register_blueprint(products_bp, url_prefix="/products")
app.register_blueprint(auth_bp, url_prefix="/auth")  # /auth ile çağıracağız

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
