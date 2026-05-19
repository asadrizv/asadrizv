from sqlmodel import Session, select
from .database import engine
from .models import Category, Business, Service, Staff


CATEGORIES = [
    ("salon", "Salons", "scissors", "Hair, color, and styling"),
    ("barber", "Barbers", "razor", "Cuts, shaves, and grooming"),
    ("spa", "Spa & Massage", "lotus", "Relax, recover, refresh"),
    ("nails", "Nails", "sparkle", "Manicure, pedicure, nail art"),
    ("clinic", "Clinics", "stethoscope", "Dermatology and wellness"),
    ("fitness", "Fitness", "dumbbell", "Gyms and personal trainers"),
    ("tutor", "Tutors", "book", "Academic and skill tutors"),
    ("auto", "Auto Care", "car", "Wash, detail, and service"),
]


BUSINESSES = [
    {
        "slug": "nabilas-karachi", "name": "Nabila's", "tagline": "Pakistan's most iconic salon",
        "description": "Premium hair, color, makeup and bridal services. A legendary destination since 1989.",
        "category_slug": "salon", "city": "Karachi", "address": "Block 4, Clifton, Karachi",
        "phone": "+92 21 3530 7700", "rating": 4.9, "review_count": 412,
        "cover_image": "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80",
        "services": [
            ("Signature Haircut", "Consultation, shampoo, cut, blow dry", 60, 4500),
            ("Hair Color", "Global color with premium products", 120, 12000),
            ("Bridal Makeup", "Full HD bridal makeup with trial", 180, 45000),
            ("Keratin Treatment", "Smoothing keratin treatment", 150, 22000),
        ],
        "staff": [("Sana A.", "Senior Stylist"), ("Hira M.", "Color Specialist"), ("Faiza R.", "Bridal Artist")],
    },
    {
        "slug": "depilex-lahore", "name": "Depilex", "tagline": "Hair, beauty and bridal experts",
        "description": "Trusted name in Pakistan for hair, skin and bridal makeovers across the country.",
        "category_slug": "salon", "city": "Lahore", "address": "MM Alam Road, Gulberg III, Lahore",
        "phone": "+92 42 3577 1111", "rating": 4.7, "review_count": 298,
        "cover_image": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&q=80",
        "services": [
            ("Haircut & Style", "Cut, wash, and blowout", 50, 3500),
            ("Facial - Deep Cleanse", "60-minute hydrating facial", 60, 5500),
            ("Mehndi Application", "Bridal or party mehndi", 90, 8000),
        ],
        "staff": [("Ayesha K.", "Senior Stylist"), ("Mehwish T.", "Beautician")],
    },
    {
        "slug": "the-barber-co-islamabad", "name": "The Barber Co.", "tagline": "Modern men's grooming",
        "description": "Sharp cuts, hot-towel shaves, and beard sculpting in a relaxed lounge atmosphere.",
        "category_slug": "barber", "city": "Islamabad", "address": "F-7 Markaz, Islamabad",
        "phone": "+92 51 265 0099", "rating": 4.8, "review_count": 187,
        "cover_image": "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&q=80",
        "services": [
            ("Classic Haircut", "Scissor and clipper cut", 40, 2500),
            ("Hot-Towel Shave", "Traditional straight-razor shave", 30, 1800),
            ("Beard Sculpt", "Trim, line-up and conditioning", 25, 1500),
            ("Father & Son Combo", "Two haircuts in one visit", 70, 4000),
        ],
        "staff": [("Bilal H.", "Master Barber"), ("Usman F.", "Barber")],
    },
    {
        "slug": "truefitt-and-hill-karachi", "name": "Truefitt & Hill", "tagline": "Heritage gentlemen's grooming",
        "description": "The world's oldest barber shop, now serving Karachi's discerning gentlemen.",
        "category_slug": "barber", "city": "Karachi", "address": "Dolmen Mall, Clifton, Karachi",
        "phone": "+92 21 3529 1234", "rating": 4.9, "review_count": 156,
        "cover_image": "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=1200&q=80",
        "services": [
            ("Royal Shave", "The full traditional experience", 45, 4500),
            ("Executive Haircut", "Precision cut with consultation", 50, 3800),
            ("Head Massage", "20-minute scalp therapy", 20, 2200),
        ],
        "staff": [("Imran S.", "Master Barber"), ("Adeel Q.", "Senior Barber")],
    },
    {
        "slug": "serena-spa-islamabad", "name": "Serena Spa", "tagline": "Five-star relaxation",
        "description": "Award-winning spa within Serena Hotel offering massage, hammam, and body treatments.",
        "category_slug": "spa", "city": "Islamabad", "address": "Serena Hotel, Khayaban-e-Suhrwardy",
        "phone": "+92 51 287 4000", "rating": 4.9, "review_count": 221,
        "cover_image": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=80",
        "services": [
            ("Deep Tissue Massage", "60-minute therapeutic massage", 60, 12000),
            ("Traditional Hammam", "Turkish bath ritual", 90, 18000),
            ("Aroma Therapy", "Essential oil full body", 75, 14000),
        ],
        "staff": [("Farah N.", "Therapist"), ("Zara I.", "Senior Therapist")],
    },
    {
        "slug": "oasis-spa-lahore", "name": "Oasis Spa", "tagline": "Urban escape in Gulberg",
        "description": "A serene urban spa offering Thai, Swedish, and signature aromatherapy massages.",
        "category_slug": "spa", "city": "Lahore", "address": "Gulberg II, Lahore",
        "phone": "+92 42 3587 6543", "rating": 4.6, "review_count": 134,
        "cover_image": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=80",
        "services": [
            ("Swedish Massage", "Classic relaxation massage", 60, 8500),
            ("Thai Massage", "Stretching-based therapy", 90, 11000),
            ("Couples Package", "Side-by-side massage", 60, 18000),
        ],
        "staff": [("Lina M.", "Therapist")],
    },
    {
        "slug": "nail-bar-karachi", "name": "The Nail Bar", "tagline": "Mani, pedi, art — done right",
        "description": "Karachi's go-to studio for gel manicures, pedicures and creative nail art.",
        "category_slug": "nails", "city": "Karachi", "address": "Khayaban-e-Shahbaz, DHA Phase 6",
        "phone": "+92 21 3534 8800", "rating": 4.7, "review_count": 178,
        "cover_image": "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200&q=80",
        "services": [
            ("Gel Manicure", "Long-lasting gel polish", 45, 2800),
            ("Spa Pedicure", "Soak, scrub, mask, polish", 60, 3500),
            ("Nail Art", "Custom designs per nail", 60, 4500),
        ],
        "staff": [("Sara J.", "Nail Artist"), ("Mahnoor L.", "Nail Technician")],
    },
    {
        "slug": "skinplicity-lahore", "name": "Skinplicity Clinic", "tagline": "Dermatology for modern skin",
        "description": "Board-certified dermatologists offering medical and cosmetic skin treatments.",
        "category_slug": "clinic", "city": "Lahore", "address": "Cantt, Lahore",
        "phone": "+92 42 3666 9900", "rating": 4.8, "review_count": 203,
        "cover_image": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&q=80",
        "services": [
            ("Dermatology Consult", "30-minute consultation", 30, 5000),
            ("Hydrafacial", "Deep cleanse and hydration", 60, 12000),
            ("Chemical Peel", "Glycolic acid peel", 45, 9000),
        ],
        "staff": [("Dr. Anam S.", "Dermatologist"), ("Dr. Hassan R.", "Cosmetic Dermatologist")],
    },
    {
        "slug": "shapes-fitness-karachi", "name": "Shapes Gym", "tagline": "Train. Recover. Repeat.",
        "description": "Pakistan's premium fitness club with personal trainers, classes, and recovery zone.",
        "category_slug": "fitness", "city": "Karachi", "address": "Clifton, Karachi",
        "phone": "+92 21 3530 1212", "rating": 4.7, "review_count": 312,
        "cover_image": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80",
        "services": [
            ("Personal Training - 1 session", "60-min one-on-one with trainer", 60, 4000),
            ("Group HIIT Class", "45-min high-intensity class", 45, 1500),
            ("Body Composition Scan", "Detailed body analysis", 20, 2500),
        ],
        "staff": [("Coach Asif", "Head Trainer"), ("Coach Mahira", "Group Coach")],
    },
    {
        "slug": "punch-mma-lahore", "name": "Punch MMA", "tagline": "Boxing, kickboxing and MMA",
        "description": "Full-contact training with national-level coaches in a no-ego gym.",
        "category_slug": "fitness", "city": "Lahore", "address": "DHA Phase 5, Lahore",
        "phone": "+92 42 3724 5566", "rating": 4.8, "review_count": 142,
        "cover_image": "https://images.unsplash.com/photo-1517438476312-10d79c5f6c95?w=1200&q=80",
        "services": [
            ("Boxing Class", "60-min coached boxing", 60, 1800),
            ("Private MMA Session", "60-min one-on-one MMA", 60, 5000),
        ],
        "staff": [("Coach Rizwan", "MMA Coach")],
    },
    {
        "slug": "the-tutor-lahore", "name": "The Tutor Lahore", "tagline": "O & A Level specialists",
        "description": "1-on-1 and small-group tutoring across math, sciences, and humanities.",
        "category_slug": "tutor", "city": "Lahore", "address": "Model Town, Lahore",
        "phone": "+92 42 3517 9090", "rating": 4.9, "review_count": 89,
        "cover_image": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&q=80",
        "services": [
            ("Math Tutoring - 1 hr", "O/A Level mathematics", 60, 2500),
            ("Physics Tutoring - 1 hr", "O/A Level physics", 60, 2500),
            ("Trial Lesson", "30-min free consultation", 30, 0),
        ],
        "staff": [("Mr. Tariq", "Math Tutor"), ("Ms. Rabia", "Physics Tutor")],
    },
    {
        "slug": "carcare-islamabad", "name": "CarCare Detail Studio", "tagline": "Premium auto detailing",
        "description": "Ceramic coating, paint correction and interior detailing for enthusiasts.",
        "category_slug": "auto", "city": "Islamabad", "address": "I-9 Industrial Area",
        "phone": "+92 51 446 7777", "rating": 4.8, "review_count": 167,
        "cover_image": "https://images.unsplash.com/photo-1605164599901-db7f68c4b3a3?w=1200&q=80",
        "services": [
            ("Express Wash", "Exterior + interior vacuum", 30, 1500),
            ("Full Interior Detail", "Deep clean all surfaces", 180, 8500),
            ("Ceramic Coating", "9H ceramic, 2-year protection", 480, 65000),
        ],
        "staff": [("Detailer Junaid", "Lead Detailer")],
    },
]


def run() -> None:
    with Session(engine) as session:
        if session.exec(select(Category)).first():
            return

        for slug, name, icon, desc in CATEGORIES:
            session.add(Category(slug=slug, name=name, icon=icon, description=desc))
        session.commit()

        for biz in BUSINESSES:
            b = Business(
                slug=biz["slug"], name=biz["name"], tagline=biz["tagline"],
                description=biz["description"], category_slug=biz["category_slug"],
                city=biz["city"], address=biz["address"], phone=biz["phone"],
                cover_image=biz["cover_image"], rating=biz["rating"],
                review_count=biz["review_count"],
            )
            session.add(b)
            session.commit()
            session.refresh(b)
            for sname, sdesc, dur, price in biz["services"]:
                session.add(Service(
                    business_id=b.id, name=sname, description=sdesc,
                    duration_minutes=dur, price_pkr=price,
                ))
            for staff_name, role in biz["staff"]:
                session.add(Staff(
                    business_id=b.id, name=staff_name, role=role,
                    avatar=f"https://api.dicebear.com/7.x/initials/svg?seed={staff_name}",
                ))
            session.commit()
