from datetime import datetime, date, time
from typing import Optional
from sqlmodel import SQLModel, Field, Relationship


class Category(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    slug: str = Field(unique=True, index=True)
    name: str
    icon: str
    description: str


class Business(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    slug: str = Field(unique=True, index=True)
    name: str
    tagline: str
    description: str
    category_slug: str = Field(index=True)
    city: str = Field(index=True)
    address: str
    phone: str
    cover_image: str
    rating: float = 4.7
    review_count: int = 0
    open_time: str = "10:00"
    close_time: str = "21:00"
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Service(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    business_id: int = Field(foreign_key="business.id", index=True)
    name: str
    description: str
    duration_minutes: int
    price_pkr: int


class Staff(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    business_id: int = Field(foreign_key="business.id", index=True)
    name: str
    role: str
    avatar: str


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    full_name: str
    phone: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Booking(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    business_id: int = Field(foreign_key="business.id", index=True)
    service_id: int = Field(foreign_key="service.id", index=True)
    staff_id: Optional[int] = Field(default=None, foreign_key="staff.id")
    booking_date: date
    booking_time: str
    status: str = "confirmed"
    notes: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Review(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    business_id: int = Field(foreign_key="business.id", index=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    author_name: str
    rating: int
    comment: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
