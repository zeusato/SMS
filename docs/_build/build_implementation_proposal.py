from pathlib import Path
import re
from docx import Document
from docx.shared import Mm, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT.parent
OUT = ROOT / 'deliverables' / 'SHS_Phuong_an_trien_khai_he_thong_quan_ly_kich_ban_v03.docx'
DOC = Document()
SEC = DOC.sections[0]
SEC.page_width, SEC.page_height = Mm(210), Mm(297)
SEC.top_margin, SEC.bottom_margin = Mm(22), Mm(19)
SEC.left_margin = SEC.right_margin = Mm(18)
SEC.header_distance, SEC.footer_distance = Mm(8), Mm(9)
SEC.different_first_page_header_footer = True

for name in ['Normal','Title','Subtitle','Heading 1','Heading 2','Heading 3','Caption','Header','Footer']:
    s=DOC.styles[name]
    s.font.name='Arial'
    s.font.color.rgb=RGBColor.from_string('000000')
    s._element.get_or_add_rPr().get_or_add_rFonts().set(qn('w:eastAsia'),'Arial')
    s.paragraph_format.widow_control=True
    for color in s._element.xpath('.//w:color'):
        for key in ['themeColor','themeTint','themeShade']:
            color.attrib.pop(qn('w:'+key),None)

normal=DOC.styles['Normal']
normal.font.size=Pt(11)
normal.paragraph_format.line_spacing=1.15
normal.paragraph_format.space_after=Pt(8)
for name,size,before,after in [('Title',27,0,13),('Heading 1',19,0,13),('Heading 2',12,12,5)]:
    s=DOC.styles[name]
    s.font.size=Pt(size);s.font.bold=True
    s.paragraph_format.space_before=Pt(before)
    s.paragraph_format.space_after=Pt(after)
    s.paragraph_format.keep_with_next=True
    s.paragraph_format.line_spacing=1.1
DOC.styles['Subtitle'].font.size=Pt(12)
DOC.styles['Subtitle'].paragraph_format.space_after=Pt(10)
DOC.styles['Caption'].font.size=Pt(9)
DOC.styles['Caption'].font.italic=False
DOC.styles['Caption'].paragraph_format.space_before=Pt(4)
DOC.styles['Caption'].paragraph_format.space_after=Pt(9)

def picture(paragraph, filename, width, crop=None, description=''):
    # Crop only the transparent display margins in OOXML; preserve original media.
    if crop:
        fullw,fullh,left,top,right,bottom=crop
        height=width*(bottom-top)/(right-left)
        pic=paragraph.add_run().add_picture(str(filename),width=Mm(width),height=Mm(height))
        bf=pic._inline.graphic.graphicData.pic.blipFill
        src=OxmlElement('a:srcRect')
        for k,v in [('l',left/fullw),('t',top/fullh),('r',(fullw-right)/fullw),('b',(fullh-bottom)/fullh)]:
            src.set(k,str(round(v*100000)))
        bf.insert(1,src)
    else:
        pic=paragraph.add_run().add_picture(str(filename),width=Mm(width))
    pic._inline.docPr.set('descr',description)
    return pic

LOGO=(1367,975,200,215,1175,759)
SLOGAN=(2802,975,200,220,2591,755)
SILK=(943,1114,22,26,919,1107)

head=SEC.header.paragraphs[0]
head.paragraph_format.space_after=Pt(0)
head.paragraph_format.tab_stops.clear_all()
head.paragraph_format.tab_stops.add_tab_stop(Mm(174),WD_ALIGN_PARAGRAPH.RIGHT)
picture(head,ASSETS/'Logo n slogan.png',51,SLOGAN,'SHS Kiến tạo Tài chính thịnh vượng')
r=head.add_run('\tPHƯƠNG ÁN TRIỂN KHAI');r.font.size=Pt(8)

def footer(section_footer):
    p=section_footer.paragraphs[0]
    p.paragraph_format.tab_stops.clear_all()
    p.paragraph_format.tab_stops.add_tab_stop(Mm(174),WD_ALIGN_PARAGRAPH.RIGHT)
    r=p.add_run('SHS  |  Scenario Management System\t');r.font.size=Pt(8)
    for instruction in ['PAGE','NUMPAGES']:
        if instruction=='NUMPAGES':p.add_run(' / ').font.size=Pt(8)
        field=OxmlElement('w:fldSimple');field.set(qn('w:instr'),instruction)
        rr=OxmlElement('w:r');pr=OxmlElement('w:rPr');sz=OxmlElement('w:sz');sz.set(qn('w:val'),'16');pr.append(sz);rr.append(pr)
        txt=OxmlElement('w:t');txt.text='1';rr.append(txt);field.append(rr);p._p.append(field)
footer(SEC.footer);footer(SEC.first_page_footer)

# A restrained original silk asset in the first-page header, behind the page content.
decor=SEC.first_page_header.paragraphs[0]
pic=picture(decor,ASSETS/'silk.png',24,SILK,'Họa tiết thương hiệu SHS')
inline=pic._inline
anchor=OxmlElement('wp:anchor')
for k,v in {'distT':'0','distB':'0','distL':'0','distR':'0','simplePos':'0','relativeHeight':'0','behindDoc':'1','locked':'0','layoutInCell':'1','allowOverlap':'1'}.items():anchor.set(k,v)
simple=OxmlElement('wp:simplePos');simple.set('x','0');simple.set('y','0');anchor.append(simple)
for axis,mm in [('H',170),('V',36)]:
    pos=OxmlElement('wp:position'+axis);pos.set('relativeFrom','page')
    offset=OxmlElement('wp:posOffset');offset.text=str(int(Mm(mm)));pos.append(offset);anchor.append(pos)
for tag in ['extent','effectExtent']:
    e=inline.find(qn('wp:'+tag))
    if e is not None:anchor.append(e)
anchor.append(OxmlElement('wp:wrapNone'))
for tag in ['docPr','cNvGraphicFramePr']:
    e=inline.find(qn('wp:'+tag))
    if e is not None:anchor.append(e)
anchor.append(inline.graphic)
inline.getparent().replace(inline,anchor)

def text(content,style=None):
    p=DOC.add_paragraph(style=style)
    for part in re.split(r'(\*\*.*?\*\*)',content):
        r=p.add_run(part[2:-2] if part.startswith('**') else part)
        if part.startswith('**'):r.bold=True
    return p

def table(rows):
    t=DOC.add_table(rows=1,cols=len(rows[0]));t.autofit=False;t.alignment=WD_TABLE_ALIGNMENT.CENTER
    widths={2:[49,125],3:[35,74,65],4:[31,48,48,47]}[len(rows[0])]
    for col,width in zip(t.columns,widths):col.width=Mm(width)
    borders=OxmlElement('w:tblBorders')
    for edge in ['top','left','bottom','right','insideH','insideV']:
        b=OxmlElement('w:'+edge)
        for k,v in [('val','single'),('sz','5'),('color','D9D9D9')]:b.set(qn('w:'+k),v)
        borders.append(b)
    t._tbl.tblPr.append(borders)
    for ri,data in enumerate(rows):
        row=t.rows[0] if ri==0 else t.add_row()
        props=row._tr.get_or_add_trPr();props.append(OxmlElement('w:cantSplit'))
        if ri==0:props.append(OxmlElement('w:tblHeader'))
        for ci,val in enumerate(data):
            cell=row.cells[ci];cell.width=Mm(widths[ci]);cell.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
            p=cell.paragraphs[0];p.paragraph_format.space_before=Pt(1);p.paragraph_format.space_after=Pt(2);p.paragraph_format.line_spacing=1.1
            r=p.add_run(val);r.font.size=Pt(10);r.bold=ri==0
            r.font.color.rgb=RGBColor.from_string('FFFFFF' if ri==0 else '142538')
            tcpr=cell._tc.get_or_add_tcPr();shade=OxmlElement('w:shd');shade.set(qn('w:fill'),'0A2762' if ri==0 else 'F2F5FA' if ri%2==0 else 'FFFFFF');tcpr.append(shade)
            mar=OxmlElement('w:tcMar')
            for edge,w in [('top',95),('bottom',95),('left',105),('right',105)]:
                e=OxmlElement('w:'+edge);e.set(qn('w:w'),str(w));e.set(qn('w:type'),'dxa');mar.append(e)
            tcpr.append(mar)
    p=DOC.add_paragraph();p.paragraph_format.space_after=Pt(0);p.paragraph_format.space_before=Pt(0);p.paragraph_format.line_spacing=1;p.add_run().font.size=Pt(3)

lines=(ROOT/'09-phuong-an-trien-khai.md').read_text(encoding='utf-8').splitlines()
pending_break=False;i=0
while i<len(lines):
    line=lines[i].strip()
    if not line:i+=1;continue
    if line=='<!-- page -->':pending_break=True
    elif line.startswith('# '):
        p=DOC.add_paragraph();p.paragraph_format.space_after=Pt(17)
        picture(p,ASSETS/'Logo n slogan.png',88,SLOGAN,'SHS Kiến tạo Tài chính thịnh vượng')
        p=text('Phương án triển khai\nhệ thống quản lý kịch bản','Title');p.paragraph_format.right_indent=Mm(22)
    elif line=='Scenario Management System':
        text(line,'Subtitle')
        p=text('Tháng 9 năm 2026  |  Phiên bản 0.3');p.runs[0].font.size=Pt(9);p.paragraph_format.space_after=Pt(17)
    elif line.startswith('## '):
        p=text(line[3:],'Heading 1')
        if pending_break:p.paragraph_format.page_break_before=True;pending_break=False
        if line[3:]=='Định hướng đề xuất':p.runs[0].font.size=Pt(15);p.paragraph_format.space_after=Pt(7)
    elif line.startswith('### '):text(line[4:],'Heading 2')
    elif line.startswith('!['):
        match=re.fullmatch(r'!\[([^\]]*)\]\(([^)]+)\)',line)
        p=DOC.add_paragraph();p.paragraph_format.space_after=Pt(7);p.alignment=WD_ALIGN_PARAGRAPH.CENTER
        picture(p,ROOT/match[2],174,description=match[1])
    elif line.startswith('|'):
        rows=[]
        while i<len(lines) and lines[i].strip().startswith('|'):
            values=[s.strip() for s in lines[i].strip().strip('|').split('|')]
            if not all(re.fullmatch(r'[-: ]+',s) for s in values):rows.append(values)
            i+=1
        table(rows);continue
    else:text(line)
    i+=1

DOC.core_properties.title='Phương án triển khai hệ thống quản lý kịch bản'
DOC.core_properties.subject='Ý tưởng thiết kế năng lực vận hành và phương án tổ chức triển khai'
DOC.core_properties.author='SHS'
DOC.core_properties.keywords='Scenario Management System, SHS, kịch bản, triển khai, quản lý tài sản'
DOC.core_properties.comments=''
for root in [DOC.styles.element,DOC._element]:
    for border in list(root.xpath('.//w:pBdr')):border.getparent().remove(border)
DOC.save(OUT)
print(OUT)
print('Paragraphs:',len(DOC.paragraphs),'Tables:',len(DOC.tables))
