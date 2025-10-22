from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Stand(Base):
    """거치대 모델"""
    __tablename__ = "stands"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    thumbnail_url = Column(String(255))  # /static/stands/{id}_thumbnail.png
    preview_model_url = Column(String(255))  # /static/stands/{id}_preview.stl
    price = Column(Float, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    orders = relationship("Order", back_populates="stand")

    def __repr__(self):
        return f"<Stand(id={self.id}, name='{self.name}', price={self.price})>"
