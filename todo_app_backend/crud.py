from sqlalchemy.orm import Session
from datetime import datetime
from . import models, schemas

def today_iso() -> str:
    d = datetime.now()
    return f"{d.year:04d}-{d.month:02d}-{d.day:02d}"

def create_list(db: Session, name: str):
    new_list = models.ToDoList(name=name, created_at=today_iso())
    db.add(new_list)
    db.commit()
    db.refresh(new_list)
    return new_list

def get_all_lists(db: Session):
    return db.query(models.ToDoList).all()

def delete_list(db: Session, list_id: int):
    obj = db.query(models.ToDoList).filter(models.ToDoList.id == list_id).first()
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True

def create_item(db: Session, list_id: int, item: schemas.ToDoItemCreate):
    new_item = models.ToDoItem(
        list_id=list_id,
        name=item.name,
        description=item.description or "",
        deadline=item.deadline,
        status=item.status or "PENDING",
        created_at=today_iso(),
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    if item.dependencies:
        reset_dependencies(db, new_item.id)
        for dep in item.dependencies:
            if dep == new_item.id:
                continue
            db.add(models.Dependency(task_id=new_item.id, depends_on_id=dep))
        db.commit()
    return new_item

def get_items_by_list(db: Session, list_id: int):
    return db.query(models.ToDoItem).filter(models.ToDoItem.list_id == list_id).all()

def delete_item(db: Session, item_id: int):
    obj = db.query(models.ToDoItem).filter(models.ToDoItem.id == item_id).first()
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True

def get_item(db: Session, item_id: int):
    return db.query(models.ToDoItem).filter(models.ToDoItem.id == item_id).first()

def get_dependencies(db: Session, task_id: int):
    return db.query(models.Dependency).filter(models.Dependency.task_id == task_id).all()

def get_dependency_ids(db: Session, task_id: int) -> list[int]:
    rows = get_dependencies(db, task_id)
    return [r.depends_on_id for r in rows]

def reset_dependencies(db: Session, task_id: int):
    db.query(models.Dependency).filter(models.Dependency.task_id == task_id).delete()
    db.commit()

def add_dependency(db: Session, task_id: int, depends_on_id: int):
    dep = models.Dependency(task_id=task_id, depends_on_id=depends_on_id)
    db.add(dep)
    db.commit()
    db.refresh(dep)
    return dep

def update_item_status(db: Session, item_id: int, status: str):
    item = get_item(db, item_id)
    if not item:
        return None

    if status == "COMPLETED":
        dep_ids = get_dependency_ids(db, item_id)
        if dep_ids:
            deps = db.query(models.ToDoItem).filter(models.ToDoItem.id.in_(dep_ids)).all()
            if any(d.status != "COMPLETED" for d in deps):
                raise RuntimeError("deps_incomplete")

    item.status = status
    db.commit()
    db.refresh(item)
    return item
