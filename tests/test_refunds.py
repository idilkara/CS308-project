"""

import sys
import os

backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
sys.path.insert(0, backend_path)

from app import app

import pytest
import json
from unittest.mock import patch

TEST_JWT_TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake_token_for_testing"

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def auth_headers():
    return {"Authorization": TEST_JWT_TOKEN, "Content-Type": "application/json"}




# --- 1️⃣ Refund Talebi Oluştur testi ---
def test_request_refund(client):
    # Test için geçerli orderitem_id (DB'nizde mevcut olmalı)
    orderitem_id = 1

    resp = client.post(
        "/request-refund",
        data=json.dumps({"orderitem_id": orderitem_id}),
        headers=auth_headers()
    )
    assert resp.status_code in [201, 400, 404]
    data = resp.get_json()
    assert "message" in data or "error" in data

# --- 2️⃣ Refund Taleplerini Listele testi ---
def test_list_refund_requests(client):
    resp = client.get(
        "/refund-requests",
        headers=auth_headers()
    )
    assert resp.status_code == 200
    data = resp.get_json()
    assert isinstance(data, list)
    if len(data) > 0:
        # Örnek olarak bir refund request'in alanlarını kontrol edelim
        refund = data[0]
        for key in ["refund_id", "orderitem_id", "user_id", "product_id", "refund_amount", "status", "request_date"]:
            assert key in refund

# --- 3️⃣ Refund Onayla testi (e-posta göndermeyi mockluyoruz) ---
@patch("refunds.send_refund_email")
def test_approve_refund(mock_send_email, client):
    # Refund ID test için DB'de var olmalı, rolü sales_manager olan kullanıcı ile test edilmeli
    refund_id = 1

    # Mock e-posta fonksiyonunun başarılı olduğunu simüle et
    mock_send_email.return_value = None

    resp = client.post(
        f"/approve-refund/{refund_id}",
        headers=auth_headers()
    )
    # Başarı veya yetkisizlik durumları olabilir
    assert resp.status_code in [200, 400, 403, 404, 202]
    data = resp.get_json()
    if resp.status_code == 200:
        assert "message" in data and "refunded_amount" in data

    # E-posta fonksiyonu çağrılmış mı test et
    if resp.status_code == 200:
        mock_send_email.assert_called_once()

# --- 4️⃣ Refund Reddet testi ---
def test_reject_refund(client):
    refund_id = 1

    resp = client.post(
        f"/reject-refund/{refund_id}",
        headers=auth_headers()
    )
    assert resp.status_code in [200, 400]
    data = resp.get_json()
    if resp.status_code == 200:
        assert data.get("message") == "Refund request rejected."
    else:
        assert "error" in data
"""

import requests
from auth_test import login
from config import BASEURL as BASE_URL, HEADERS
import time

def request_refund(token, orderitem_id):
    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    data = {"orderitem_id": orderitem_id}
    return requests.post(f"{BASE_URL}/refunds/request-refund", json=data, headers=headers)

def list_refund_requests(token):
    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    return requests.get(f"{BASE_URL}/refunds/refund-requests", headers=headers)

def approve_refund(token, refund_id):
    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    return requests.post(f"{BASE_URL}/refunds/approve-refund/{refund_id}", headers=headers)

def reject_refund(token, refund_id):
    headers = {"Authorization": f"Bearer {token}", **HEADERS}
    return requests.post(f"{BASE_URL}/refunds/reject-refund/{refund_id}", headers=headers)

if __name__ == "__main__":
    # 1️⃣ Kullanıcı login
    login_response = login("customer@example.com", "password")
    customer_token = login_response.get("access_token")
    if not customer_token:
        print("❌ Customer login failed.")
        exit()
    print("✅ Customer logged in.")

    # 2️⃣ Product manager veya sales manager login (iade onayı için)
    sm_login_resp = login("sm@example.com", "password")
    sm_token = sm_login_resp.get("access_token")
    if not sm_token:
        print("❌ Sales manager login failed.")
        exit()
    print("✅ Sales Manager logged in.")

    # 3️⃣ İade talebi oluştur (Geçerli orderitem_id ile)
    orderitem_id = 1  # Veritabanınızda gerçek bir delivered orderitem_id olmalı
    refund_resp = request_refund(customer_token, orderitem_id)
    if refund_resp.status_code == 201:
        refund_id = refund_resp.json().get("refund_id")
        print(f"✅ Refund request created. Refund ID: {refund_id}")
    else:
        print(f"❌ Refund request failed: {refund_resp.status_code} {refund_resp.text}")
        exit()

    time.sleep(1)  # Opsiyonel, DB işlemi için bekleme

    # 4️⃣ İade taleplerini listele (sales manager token ile)
    list_resp = list_refund_requests(sm_token)
    if list_resp.status_code == 200:
        print(f"✅ Refund requests listed. Total: {len(list_resp.json())}")
    else:
        print(f"❌ Failed to list refund requests: {list_resp.status_code}")

    # 5️⃣ İade talebini onayla
    approve_resp = approve_refund(sm_token, refund_id)
    if approve_resp.status_code == 200:
        print("✅ Refund approved and email sent.")
    else:
        print(f"❌ Refund approval failed: {approve_resp.status_code} {approve_resp.text}")

    # 6️⃣ Alternatif olarak iade reddet (Onaylama yerine test için)
    # reject_resp = reject_refund(sm_token, refund_id)
    # if reject_resp.status_code == 200:
    #     print("✅ Refund rejected.")
    # else:
    #     print(f"❌ Refund rejection failed: {reject_resp.status_code} {reject_resp.text}")
