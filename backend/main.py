from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr
from sqlmodel import Session, select

from .database import engine, init_db, get_session
from .models import Booking, Business, Category, Review, Service, Staff, User
from . import seed


app = FastAPI(title="Sahil — Pakistan Booking API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()
    seed.run()


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "sahil-api"}


@app.get("/api/categories")
def list_categories(session: Session = Depends(get_session)):
    return session.exec(select(Category)).all()


@app.get("/api/businesses")
def list_businesses(
    category: Optional[str] = None,
    city: Optional[str] = None,
    q: Optional[str] = None,
    session: Session = Depends(get_session),
):
    stmt = select(Business)
    if category:
        stmt = stmt.where(Business.category_slug == category)
    if city:
        stmt = stmt.where(Business.city == city)
    results = session.exec(stmt).all()
    if q:
        needle = q.lower()
        results = [
            b for b in results
            if needle in b.name.lower()
            or needle in b.tagline.lower()
            or needle in b.description.lower()
            or needle in b.city.lower()
        ]
    return results


@app.get("/api/cities")
def list_cities(session: Session = Depends(get_session)):
    rows = session.exec(select(Business.city)).all()
    return sorted(set(rows))


@app.get("/api/businesses/{slug}")
def get_business(slug: str, session: Session = Depends(get_session)):
    biz = session.exec(select(Business).where(Business.slug == slug)).first()
    if not biz:
        raise HTTPException(status_code=404, detail="Business not found")
    services = session.exec(select(Service).where(Service.business_id == biz.id)).all()
    staff = session.exec(select(Staff).where(Staff.business_id == biz.id)).all()
    reviews = session.exec(
        select(Review).where(Review.business_id == biz.id).order_by(Review.created_at.desc())
    ).all()
    return {"business": biz, "services": services, "staff": staff, "reviews": reviews}


@app.get("/api/businesses/{slug}/availability")
def get_availability(
    slug: str,
    booking_date: date = Query(...),
    session: Session = Depends(get_session),
):
    biz = session.exec(select(Business).where(Business.slug == slug)).first()
    if not biz:
        raise HTTPException(status_code=404, detail="Business not found")

    open_h, open_m = (int(x) for x in biz.open_time.split(":"))
    close_h, close_m = (int(x) for x in biz.close_time.split(":"))
    start = datetime.combine(booking_date, datetime.min.time()).replace(hour=open_h, minute=open_m)
    end = datetime.combine(booking_date, datetime.min.time()).replace(hour=close_h, minute=close_m)

    existing = session.exec(
        select(Booking).where(Booking.business_id == biz.id, Booking.booking_date == booking_date)
    ).all()
    taken = {b.booking_time for b in existing}

    slots = []
    cur = start
    while cur < end:
        slot = cur.strftime("%H:%M")
        slots.append({"time": slot, "available": slot not in taken})
        cur += timedelta(minutes=30)
    return {"date": booking_date.isoformat(), "slots": slots}


class AuthIn(BaseModel):
    email: EmailStr
    full_name: str
    phone: str = ""


@app.post("/api/auth")
def auth(body: AuthIn, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == body.email)).first()
    if not user:
        user = User(email=body.email, full_name=body.full_name, phone=body.phone)
        session.add(user)
        session.commit()
        session.refresh(user)
    else:
        changed = False
        if body.full_name and user.full_name != body.full_name:
            user.full_name = body.full_name
            changed = True
        if body.phone and user.phone != body.phone:
            user.phone = body.phone
            changed = True
        if changed:
            session.add(user)
            session.commit()
            session.refresh(user)
    return user


class BookingIn(BaseModel):
    user_id: int
    business_slug: str
    service_id: int
    staff_id: Optional[int] = None
    booking_date: date
    booking_time: str
    notes: str = ""


@app.post("/api/bookings")
def create_booking(body: BookingIn, session: Session = Depends(get_session)):
    biz = session.exec(select(Business).where(Business.slug == body.business_slug)).first()
    if not biz:
        raise HTTPException(status_code=404, detail="Business not found")
    user = session.get(User, body.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    service = session.get(Service, body.service_id)
    if not service or service.business_id != biz.id:
        raise HTTPException(status_code=400, detail="Service does not belong to this business")

    clash = session.exec(
        select(Booking).where(
            Booking.business_id == biz.id,
            Booking.booking_date == body.booking_date,
            Booking.booking_time == body.booking_time,
        )
    ).first()
    if clash:
        raise HTTPException(status_code=409, detail="This time slot is already booked")

    booking = Booking(
        user_id=body.user_id, business_id=biz.id, service_id=body.service_id,
        staff_id=body.staff_id, booking_date=body.booking_date,
        booking_time=body.booking_time, notes=body.notes,
    )
    session.add(booking)
    session.commit()
    session.refresh(booking)
    return {
        "booking": booking,
        "business": {"name": biz.name, "address": biz.address, "phone": biz.phone},
        "service": {"name": service.name, "price_pkr": service.price_pkr},
    }


@app.get("/api/bookings")
def list_bookings(user_id: int, session: Session = Depends(get_session)):
    bookings = session.exec(
        select(Booking).where(Booking.user_id == user_id).order_by(Booking.booking_date.desc())
    ).all()
    out = []
    for b in bookings:
        biz = session.get(Business, b.business_id)
        svc = session.get(Service, b.service_id)
        out.append({
            "booking": b,
            "business": {"name": biz.name, "slug": biz.slug, "address": biz.address, "city": biz.city},
            "service": {"name": svc.name, "price_pkr": svc.price_pkr, "duration_minutes": svc.duration_minutes},
        })
    return out


@app.post("/api/bookings/{booking_id}/cancel")
def cancel_booking(booking_id: int, user_id: int, session: Session = Depends(get_session)):
    b = session.get(Booking, booking_id)
    if not b or b.user_id != user_id:
        raise HTTPException(status_code=404, detail="Booking not found")
    b.status = "cancelled"
    session.add(b)
    session.commit()
    return {"ok": True}


class ReviewIn(BaseModel):
    user_id: int
    business_slug: str
    rating: int
    comment: str


@app.post("/api/reviews")
def create_review(body: ReviewIn, session: Session = Depends(get_session)):
    if not 1 <= body.rating <= 5:
        raise HTTPException(status_code=400, detail="Rating must be 1-5")
    biz = session.exec(select(Business).where(Business.slug == body.business_slug)).first()
    if not biz:
        raise HTTPException(status_code=404, detail="Business not found")
    user = session.get(User, body.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    review = Review(
        business_id=biz.id, user_id=body.user_id, author_name=user.full_name,
        rating=body.rating, comment=body.comment,
    )
    session.add(review)
    biz.review_count += 1
    biz.rating = round(((biz.rating * (biz.review_count - 1)) + body.rating) / biz.review_count, 2)
    session.add(biz)
    session.commit()
    session.refresh(review)
    return review


FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"
if FRONTEND_DIR.exists():
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIR / "assets"), name="assets")

    @app.get("/")
    def index():
        return FileResponse(FRONTEND_DIR / "index.html")

    @app.get("/{full_path:path}")
    def spa(full_path: str):
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404)
        target = FRONTEND_DIR / full_path
        if target.is_file():
            return FileResponse(target)
        return FileResponse(FRONTEND_DIR / "index.html")
