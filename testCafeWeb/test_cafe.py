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
import sys

# ===================================================================
# ===== CẤU HÌNH =====
# ===================================================================
# Địa chỉ IP Public của server EC2 đang chạy ứng dụng
CLOUD_URL = "http://18.234.214.71:3000"
INPUT_EXCEL = "test_data_cafe.xlsx"  # File Excel chứa dữ liệu đầu vào
OUTPUT_EXCEL = "test_result_cafe.xlsx"  # File Excel lưu kết quả kiểm thử

# ===== KHỞI TẠO DRIVER & WAIT =====
options = Options()
options.add_argument("--window-size=1920,1080")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_experimental_option("excludeSwitches", ["enable-automation"])
options.add_experimental_option('useAutomationExtension', False)

print("Khởi động Chrome với webdriver-manager...")
try:
    # ⭐️ FIX LỖI: Dùng ChromeDriverManager().install() trực tiếp trong Service ⭐️
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    wait = WebDriverWait(driver, 20)
except Exception as e:
    print(f"Lỗi: Không thể khởi tạo Driver. Chi tiết: {e}")
    sys.exit(1)


# ===== HÀM HỖ TRỢ =====
def wait_for_js_load():
    """Chờ đợi trang load xong và cho thêm thời gian ổn định."""
    try:
        wait.until(lambda d: d.execute_script("return document.readyState") == "complete")
        time.sleep(1.5)
    except:
        pass


# ===== HÀM LOGIN (Tối ưu hóa Wait) =====
def login(username="", password=""):
    try:
        driver.get(f"{CLOUD_URL}/login")
        wait_for_js_load()
        print("  → Đang load trang login...")

        # ⭐️ FIX 1: Chờ đợi input SẴN SÀNG để click và nhập liệu ⭐️
        # Dùng XPATH dựa trên type và placeholder để định vị chính xác
        username_input = wait.until(EC.element_to_be_clickable((By.XPATH, "//input[@type='text']")))
        password_input = driver.find_element(By.XPATH, "//input[@type='password']")

        username_input.clear()
        password_input.clear()

        # ⭐️ FIX 2: Tăng độ tin cậy khi gửi ký tự ⭐️
        if username:
            # Gửi ký tự sau khi đã chắc chắn element sẵn sàng
            username_input.send_keys(username)
            time.sleep(0.5)
        if password:
            password_input.send_keys(password)

        driver.find_element(By.XPATH, "//button[contains(text(), 'Đăng nhập')]").click()
        time.sleep(3)  # Chờ chuyển hướng

        if "/login" not in driver.current_url:
            return True
        else:
            # Chờ đợi thông báo lỗi (thường là màu đỏ)
            error_msg_xpath = "//p[contains(@style, 'color: red') or contains(text(), 'không đúng')]"
            error_messages = driver.find_elements(By.XPATH, error_msg_xpath)

            if error_messages:
                return error_messages[0].text

            return "Đăng nhập thất bại"
    except Exception as e:
        return f"Lỗi load form login: {str(e)[:50]}"


# ===== HÀM REGISTER (FIX LỖI NHẬP USERNAME) =====
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
import sys


# ... (Khối cấu hình và khởi tạo Driver giữ nguyên) ...

# ===== HÀM LOGIN (FIX XPATH SỬ DỤNG LABEL) =====
def login(username="", password=""):
    try:
        driver.get(f"{CLOUD_URL}/login")
        wait_for_js_load()
        print("  → Đang load trang login...")

        # ⭐️ FIX LỖI: Dùng XPATH dựa trên vị trí input sau label ⭐️
        # XPATH cho Username: Tìm label 'Tên đăng nhập' và lấy input cùng cấp
        username_input = wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//label[contains(text(), 'Tên đăng nhập')]/following-sibling::input")))
        # XPATH cho Password: Tương tự
        password_input = driver.find_element(By.XPATH, "//label[contains(text(), 'Mật khẩu')]/following-sibling::input")

        username_input.clear()
        password_input.clear()

        # ⭐️ Gửi ký tự và kiểm tra ⭐️
        if username:
            username_input.send_keys(username)
            time.sleep(0.5)
        if password:
            password_input.send_keys(password)

        driver.find_element(By.XPATH, "//button[contains(text(), 'Đăng nhập')]").click()
        time.sleep(3)  # Chờ chuyển hướng

        # ... (logic kiểm tra lỗi) ...
        return False
    except Exception as e:
        return f"Lỗi load form login: {str(e)[:50]}"


# ===== HÀM REGISTER (FIX XPATH SỬ DỤNG LABEL) =====
def login(username="", password=""):
    try:
        driver.get(f"{CLOUD_URL}/login")
        wait_for_js_load()
        print("  → Đang load trang login...")

        # ⭐️ FIX: XPATH DỰA TRÊN LABEL ⭐️
        username_input = wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//label[contains(text(), 'Tên đăng nhập')]/following-sibling::input")))
        password_input = driver.find_element(By.XPATH, "//label[contains(text(), 'Mật khẩu')]/following-sibling::input")

        username_input.clear()
        password_input.clear()

        # ⭐️ SỬ DỤNG PHƯƠNG PHÁP NHẬP LIỆU ỔN ĐỊNH ⭐️
        if username:
            username_input.send_keys(username)
            time.sleep(0.5)
        if password:
            password_input.send_keys(password)

        driver.find_element(By.XPATH, "//button[contains(text(), 'Đăng nhập')]").click()
        time.sleep(3)  # Chờ chuyển hướng

        if "/login" not in driver.current_url:
            return True
        else:
            error_msg_xpath = "//p[contains(@style, 'color: red') or contains(text(), 'không đúng')]"
            error_messages = driver.find_elements(By.XPATH, error_msg_xpath)

            if error_messages:
                return error_messages[0].text

            return "Đăng nhập thất bại"
    except Exception as e:
        return f"Lỗi load form login: {str(e)[:50]}"


# ===== HÀM REGISTER (FIX XPATH DỰA TRÊN LABEL) =====
def register(username="", password=""):
    try:
        driver.get(f"{CLOUD_URL}/register")
        wait_for_js_load()
        print("  → Đang load trang register...")

        # ⭐️ FIX: Dùng XPATH dựa trên Label ⭐️
        username_input = wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//label[contains(text(), 'Tên đăng nhập')]/following-sibling::input")))
        password_input = driver.find_element(By.XPATH, "//label[contains(text(), 'Mật khẩu')]/following-sibling::input")

        username_input.clear()
        password_input.clear()
        if username: username_input.send_keys(username)
        if password: password_input.send_keys(password)

        driver.find_element(By.XPATH, "//button[contains(text(), 'Đăng ký')]").click()

        # ⭐️ CHỜ ĐỢI THÔNG BÁO KẾT QUẢ ⭐️
        result_msg_xpath = "//p[contains(@style, 'color: green') or contains(@style, 'color: red')]"
        wait.until(EC.presence_of_element_located((By.XPATH, result_msg_xpath)))

        result_element = driver.find_element(By.XPATH, result_msg_xpath)
        result_text = result_element.text

        if "thành công" in result_text.lower():
            return "Đăng ký thành công, hãy đăng nhập!"
        else:
            return result_text

    except Exception as e:
        return f"Lỗi load form register: {str(e)[:60]}"


# ===== HÀM LOGOUT =====
def logout():
    try:
        # Chờ nút Đăng Xuất và click
        logout_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Đăng Xuất')]")))
        logout_button.click()
        time.sleep(2)
        return "/login" in driver.current_url
    except:
        return False


# ===== HÀM REGISTER (Đã FIX LỖI ỔN ĐỊNH) =====
def register(username="", password=""):
    try:
        driver.get(f"{CLOUD_URL}/register")
        wait_for_js_load()
        print("  → Đang load trang register...")

        username_input = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@type='text']")))
        password_input = driver.find_element(By.XPATH, "//input[@type='password']")
        username_input.clear()
        password_input.clear()
        if username: username_input.send_keys(username)
        if password: password_input.send_keys(password)

        driver.find_element(By.XPATH, "//button[contains(text(), 'Đăng ký')]").click()

        # ⭐️ FIX LỖI: CHỜ ĐỢI THÔNG BÁO KẾT QUẢ (thay vì time.sleep) ⭐️
        result_msg_xpath = "//p[contains(@style, 'color: green') or contains(@style, 'color: red')]"

        # Chờ thông báo thành công (green) hoặc thất bại (red) xuất hiện
        wait.until(EC.presence_of_element_located((By.XPATH, result_msg_xpath)))

        result_element = driver.find_element(By.XPATH, result_msg_xpath)
        result_text = result_element.text

        if "thành công" in result_text.lower():
            return "Đăng ký thành công, hãy đăng nhập!"
        else:
            return result_text  # Trả về thông báo lỗi cụ thể (đã tồn tại, thiếu pass,...)

    except Exception as e:
        return f"Lỗi load form register: {str(e)[:60]}"


# ===== HÀM PLACE TABLE (Đã tối ưu để đặt hàng) =====
def place_table():
    # Giả định đã đăng nhập thành công trước khi gọi hàm này
    driver.get(CLOUD_URL)
    wait_for_js_load()
    try:
        # 1. Chọn bàn số 1
        table = wait.until(EC.element_to_be_clickable((By.XPATH, "//h4[contains(text(), 'Bàn số 1')]")))
        table.click()

        # 2. Chọn 2 món cho sản phẩm đầu tiên
        quantity_input = wait.until(
            EC.presence_of_element_located((By.XPATH, "//ul[@class='menu-list']/li[1]//input[@type='number']")))
        quantity_input.clear()
        quantity_input.send_keys("2")

        # 3. Đặt bàn và Order
        driver.find_element(By.XPATH, "//button[contains(text(), 'Đặt Bàn & Order')]").click()
        time.sleep(5)  # Chờ phản hồi API

        # 4. Kiểm tra thông báo kết quả
        result_message = driver.find_element(By.XPATH, "//p[contains(@class, 'message')]").text

        return result_message

    except Exception as e:
        return f"Lỗi đặt bàn: {str(e)[:50]}"


# ===== CHẠY TEST CHÍNH (LOGIC HOẠT ĐỘNG) =====
if __name__ == "__main__":
    print("BẮT ĐẦU KIỂM THỬ TỰ ĐỘNG TRÊN CLOUD")
    # Đọc file Excel (bạn cần tạo file này với nội dung ở trên)
    try:
        data = pd.read_excel(INPUT_EXCEL)
    except FileNotFoundError:
        print(f"❌ Lỗi: Không tìm thấy file {INPUT_EXCEL}. Vui lòng tạo file test data.")
        driver.quit()
        sys.exit(1)

    results = []

    for idx, row in data.iterrows():
        tc = row['Test Case']
        action = row['Action']
        expected = row['Expected Result']

        print(f"\n[{tc}] Đang chạy hành động: {action}...")

        actual = ""
        status = "ERROR"
        login_successful = False

        try:
            # 1. Logic Login/Register/Logout
            if action == "Register":
                actual = register(row.get('Username', ''), row.get('Password', ''))

            elif "Login" in action:
                result = login(row.get('Username', ''), row.get('Password', ''))
                if isinstance(result, bool) and result:
                    login_successful = True
                    if "root" in row.get('Username', ''):
                        actual = "Redirect đến Dashboard"
                    else:
                        actual = "Redirect đến trang chủ"
                else:
                    actual = result  # Trả về thông báo lỗi

                if login_successful: logout()  # Đăng xuất ngay sau khi test Login thành công

            elif action == "Logout":
                actual = "Đăng xuất thành công" if logout() else "Đăng xuất thất bại"

            # 2. Logic Đặt bàn
            elif action == "PlaceTable":
                # Phải đăng nhập trước khi đặt bàn
                login_result = login(row.get('Username', 'guest'), row.get('Password', '123456'))
                if login_result is True:
                    actual = place_table()
                    logout()  # Đăng xuất sau khi đặt
                else:
                    actual = f"Lỗi: Không thể đăng nhập để đặt bàn: {login_result}"

            # 3. Logic Tìm kiếm
            elif action == "Search":
                query = row['Keyword']
                driver.get(f"{CLOUD_URL}/search?query={query}")
                wait_for_js_load()

                products_found = driver.find_elements(By.XPATH,
                                                      "//div[contains(@style, 'grid-template-columns')]//div[contains(@style, 'box-shadow')]")

                if "Không tìm thấy sản phẩm nào" in driver.page_source:
                    actual = "Không tìm thấy sản phẩm nào"
                else:
                    actual = f"Tìm thấy {len(products_found)} sản phẩm" if len(
                        products_found) > 0 else "Không tìm thấy sản phẩm nào"


            elif action == "Home":
                driver.get(CLOUD_URL)
                time.sleep(3)
                actual = "Trang chủ đã load" if "Trang Đặt Bàn & Order" in driver.page_source else "Lỗi trang chủ"

            status = "PASSED" if expected.lower() in actual.lower() else "FAILED"

        except Exception as e:
            actual = f"Lỗi hệ thống: {str(e)[:60]}"
            status = "ERROR"

        results.append({
            "Test Case": tc,
            "Action": action,
            "Input Username": row.get('Username', ''),
            "Input Password": row.get('Password', ''),
            "Keyword": row.get('Keyword', ''),
            "Expected Result": expected,
            "Actual Result": actual,
            "Status": status
        })

    # ===== XUẤT KẾT QUẢ VÀ DỌN DẸP =====
    report_df = pd.DataFrame(results)
    report_df.to_excel(OUTPUT_EXCEL, index=False)
    print(f"\nHOÀN TẤT! Báo cáo: {os.path.abspath(OUTPUT_EXCEL)}")
    driver.quit()