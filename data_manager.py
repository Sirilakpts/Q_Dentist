import json
import os
import random
import string
from datetime import datetime, date, timedelta
from typing import Dict, List, Optional, Any

DATA_FILE = os.path.join(os.path.dirname(__file__), "bookings_data.json")

DENTAL_SERVICES = [
    {
        "id": "checkup",
        "name": "ตรวจฟันและให้คำปรึกษา",
        "category": "ตรวจสุขภาพช่องปาก",
        "description": "ตรวจสุขภาพฟันและเหงือกเบื้องต้น วินิจฉัยโรคในช่องปาก วางแผนการรักษา และให้คำแนะนำการดูแลฟัน",
        "duration": 20,
        "badge": "คิวเร็ว",
        "preparation": [
            "แปรงฟันทำความสะอาดช่องปากก่อนเข้ารับบริการ",
            "นำบัตรประจำตัวประชาชนและประวัติการแพ้ยา (ถ้ามี)",
            "หากมีโรคประจำตัวหรือรับประทานยาละลายลิ่มเลือด กรุณาแจ้งล่วงหน้า",
        ],
    },
    {
        "id": "scaling",
        "name": "ขูดหินปูน",
        "category": "ทันตกรรมป้องกัน",
        "description": "ขจัดคราบหินปูน คราบแบคทีเรีย และคราบพลัคที่เกาะแน่นบนผิวฟันและใต้ขอบเหงือก ป้องกันเหงือกอักเสบ",
        "duration": 30,
        "preparation": [
            "รับประทานอาหารให้เรียบร้อยก่อนรับบริการอย่างน้อย 1 ชั่วโมง",
            "ผู้ป่วยความดันโลหิตสูงควรควบคุมระดับความดันให้อยู่ในเกณฑ์ปกติ",
            "แจ้งประวัติโรคหัวใจหรือการใส่ลิ้นหัวใจเทียมแก่เจ้าหน้าที่",
        ],
    },
    {
        "id": "filling",
        "name": "อุดฟัน",
        "category": "ทันตกรรมบูรณะ",
        "description": "บูรณะรอยผุ รูฟันผุ หรือฟันบิ่นแตก ด้วยวัสดุคอมโพสิตสีเหมือนฟันหรืออะมัลกัม เพื่อคืนการทำงานและความสวยงาม",
        "duration": 40,
        "preparation": [
            "ทำความสะอาดช่องปากให้สะอาด",
            "หากมีอาการปวดฟันรุนแรงหรือมีหนอง ควรแจ้งเพื่อรับการตรวจประเมินก่อน",
            "หลีกเลี่ยงการดื่มชา กาแฟ หรือน้ำอัดลมก่อนเวลานัด",
        ],
    },
    {
        "id": "extraction",
        "name": "ถอนฟัน",
        "category": "ศัลยศาสตร์ช่องปาก",
        "description": "ถอนฟันที่ไม่สามารถรักษาหรือเก็บไว้ได้ เช่น ฟันผุลึกถึงโพรงประสาท ฟันโยกจากโรคปริทันต์ขั้นรุนแรง",
        "duration": 45,
        "preparation": [
            "พักผ่อนให้เพียงพออย่างน้อย 6-8 ชั่วโมงในคืนก่อนหน้า",
            "รับประทานอาหารให้เรียบร้อยก่อนเข้ารับการถอนฟัน",
            "ผู้ที่ทานยาต้านการแข็งตัวของเลือด ต้องปรึกษาแพทย์ประจำตัวก่อน",
            "เตรียมผู้ดูแลหรือยานพาหนะเดินทางกลับบ้าน",
        ],
    },
]

TIME_SLOTS = [
    {"id": "s1", "time": "08:30 - 09:30 น.", "capacity": 4},
    {"id": "s2", "time": "09:30 - 10:30 น.", "capacity": 4},
    {"id": "s3", "time": "10:30 - 11:30 น.", "capacity": 3},
    {"id": "s4", "time": "13:00 - 14:00 น.", "capacity": 4},
    {"id": "s5", "time": "14:00 - 15:00 น.", "capacity": 3},
    {"id": "s6", "time": "15:00 - 16:00 น.", "capacity": 2},
]

STATUS_META = {
    "pending": {
        "label": "รอเจ้าหน้าที่ยืนยัน",
        "color": "#D97706",
        "bg": "#FEF3C7",
        "desc": "ระบบบันทึกคำขอจองคิวเรียบร้อย อยู่ระหว่างรอเจ้าหน้าที่ตรวจสอบ",
    },
    "confirmed": {
        "label": "ยืนยันนัดหมายแล้ว",
        "color": "#059669",
        "bg": "#D1FAE5",
        "desc": "เจ้าหน้าที่ยืนยันช่วงเวลาและคิวตรวจรักษาเรียบร้อยแล้ว",
    },
    "checked_in": {
        "label": "เช็คอินแล้ว",
        "color": "#2563EB",
        "bg": "#DBEAFE",
        "desc": "ผู้รับบริการมาถึงจุดบริการและลงทะเบียนแล้ว",
    },
    "completed": {
        "label": "รับบริการเสร็จสิ้น",
        "color": "#475569",
        "bg": "#F1F5F9",
        "desc": "เสร็จสิ้นกระบวนการตรวจรักษาเรียบร้อย",
    },
    "cancelled": {
        "label": "ยกเลิกการจอง",
        "color": "#DC2626",
        "bg": "#FEE2E2",
        "desc": "รายการจองนี้ถูกยกเลิกแล้ว สิทธิ์ถูกคืนสู่ระบบ",
    },
}

THAI_MONTHS = [
    "", "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
]

THAI_DAYS = ["วันจันทร์", "วันอังคาร", "วันพุธ", "วันพฤหัสบดี", "วันศุกร์", "วันเสาร์", "วันอาทิตย์"]

def format_thai_date(date_val: Any, include_day_name: bool = True) -> str:
    if isinstance(date_val, str):
        try:
            d = datetime.strptime(date_val, "%Y-%m-%d").date()
        except ValueError:
            return date_val
    elif isinstance(date_val, (datetime, date)):
        d = date_val if isinstance(date_val, date) else date_val.date()
    else:
        return ""

    thai_year = d.year + 543
    month_name = THAI_MONTHS[d.month]
    day_name = THAI_DAYS[d.weekday()]

    if include_day_name:
        return f"{day_name}ที่ {d.day} {month_name} พ.ศ. {thai_year}"
    return f"{d.day} {month_name} {thai_year}"

def format_phone(phone: str) -> str:
    clean = "".join(filter(str.isdigit, phone))
    if len(clean) == 10:
        return f"{clean[:3]}-{clean[3:6]}-{clean[6:]}"
    if len(clean) == 9:
        return f"{clean[:2]}-{clean[2:5]}-{clean[5:]}"
    return phone

def mask_phone(phone: str) -> str:
    clean = "".join(filter(str.isdigit, phone))
    if len(clean) == 10:
        return f"{clean[:3]}-XXX-{clean[6:]}"
    return phone

def get_initial_mock_bookings() -> List[Dict[str, Any]]:
    today = date.today().strftime("%Y-%m-%d")
    tomorrow = (date.today() + timedelta(days=1)).strftime("%Y-%m-%d")
    return [
        {
            "id": "BK-SAMPLE-001",
            "referenceCode": "BR-1001",
            "queueNumber": "A01",
            "serviceId": "checkup",
            "serviceName": "ตรวจฟันและให้คำปรึกษา",
            "date": today,
            "timeSlot": "08:30 - 09:30 น.",
            "patientName": "สมชาย บุรีรัมย์ดี",
            "phone": "0812345678",
            "idCardLast4": "1234",
            "symptomNote": "ต้องการตรวจสุขภาพฟันประจำปี",
            "status": "confirmed",
            "createdAt": datetime.now().isoformat(),
        },
        {
            "id": "BK-SAMPLE-002",
            "referenceCode": "BR-1002",
            "queueNumber": "B01",
            "serviceId": "scaling",
            "serviceName": "ขูดหินปูน",
            "date": today,
            "timeSlot": "09:30 - 10:30 น.",
            "patientName": "สมหญิง ศรีนคร",
            "phone": "0898765432",
            "idCardLast4": "5678",
            "symptomNote": "มีหินปูนสะสมบริเวณฟันหน้าล่าง",
            "status": "pending",
            "createdAt": datetime.now().isoformat(),
        },
        {
            "id": "BK-SAMPLE-003",
            "referenceCode": "BR-1003",
            "queueNumber": "C01",
            "serviceId": "filling",
            "serviceName": "อุดฟัน",
            "date": tomorrow,
            "timeSlot": "08:30 - 09:30 น.",
            "patientName": "วิชัย มั่งมี",
            "phone": "0861112233",
            "idCardLast4": "9988",
            "symptomNote": "เสียวฟันเวลารับประทานน้ำเย็น",
            "status": "confirmed",
            "createdAt": datetime.now().isoformat(),
        },
    ]

def load_bookings() -> List[Dict[str, Any]]:
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    initial = get_initial_mock_bookings()
    save_bookings(initial)
    return initial

def save_bookings(bookings: List[Dict[str, Any]]) -> None:
    try:
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(bookings, f, ensure_ascii=False, indent=2)
    except Exception:
        pass

def generate_ref_code() -> str:
    chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"
    rand = "".join(random.choice(chars) for _ in range(4))
    return f"BR-{rand}"

def generate_queue_number(service_id: str, date_str: str, bookings: List[Dict[str, Any]]) -> str:
    prefix_map = {"checkup": "A", "scaling": "B", "filling": "C", "extraction": "D"}
    prefix = prefix_map.get(service_id, "Q")
    count = sum(1 for b in bookings if b.get("date") == date_str and b.get("serviceId") == service_id)
    return f"{prefix}{str(count + 1).zfill(2)}"

def create_booking(
    service_id: str,
    date_str: str,
    time_slot: str,
    patient_name: str,
    phone: str,
    id_card_last4: str,
    symptom_note: str = ""
) -> Dict[str, Any]:
    bookings = load_bookings()
    service = next((s for s in DENTAL_SERVICES if s["id"] == service_id), None)
    if not service:
        return {"success": False, "error": "ไม่พบบริการทันตกรรมที่เลือก"}

    ref_code = generate_ref_code()
    queue_no = generate_queue_number(service_id, date_str, bookings)

    new_booking = {
        "id": f"BK-{int(datetime.now().timestamp())}",
        "referenceCode": ref_code,
        "queueNumber": queue_no,
        "serviceId": service_id,
        "serviceName": service["name"],
        "date": date_str,
        "timeSlot": time_slot,
        "patientName": patient_name.strip(),
        "phone": "".join(filter(str.isdigit, phone)),
        "idCardLast4": "".join(filter(str.isdigit, id_card_last4)),
        "symptomNote": symptom_note.strip() if symptom_note else "",
        "status": "pending",
        "createdAt": datetime.now().isoformat(),
    }

    bookings.insert(0, new_booking)
    save_bookings(bookings)
    return {"success": True, "booking": new_booking}

def cancel_booking(ref_code: str, reason: str = "") -> Dict[str, Any]:
    bookings = load_bookings()
    target = None
    for b in bookings:
        if b.get("referenceCode", "").upper() == ref_code.strip().upper():
            target = b
            break

    if not target:
        return {"success": False, "error": "ไม่พบรายการจองตามรหัสอ้างอิงนี้"}

    if target.get("status") == "cancelled":
        return {"success": False, "error": "รายการนี้ถูกยกเลิกไปแล้ว"}

    if target.get("status") in ["completed", "checked_in"]:
        return {"success": False, "error": "ไม่สามารถยกเลิกรายการที่เสร็จสิ้นหรือเช็คอินแล้ว"}

    target["status"] = "cancelled"
    target["cancelReason"] = reason.strip() or "ผู้รับบริการขอยกเลิกผ่านระบบ"
    target["updatedAt"] = datetime.now().isoformat()
    save_bookings(bookings)
    return {"success": True, "booking": target}

def update_booking_status(ref_code: str, new_status: str, reason: str = "") -> Dict[str, Any]:
    bookings = load_bookings()
    for b in bookings:
        if b.get("referenceCode", "").upper() == ref_code.strip().upper():
            b["status"] = new_status
            b["updatedAt"] = datetime.now().isoformat()
            if new_status == "cancelled":
                b["cancelReason"] = reason.strip() or "เจ้าหน้าที่ยกเลิกรายการ"
            save_bookings(bookings)
            return {"success": True, "booking": b}
    return {"success": False, "error": "ไม่พบรายการจองตามรหัสนี้"}

def find_booking(ref_code: str, verify_info: str) -> List[Dict[str, Any]]:
    bookings = load_bookings()
    clean_ref = ref_code.strip().upper()
    clean_verify = "".join(filter(str.isdigit, verify_info.strip()))

    results = []
    for b in bookings:
        if b.get("referenceCode", "").upper() == clean_ref:
            phone_match = len(clean_verify) >= 4 and b.get("phone", "").endswith(clean_verify)
            id_match = b.get("idCardLast4", "") == clean_verify
            if phone_match or id_match:
                results.append(b)
    return results

def get_slot_availability(date_str: str) -> List[Dict[str, Any]]:
    bookings = load_bookings()
    active_bookings = [b for b in bookings if b.get("date") == date_str and b.get("status") != "cancelled"]

    slots_status = []
    for s in TIME_SLOTS:
        booked_count = sum(1 for b in active_bookings if b.get("timeSlot") == s["time"])
        available = booked_count < s["capacity"]
        slots_status.append({
            "id": s["id"],
            "time": s["time"],
            "capacity": s["capacity"],
            "booked_count": booked_count,
            "remaining": max(0, s["capacity"] - booked_count),
            "is_available": available,
        })
    return slots_status
