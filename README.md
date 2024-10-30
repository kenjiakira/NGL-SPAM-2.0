
# Công Cụ NGL Spammer

![Logo NGL Spammer](logo.jpeg)

Chào mừng bạn đến với **NGL Spammer!** Đây là một script đơn giản để gửi spam tới một tài khoản NGL nhất định. Cùng khám phá nhé!

---

## Tính Năng

- **⚡ Gửi Câu Hỏi Nhanh**: Gửi câu hỏi spam tới API của NGL đều đặn theo từng khoảng thời gian.
- **📊 Nhật Ký Theo Thời Gian Thực**: Ghi lại các yêu cầu thành công và thất bại ngay lập tức.
- **✅ Thống Kê Thành Công**: Hiển thị số lượng yêu cầu thành công và thất bại.
- **🛠️ Tùy Chỉnh Dễ Dàng**: Dễ dàng tùy chỉnh các câu hỏi và cài đặt.

---

## Cài Đặt

### Yêu Cầu

Hãy chắc chắn rằng bạn đã cài đặt **Node.js** và **npm** trên máy tính của mình.

---

### Các Bước Cài Đặt

1. **Clone kho lưu trữ:**
   ```bash
   git clone https://github.com/kenjiakira/NGL-SPAM-2.0
   cd NGL-Spammer
   ```

2. **Cài đặt các gói:**
   ```bash
   npm install
   ```

3. **Đăng Ký MongoDB:**
   - Truy cập vào [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
   - Đăng ký một tài khoản hoặc đăng nhập nếu bạn đã có tài khoản.
   - Tạo một cluster mới:
     - Nhấn vào nút "Build a Cluster".
     - Chọn cấu hình cluster phù hợp với nhu cầu của bạn (có tùy chọn miễn phí).
     - Nhấn "Create Cluster".
   - **Tạo một database**:
     - Sau khi cluster được tạo, nhấn vào "Collections".
     - Nhấn "Create Database", đặt tên cho database (ví dụ: `ngldb`).
   - **Tạo một user**:
     - Trong phần **Database Access**, thêm một user mới với quyền truy cập phù hợp và ghi lại tên người dùng và mật khẩu.
   - **Lấy chuỗi kết nối**:
     - Nhấn vào "Connect" trên cluster của bạn.
     - Chọn "Connect your application".
     - Sao chép chuỗi kết nối, nó sẽ có dạng:
       ```plaintext
       mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority
       ```

4. **Chỉnh sửa cấu hình:**
   - Tạo file `.env` trong thư mục gốc của dự án và thêm các biến môi trường sau:
     ```plaintext
     DB_USER=your_username_here
     DB_PASSWORD=your_password_here
     DB_NAME=ngldb
     ```

   - Cập nhật mã nguồn trong file `index.js` để sử dụng biến môi trường:
     ```javascript
     const mongoose = require('mongoose');
     require('dotenv').config(); // Thêm dòng này để sử dụng dotenv

     mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@ngl.5koo9.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`)
     .then(() => {
         console.log('Kết nối đến MongoDB thành công!');
     })
     .catch(err => {
         console.error('Kết nối đến MongoDB thất bại:', err);
     });
     ```

5. **Chạy script:**
   ```bash
   node index.js
   ```

---

## Cách Sử Dụng

1. Mở trình duyệt web và truy cập `http://localhost:3000`.
2. Theo dõi nhật ký cập nhật theo thời gian thực khi các câu hỏi được gửi.
3. Xem số lượng yêu cầu thành công và thất bại.

---

## Cấu Hình

Thay đổi cài đặt trong file `config.json`:

```json
{
    "interval": 2,  // Thời gian (giây) giữa các yêu cầu
    "username": "tên_người_dùng_của_bạn",  // Tên người dùng của bạn trên NGL
    "questions": [
        "Dạo này thế nào?",
        "Bạn khỏe không?",
        "Kể tôi nghe điều gì vui vẻ!"
    ]
}
```

---

## Triển Khai trên Render

1. **Tạo tài khoản Render:**
   - Truy cập [Render](https://render.com) và đăng ký tài khoản miễn phí.

2. **Tạo Dịch Vụ Web Mới:**
   - Nhấn vào nút "New" và chọn "Web Service."
   - Kết nối tài khoản GitHub của bạn và chọn kho lưu trữ bạn vừa tạo.

3. **Cấu Hình Dịch Vụ:**
   - Đặt **Tên** cho dịch vụ của bạn.
   - Chọn **Khu vực** (ví dụ: US).
   - Với **Môi trường**, chọn **Node**.
   - Đặt **Lệnh Xây Dựng** thành:
     ```bash
     npm install
     ```
   - Đặt **Lệnh Khởi Động** thành:
     ```bash
     node index.js
     ```

4. **Thêm Biến Môi Trường cho MongoDB:**
   - Trong phần cấu hình dịch vụ Render, tìm đến **Environment**.
   - Thêm các biến môi trường tương tự như bạn đã làm với file `.env`:
     - **DB_USER**: `your_username_here`
     - **DB_PASSWORD**: `your_password_here`
     - **DB_NAME**: `ngldb`

5. **Triển Khai:**
   - Nhấn "Create Web Service" để triển khai script. Chờ quá trình hoàn tất.

6. **Truy Cập Script:**
   - Sau khi triển khai, Render sẽ cung cấp cho bạn một URL để truy cập vào script của bạn.

---

## Duy Trì Hoạt Động với Uptime Robot

1. **Tạo tài khoản Uptime Robot:**
   - Truy cập [Uptime Robot](https://uptimerobot.com) và đăng ký tài khoản miễn phí.

2. **Thêm Monitor Mới:**
   - Nhấn "Add New Monitor."
   - Chọn **Loại Monitor** là "HTTP(s)."

3. **Cấu Hình Monitor:**
   - Nhập **Tên Thân Thiện** cho monitor của bạn (ví dụ: NGL Spammer).
   - Trong trường **URL**, nhập URL script trên Render của bạn.
   - Đặt **Khoảng Thời Gian Kiểm Tra** theo ý bạn (ví dụ: 5 phút).

4. **Lưu Monitor:**
   - Nhấn "Create Monitor." Uptime Robot sẽ kiểm tra script của bạn theo khoảng thời gian đã thiết lập.

---

## Giấy Phép

Dự án này thuộc giấy phép MIT. Kiểm tra file [LICENSE](LICENSE) để biết thêm thông tin.

---

## Chủ Dự Án

Dự án này được duy trì bởi JrDev06 và KenjiDev (HNT). Hãy liên hệ nếu bạn có bất kỳ thắc mắc nào!

---

### Cảm Ơn Bạn Đã Quan Tâm Đến NGL Spammer!

Hy vọng bạn sẽ thích sử dụng script này! Nếu có câu hỏi, đừng ngần ngại liên hệ với chủ dự án.
