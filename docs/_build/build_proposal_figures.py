from pathlib import Path
from html import escape

OUT = Path(__file__).resolve().parents[1] / 'figures'
NAVY, ORANGE, INK, MUTED = '#0A2762', '#FE8700', '#142538', '#536579'

def start(height):
    return [f'<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="{height}" viewBox="0 0 1400 {height}"><defs><marker id="arr" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9 Z" fill="{NAVY}"/></marker></defs><rect width="1400" height="{height}" fill="white"/><g font-family="Arial, Segoe UI, sans-serif">']

def text(x, y, lines, size=30, color=INK, bold=False, anchor='middle', gap=39):
    spans = ''.join(f'<tspan x="{x}" dy="{0 if i == 0 else gap}">{escape(line)}</tspan>' for i, line in enumerate(lines))
    return f'<text x="{x}" y="{y}" font-size="{size}" fill="{color}" font-weight="{700 if bold else 400}" text-anchor="{anchor}">{spans}</text>'

def box(x,y,w,h,title,desc=(),dark=False,warm=False):
    fill = NAVY if dark else '#FFF4E6' if warm else '#F3F6FA'
    stroke = NAVY if dark else ORANGE if warm else '#BBC9DA'
    parts = [f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="12" fill="{fill}" stroke="{stroke}" stroke-width="2"/>']
    parts.append(text(x+w/2,y+43,[title],32,'white' if dark else NAVY,True))
    if desc: parts.append(text(x+w/2,y+83,list(desc),29,'white' if dark else INK,gap=37))
    return ''.join(parts)

def arrow(path, dashed=False):
    return f'<path d="{path}" fill="none" stroke="{NAVY}" stroke-width="3" marker-end="url(#arr)"'+(' stroke-dasharray="9 7"' if dashed else '')+'/>'

def save(name, parts):
    (OUT / name).write_text(''.join(parts)+'</g></svg>',encoding='utf-8')

p=start(590)
p += [box(15,30,365,330,'Nguồn thông tin',('Khách hàng và tài khoản','Tài sản và giao dịch','Sản phẩm và thị trường','Nhu cầu và tương tác')),
      box(450,30,500,330,'Hệ thống quản lý kịch bản',('Thiết lập và quản lý phiên bản','Đánh giá điều kiện','Áp dụng chính sách','Điều phối và theo dõi'),dark=True),
      box(1020,30,365,330,'Kênh thực hiện',('Thông báo đa kênh','Offer và giao việc','Tác nghiệp nghiệp vụ','Tiếp nhận kết quả')),
      arrow('M382 195 H446'),arrow('M952 195 H1016'),
      box(250,435,900,130,'Kết quả và phản hồi',('Cập nhật hồ sơ phục vụ và bằng chứng để cải tiến kịch bản',),warm=True),
      arrow('M1203 362 V500 H1154'), arrow('M248 500 H197 V364',True),
      arrow('M700 432 V364',True)]
save('03-mo-hinh-nang-luc.svg',p)

p=start(1100)
steps=[
 ('Thông tin chung','Mục tiêu, danh mục, phạm vi, đơn vị và người phụ trách'),
 ('Điều kiện thỏa mãn','Đại lượng, công thức, nhóm VÀ hoặc HOẶC và xem thử đối tượng'),
 ('Cơ chế kích hoạt','Sự kiện HOẶC lịch thời gian, ngoại lệ và quy tắc tái kích hoạt'),
 ('Hành động thực hiện','Người nhận, kênh, nội dung, sản phẩm, tham số và thứ tự'),
 ('Hiệu lực và hậu xử lý','Bắt đầu, kết thúc, công việc từng lần và tổng hợp theo kỳ'),
]
for i,(title,desc) in enumerate(steps):
    y=15+i*132
    p.append(f'<rect x="35" y="{y}" width="1330" height="105" rx="12" fill="#F3F6FA" stroke="#BBC9DA" stroke-width="2"/>')
    p.append(f'<circle cx="88" cy="{y+53}" r="28" fill="{ORANGE}"/>')
    p.append(text(88,y+64,[str(i+1)],31,NAVY,True))
    p.append(text(140,y+40,[title],33,NAVY,True,'start'))
    p.append(text(140,y+81,[desc],29,INK,False,'start'))
    if i<4:p.append(arrow(f'M700 {y+108} V{y+130}'))
p += [arrow('M700 650 V687'),box(35,690,860,103,'Kiểm tra và phê duyệt theo thẩm quyền',('Đối chiếu dữ liệu, lịch, hành động, quyền và xung đột',),dark=True),
      arrow('M898 743 H975'),box(980,690,385,103,'Cần bổ sung',('Trở về bước liên quan',),warm=True),
      arrow('M1170 687 V669 H1378 V70 H1369',True),
      arrow('M465 796 V846 H700 V875'),text(550,831,['Được công bố'],26,MUTED),
      box(35,879,1330,185,'Phiên bản thực thi được đăng ký',('Cấu hình có phiên bản và định nghĩa tiến trình','Nguồn kích hoạt cùng chính sách thực thi và hậu xử lý','Sẵn sàng vận hành theo khoảng hiệu lực'),warm=True)]
save('04-luong-thiet-lap.svg',p)

p=start(1120)
p += [box(35,15,405,105,'Sự kiện phù hợp',('Có mã và đối tượng liên quan',),warm=True),
      box(480,15,405,105,'Đến mốc lịch',('Theo lịch đã đăng ký',),warm=True),
      arrow('M238 123 V146 H459 V173'),arrow('M683 123 V146 H459 V173'),
      box(35,176,848,76,'Kiểm tra phiên bản hiệu lực và nguồn kích hoạt'),
      arrow('M459 255 V285'),box(35,288,848,76,'Xác định đối tượng và lấy dữ liệu có thời điểm'),
      arrow('M459 367 V397'),box(35,400,848,105,'Đánh giá điều kiện và chính sách',('Chống trùng, tái kích hoạt, ưu tiên và giới hạn tiếp xúc',)),
      arrow('M886 450 H1000'),box(1005,365,365,146,'Không thực hiện',('Không thỏa, thiếu dữ liệu','hoặc bị chính sách loại'),warm=True),
      arrow('M459 508 V548'),text(507,538,['Được phép'],25,MUTED,False,'start'),
      box(35,552,848,105,'Thực hiện các hành động',('Gửi yêu cầu và nhận kết quả từ hệ thống đích',),dark=True),
      arrow('M459 660 V695'),box(35,698,848,106,'Lưu quyết định và kết quả',('Gắn dữ liệu, đối tượng, phiên bản và trạng thái',)),
      arrow('M1002 490 H940 V720 H887',True),
      arrow('M459 807 V851'),text(507,838,['Lượt đã kích hoạt'],25,MUTED,False,'start'),
      box(35,855,848,112,'Hậu xử lý từng lần',('Giao việc nếu được cấu hình và theo dõi kết quả',),warm=True),
      box(1005,590,365,76,'Lịch tổng hợp riêng'),arrow('M1188 669 V695'),
      box(1005,698,365,106,'Tổng hợp theo kỳ',('Theo cửa sổ dữ liệu',)),arrow('M886 751 H1001',True),
      arrow('M1188 807 V851'),box(1005,855,365,112,'Rà soát theo kỳ',('Báo cáo và phần việc',),warm=True),
      arrow('M459 970 V995 H700 V1020'),arrow('M1188 970 V995 H700 V1020'),
      box(200,1023,1000,76,'Theo dõi kết quả và cải tiến kịch bản')]
save('05-luong-van-hanh.svg',p)
print('Created 3 implementation diagrams')
