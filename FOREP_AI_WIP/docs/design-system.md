# FOREP EXE Design System

## Semantic tokens

Tokens nằm trong `src/app/globals.css` bằng Tailwind v4 `@theme`.

| Token | Mục đích |
| --- | --- |
| `background` | nền app tổng thể |
| `surface` | card, form, table container |
| `surface-muted` | filter bar, secondary background, skeleton |
| `surface-subtle` | table header, inset panels |
| `border` | border mặc định |
| `border-strong` | separator hoặc component cần nhấn mạnh |
| `foreground` | text chính |
| `muted-foreground` | metadata, helper text |
| `primary` | brand accent và primary action |
| `success` | trạng thái tốt/hoàn thành |
| `warning` | cần chú ý/quá hạn/blocker |
| `destructive` | thao tác nguy hiểm hoặc lỗi |
| `info` | trạng thái đang xử lý/thông tin |

Không dùng random hex trong component mới. Nếu cần màu mới, thêm semantic token trước.

## Typography

- Font: `Be Vietnam Pro` qua `next/font/google`, variable `--font-app`.
- Page title: `text-2xl sm:text-3xl font-black`.
- Section title: `text-lg font-black`.
- Body text: `text-sm leading-6`.
- Metadata/helper: `text-xs/text-sm text-muted-foreground`.
- Không dùng uppercase quá dày cho navigation; chỉ dùng tracking nhỏ cho eyebrow/metadata.

## Layout

- Sidebar width: `w-sidebar` (`18rem`).
- Header height: `h-header` (`4rem`).
- Page max width: `max-w-[1500px]` trong app shell.
- Section gap: `gap-5`.
- Card radius: `rounded-card`.
- Control radius: `rounded-control`.

## Components

### Button

File: `src/components/common/Button.tsx`

Variants:

- `primary`: hành động chính của khu vực.
- `secondary`: hành động thay thế rõ ràng.
- `outline`: hành động thấp hơn, ít dùng.
- `ghost`: action nhỏ trong list/header.
- `danger`: thao tác phá hủy như hủy task/tạm ngưng.

Button mặc định là `type="button"` để tránh submit nhầm. Submit form phải khai báo `type="submit"`.

### Field / Select / TextArea

File: `src/components/common/Field.tsx`

- Luôn có visible label.
- Có `optional`, `helper`, `error`.
- Input height tối thiểu 44px.
- Placeholder không thay thế label.

### Card

File: `src/components/common/Card.tsx`

- Dùng `bg-surface`, `border-border`, shadow rất nhẹ.
- Không nest card nếu không cần phân lớp nội dung.

### PageHeader

File: `src/components/common/PageHeader.tsx`

Props chính:

- `eyebrow`
- `title`
- `description`
- `primaryAction`
- `secondaryAction`
- `action` để giữ tương thích cũ

Action đặt cùng vị trí trên mọi page.

### Badges

File: `src/components/common/StatusBadge.tsx`

Task status:

- `ASSIGNED`: Đã giao
- `IN_PROGRESS`: Đang thực hiện
- `BLOCKED`: Đang vướng
- `COMPLETED`: Hoàn thành
- `CANCELLED`: Đã hủy

Priority:

- `LOW`: Thấp
- `MEDIUM`: Trung bình
- `HIGH`: Cao
- `CRITICAL`: Khẩn cấp

Workload:

- `NO_WORK`: Chưa có việc
- `LOW`: Tải thấp
- `NORMAL`: Bình thường
- `HIGH`: Tải cao
- `OVERLOADED`: Quá tải

Không dùng `StatusBadge` cho workload; dùng `WorkloadBadge`.

### Feedback states

Files:

- `src/components/feedback/LoadingState.tsx`
- `src/components/feedback/EmptyState.tsx`
- `src/components/feedback/ErrorState.tsx`

Rules:

- Loading dùng skeleton, không spinner full page.
- Empty state phải nói người dùng nên mong đợi gì tiếp theo.
- Error state hiển thị message tiếng Việt; details kỹ thuật chỉ trong collapsible details.

## Responsive rules

- Desktop: sidebar persistent, tables cho data-heavy pages.
- Tablet/mobile: sidebar drawer, task/employee list chuyển card.
- Không ép table desktop trên mobile nếu có card alternative.
- Action chính phải chạm được bằng ngón tay, tối thiểu khoảng 44px.

## Accessibility rules

- Icon-only controls cần `aria-label`.
- Active nav dùng `aria-current`.
- Focus visible qua `.focus-ring`.
- Không truyền trạng thái chỉ bằng màu.
- Form field luôn có label, inline error và tab order tự nhiên.

## Motion

- Chỉ dùng transition màu/spacing nhẹ.
- Tôn trọng `prefers-reduced-motion` trong `globals.css`.
- Không dùng animation cản thao tác trên dashboard hoặc task flow.
