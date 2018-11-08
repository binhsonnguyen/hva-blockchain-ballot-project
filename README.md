DApp cho việc bầu cử
===

[![Build Status](https://travis-ci.org/binhsonnguyen/hva-blockchain-ballot-project.svg?branch=master)](https://travis-ci.org/binhsonnguyen/hva-blockchain-ballot-project)

Missions
---

1. Xuất bản ứng dụng lên mạng Ropsten Ethereum.
2. Mời các thành viên trong lớp làm cử tri.
3. Ứng dụng web truy cập được từ Internet.
4. Testcase cho các trường hợp bằng JavaScript

Reqs
---

```
[x] Người xuất bản ứng dụng là CHỦ TOẠ.
[x] Chỉ có CHỦ TOẠ được thêm ứng viên (người được bầu)
[x] Chỉ có CHỦ TOẠ được thêm cử tri (người đi bầu)
[x] Chỉ có CHỦ TOẠ được bắt đầu việc bầu cử. START
[ ] Chỉ có CHỦ TOẠ được phép kết thúc bầu cử. FINISH
[ ] Chỉ có CHỦ TOẠ được phép reset bầu cử. RESET (xóa tất cả thông tin ứng viên và cử tri)
[ ] Chỉ được bắt đầu bầu cử nếu có ít nhất 2 ứng viên.
[ ] Chỉ được phép kết thúc bầu cử nếu có ít nhất 50% cử tri đã bầu.
[ ] Không có 2 ứng viên giống tên nhau.
[ ] Chỉ có cử tri được có tên có thể bầu cử.
[ ] Mỗi cử tri có giá trị 1 phiếu.
[ ] Mỗi cử tri được bầu 1 lần.
```

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
