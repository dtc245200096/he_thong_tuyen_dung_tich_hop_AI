# -*- coding: utf-8 -*-
"""
Script đồng bộ báo cáo DOCX siêu toàn diện sang HTML và Markdown
Bao gồm đầy đủ:
- Danh mục hình ảnh biểu đồ
- Khung chờ dán ảnh chụp màn hình (Screenshot Placeholder)
- Toàn bộ các bảng dữ liệu & bảng test cases (> 214 TC)
"""
import os
import sys

try:
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    if hasattr(sys.stderr, 'reconfigure'):
        sys.stderr.reconfigure(encoding='utf-8')
except Exception:
    pass

from docx import Document
from docx.document import Document as _DocumentType
from docx.oxml.table import CT_Tbl
from docx.oxml.text.paragraph import CT_P
from docx.table import Table, _Cell
from docx.text.paragraph import Paragraph

def iter_block_items(parent):
    if isinstance(parent, _DocumentType):
        parent_elm = parent.element.body
    elif isinstance(parent, _Cell):
        parent_elm = parent._tc
    else:
        raise ValueError("Invalid parent type")

    for child in parent_elm.iterchildren():
        if isinstance(child, CT_P):
            yield Paragraph(child, parent)
        elif isinstance(child, CT_Tbl):
            yield Table(child, parent)

def escape_html(text):
    return text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('\n', '<br>')

def run_export():
    docx_path = 'BAO_CAO_BAI_TAP_LON_AI_RECRUITMENT.docx'
    if not os.path.exists(docx_path):
        print(f"File {docx_path} not found!")
        return

    doc = Document(docx_path)
    print("Reading docx blocks...")

    html_parts = []
    md_parts = []

    # HTML Header
    html_parts.append("""<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BÁO CÁO BÀI TẬP LỚN: HỆ THỐNG TUYỂN DỤNG TÍCH HỢP AI</title>
    <style>
        @page {
            size: A4;
            margin: 20mm 20mm 20mm 25mm;
        }
        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.35;
            color: #1e293b;
            background-color: #f8fafc;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 960px;
            margin: 0 auto;
            background: #ffffff;
            padding: 40px 50px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            border-radius: 4px;
        }
        h1 {
            font-size: 15pt;
            color: #1e3a8a;
            border-bottom: 2px solid #1e3a8a;
            padding-bottom: 6px;
            margin-top: 30px;
            text-transform: uppercase;
        }
        h2 {
            font-size: 13pt;
            color: #0f766e;
            margin-top: 24px;
        }
        h3 {
            font-size: 12pt;
            color: #0f172a;
            margin-top: 18px;
        }
        p {
            text-align: justify;
            margin-bottom: 10px;
            text-indent: 1.5em;
        }
        .no-indent {
            text-indent: 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 16px 0;
            font-size: 10pt;
        }
        th, td {
            border: 1px solid #cbd5e1;
            padding: 6px 8px;
            text-align: left;
            vertical-align: top;
        }
        th {
            background-color: #1e3a8a;
            color: #ffffff;
            font-weight: bold;
            text-align: center;
        }
        tr:nth-child(even) {
            background-color: #f8fafc;
        }
        .center {
            text-align: center;
        }
        .img-container {
            text-align: center;
            margin: 20px 0;
        }
        .img-container img {
            max-width: 95%;
            height: auto;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .caption {
            font-size: 10pt;
            font-style: italic;
            font-weight: bold;
            color: #475569;
            margin-top: 6px;
            text-align: center;
        }
        .alert-box {
            background-color: #fef2f2;
            border-left: 4px solid #ef4444;
            padding: 12px 16px;
            margin: 16px 0;
            font-size: 11pt;
            color: #991b1b;
        }
        .screenshot-placeholder {
            border: 2px dashed #2563eb;
            background-color: #f0f7ff;
            padding: 24px 20px;
            text-align: center;
            margin: 20px auto;
            max-width: 90%;
            border-radius: 6px;
        }
        .placeholder-icon {
            font-weight: bold;
            font-size: 11pt;
            color: #1e3a8a;
            margin-bottom: 8px;
        }
        .placeholder-desc {
            font-size: 10pt;
            font-style: italic;
            color: #475569;
            line-height: 1.4;
        }
        @media print {
            body {
                background: none;
                padding: 0;
            }
            .container {
                box-shadow: none;
                padding: 0;
                max-width: 100%;
            }
            .page-break {
                page-break-before: always;
            }
        }
    </style>
</head>
<body>
<div class="container">
""")

    # Mapping of image captions to local files
    caption_to_img = {
        "Hình 1.1: Sơ đồ quy trình tuyển dụng thủ công hiện tại (As-Is) & các điểm nghẽn": "docs_images/as_is_recruitment_flow.png",
        "Hình 2.1: Sơ đồ phân rã chức năng (FDD) Hệ thống Tuyển dụng AI": "docs_images/hinh_1_2_phan_ra_chuc_nang.png",
        "Hình 2.2: Biểu đồ Use Case tổng quát (URM Diagram)": "docs_images/hinh_1_1_urm.png",
        "Hình 2.3: Biểu đồ lớp tổng thể đầy đủ 17 thực thể chuẩn ATS": "docs_images/hinh_1_3_bieu_do_lop_day_du.png",
        "Hình 2.4: Phân rã lớp Tài khoản - Ứng viên - Hồ sơ CV": "docs_images/hinh_1_4_lop_tai_khoan_ung_vien_ho_so.png",
        "Hình 2.5: Phân rã lớp Vị trí công việc - Tin tuyển dụng - Lịch phỏng vấn": "docs_images/hinh_1_5_lop_vi_tri_tin_dang_phong_van.png",
        "Hình 2.6: Phân rã lớp Dịch vụ AI (DichVuAI) - Báo cáo - Thông báo": "docs_images/hinh_1_6_lop_dich_vu_ai_bao_cao_thong_bao.png",
        "Hình 2.7: Sơ đồ trình tự Xác thực Đăng nhập & Cấp phát JWT / RBAC Scope": "docs_images/seq_01_auth_jwt.png",
        "Hình 2.8: Sơ đồ trình tự Tiếp nhận CV, OCR & AI Đối sánh Năng lực RAG": "docs_images/seq_02_cv_ai_matching.png",
        "Hình 2.9: Sơ đồ trình tự Điều phối Lịch phỏng vấn & Gợi ý câu hỏi AI Copilot": "docs_images/seq_03_interview_ai_questions.png",
        "Hình 2.10: Sơ đồ trình tự Thống kê & Hỏi đáp điều hành Safe Text-to-SQL": "docs_images/seq_04_text_to_sql_analytics.png",
        "Hình 2.11: Sơ đồ hoạt động (Activity Diagram): Đăng nhập hệ thống & Phân quyền (UC-01)": "docs_images/act_01_login.png",
        "Hình 2.12: Sơ đồ hoạt động (Activity Diagram): Đăng tin tuyển dụng (UC-02)": "docs_images/act_02_post_job.png",
        "Hình 2.13: Sơ đồ hoạt động (Activity Diagram): Nộp hồ sơ ứng tuyển & OCR (UC-03)": "docs_images/act_03_apply_cv.png",
        "Hình 2.14: Sơ đồ hoạt động (Activity Diagram): AI Đối sánh năng lực RAG (UC-04)": "docs_images/act_04_ai_matching.png",
        "Hình 2.15: Sơ đồ hoạt động (Activity Diagram): Điều phối lịch phỏng vấn & Gợi ý câu hỏi (UC-05)": "docs_images/act_05_interview_schedule.png",
        "Hình 2.16: Sơ đồ hoạt động (Activity Diagram): Safe Text-to-SQL Analytics (UC-06)": "docs_images/act_06_safe_text_to_sql.png",
        "Hình 2.17: Sơ đồ luồng màn hình tổng quan (Screen Flow Diagram)": "docs_images/screen_flow_diagram.png",
        "Hình 2.21: Sơ đồ Quan hệ Thực thể Logic (ERD) 17 bảng dữ liệu chuẩn 3NF": "docs_images/hinh_3_1_erd_logic.png"
    }

    for block in iter_block_items(doc):
        if isinstance(block, Paragraph):
            text = block.text.strip()
            if not text:
                continue

            style_name = block.style.name if block.style else ""

            # Check if this paragraph is an image caption
            matched_img = None
            for cap, path in caption_to_img.items():
                if cap in text:
                    matched_img = (cap, path)
                    break

            if matched_img:
                cap, path = matched_img
                html_parts.append(f"""
<div class="img-container">
    <img src="{path}" alt="{cap}">
    <div class="caption">{cap}</div>
</div>
""")
                md_parts.append(f"\n![{cap}]({path})\n*{cap}*\n")
                continue

            if style_name.startswith('Heading 1') or (text.startswith('CHƯƠNG') or text.startswith('MỤC LỤC') or text.startswith('DANH MỤC')):
                html_parts.append(f"<h1>{escape_html(text)}</h1>\n")
                md_parts.append(f"\n# {text}\n")
            elif style_name.startswith('Heading 2') or (len(text) > 2 and text[0].isdigit() and text[1] == '.' and len(text) < 100):
                html_parts.append(f"<h2>{escape_html(text)}</h2>\n")
                md_parts.append(f"\n## {text}\n")
            elif style_name.startswith('Heading 3') or (len(text) > 4 and text[:2] in ['Bả', 'Ch', '2.', '3.', '4.', '5.', '6.'] and len(text) < 120 and ('Bảng' in text or 'Hình' in text or '2.' in text or '5.' in text or '6.' in text)):
                html_parts.append(f"<h3>{escape_html(text)}</h3>\n")
                md_parts.append(f"\n### {text}\n")
            elif "NGUYÊN TẮC CỐT LÕI (HUMAN-IN-THE-LOOP)" in text:
                html_parts.append(f'<div class="alert-box">{escape_html(text)}</div>\n')
                md_parts.append(f"\n> ⚠️ **{text}**\n")
            elif block.style.name == 'List Bullet':
                html_parts.append(f"<ul><li>{escape_html(text)}</li></ul>\n")
                md_parts.append(f"* {text}\n")
            else:
                html_parts.append(f"<p>{escape_html(text)}</p>\n")
                md_parts.append(f"\n{text}\n")

        elif isinstance(block, Table):
            # Check if this table is a screenshot placeholder
            if len(block.rows) == 1 and len(block.columns) == 1 and "DÁN ẢNH CHỤP MÀN HÌNH" in block.rows[0].cells[0].text:
                full_cell_text = block.rows[0].cells[0].text.strip()
                desc_text = full_cell_text.replace("📷 [DÁN ẢNH CHỤP MÀN HÌNH TẠI ĐÂY]", "").strip()
                html_parts.append(f"""
<div class="screenshot-placeholder">
    <div class="placeholder-icon">📷 [DÁN ẢNH CHỤP MÀN HÌNH TẠI ĐÂY]</div>
    <div class="placeholder-desc">{escape_html(desc_text)}</div>
</div>
""")
                md_parts.append(f"\n> 📷 **[DÁN ẢNH CHỤP MÀN HÌNH TẠI ĐÂY]**  \n> *{desc_text}*\n")
                continue

            # Standard HTML/MD Table
            html_table = ["<table>\n"]
            md_table = []

            for r_idx, row in enumerate(block.rows):
                is_header = (r_idx == 0)
                html_table.append("  <tr>\n")
                row_cells_text = [cell.text.strip().replace('\n', '<br>') for cell in row.cells]
                row_md_text = [cell.text.strip().replace('\n', ' ') for cell in row.cells]

                tag = "th" if is_header else "td"
                for cell_text in row_cells_text:
                    html_table.append(f"    <{tag}>{cell_text}</{tag}>\n")
                html_table.append("  </tr>\n")

                if is_header:
                    md_table.append("| " + " | ".join(row_md_text) + " |")
                    md_table.append("| " + " | ".join(["---"] * len(row_md_text)) + " |")
                else:
                    md_table.append("| " + " | ".join(row_md_text) + " |")

            html_table.append("</table>\n")
            html_parts.append("".join(html_table))
            md_parts.append("\n" + "\n".join(md_table) + "\n")

    html_parts.append("""
</div>
</body>
</html>
""")

    # Write HTML
    html_out = "BAO_CAO_BAI_TAP_LON_AI_RECRUITMENT.html"
    with open(html_out, "w", encoding="utf-8") as f:
        f.write("".join(html_parts))
    print(f"SUCCESS: Saved {html_out} ({os.path.getsize(html_out)} bytes)")

    # Write Markdown
    md_out = "BAO_CAO_BAI_TAP_LON_AI_RECRUITMENT.md"
    with open(md_out, "w", encoding="utf-8") as f:
        f.write("".join(md_parts))
    print(f"SUCCESS: Saved {md_out} ({os.path.getsize(md_out)} bytes)")

if __name__ == "__main__":
    run_export()
