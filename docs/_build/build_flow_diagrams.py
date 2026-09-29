from pathlib import Path
from html import escape

OUT=Path(__file__).resolve().parents[1]/'figures'
OUT.mkdir(exist_ok=True)
NAVY='#0A2762'; ORANGE='#FE8700'; INK='#142538'; MUTED='#526579'; LINE='#B8C6D8'

def header(h):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="{h}" viewBox="0 0 1200 {h}">
<defs><marker id="arrow" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 Z" fill="{NAVY}"/></marker></defs>
<rect width="1200" height="{h}" fill="white"/>
<g font-family="Arial, Segoe UI, sans-serif">'''

def text(x,y,lines,size=26,fill=INK,weight='normal',anchor='start',spacing=34):
    spans=''.join(f'<tspan x="{x}" dy="{0 if i==0 else spacing}">{escape(s)}</tspan>' for i,s in enumerate(lines))
    return f'<text x="{x}" y="{y}" fill="{fill}" font-size="{size}" font-weight="{weight}" text-anchor="{anchor}">{spans}</text>'

def rect(x,y,w,h,fill='#F6F8FC',stroke=LINE,r=12):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}" stroke-width="2"/>'

def arrow(path,dashed=False):
    return f'<path d="{path}" fill="none" stroke="{NAVY}" stroke-width="3" marker-end="url(#arrow)"'+(' stroke-dasharray="8 7"' if dashed else '')+'/>'

def save(name,parts):
    (OUT/name).write_text(''.join(parts)+'</g></svg>',encoding='utf-8')

p=[header(1110)]
steps=[
 ('Thông tin chung','Tên, danh mục, mục đích và người phụ trách'),
 ('Điều kiện thỏa mãn','Chọn đại lượng, tạo công thức, kết hợp tất cả hoặc ít nhất một'),
 ('Cơ chế kích hoạt','Chọn sự kiện HOẶC lịch thời gian; quy tắc tái kích hoạt'),
 ('Hành động thực hiện','Thông báo và nội dung, giao việc, offer, kiểm soát nghiệp vụ'),
 ('Hiệu lực và hậu xử lý','Bắt đầu, kết thúc; hậu xử lý từng lần và theo kỳ'),
]
for i,(title,desc) in enumerate(steps):
    y=20+i*133
    p += [rect(70,y,1060,104),f'<circle cx="119" cy="{y+52}" r="28" fill="{ORANGE}"/>',text(119,y+62,[str(i+1)],29,NAVY,'bold','middle'),text(168,y+40,[title],31,NAVY,'bold'),text(168,y+78,[desc],25)]
    if i<4:p.append(arrow(f'M600 {y+104} V{y+133}'))
p += [arrow('M600 656 V684 H380 V706'),rect(70,708,620,80,NAVY,NAVY),text(380,757,['Kiểm tra và công bố'],31,'white','bold','middle'),arrow('M692 748 H756'),text(722,696,['Còn lỗi'],23,MUTED,'normal','middle'),rect(760,708,370,80,'#FFF3E3',ORANGE),text(945,740,['Quay về đúng bước','để chỉnh sửa'],24,NAVY,'normal','middle',30),arrow('M1130 748 H1170 V604 H1134',True),arrow('M380 790 V816 H600 V850'),text(480,809,['Hợp lệ'],23,MUTED),rect(70,854,1060,86,'#EDF2FA',NAVY),text(600,890,['Hệ thống tự sinh tiến trình'],31,NAVY,'bold','middle'),text(600,924,['Gắn phiên bản, đăng ký sự kiện hoặc lịch và quy tắc hậu xử lý'],25,INK,'normal','middle'),arrow('M600 942 V979'),rect(70,983,1060,96,'#FFF3E3',ORANGE),text(600,1022,['Tiến trình sẵn sàng vận hành theo hiệu lực'],29,NAVY,'bold','middle'),text(600,1057,['Không cần CNTT lập trình job riêng cho kịch bản'],25,INK,'normal','middle')]
save('01-tao-kich-ban.svg',p)

p=[header(1110),rect(70,20,500,85,'#FFF3E3',ORANGE),text(320,57,['Sự kiện phù hợp'],30,NAVY,'bold','middle'),text(320,90,['Một trong các sự kiện đã đăng ký'],23,INK,'normal','middle'),rect(630,20,500,85,'#FFF3E3',ORANGE),text(880,57,['Đến mốc lịch'],30,NAVY,'bold','middle'),text(880,90,['Theo chu kỳ và lịch đã thiết lập'],23,INK,'normal','middle'),arrow('M320 106 V139 H600 V169'),arrow('M880 106 V139 H600 V169'),rect(160,173,880,83),text(600,209,['Tiến trình đang có hiệu lực'],30,NAVY,'bold','middle'),text(600,243,['Kiểm tra trạng thái và nguồn kích hoạt'],24,INK,'normal','middle'),arrow('M600 258 V292'),rect(160,296,880,78),text(600,330,['Xác định đối tượng và lấy dữ liệu'],29,NAVY,'bold','middle'),text(600,361,['Dùng cấu hình và phiên bản đã công bố'],24,INK,'normal','middle'),arrow('M600 376 V407'),f'<path d="M600 409 L852 480 L600 551 L348 480 Z" fill="#EDF2FA" stroke="{NAVY}" stroke-width="2"/>',text(600,472,['Đủ điều kiện','và qua chính sách'],26,NAVY,'bold','middle',32),arrow('M856 480 H916'),rect(920,425,250,110,'#F6F8FC'),text(1045,455,['Không hoặc thiếu','dữ liệu: ghi nhận','lý do không chạy'],23,INK,'normal','middle',30),arrow('M600 554 V588'),text(638,576,['Có'],23,MUTED),rect(160,592,880,83,NAVY,NAVY),text(600,627,['Thực hiện các hành động đã cấu hình'],29,'white','bold','middle'),text(600,659,['Thông báo, offer, giao việc hoặc thao tác nghiệp vụ'],24,'white','normal','middle'),arrow('M600 678 V711'),rect(160,715,880,70),text(600,758,['Lưu kết quả hành động và lịch sử'],28,NAVY,'bold','middle'),arrow('M600 787 V810 H320 V840'),arrow('M600 787 V810 H880 V840'),rect(70,844,500,92,'#FFF3E3',ORANGE),text(320,881,['Hậu xử lý từng lần'],28,NAVY,'bold','middle'),text(320,919,['Tạo và theo dõi phần việc nếu bật'],23,INK,'normal','middle'),rect(630,844,500,92,'#FFF3E3',ORANGE),text(880,881,['Hậu xử lý theo kỳ'],28,NAVY,'bold','middle'),text(880,919,['Tổng hợp khi đến lịch riêng nếu bật'],23,INK,'normal','middle'),arrow('M320 938 V970 H600 V1001'),arrow('M880 938 V970 H600 V1001'),rect(160,1005,880,72,'#EDF2FA',NAVY),text(600,1049,['Theo dõi kết quả, thống kê và truy vết'],29,NAVY,'bold','middle'),arrow('M1171 480 H1188 V1041 H1045',True)]
save('02-van-hanh-tu-dong.svg',p)
print(OUT)
