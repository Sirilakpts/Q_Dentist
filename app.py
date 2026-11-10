"""
Q_Dentist - ระบบจองคิวทันตกรรม เทศบาลนครบุรีรัมย์
Buriram City Municipality Dental Queue Booking System
Developed with Streamlit
"""

import streamlit as st
from datetime import date, timedelta
import pandas as pd
from typing import Optional

from data_manager import (
    DENTAL_SERVICES,
    TIME_SLOTS,
    STATUS_META,
    format_thai_date,
    format_phone,
    mask_phone,
    load_bookings,
    create_booking,
    cancel_booking,
    update_booking_status,
    find_booking,
    get_slot_availability,
)

# -----------------------------------------------------------------------------
# 1. Page Configuration
# -----------------------------------------------------------------------------
st.set_page_config(
    page_title="ระบบจองคิวทันตกรรม เทศบาลนครบุรีรัมย์",
    page_icon="🦷",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# -----------------------------------------------------------------------------
# 2. Custom CSS (Noto Sans Thai, Buriram Navy #063466, Soft Mint #E9F4F1, Gold #D5A423)
# -----------------------------------------------------------------------------
st.markdown(
    """
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700&display=swap');

    html, body, [class*="css"], .stMarkdown, .stButton, .stTextInput, .stSelectbox {
        font-family: 'Noto Sans Thai', sans-serif !important;
    }

    /* Main background & Container padding */
    .stApp {
        background-color: #F5F7FA;
    }
    .main .block-container {
        padding-top: 1.5rem;
        padding-bottom: 3rem;
        max-width: 1200px;
    }

    /* Top Brand Bar */
    .top-gov-bar {
        background: linear-gradient(90deg, #063466 0%, #0a4685 100%);
        color: #ffffff;
        padding: 12px 24px;
        border-radius: 12px;
        margin-bottom: 20px;
        box-shadow: 0 4px 14px rgba(6, 52, 102, 0.12);
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;
    }
    .gov-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 600;
        letter-spacing: 0.3px;
    }
    .gold-accent {
        color: #D5A423;
        font-weight: 700;
    }

    /* Hero Section */
    .hero-card {
        background: #ffffff;
        border-radius: 16px;
        padding: 32px 36px;
        border: 1px solid #E2E8F0;
        box-shadow: 0 4px 20px rgba(6, 52, 102, 0.05);
        margin-bottom: 28px;
    }
    .hero-title {
        color: #063466;
        font-size: 32px;
        font-weight: 700;
        line-height: 1.3;
        margin-bottom: 12px;
    }
    .hero-subtitle {
        color: #475569;
        font-size: 17px;
        line-height: 1.6;
        margin-bottom: 20px;
    }
    .hero-badge-pill {
        display: inline-block;
        background-color: #E9F4F1;
        color: #0d594b;
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 16px;
        border: 1px solid #bce2d8;
    }

    /* 4-Step Booking Guide */
    .section-header {
        text-align: center;
        margin: 32px 0 20px 0;
    }
    .section-title {
        color: #063466;
        font-size: 24px;
        font-weight: 700;
        margin-bottom: 6px;
    }
    .section-desc {
        color: #64748B;
        font-size: 15px;
    }

    .step-card {
        background: #ffffff;
        border: 1px solid #E2E8F0;
        border-radius: 14px;
        padding: 22px 16px;
        text-align: center;
        min-height: 185px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
    }
    .step-circle {
        width: 44px;
        height: 44px;
        background-color: #063466;
        color: #ffffff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 16px;
        box-shadow: 0 2px 6px rgba(6, 52, 102, 0.25);
    }
    .step-name {
        color: #063466;
        font-size: 16px;
        font-weight: 700;
        margin-bottom: 6px;
    }
    .step-detail {
        color: #64748B;
        font-size: 13px;
        line-height: 1.45;
    }

    /* Service Compact Cards */
    .service-card {
        background: #ffffff;
        border: 1px solid #E2E8F0;
        border-radius: 14px;
        padding: 20px 20px 16px 20px;
        transition: all 0.2s ease;
        box-shadow: 0 2px 8px rgba(0,0,0,0.03);
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    .service-card:hover {
        border-color: #063466;
        box-shadow: 0 6px 16px rgba(6, 52, 102, 0.08);
    }
    .service-icon-box {
        width: 44px;
        height: 44px;
        background: #E9F4F1;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        margin-bottom: 12px;
    }
    .service-name {
        color: #063466;
        font-size: 17px;
        font-weight: 700;
        margin-bottom: 6px;
    }
    .service-desc {
        color: #475569;
        font-size: 13.5px;
        line-height: 1.5;
        margin-bottom: 12px;
        flex-grow: 1;
    }
    .service-meta {
        font-size: 12px;
        color: #063466;
        background: #F1F5F9;
        padding: 4px 8px;
        border-radius: 6px;
        display: inline-block;
        font-weight: 600;
    }

    /* Contact Banner */
    .contact-banner {
        background: linear-gradient(135deg, #E9F4F1 0%, #d8ece7 100%);
        border: 1px solid #b7dfd4;
        border-radius: 14px;
        padding: 24px 28px;
        margin-top: 32px;
        color: #083b31;
    }

    /* Print Appointment Slip */
    .appointment-slip {
        background: #ffffff;
        border: 2px dashed #063466;
        border-radius: 16px;
        padding: 32px;
        margin: 20px auto;
        max-width: 650px;
        box-shadow: 0 8px 24px rgba(6, 52, 102, 0.08);
    }
    .slip-header {
        text-align: center;
        border-bottom: 2px solid #E2E8F0;
        padding-bottom: 16px;
        margin-bottom: 20px;
    }
    .slip-queue-number {
        font-size: 52px;
        font-weight: 800;
        color: #063466;
        letter-spacing: 2px;
        margin: 8px 0;
    }
    .slip-ref-code {
        font-size: 18px;
        color: #D5A423;
        font-weight: 700;
        background: #063466;
        display: inline-block;
        padding: 4px 16px;
        border-radius: 6px;
    }
    .slip-row {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px dashed #E2E8F0;
        font-size: 15px;
    }
    .slip-label {
        color: #64748B;
        font-weight: 500;
    }
    .slip-value {
        color: #063466;
        font-weight: 600;
    }

    /* Status Badges */
    .status-badge {
        display: inline-block;
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 13.5px;
        font-weight: 600;
    }

    /* Custom Streamlit Buttons */
    div.stButton > button:first-child {
        background-color: #063466;
        color: #ffffff;
        font-weight: 600;
        border-radius: 8px;
        border: none;
        padding: 8px 18px;
        transition: all 0.15s ease-in-out;
    }
    div.stButton > button:first-child:hover {
        background-color: #0a4685;
        color: #ffffff;
        border: none;
        box-shadow: 0 4px 12px rgba(6, 52, 102, 0.2);
    }

    @media print {
        body * {
            visibility: hidden;
        }
        .appointment-slip, .appointment-slip * {
            visibility: visible;
        }
        .appointment-slip {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: 1px solid #000;
            box-shadow: none;
        }
    }
    </style>
    """,
    unsafe_allow_html=True,
)

# -----------------------------------------------------------------------------
# 3. Session State Initialization
# -----------------------------------------------------------------------------
if "active_nav" not in st.session_state:
    st.session_state.active_nav = "หน้าแรก"

if "booking_service_id" not in st.session_state:
    st.session_state.booking_service_id = "checkup"

if "latest_booking" not in st.session_state:
    st.session_state.latest_booking = None

if "tracking_result" not in st.session_state:
    st.session_state.tracking_result = None

# -----------------------------------------------------------------------------
# 4. Top Header & Navigation
# -----------------------------------------------------------------------------
st.markdown(
    """
    <div class="top-gov-bar">
        <div class="gov-badge">
            <span style="font-size: 24px;">🏛️</span>
            <div>
                <span style="font-size: 16px; font-weight: 700;">เทศบาลนครบุรีรัมย์</span> | กลุ่มงานทันตสาธารณสุข
                <div style="font-size: 12px; color: #E9F4F1; font-weight: 400;">ศูนย์บริการสาธารณสุขและทันตกรรม เทศบาลนครบุรีรัมย์</div>
            </div>
        </div>
        <div style="text-align: right; font-size: 13px; color: #E9F4F1;">
            เปิดทำการ จันทร์ - ศุกร์ <span class="gold-accent">08:30 - 16:30 น.</span> | โทร. 044-602-345
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)

# Navigation Menu
nav_tabs = ["🏠 หน้าแรก", "📅 จองคิวทันตกรรม", "🔍 ตรวจสอบคิว", "🩺 สำหรับเจ้าหน้าที่"]
active_tab = st.radio(
    "เลือกเมนูการใช้งาน",
    nav_tabs,
    index=0 if st.session_state.active_nav == "หน้าแรก"
          else 1 if st.session_state.active_nav == "จองคิวทันตกรรม"
          else 2 if st.session_state.active_nav == "ตรวจสอบคิว"
          else 3,
    horizontal=True,
    label_visibility="collapsed",
    key="nav_radio"
)
st.session_state.active_nav = active_tab.split(" ")[1]


# -----------------------------------------------------------------------------
# 5. TAB 1: หน้าแรก (Home)
# -----------------------------------------------------------------------------
if st.session_state.active_nav == "หน้าแรก":
    # Hero Section
    col_hero_left, col_hero_right = st.columns([3, 2], gap="large")

    with col_hero_left:
        st.markdown(
            """
            <div class="hero-badge-pill">✨ สะดวก รวดเร็ว ไม่ต้องรอคิวนานที่คลินิก</div>
            <div class="hero-title">ระบบจองคิวทันตกรรมออนไลน์<br><span style="color: #D5A423;">เทศบาลนครบุรีรัมย์</span></div>
            <div class="hero-subtitle">
                บริการจองเวลานัดหมายล่วงหน้าสำหรับการตรวจสุขภาพช่องปาก ขูดหินปูน อุดฟัน และถอนฟัน 
                เพื่อประชาชนในเขตเทศบาลนครบุรีรัมย์ ลดระยะเวลารอคอย บริการด้วยมาตรฐานและความใส่ใจ
            </div>
            """,
            unsafe_allow_html=True,
        )

        c1, c2 = st.columns([1, 1])
        with c1:
            if st.button("📅 จองคิวทันตกรรม", use_container_width=True):
                st.session_state.active_nav = "จองคิวทันตกรรม"
                st.rerun()
        with c2:
            if st.button("🔍 ตรวจสอบสถานะคิว", use_container_width=True):
                st.session_state.active_nav = "ตรวจสอบคิว"
                st.rerun()

    with col_hero_right:
        st.markdown(
            """
            <div class="hero-card" style="margin-bottom: 0; background: linear-gradient(135deg, #063466 0%, #0d4b8f 100%); color: white; text-align: center;">
                <div style="font-size: 56px; margin-bottom: 12px;">🦷✨</div>
                <div style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">ยิ้มสดใส สุขภาพฟันแข็งแรง</div>
                <div style="font-size: 14px; color: #E9F4F1; line-height: 1.6; margin-bottom: 16px;">
                    ให้บริการโดยทีมทันตแพทย์และบุคลากรผู้เชี่ยวชาญ เครื่องมือผ่านการฆ่าเชื้อตามมาตรฐานสากล
                </div>
                <div style="background: rgba(255,255,255,0.12); padding: 10px 16px; border-radius: 8px; font-size: 13px;">
                    📍 อาคารบริการสาธารณสุข ชั้น 2 เทศบาลนครบุรีรัมย์
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )

    st.markdown("<hr style='margin: 28px 0; border: none; border-top: 1px solid #E2E8F0;'>", unsafe_allow_html=True)

    # 4-Step Booking Section
    st.markdown(
        """
        <div class="section-header">
            <div class="section-title">ขั้นตอนการจองคิวง่ายๆ 4 ขั้นตอน</div>
            <div class="section-desc">ทำรายการเสร็จสิ้นภายใน 2 นาที ได้รับรหัสคิวและใบนัดหมายทันที</div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    col_s1, col_s2, col_s3, col_s4 = st.columns(4)

    steps_data = [
        ("1", "เลือกบริการทันตกรรม", "เลือกประเภทการรักษาที่ต้องการ เช่น ตรวจฟัน ขูดหินปูน หรืออุดฟัน"),
        ("2", "เลือกวันและเวลา", "เลือกวันทำการ จันทร์-ศุกร์ และรอบเวลาที่สะดวกเข้ารับบริการ"),
        ("3", "กรอกข้อมูลผู้รับบริการ", "ระบุชื่อ-นามสกุล เบอร์โทรศัพท์ และเลขท้ายบัตรประชาชน"),
        ("4", "รับใบนัดหมาย", "รับรหัสอ้างอิงและบันทึกใบนัดหมาย เพื่อแสดงต่อเจ้าหน้าที่"),
    ]

    for col, (num, title, desc) in zip([col_s1, col_s2, col_s3, col_s4], steps_data):
        with col:
            st.markdown(
                f"""
                <div class="step-card">
                    <div class="step-circle">{num}</div>
                    <div class="step-name">{title}</div>
                    <div class="step-detail">{desc}</div>
                </div>
                """,
                unsafe_allow_html=True,
            )

    st.markdown("<div style='height: 24px;'></div>", unsafe_allow_html=True)

    # Services Section
    st.markdown(
        """
        <div class="section-header">
            <div class="section-title">บริการทันตกรรมที่เปิดรับจองคิว</div>
            <div class="section-desc">ครอบคลุมการดูแลรักษาและส่งเสริมสุขภาพช่องปากเบื้องต้น</div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    s_cols = st.columns(4)
    service_icons = {"checkup": "🔍", "scaling": "✨", "filling": "🦷", "extraction": "🩹"}

    for idx, s in enumerate(DENTAL_SERVICES):
        with s_cols[idx]:
            icon = service_icons.get(s["id"], "🩺")
            st.markdown(
                f"""
                <div class="service-card">
                    <div>
                        <div class="service-icon-box">{icon}</div>
                        <div class="service-name">{s['name']}</div>
                        <div style="font-size: 12px; color: #D5A423; font-weight: 600; margin-bottom: 8px;">{s['category']}</div>
                        <div class="service-desc">{s['description'][:95]}...</div>
                    </div>
                    <div style="margin-top: 12px; display: flex; justify-content: space-between; align-items: center;">
                        <span class="service-meta">⏱️ ประมาณ {s['duration']} นาที</span>
                    </div>
                </div>
                """,
                unsafe_allow_html=True,
            )
            if st.button(f"จองคิว: {s['name']}", key=f"btn_svc_{s['id']}", use_container_width=True):
                st.session_state.booking_service_id = s["id"]
                st.session_state.active_nav = "จองคิวทันตกรรม"
                st.rerun()

    # Contact & Information Banner
    st.markdown(
        """
        <div class="contact-banner">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
                <div>
                    <div style="font-size: 18px; font-weight: 700; color: #063466; margin-bottom: 6px;">
                        📌 ติดต่อกลุ่มงานทันตสาธารณสุข เทศบาลนครบุรีรัมย์
                    </div>
                    <div style="font-size: 14px; color: #1e3a5f;">
                        ห้องตรวจทันตกรรม ชั้น 2 อาคารส่งเสริมสุขภาพ ถ.รมย์บุรี ต.ในเมือง อ.เมือง จ.บุรีรัมย์ 31000
                    </div>
                    <div style="font-size: 13.5px; color: #334155; margin-top: 4px;">
                        📞 โทรศัพท์: 044-602-345 ต่อ 201-203 | สายด่วนเทศบาล: 1132
                    </div>
                </div>
                <div style="text-align: right; background: white; padding: 12px 20px; border-radius: 10px; border: 1px solid #bce2d8;">
                    <div style="font-size: 13px; color: #64748B;">เวลาเปิดรับบริการ</div>
                    <div style="font-size: 16px; font-weight: 700; color: #063466;">วันจันทร์ - ศุกร์</div>
                    <div style="font-size: 14px; color: #059669; font-weight: 600;">08:30 - 16:30 น.</div>
                </div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )


# -----------------------------------------------------------------------------
# 6. TAB 2: จองคิวทันตกรรม (Booking Wizard)
# -----------------------------------------------------------------------------
elif st.session_state.active_nav == "จองคิวทันตกรรม":
    st.markdown(
        """
        <div class="section-header" style="text-align: left; margin-top: 10px;">
            <div class="section-title">📅 ระบบจองคิวทันตกรรมออนไลน์</div>
            <div class="section-desc">กรุณากรอกข้อมูลตามขั้นตอนเพื่อสำรองเวลานัดหมายล่วงหน้า</div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # If just booked, show the appointment slip!
    if st.session_state.latest_booking:
        bk = st.session_state.latest_booking
        st.success("🎉 บันทึกการจองคิวสำเร็จ! กรุณาบันทึกหรือถ่ายภาพหน้าจอใบนัดหมายนี้")

        st.markdown(
            f"""
            <div class="appointment-slip">
                <div class="slip-header">
                    <div style="font-size: 14px; color: #64748B; font-weight: 600;">ใบนัดหมายรับบริการทันตกรรม</div>
                    <div style="font-size: 20px; font-weight: 700; color: #063466;">เทศบาลนครบุรีรัมย์</div>
                    <div class="slip-queue-number">{bk['queueNumber']}</div>
                    <div class="slip-ref-code">รหัสอ้างอิง: {bk['referenceCode']}</div>
                </div>

                <div class="slip-row">
                    <span class="slip-label">บริการทันตกรรม</span>
                    <span class="slip-value">{bk['serviceName']}</span>
                </div>
                <div class="slip-row">
                    <span class="slip-label">วันที่นัดหมาย</span>
                    <span class="slip-value">{format_thai_date(bk['date'])}</span>
                </div>
                <div class="slip-row">
                    <span class="slip-label">ช่วงเวลา</span>
                    <span class="slip-value">{bk['timeSlot']}</span>
                </div>
                <div class="slip-row">
                    <span class="slip-label">ชื่อผู้รับบริการ</span>
                    <span class="slip-value">{bk['patientName']}</span>
                </div>
                <div class="slip-row">
                    <span class="slip-label">เบอร์โทรศัพท์</span>
                    <span class="slip-value">{format_phone(bk['phone'])}</span>
                </div>
                <div class="slip-row">
                    <span class="slip-label">เลขท้ายบัตร ปชช.</span>
                    <span class="slip-value">{bk['idCardLast4']}</span>
                </div>
                <div class="slip-row">
                    <span class="slip-label">สถานะคิว</span>
                    <span class="slip-value" style="color: #D97706;">⏳ รอเจ้าหน้าที่ยืนยัน</span>
                </div>

                <div style="background: #F8FAFC; padding: 14px; border-radius: 8px; margin-top: 18px; font-size: 13px; color: #475569;">
                    <strong>ข้อแนะนำก่อนเข้ารับบริการ:</strong><br>
                    • กรุณามาถึงก่อนเวลานัดหมายอย่างน้อย 15 นาที เพื่อลงทะเบียนและวัดสัญญาณชีพ<br>
                    • นำบัตรประจำตัวประชาชนตัวจริงมาแสดงต่อเจ้าหน้าที่จุดคัดกรอง<br>
                    • หากต้องการเลื่อนหรือยกเลิก สามารถตรวจสอบและจัดการผ่านเมนู "ตรวจสอบคิว"
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )

        col_b1, col_b2 = st.columns(2)
        with col_b1:
            if st.button("➕ ทำรายการจองคิวใหม่", use_container_width=True):
                st.session_state.latest_booking = None
                st.rerun()
        with col_b2:
            if st.button("🔍 ไปยังหน้าตรวจสอบคิว", use_container_width=True):
                st.session_state.active_nav = "ตรวจสอบคิว"
                st.session_state.tracking_result = bk
                st.session_state.latest_booking = None
                st.rerun()

    else:
        # Form Container
        col_form, col_info = st.columns([3, 2], gap="large")

        with col_form:
            st.subheader("1. เลือกบริการทันตกรรม")
            service_names = {s["id"]: s["name"] for s in DENTAL_SERVICES}
            selected_service_id = st.selectbox(
                "บริการทันตกรรม",
                options=list(service_names.keys()),
                format_func=lambda x: service_names[x],
                index=list(service_names.keys()).index(st.session_state.booking_service_id)
                      if st.session_state.booking_service_id in service_names else 0,
            )
            st.session_state.booking_service_id = selected_service_id
            active_svc = next(s for s in DENTAL_SERVICES if s["id"] == selected_service_id)

            st.markdown("<div style='height: 12px;'></div>", unsafe_allow_html=True)
            st.subheader("2. เลือกวันและช่วงเวลาเข้ารับบริการ")

            # Date calculation (Next 14 business days)
            today = date.today()
            available_dates = []
            curr = today
            while len(available_dates) < 14:
                if curr.weekday() < 5:  # Monday to Friday
                    available_dates.append(curr)
                curr += timedelta(days=1)

            selected_date = st.selectbox(
                "วันที่นัดหมาย (เปิดบริการวันจันทร์ - ศุกร์)",
                options=available_dates,
                format_func=lambda d: format_thai_date(d),
            )
            selected_date_str = selected_date.strftime("%Y-%m-%d")

            # Slots availability for selected date
            slots_data = get_slot_availability(selected_date_str)
            slot_options = []
            for s in slots_data:
                status_txt = f"ว่าง {s['remaining']} ที่" if s["is_available"] else "เต็ม"
                slot_options.append((s["time"], f"{s['time']} ({status_txt})", s["is_available"]))

            available_slot_choices = [item[0] for item in slot_options if item[2]]

            if not available_slot_choices:
                st.error("⚠️ คิวในวันที่เลือกเต็มทุกช่วงเวลาแล้ว กรุณาเลือกวันอื่น")
                selected_slot = None
            else:
                selected_slot = st.selectbox(
                    "ช่วงเวลาตรวจรักษา",
                    options=available_slot_choices,
                )

            st.markdown("<div style='height: 12px;'></div>", unsafe_allow_html=True)
            st.subheader("3. ข้อมูลผู้รับบริการ")

            p_name = st.text_input("ชื่อ-นามสกุล ผู้รับบริการ *", placeholder="เช่น นายสมชาย บุรีรัมย์")
            col_p1, col_p2 = st.columns(2)
            with col_p1:
                p_phone = st.text_input("เบอร์โทรศัพท์ (10 หลัก) *", placeholder="0812345678", max_chars=10)
            with col_p2:
                p_id_last4 = st.text_input("เลขท้ายบัตรประชาชน (4 หลัก) *", placeholder="1234", max_chars=4)

            p_symptom = st.text_area("อาการเบื้องต้นหรือข้อความถึงทันตแพทย์ (ถ้ามี)", placeholder="เช่น มีอาการเสียวฟันเวลาทานน้ำเย็น ต้องการตรวจสุขภาพฟันประจำปี")

            agree_check = st.checkbox("ข้าพเจ้ายืนยันว่าข้อมูลข้างต้นถูกต้อง และจะเดินทางมารับบริการตรงตามวันและเวลาที่เลือก")

            st.markdown("<div style='height: 16px;'></div>", unsafe_allow_html=True)

            if st.button("✅ ยืนยันการจองคิวทันตกรรม", use_container_width=True):
                # Validations
                if not p_name.strip():
                    st.error("กรุณาระบุชื่อ-นามสกุล")
                elif len("".join(filter(str.isdigit, p_phone))) < 9:
                    st.error("กรุณาระบุเบอร์โทรศัพท์ให้ถูกต้อง (9-10 หลัก)")
                elif len("".join(filter(str.isdigit, p_id_last4))) != 4:
                    st.error("กรุณาระบุเลขท้ายบัตรประชาชน 4 หลัก")
                elif not selected_slot:
                    st.error("กรุณาเลือกช่วงเวลาที่ยังว่างอยู่")
                elif not agree_check:
                    st.error("กรุณากดยินยอมและยืนยันข้อมูลก่อนทำรายการ")
                else:
                    res = create_booking(
                        service_id=selected_service_id,
                        date_str=selected_date_str,
                        time_slot=selected_slot,
                        patient_name=p_name,
                        phone=p_phone,
                        id_card_last4=p_id_last4,
                        symptom_note=p_symptom,
                    )
                    if res["success"]:
                        st.session_state.latest_booking = res["booking"]
                        st.rerun()
                    else:
                        st.error(res.get("error", "เกิดข้อผิดพลาดในการบันทึก"))

        with col_info:
            st.markdown(
                f"""
                <div style="background: white; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
                    <div style="font-size: 16px; font-weight: 700; color: #063466; margin-bottom: 12px;">
                        📋 รายละเอียดบริการ: {active_svc['name']}
                    </div>
                    <div style="font-size: 13.5px; color: #475569; margin-bottom: 12px;">
                        {active_svc['description']}
                    </div>
                    <div style="background: #E9F4F1; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #0d594b; margin-bottom: 14px;">
                        ⏱️ ระยะเวลาตรวจรักษาโดยประมาณ: <strong>{active_svc['duration']} นาที</strong>
                    </div>

                    <div style="font-size: 14px; font-weight: 600; color: #063466; margin-bottom: 8px;">
                        คำแนะนำและการเตรียมตัว:
                    </div>
                    <ul style="font-size: 13px; color: #64748B; padding-left: 18px; margin-bottom: 0;">
                        {"".join(f"<li>{prep}</li>" for prep in active_svc['preparation'])}
                    </ul>
                </div>

                <div style="background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 12px; padding: 18px; margin-top: 16px;">
                    <div style="font-weight: 700; color: #B45309; font-size: 14px; margin-bottom: 6px;">
                        ⚠️ ข้อกำหนดการรับบริการ
                    </div>
                    <div style="font-size: 12.5px; color: #78350F; line-height: 1.5;">
                        • ให้บริการตามลำดับคิวและช่วงเวลาที่นัดหมาย<br>
                        • หากมาสายเกิน 20 นาที สิทธิ์คิวอาจถูกส่งต่อแก่ผู้มารับบริการท่านอื่น<br>
                        • ผู้มีสิทธิหลักประกันสุขภาพ (บัตรทอง) ในเขตเทศบาล กรุณานำบัตรประชาชนมาแสดงเพื่อใช้สิทธิ์
                    </div>
                </div>
                """,
                unsafe_allow_html=True,
            )


# -----------------------------------------------------------------------------
# 7. TAB 3: ตรวจสอบและจัดการคิว (Tracking & Cancel)
# -----------------------------------------------------------------------------
elif st.session_state.active_nav == "ตรวจสอบคิว":
    st.markdown(
        """
        <div class="section-header" style="text-align: left; margin-top: 10px;">
            <div class="section-title">🔍 ตรวจสอบสถานะการจองคิว</div>
            <div class="section-desc">ค้นหารายละเอียดคิวของท่านด้วยรหัสอ้างอิง และยืนยันตัวตนด้วยเบอร์โทรหรือเลขท้ายบัตรประชาชน</div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    col_search, col_result = st.columns([1, 1], gap="large")

    with col_search:
        st.markdown(
            """
            <div style="background: white; border: 1px solid #E2E8F0; border-radius: 12px; padding: 22px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
                <div style="font-size: 16px; font-weight: 700; color: #063466; margin-bottom: 12px;">
                    กรอกข้อมูลเพื่อค้นหาคิว
                </div>
            """,
            unsafe_allow_html=True,
        )

        search_ref = st.text_input("รหัสอ้างอิงการจอง (เช่น BR-1001)", placeholder="BR-XXXX").strip().upper()
        search_verify = st.text_input("เบอร์โทรศัพท์ หรือ เลขท้าย 4 หลักบัตรประชาชน", placeholder="เช่น 0812345678 หรือ 1234").strip()

        if st.button("🔎 ตรวจสอบข้อมูล", use_container_width=True):
            if not search_ref:
                st.error("กรุณาระบุรหัสอ้างอิงการจอง")
            elif not search_verify:
                st.error("กรุณาระบุเบอร์โทรหรือเลขท้าย 4 หลักเพื่อยืนยันตัวตน")
            else:
                matches = find_booking(search_ref, search_verify)
                if matches:
                    st.session_state.tracking_result = matches[0]
                    st.success("พบข้อมูลการนัดหมาย!")
                else:
                    st.session_state.tracking_result = None
                    st.error("ไม่พบข้อมูลการจองที่ตรงกับรหัสอ้างอิงและข้อมูลยืนยันตัวตนที่ระบุ")

        st.markdown(
            """
                <div style="margin-top: 14px; font-size: 12.5px; color: #64748B;">
                    💡 หากลืมรหัสอ้างอิง สามารถติดต่อสอบถามกลุ่มงานทันตกรรม โทร. 044-602-345 ในวันและเวลาราชการ
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )

    with col_result:
        res = st.session_state.tracking_result
        if res:
            status_info = STATUS_META.get(res["status"], STATUS_META["pending"])
            st.markdown(
                f"""
                <div style="background: white; border: 1px solid #E2E8F0; border-radius: 12px; padding: 24px; box-shadow: 0 4px 12px rgba(6, 52, 102, 0.06);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; border-bottom: 1px solid #F1F5F9; padding-bottom: 12px;">
                        <div>
                            <span style="font-size: 13px; color: #64748B;">รหัสอ้างอิง:</span>
                            <span style="font-size: 16px; font-weight: 700; color: #063466;">{res['referenceCode']}</span>
                            <div style="font-size: 28px; font-weight: 800; color: #063466;">คิว {res['queueNumber']}</div>
                        </div>
                        <span class="status-badge" style="background: {status_info['bg']}; color: {status_info['color']};">
                            {status_info['label']}
                        </span>
                    </div>

                    <div style="font-size: 13.5px; color: #475569; margin-bottom: 16px; background: #F8FAFC; padding: 8px 12px; border-radius: 6px;">
                        📌 <strong>สถานะปัจจุบัน:</strong> {status_info['desc']}
                    </div>

                    <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 6px 0; color: #64748B; width: 40%;">บริการทันตกรรม:</td>
                            <td style="padding: 6px 0; font-weight: 600; color: #063466;">{res['serviceName']}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; color: #64748B;">วันที่นัดหมาย:</td>
                            <td style="padding: 6px 0; font-weight: 600; color: #063466;">{format_thai_date(res['date'])}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; color: #64748B;">ช่วงเวลา:</td>
                            <td style="padding: 6px 0; font-weight: 600; color: #063466;">{res['timeSlot']}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; color: #64748B;">ชื่อผู้รับบริการ:</td>
                            <td style="padding: 6px 0; font-weight: 600; color: #063466;">{res['patientName']}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; color: #64748B;">เบอร์โทรศัพท์:</td>
                            <td style="padding: 6px 0; font-weight: 600; color: #063466;">{mask_phone(res['phone'])}</td>
                        </tr>
                    </table>
                </div>
                """,
                unsafe_allow_html=True,
            )

            # Cancellation Action if active
            if res["status"] in ["pending", "confirmed"]:
                st.markdown("<div style='height: 12px;'></div>", unsafe_allow_html=True)
                with st.expander("❌ ต้องการยกเลิกการจองคิวนี้"):
                    cancel_reason = st.text_input("ระบุเหตุผลในการขอยกเลิก (เช่น ติดธุระด่วน)", key="cancel_reason_input")
                    if st.button("ยืนยันการยกเลิกคิว", key="confirm_cancel_btn"):
                        c_res = cancel_booking(res["referenceCode"], cancel_reason)
                        if c_res["success"]:
                            st.session_state.tracking_result = c_res["booking"]
                            st.warning("ยกเลิกรายการจองคิวเรียบร้อยแล้ว สิทธิ์ถูกคืนเข้าสู่ระบบ")
                            st.rerun()
                        else:
                            st.error(c_res.get("error", "ไม่สามารถยกเลิกได้"))
        else:
            st.info("👈 กรุณากรอกรหัสอ้างอิงเพื่อตรวจสอบสถานะคิวและใบนัดหมาย")


# -----------------------------------------------------------------------------
# 8. TAB 4: สำหรับเจ้าหน้าที่ (Staff Management Dashboard)
# -----------------------------------------------------------------------------
elif st.session_state.active_nav == "สำหรับเจ้าหน้าที่":
    st.markdown(
        """
        <div class="section-header" style="text-align: left; margin-top: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
                <div>
                    <div class="section-title">🩺 แผงควบคุมระบบคิวทันตกรรม (เจ้าหน้าที่)</div>
                    <div class="section-desc">จัดการรายการนัดหมาย อัปเดตสถานะคิวตรวจ และสรุปข้อมูลสถิติ</div>
                </div>
                <div style="background: #E9F4F1; color: #063466; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 12px;">
                    โหมดจัดการระบบ (Staff Portal)
                </div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    all_bookings = load_bookings()

    # Metrics Row
    m_col1, m_col2, m_col3, m_col4 = st.columns(4)
    total_count = len(all_bookings)
    pending_count = sum(1 for b in all_bookings if b.get("status") == "pending")
    confirmed_count = sum(1 for b in all_bookings if b.get("status") == "confirmed")
    completed_count = sum(1 for b in all_bookings if b.get("status") == "completed")

    m_col1.metric("คิวทั้งหมดในระบบ", f"{total_count} รายการ")
    m_col2.metric("รอเจ้าหน้าที่ยืนยัน", f"{pending_count} รายการ", delta=f"{pending_count} รอดำเนินการ", delta_color="inverse")
    m_col3.metric("ยืนยันนัดหมายแล้ว", f"{confirmed_count} รายการ")
    m_col4.metric("ตรวจเสร็จสิ้นแล้ว", f"{completed_count} รายการ")

    st.markdown("<hr style='margin: 18px 0; border: none; border-top: 1px solid #E2E8F0;'>", unsafe_allow_html=True)

    # Filter & Search
    f_col1, f_col2, f_col3 = st.columns([2, 2, 2])
    with f_col1:
        status_filter = st.selectbox(
            "กรองตามสถานะ",
            ["ทั้งหมด", "รอเจ้าหน้าที่ยืนยัน (pending)", "ยืนยันแล้ว (confirmed)", "เช็คอินแล้ว (checked_in)", "เสร็จสิ้น (completed)", "ยกเลิก (cancelled)"]
        )
    with f_col2:
        service_filter = st.selectbox(
            "กรองตามบริการ",
            ["ทุกบริการ"] + [s["name"] for s in DENTAL_SERVICES]
        )
    with f_col3:
        search_kw = st.text_input("ค้นหา (ชื่อ / รหัส / เบอร์โทร)", placeholder="พิมพ์ค้นหา...").strip().lower()

    # Apply filters
    filtered = all_bookings
    if status_filter != "ทั้งหมด":
        st_code = status_filter.split("(")[-1].replace(")", "").strip()
        filtered = [b for b in filtered if b.get("status") == st_code]

    if service_filter != "ทุกบริการ":
        filtered = [b for b in filtered if b.get("serviceName") == service_filter]

    if search_kw:
        filtered = [
            b for b in filtered
            if search_kw in b.get("patientName", "").lower()
            or search_kw in b.get("referenceCode", "").lower()
            or search_kw in b.get("queueNumber", "").lower()
            or search_kw in b.get("phone", "")
        ]

    st.markdown(f"<div style='font-size: 14px; font-weight: 600; color: #475569; margin-bottom: 8px;'>ผลการค้นหา: {len(filtered)} รายการ</div>", unsafe_allow_html=True)

    if filtered:
        for b in filtered:
            status_meta = STATUS_META.get(b.get("status", "pending"), STATUS_META["pending"])
            with st.expander(f"คิว {b.get('queueNumber')} [{b.get('referenceCode')}] - {b.get('patientName')} | {b.get('serviceName')} ({format_thai_date(b.get('date'), False)} {b.get('timeSlot')})"):
                c_info, c_action = st.columns([3, 2])
                with c_info:
                    st.write(f"**ชื่อผู้รับบริการ:** {b.get('patientName')}")
                    st.write(f"**เบอร์โทรศัพท์:** {format_phone(b.get('phone', ''))}")
                    st.write(f"**เลขท้ายบัตร ปชช.:** {b.get('idCardLast4', '-')}")
                    st.write(f"**วันเวลา:** {format_thai_date(b.get('date'))} ({b.get('timeSlot')})")
                    if b.get("symptomNote"):
                        st.write(f"**อาการที่ระบุ:** {b.get('symptomNote')}")
                    if b.get("cancelReason"):
                        st.write(f"**เหตุผลที่ยกเลิก:** {b.get('cancelReason')}")

                with c_action:
                    st.markdown(
                        f"""
                        <div style="margin-bottom: 12px;">
                            สถานะปัจจุบัน: <span class="status-badge" style="background: {status_meta['bg']}; color: {status_meta['color']};">{status_meta['label']}</span>
                        </div>
                        """,
                        unsafe_allow_html=True,
                    )
                    new_st = st.selectbox(
                        "เปลี่ยนสถานะ",
                        options=["pending", "confirmed", "checked_in", "completed", "cancelled"],
                        format_func=lambda x: STATUS_META[x]["label"],
                        index=["pending", "confirmed", "checked_in", "completed", "cancelled"].index(b.get("status", "pending")),
                        key=f"status_sel_{b.get('id', b.get('referenceCode'))}"
                    )
                    if st.button("💾 บันทึกสถานะ", key=f"btn_save_{b.get('id', b.get('referenceCode'))}"):
                        update_booking_status(b.get("referenceCode"), new_st)
                        st.success(f"อัปเดตสถานะคิว {b.get('queueNumber')} เป็น '{STATUS_META[new_st]['label']}' เรียบร้อย")
                        st.rerun()
    else:
        st.info("ไม่พบรายการจองตามเงื่อนไขที่ระบุ")

# -----------------------------------------------------------------------------
# 9. Footer
# -----------------------------------------------------------------------------
st.markdown(
    """
    <div style="text-align: center; color: #94A3B8; font-size: 13px; margin-top: 48px; border-top: 1px solid #E2E8F0; padding-top: 20px;">
        ระบบจองคิวทันตกรรม เทศบาลนครบุรีรัมย์ © 2569 | กลุ่มงานทันตสาธารณสุข เทศบาลนครบุรีรัมย์<br>
        ให้บริการประชาชนด้วยความโปร่งใส สะดวก รวดเร็ว และเป็นธรรม
    </div>
    """,
    unsafe_allow_html=True,
)
