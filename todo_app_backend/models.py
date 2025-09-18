from sqlalchemy import Column, Integer, String, ForeignKey, Date, UniqueConstraint
from sqlalchemy.orm import relationship
from .database import Base

class ToDoList(Base):
    __tablename__ = "todo_lists"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    created_at = Column(String,nullable=False)
    items = relationship("ToDoItem", back_populates="todo_list", cascade="all, delete-orphan")

class ToDoItem(Base):
    __tablename__ = "todo_items"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    deadline = Column(Date, nullable=True)
    status = Column(String, default="PENDING", nullable=False)
    list_id = Column(Integer, ForeignKey("todo_lists.id"), nullable=False)
    created_at= Column(String,nullable=False)
    todo_list = relationship("ToDoList", back_populates="items")
    dependencies = relationship(
        "Dependency",
        back_populates="task",
        cascade="all, delete-orphan",
        foreign_keys="Dependency.task_id",
    )

class Dependency(Base):
    __tablename__ = "dependencies"
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("todo_items.id"), nullable=False)
    depends_on_id = Column(Integer, ForeignKey("todo_items.id"), nullable=False)
    task = relationship("ToDoItem", foreign_keys=[task_id], back_populates="dependencies")

    __table_args__ = (
        UniqueConstraint("task_id", "depends_on_id", name="uq_task_dep"),
    )