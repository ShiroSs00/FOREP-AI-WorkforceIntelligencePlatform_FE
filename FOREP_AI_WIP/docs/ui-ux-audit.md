# FOREP EXE UI/UX Audit

## Mục tiêu redesign

FOREP EXE được tinh chỉnh thành một SaaS quản lý công việc cho doanh nghiệp nhỏ, tách rõ trải nghiệm `OWNER` và `EMPLOYEE`, giữ nguyên API/backend flow đang hoạt động. Giao diện ưu tiên tốc độ đọc, hành động chính rõ ràng, trạng thái dễ hiểu và không hiển thị nội dung kỹ thuật như một developer tool.

## Quyết định thiết kế chính

- Dùng nền trung tính sáng, surface trắng, accent teal thống nhất.
- Sidebar persistent trên desktop, drawer trên mobile và tự đóng sau điều hướng.
- Header chỉ hiển thị page context, notification, role context và primary action theo vai trò.
- `OWNER` có primary action là `Tạo task`; `EMPLOYEE` có primary action là `Gửi báo cáo`.
- Navigation `EMPLOYEE` được rút gọn: Việc của tôi, Báo cáo ngày, Thông báo, Hồ sơ.
- Tất cả status/task/workload/priority dùng badge tiếng Việt nhất quán.
- Loading state dùng skeleton theo layout; error state có message tiếng Việt và details kỹ thuật chỉ mở khi cần.

## Route audit

| Route | User | Main job | Vấn đề cũ | Cải thiện đã làm |
| --- | --- | --- | --- | --- |
| `/login` | Public | Đăng nhập workspace | Form tối làm label/input khó đọc sau khi đổi token | Đổi sang layout sáng, product copy rõ, error inline bằng tiếng Việt, vẫn gọi API thật |
| `/register-workspace` | Public | Tạo workspace + owner account | Layout tối và copy chưa đồng bộ | Đổi sang card sáng, field label rõ, CTA và error thống nhất |
| `/owner/dashboard` | OWNER | Nắm tình hình vận hành ngay | KPI ngang nhau, thiếu ưu tiên việc cần xử lý | Thêm section Cần chú ý hôm nay, KPI có tone, workload snapshot, task cần xử lý, AI summary |
| `/employee/home` | EMPLOYEE | Xem việc cần làm và gửi báo cáo | Quá giống dashboard quản lý | Rút gọn thành task mở, blocker, quá hạn, báo cáo hôm nay, thao tác nhanh |
| `/tasks` | OWNER/EMPLOYEE | Scan và mở task | Table desktop-only, filter ít, mobile yếu | Thêm search/status/priority/assignee/overdue filters, reset filter, desktop table + mobile cards |
| `/tasks/[id]` | OWNER/EMPLOYEE | Xem chi tiết và cập nhật tiến độ | Nội dung và action lẫn nhau, lịch sử cramped | Tách summary, content, action panel, timeline; quick actions progress/blocker/completion |
| `/owner/tasks/new` | OWNER | Tạo task nhanh | Form phẳng, AI gợi ý chưa đặt đúng ngữ cảnh | Group Basic/Planning/Assignment, AI panel giải thích vì sao, nút Chọn người này |
| `/owner/employees` | OWNER | Quản lý nhân viên | Form và table chen nhau, mobile chưa tốt | Form thêm nhân viên riêng, search, desktop table, mobile card, confirm tạm ngưng |
| `/owner/employees/[id]` | OWNER | Xem hồ sơ + workload | Error raw, workload dùng badge sai | Form rõ, ErrorState mới, workload badge đúng enum |
| `/owner/analytics/workload` | OWNER | Nhận diện quá tải/rảnh | Wording chưa giải thích tính ước tính | Copy nhấn mạnh tín hiệu ước tính, KPI + chart + table, workload badge nhất quán |
| `/daily-reports` | OWNER/EMPLOYEE | Xem báo cáo ngày | Không có search/filter; blocker chưa nổi bật | Search, filter vướng mắc, item layout dễ scan, owner review action rõ |
| `/daily-reports/new` | EMPLOYEE/OWNER | Gửi báo cáo | Form cũ còn text kỹ thuật | Field order đúng workflow: hoàn thành, đang làm, vướng mắc, kế hoạch |
| `/notifications` | OWNER/EMPLOYEE | Xem/đánh dấu thông báo | Chỉ là list thô | Tabs Tất cả/Chưa đọc, search, unread treatment nhẹ, action chỉ hiện khi cần |
| `/owner/ai` | OWNER | Xem gợi ý AI | AI trông như kết luận, workload badge sai | Tách workload/delay risks/business summary/suggestions, copy “gợi ý không tự quyết định” |
| `/owner/workspace` | OWNER | Cấu hình workspace | Form cũ không đồng bộ token | Card mới, ErrorState mới, copy workspace rõ |
| `/profile` | EMPLOYEE/OWNER | Xem tài khoản | Role enum thô | Role badge tiếng Việt, status badge thống nhất |

## Mobile considerations

- Sidebar chuyển thành drawer và tự đóng khi click link.
- Task list và employee list có mobile card thay vì ép table ngang.
- Form task và daily report stack theo chiều dọc, action sticky ở cuối với task form.
- Touch target button/input tối thiểu khoảng 44px.

## Accessibility considerations

- Dùng semantic heading và một `h1` qua `PageHeader`.
- Icon-only button trong shell có `aria-label`.
- Active navigation dùng `aria-current="page"`.
- Focus ring thống nhất qua `.focus-ring`.
- Badge status luôn có text, không chỉ dựa vào màu.
- Error details kỹ thuật nằm trong `details/summary`, không áp vào người dùng mặc định.

## Việc còn nên QA thủ công

- Kiểm tra responsive ở 320px, 375px, 768px, 1024px, 1440px.
- Kiểm tra flow thật với tài khoản OWNER và EMPLOYEE trên backend live.
- Kiểm tra screen reader basic navigation trên sidebar, filters, task detail form.
- Kiểm tra build trên Vercel nếu font Google bị môi trường build chặn mạng.
