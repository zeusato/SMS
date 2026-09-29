from pathlib import Path
import re
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'deliverables'
OUT.mkdir(exist_ok=True)
source = (ROOT / '01-de-xuat-he-thong.md').read_text(encoding='utf-8')
doc = Document()
section = doc.sections[0]
section.page_width = Inches(8.5)
section.page_height = Inches(11)
section.top_margin = Inches(.72)
section.bottom_margin = Inches(.68)
section.left_margin = Inches(.78)
section.right_margin = Inches(.78)
section.header_distance = Inches(.25)
section.footer_distance = Inches(.28)
for name in ['Normal', 'Title', 'Subtitle', 'Heading 1', 'Heading 2', 'Heading 3']:
    st = doc.styles[name]
    st.font.name = 'Arial'
    st.font.color.rgb = RGBColor(0,0,0)
    st._element.get_or_add_rPr().get_or_add_rFonts().set(qn('w:eastAsia'), 'Arial')
    for el in st._element.xpath('.//w:color'):
        for attr in ['themeColor','themeTint','themeShade']:
            el.attrib.pop(qn('w:'+attr),None)
    st.paragraph_format.widow_control = True
normal = doc.styles['Normal']
normal.font.size = Pt(11)
normal.paragraph_format.line_spacing = 1.13
normal.paragraph_format.space_after = Pt(7)
title = doc.styles['Title']
title.font.size = Pt(27)
title.font.bold = True
title.paragraph_format.space_after = Pt(9)
for name,size,before,after in [('Heading 1',16,13,8),('Heading 2',12,9,4)]:
    st=doc.styles[name]
    st.font.size=Pt(size)
    st.font.bold=True
    st.paragraph_format.space_before=Pt(before)
    st.paragraph_format.space_after=Pt(after)
    st.paragraph_format.keep_with_next=True

doc.core_properties.title = 'Đề xuất hệ thống quản lý kịch bản SMS'
doc.core_properties.subject = 'Định hướng sản phẩm và phạm vi kiểm chứng bằng mockup'
doc.core_properties.author = 'SMS'
doc.core_properties.keywords = 'SMS, Scenario Management System, kịch bản, quản lý tài sản'

footer=section.footer.paragraphs[0]
footer.alignment=WD_ALIGN_PARAGRAPH.RIGHT
r=footer.add_run('SMS  |  ')
r.font.size=Pt(9)
field=OxmlElement('w:fldSimple')
field.set(qn('w:instr'),'PAGE')
footer._p.append(field)

page_starts={
    'Giá trị và cách kiểm chứng',
    'Luồng tạo và công bố kịch bản',
    'Quy trình tạo kịch bản',
    'Tiến trình tự động sau khi công bố',
    'Quản lý và quan sát',
    'Đường triển khai đề xuất',
}

def add_text(text,style=None):
    p=doc.add_paragraph(style=style)
    previous=p._p.getprevious()
    if previous is not None and previous.tag==qn('w:tbl'):
        inherited=p.style.paragraph_format.space_before
        p.paragraph_format.space_before=Pt(max(6, inherited.pt if inherited else 0))
    parts=re.split(r'(\*\*.*?\*\*)',text)
    for part in parts:
        run=p.add_run(part[2:-2] if part.startswith('**') else part)
        if part.startswith('**'): run.bold=True
    return p

def add_table(rows):
    table=doc.add_table(rows=1,cols=len(rows[0]))
    table.alignment=WD_TABLE_ALIGNMENT.CENTER
    table.autofit=False
    widths=([1.38,2.65,2.91] if len(rows[0])==3 else [1.70,5.24])
    for col,width in zip(table.columns,widths): col.width=Inches(width)
    pr=table._tbl.tblPr
    borders=OxmlElement('w:tblBorders')
    for edge in ['top','left','bottom','right','insideH','insideV']:
        el=OxmlElement('w:'+edge)
        for attr,val in [('val','single'),('sz','5'),('color','D9D9D9')]:
            el.set(qn('w:'+attr),val)
        borders.append(el)
    pr.append(borders)
    for ri,data in enumerate(rows):
        cells=table.rows[0].cells if ri==0 else table.add_row().cells
        row=table.rows[ri]
        trpr=row._tr.get_or_add_trPr()
        ns=OxmlElement('w:cantSplit');trpr.append(ns)
        if ri==0:
            repeat=OxmlElement('w:tblHeader');repeat.set(qn('w:val'),'true');trpr.append(repeat)
        for ci,txt in enumerate(data):
            cell=cells[ci]
            cell.width=Inches(widths[ci])
            cell.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
            p=cell.paragraphs[0]
            p.paragraph_format.space_before=Pt(2)
            p.paragraph_format.space_after=Pt(2)
            p.paragraph_format.line_spacing=1.08
            r=p.add_run(txt)
            r.font.name='Arial';r.font.size=Pt(10.2)
            r.bold=ri==0
            r.font.color.rgb=RGBColor(255,255,255) if ri==0 else RGBColor(0,0,0)
            tcpr=cell._tc.get_or_add_tcPr()
            shade=OxmlElement('w:shd')
            shade.set(qn('w:fill'),'0A2762' if ri==0 else ('F2F5F8' if ri%2==0 else 'FFFFFF'))
            tcpr.append(shade)
            margins=OxmlElement('w:tcMar')
            for edge in ['top','bottom','left','right']:
                e=OxmlElement('w:'+edge);e.set(qn('w:w'),'100');e.set(qn('w:type'),'dxa');margins.append(e)
            tcpr.append(margins)

lines=source.splitlines()
i=0
while i<len(lines):
    line=lines[i].strip()
    if not line:
        i+=1;continue
    if line.startswith('# '):
        add_text(line[2:],'Title')
        p=add_text('Scenario Management System')
        p.runs[0].font.size=Pt(13)
        p=add_text('Ngày 29 tháng 9 năm 2026    Phiên bản 0.2')
        p.runs[0].font.size=Pt(9)
        p.paragraph_format.space_after=Pt(12)
    elif line.startswith('## '):
        title=line[3:]
        p=add_text(title,'Heading 1')
        if title in page_starts:
            p.paragraph_format.page_break_before=True
    elif line.startswith('### '):
        add_text(line[4:],'Heading 2')
    elif line.startswith('!['):
        match=re.fullmatch(r'!\[([^\]]*)\]\(([^)]+)\)',line)
        if not match: raise ValueError(line)
        p=doc.add_paragraph()
        p.alignment=WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_after=Pt(7)
        picture=p.add_run().add_picture(str(ROOT/match.group(2)),width=Inches(6.75))
        picture._inline.docPr.set('descr',match.group(1))
    elif line.startswith('|'):
        rows=[]
        while i<len(lines) and lines[i].strip().startswith('|'):
            cells=[x.strip() for x in lines[i].strip().strip('|').split('|')]
            if not all(re.fullmatch(r'[-: ]+',x) for x in cells):rows.append(cells)
            i+=1
        add_table(rows)
        continue
    else:
        add_text(line)
    i+=1

out=OUT/'SMS_De_xuat_he_thong_v02.docx'
for root in [doc.styles.element, doc._element]:
    for border in list(root.xpath('.//w:pBdr')):
        border.getparent().remove(border)
doc.save(out)
print(out)
