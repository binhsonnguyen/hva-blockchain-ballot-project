DApp cho việc bầu cử
===

Nhiệm vụ
---

1. Xuất bản ứng dụng lên mạng Ropsten Ethereum.
2. Mời các thành viên trong lớp làm cử tri.
3. Ứng dụng web truy cập được từ Internet.
4. Testcase cho các trường hợp bằng JavaScript

Xây dựng ứng dụng dapp
---

1. Người xuất bản ứng dụng là CHỦ TOẠ.
2. Chỉ có CHỦ TOẠ được thêm ứng viên (người được bầu)
3. Chỉ có CHỦ TOẠ được thêm cử tri (người đi bầu)
4. Chỉ có CHỦ TOẠ được bắt đầu việc bầu cử. START
5. Chỉ có CHỦ TOẠ được phép kết thúc bầu cử. FINISH
6. Chỉ có CHỦ TOẠ được phép reset bầu cử. RESET (xóa tất cả thông tin ứng viên và cử tri)
7. Chỉ được bắt đầu bầu cử nếu có ít nhất 2 ứng viên.
8. Chỉ được phép kết thúc bầu cử nếu có ít nhất 50% cử tri đã bầu.
9. Không có 2 ứng viên giống tên nhau.
10. Chỉ có cử tri được có tên có thể bầu cử.
11. Mỗi cử tri có giá trị 1 phiếu.
12. Mỗi cử tri được bầu 1 lần.

Kịch bản
---

1. CHỦ TOẠ reset việc bầu cử.
2. CHỦ TOẠ thêm tên từng ứng viên.
3. CHỦ TOẠ thêm từng cử tri (địa chỉ tài khoản)
4. CHỦ TOẠ bắt đầu việc bầu cử. START
5. CỬ TRI bầu chọn dựa trên tên ứng viên.
6. CHỦ TOẠ kết thúc bầu cử FINISH
7. Bắt các sự kiện để hiển thị thông tin phù hợp cho người dùng.
8. Kết quả hiển thị thời gian thực.
