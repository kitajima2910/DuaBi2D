# Project
Marble Race Country

# Current Version
v1.0

# Current Stage
Released

# Current Phase
Release

# Completed
* Tích hợp chế độ Tự Động Kết Thúc Trận Đấu khi có 2 đội về đích trong chế độ World Cup 2026:
  - Khi cuộc đua thuộc khuôn khổ World Cup 2026 đang diễn ra và có đủ 2 quốc gia/viên bi xuất sắc vượt qua vạch đích, hệ thống sẽ ngay lập tức tự động kết thúc và tổng kết trận đấu.
  - Sự thay đổi này giúp tiết kiệm thời gian đáng kể, đẩy nhanh tốc độ giải đấu vì chỉ cần tìm ra Top 2 đội đi tiếp mà không cần phải chờ 2 đội còn lại lết hết chặng đua dài 2 phút.
* Tích hợp chế độ Đếm Ngược chuẩn bị xuất phát (Pre-race Countdown) & Giới hạn Thời gian thi đấu (120s Timeout) cho World Cup 2026:
  - Bổ sung cơ chế đếm ngược 3 giây hoành tráng trước khi bắt đầu mỗi trận đấu trong chế độ World Cup 2026, đi kèm hiệu ứng đếm số phóng to nảy nhảy đầy kịch tính (`3`, `2`, `1`, `SẴN SÀNG!`) và âm thanh beep bíp chuyên nghiệp tăng dần tông độ (tông cao 880Hz khi Xuất phát).
  - Tích hợp bộ đếm ngược giới hạn thời gian chạy trận đấu tối đa là 120 giây (2 phút) cực kỳ rộng rãi giúp các viên bi thoải mái đua hết chặng về đích. Khi đồng hồ chỉ còn 5 giây cuối cùng, hệ thống sẽ phát âm thanh cảnh báo nhịp nhanh liên tục. Nếu hết 120 giây mà một số viên bi vẫn chưa về đích (bị kẹt hoặc chạy chậm), trận đấu sẽ ngay lập tức dừng lại nhờ tiếng còi buzzer báo hết giờ chuyên nghiệp.
  - Xử lý thông minh việc xếp hạng và trao thưởng cho các nước dựa vào mức độ phần trăm hoàn thành đường đua thực tế (`checkpointProgress`) của họ lúc hết giờ, đồng thời hiển thị trạng thái hoàn thành `%` hoặc "DNF" (Did Not Finish) cực kỳ rõ ràng trên Bảng xếp hạng và Bục vinh quang.
* Tích hợp cơ chế Kéo-Để-Cuộn (Drag-to-Scroll / Touch & Grab Scroll) cho các danh sách dài:
  - Cho phép người dùng dễ dàng dùng chuột giữ và kéo (grab & drag) hoặc vuốt chạm (touch/swipe) để cuộn danh sách Bảng xếp hạng thực tế, Bảng điểm Giải đấu và Bảng tiến trình World Cup 2026 một cách mượt mà.
  - Thay đổi con trỏ chuột sang dạng bàn tay nắm kéo (`cursor-grab active:cursor-grabbing`) cực kỳ trực quan và chuyên nghiệp khi di chuột qua các khu vực cuộn.
  - Xử lý thông minh việc chặn lan truyền sự kiện Click khi kết thúc thao tác kéo thả (drag), giúp ngăn chặn việc bấm nhầm hay các hành vi không mong muốn khi cuộn danh sách.
* Tích hợp cấu trúc thi đấu World Cup 2026 hoành tráng:
  - Chia 16 quốc gia tranh tài làm 4 bảng đấu (A, B, C, D) ngẫu nhiên, mỗi bảng gồm 4 nước.
  - Vòng bảng (Group Stage): Đấu vòng tròn tìm kiếm 2 quốc gia đứng đầu mỗi bảng có thành tích xuất sắc nhất lọt vào Tứ kết (Quarterfinals).
  - Vòng Tứ kết (Quarterfinals): Tranh tài 2 trận (Trận 1 gồm bảng A-B, Trận 2 gồm bảng C-D), chọn ra Top 2 đội dẫn đầu mỗi trận tiến vào Bán kết.
  - Vòng Bán kết (Semifinals): 4 nước cùng tranh tài khốc liệt tìm ra các nước bước tiếp vào Chung kết.
  - Vòng Chung kết (Finals): Đại chiến đỉnh cao tranh Cúp Vàng thế giới, vinh danh Quốc gia Vô địch, Hạng Nhì và Hạng Ba hào hùng cùng Cột cờ tung bay phấp phới hoành tráng trên bục Podium.
* Tối ưu hóa hiển thị nhãn tên nước dẫn đầu: Ẩn hoàn toàn nhãn tên nước phía trên viên bi dẫn đầu khi các viên bi đang chuẩn bị xuất phát ở trạng thái chờ (Idle), chỉ hiển thị nhãn tên này một cách thông minh và sinh động khi cuộc đua chính thức bắt đầu chuyển động (Racing/Paused), giúp giảm thiểu rối loạn hình ảnh tại vạch xuất phát.
* Khử bỏ và thiết kế lại hệ thống thanh cuộn (scrollbars) thô thiển mặc định của trình duyệt: Thay thế bằng thanh cuộn tối giản siêu mỏng (5px) trong suốt màu Slate tự động biến đổi sang màu xanh sáng (Sky Glow) khi di chuột qua, đồng thời ẩn hoàn toàn thanh cuộn tại hai bảng thông tin phụ (Bảng điểm giải đấu và Bảng xếp hạng thực tế) giúp giao diện game luôn sạch sẽ, đậm chất arcade/gaming UI mà vẫn đảm bảo tính năng cuộn mượt mà.
* Tích hợp hiệu ứng Cột cờ và Lá cờ bay phấp phới 3D tuyệt đẹp cho mỗi quốc gia trên Bục vinh quang (Podium) tổng kết: Thiết kế cột cờ bạc ánh kim sang trọng với chóp mạ vàng và lá cờ uốn lượn liên tục sử dụng công nghệ mô phỏng CSS 3D Transforms (`rotateX`, `rotateY`, `skewY`) lệch pha so le, kết hợp cùng lớp phủ Shading Waves (`mix-blend-multiply`) di chuyển tự nhiên như cờ vải lụa bay trước gió.
* Đồng bộ và chuẩn hóa hiển thị thời gian về đích trên "Bảng xếp hạng thực tế": Chuyển đổi từ cơ chế sử dụng mốc thời gian Unix Epoch không chính xác sang bộ đếm thời gian giả lập vật lý chuyên dụng (ms) tăng dần theo tốc độ mô phỏng (`elapsedRaceTimeRef`). Thời gian hoàn thành hiển thị chuẩn xác dạng giây (ví dụ: `15.42s`) như các trò chơi chuyên nghiệp, hỗ trợ hoàn hảo cả khi tăng tốc 2x/4x hay tạm dừng cuộc đua.
* Làm mượt chỉ số hiển thị FPS và tối ưu hóa hiệu năng: Cập nhật chỉ số FPS định kỳ mỗi 500ms thay vì cập nhật liên tục 60 lần/giây, loại bỏ hoàn toàn hiện tượng số nhảy giật cục gây mỏi mắt, đồng thời giảm tần suất re-render không cần thiết của React để trò chơi hoạt động mượt mà hơn.
* Khắc phục lỗi nhãn tên viên bi dẫn đầu bị biến mất sau khi có viên bi cán đích: Tự động chuyển nhãn tên sang viên bi dẫn đầu tiếp theo đang chạy tích cực trên đường đua thay vì bị kẹt vĩnh viễn ở viên bi đã về đích đầu tiên.
* Khắc phục lỗi sai lệch hiển thị "Số lượng Quốc gia" bằng cách tự động đồng bộ hóa giá trị mặc định lúc khởi tạo và thanh kéo trượt (slider max) dựa trên chính xác tổng số quốc gia hiện có (`countries.length = 16`).
* Cố định chế độ Giải Đấu (Tournament) duy nhất và tinh gọn giao diện, loại bỏ các chế độ chơi đơn lẻ để người chơi tập trung hoàn toàn vào việc tranh cúp tích điểm nhiều chặng hấp dẫn.
* Bản địa hóa (Việt hóa 100% giao diện và dữ liệu) không lỗi font, sử dụng phông chữ hiển thị hiện đại Montserrat (Google Fonts) làm font chữ mặc định của ứng dụng.
* Tích hợp cờ quốc gia vẽ bằng vector hình học sắc nét (qua component Canvas chuyên dụng `CountryFlag`) vào Bảng xếp hạng thực tế và Bảng điểm giải đấu, mang lại trải nghiệm đồng bộ, trực quan vô cùng đẹp mắt.
* Tối ưu hóa điều kiện kết thúc trận đấu: Trận đấu tự động kết thúc ngay khi **Top 10 viên bi đầu tiên** cán đích (hoặc tất cả các viên bi còn hoạt động về đích/bị loại) giúp loại bỏ thời gian chờ đợi lâu vô ích.
* Tăng tốc độ chuyển động và bám đuổi của Camera thông minh: Nâng hệ số bám đuổi tiến lên `0.12` để giữ vị trí dẫn đầu sắc nét hơn và nâng hệ số lùi/chuyển camera lên `0.04` (nhanh gấp 8 lần trước đó) giúp chuyển cảnh mượt mà, nhanh chóng và vô cùng lôi cuốn khi thay đổi vị trí dẫn đầu.
* Tích hợp hệ thống tự động giải cứu bi bị kẹt và nảy loop vô tận (Stuck & Loop Rescue Engine) sau 3 lần nảy liên tục ở vùng hẹp bằng cú siêu nảy rực rỡ (Super Bounce), đi kèm hiệu ứng vòng hào quang vàng, tia lửa xoay tròn, âm thanh va chạm mạnh và rung camera nhẹ.
* Tăng chiều dài đường đua lên gấp 3 lần (10800px) và phân bổ đều 29 phân đoạn chướng ngại vật ngẫu nhiên phong phú, mang lại cảm giác kịch tính, lôi cuốn kéo dài.
* Tối ưu hóa trải nghiệm người dùng: Tinh chỉnh giảm sâu trọng lực xuống 0.065, giới hạn tốc độ xuống 11.5 và bổ sung giảm tốc dọc (vertical friction) giúp các viên bi di chuyển chậm, chuyển động trượt êm ái, mượt mà và cực kỳ dễ nhìn.
* Sửa lỗi "stale closure" của React state khiến các viên bi không di chuyển khi nhấn "Đua Ngay" bằng cách đồng bộ hóa trạng thái qua các React Refs (`useRef`).
* Mô phỏng vật lý 2D chất lượng cao mượt mà ở 60 FPS cho 50–150 country marbles cùng lúc.
* Triển khai vẽ cờ quốc gia bằng vector hình học trên Canvas cực kỳ sắc nét (20 quốc gia hàng đầu).
* Chướng ngại vật đa dạng: funnels (phễu), pegs (chốt nảy), spinning wheels (bánh xe xoay), pendulums (quả lắc), bumpers (đệm nảy), jump pads (đệm nhảy), moving platforms (thanh trượt), split paths (chia làn), rotating gates (cửa xoay), elevators (lỗ nâng không trọng lực), gravity drops và vạch đích checkerboard.
* Chế độ chơi chính thức: Giải Đấu (Tournament) với cơ chế tích lũy điểm số kịch tính qua nhiều vòng đua khác nhau.
* Giao diện HUD chuyên nghiệp, bảng xếp hạng cập nhật thời gian thực, bục vinh quang (podium) chúc mừng.
* Tạo hiệu ứng âm thanh Web Audio API sống động cho va chạm, đệm nảy và chiến thắng.
* Hỗ trợ nút điều chỉnh tốc độ mô phỏng (1x, 2x, 4x), tùy biến số lượng bi, random seed màn chơi.
* Layout hoàn toàn responsive, tối ưu tuyệt đối trên cả desktop lẫn thiết bị di động.

# In Progress
* Không có

# Pending
* Không có

# Known Issues
* Không có

# Design Rules
* Luôn giữ logic vật lý deterministic và công bằng cho tất cả các nước.
* Không sử dụng thư viện bên ngoài để bảo toàn tính độc lập của mã nguồn.

# Next Recommended Task
* Thưởng thức trò chơi tuyệt vời này!
