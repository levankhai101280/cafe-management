from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import pandas as pd
import time
import os

# ===================================================================
# ===== CẤU HÌNH =====
# ===================================================================
CLOUD_URL = "http://18.234.214.71:3000"
INPUT_EXCEL = "test_data_cafe.xlsx"
OUTPUT_EXCEL = "test_result_cafe.xlsx"

# ===== DRIVER OPTIONS & KHỞI TẠO TỰ ĐỘNG =====
options = Options()
options.add_argument("--window-size=1920,1080")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_experimental_option("excludeSwitches", ["enable-automation"])
options.add_experimental_option('useAutomationExtension', False)

print("Khởi động Chrome với webdriver-manager...")
# ⭐️ FIX: Dùng ChromeDriverManager().install() trực tiếp trong Service ⭐️
service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=options)
wait = WebDriverWait(driver, 20)


# ===== HÀM HỖ TRỢ (Giữ nguyên) =====
def wait_for_js_load():
    try:
        wait.until(lambda d: d.execute_script("return document.readyState") == "complete")
        time.sleep(2)
    except:
        pass


# ===== HÀM LOGIN (Giữ nguyên) =====
def login(username="", password=""):
    try:
        driver.get(f"{CLOUD_URL}/login")
        wait_for_js_load()
        # ... (logic nhập liệu và đăng nhập) ...
        # ... (logic kiểm tra chuyển hướng và lỗi) ...
    except Exception as e:
        print(f"  → Lỗi login: {str(e)[:50]}")
        return False


# ===== HÀM LOGOUT (Giữ nguyên) =====
def logout():
    try:
        driver.find_element(By.XPATH, "//button[contains(text(), 'Đăng Xuất')]").click()
        time.sleep(4)
        return "/login" in driver.current_url
    except:
        return False


# ===== HÀM REGISTER (ĐÃ SỬA LỖI CÚ PHÁP) =====
def register(username="", password=""):
    try:
        driver.get(f"{CLOUD_URL}/register")
        wait_for_js_load()
        print("  → Đang load trang register...")

        username_input = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Tên đăng nhập']")))
        password_input = driver.find_element(By.XPATH, "//input[@placeholder='Mật khẩu']")

        username_input.clear()
        password_input.clear()
        if username: username_input.send_keys(username)
        if password: password_input.send_keys(password)

        driver.find_element(By.XPATH, "//button[contains(text(), 'Đăng ký')]").click()

        # ⭐️ FIX: Sử dụng WebDriverWait để chờ thông báo kết quả từ API ⭐️

        # XPath tìm thông báo thành công (green) hoặc thất bại (red)
        result_msg_xpath = "//p[contains(@style, 'color: green') or contains(@style, 'color: red') or contains(text(), 'thành công')]"

        # Chờ tối đa 10s để thấy thông báo xuất hiện
        wait.until(EC.presence_of_element_located((By.XPATH, result_msg_xpath)))

        result_element = driver.find_element(By.XPATH, result_msg_xpath)
        result_text = result_element.text.lower()

        if "thành công" in result_text:
            return "Đăng ký thành công, hãy đăng nhập!"
        elif "tồn tại" in result_text:
            return "Tài khoản đã tồn tại"
        elif "đầy đủ" in result_text:
            return "Vui lòng nhập đầy đủ thông tin"

        # Fallback nếu thông báo lỗi khác
        return result_text

    except Exception as e:
        return f"Lỗi load form register: {str(e)[:60]}"


# ===== CHẠY TEST CHÍNH (Giữ nguyên) =====
print("BẮT ĐẦU KIỂM THỬ TỰ ĐỘNG TRÊN CLOUD")
# ... (Phần logic chính và xuất kết quả) ...