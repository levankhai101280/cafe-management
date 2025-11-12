# =====================================================
# test_cafe_api.py  —  Kiểm thử API backend (không Selenium)
# =====================================================
# Backend: http://18.234.214.71:8081/api/
# Input: test_data_cafe.xlsx
# Output: test_result_cafe.xlsx
# =====================================================

import requests
import pandas as pd
import time
import os

API_BASE = "http://18.234.214.71:8081/api"
INPUT_EXCEL = "test_data_cafe.xlsx"
OUTPUT_EXCEL = "test_result_cafe.xlsx"

print("🔍 BẮT ĐẦU KIỂM THỬ API TRÊN CLOUD AWS...\n")

# =====================================================
# HÀM HỖ TRỢ
# =====================================================
def api_post(path, data=None, token=None, files=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    url = f"{API_BASE}{path}"
    try:
        if files:
            # Upload multipart (ví dụ thêm sản phẩm)
            response = requests.post(url, headers={"Authorization": f"Bearer {token}"}, files=files, data=data)
        else:
            response = requests.post(url, headers=headers, json=data)
        return response
    except Exception as e:
        return None

def api_get(path, token=None):
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    try:
        response = requests.get(f"{API_BASE}{path}", headers=headers)
        return response
    except Exception as e:
        return None


# =====================================================
# HÀM LOGIN / REGISTER / CÁC HÀM TEST KHÁC
# =====================================================
def register(username, password):
    data = {"username": username, "password": password}
    resp = api_post("/auth/register", data)
    if not resp:
        return "Lỗi kết nối"
    if resp.status_code == 200 and "thành công" in resp.text.lower():
        return "Đăng ký thành công, hãy đăng nhập!"
    elif "tên đăng nhập" in resp.text.lower():
        return "Vui lòng nhập tên đăng nhập"
    elif "mật khẩu" in resp.text.lower():
        return "Vui lòng nhập mật khẩu"
    else:
        return resp.text.strip()

def login(username, password):
    data = {"username": username, "password": password}
    resp = api_post("/auth/login", data)
    if not resp:
        return False, "Lỗi kết nối"

    if resp.status_code == 200:
        token = resp.json().get("token")
        role = resp.json().get("role")
        if role == "root_user":
            return True, "Redirect đến Dashboard", token
        else:
            return True, "Redirect đến trang chủ", token
    elif resp.status_code == 401:
        return False, "Tài khoản hoặc mật khẩu không đúng", None
    else:
        return False, resp.text.strip(), None

def place_table(username, password):
    ok, msg, token = login(username, password)
    if not ok:
        return "Login thất bại"
    # Lấy danh sách bàn trống
    resp = api_get("/user/tables/available", token)
    if resp and resp.status_code == 200 and len(resp.json()) > 0:
        table_id = resp.json()[0]["id"]
        r2 = api_post(f"/user/tables/{table_id}/book", token=token)
        if r2 and r2.status_code == 200:
            return "Đặt bàn thành công"
    return "Đặt bàn thất bại"

def search(keyword):
    resp = api_get(f"/products/search?name={keyword}")
    if not resp:
        return "Lỗi kết nối"
    if resp.status_code == 200 and len(resp.json()) > 0:
        return "Có kết quả"
    else:
        return "Không tìm thấy sản phẩm nào"

def home():
    resp = api_get("/products")
    if resp and resp.status_code == 200:
        return "Trang chủ đã load"
    return "Lỗi trang chủ"

def update_table_status(username, password):
    ok, msg, token = login(username, password)
    if not ok:
        return "Login thất bại"
    resp = api_get("/admin/tables", token)
    if not resp or resp.status_code != 200:
        return "Không lấy được danh sách bàn"
    table_id = resp.json()[0]["id"]
    r2 = requests.put(f"{API_BASE}/admin/tables/{table_id}/status?status=TRỐNG",
                      headers={"Authorization": f"Bearer {token}"})
    if r2.status_code == 200:
        return "Cập nhật thành công"
    return "Cập nhật thất bại"

def add_product(username, password):
    ok, msg, token = login(username, password)
    if not ok:
        return "Login thất bại"
    # Giả lập thêm sản phẩm (không upload ảnh thật)
    data = {
        "name": f"Sản phẩm thử {int(time.time())}",
        "price": 10000,
        "description": "Tự động test API",
        "categoryId": 1
    }
    files = {"image": ("test.jpg", b"fakeimage", "image/jpeg")}
    r = api_post("/admin/products/upload", data=data, token=token, files=files)
    if r and r.status_code == 200:
        return "Thêm sản phẩm thành công"
    return "Thêm sản phẩm thất bại"

def update_product(username, password):
    ok, msg, token = login(username, password)
    if not ok:
        return "Login thất bại"
    r = api_get("/admin/products", token)
    if not r or r.status_code != 200 or not r.json():
        return "Không tìm thấy sản phẩm"
    product_id = r.json()[0]["id"]
    r2 = requests.put(f"{API_BASE}/admin/products/{product_id}",
                      json={"name": "Cập nhật test", "price": 20000},
                      headers={"Authorization": f"Bearer {token}"})
    if r2.status_code == 200:
        return "Cập nhật thành công"
    return "Cập nhật thất bại"


# =====================================================
# CHẠY TEST CHÍNH
# =====================================================
data = pd.read_excel(INPUT_EXCEL)
results = []

for idx, row in data.iterrows():
    tc = row["Test Case"]
    action = row["Action"]
    expected = row["Expected Result"]
    print(f"[{tc}] Đang chạy...")

    actual = ""
    try:
        if action == "Register":
            actual = register(row.get("Username", ""), row.get("Password", ""))
        elif action == "Login":
            ok, msg, token = login(row.get("Username", ""), row.get("Password", ""))
            actual = msg
        elif action == "PlaceTable":
            actual = place_table(row.get("Username", ""), row.get("Password", ""))
        elif action == "Search":
            actual = search(row.get("Keyword", ""))
        elif action == "Home":
            actual = home()
        elif action == "UpdateTable":
            actual = update_table_status(row.get("Username", ""), row.get("Password", ""))
        elif action == "AddProduct":
            actual = add_product(row.get("Username", ""), row.get("Password", ""))
        elif action == "UpdateProduct":
            actual = update_product(row.get("Username", ""), row.get("Password", ""))
        else:
            actual = "Action chưa hỗ trợ"

        status = "PASSED" if expected.lower() in actual.lower() else "FAILED"
    except Exception as e:
        actual = f"Lỗi: {str(e)[:80]}"
        status = "ERROR"

    results.append({
        "Test Case": tc,
        "Input Username": row.get("Username", ""),
        "Input Password": row.get("Password", ""),
        "Keyword": row.get("Keyword", ""),
        "Expected Result": expected,
        "Actual Result": actual,
        "Status": status
    })

# =====================================================
# XUẤT KẾT QUẢ
# =====================================================
report_df = pd.DataFrame(results)
report_df.to_excel(OUTPUT_EXCEL, index=False)
print(f"\n✅ HOÀN TẤT! Báo cáo: {os.path.abspath(OUTPUT_EXCEL)}")
