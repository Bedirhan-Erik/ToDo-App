from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

from todo_app_backend.database import get_session, init_db
from todo_app_backend.schemas import ToDoListCreate, ToDoItemCreate, DependenciesIn, StatusUpdate
from todo_app_backend.crud import (
    create_list, get_all_lists, delete_list,
    create_item, get_items_by_list, delete_item,
    update_item_status, add_dependency, get_dependencies, get_item,
    reset_dependencies, get_dependency_ids
)

app = FastAPI(debug=True)
init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/lists")
def create_list_route(list_data: ToDoListCreate, session: Session = Depends(get_session)):
    r = create_list(session, list_data.name)
    return {"id": r.id, "name": r.name, "createdAt": r.created_at}

@app.get("/lists")
def get_lists_route(session: Session = Depends(get_session)):
    rows = get_all_lists(session)
    return [{"id": r.id, "name": r.name, "createdAt": r.created_at} for r in rows]

@app.delete("/lists/{list_id}")
def delete_list_route(list_id: int, session: Session = Depends(get_session)):
    deleted = delete_list(session, list_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="List Not Found")
    return {"detail": "Deleted"}

@app.post("/lists/{list_id}/items")
def create_item_route(list_id: int, item_data: ToDoItemCreate, session: Session = Depends(get_session)):
    it = create_item(session, list_id, item_data)
    deps_ids = get_dependency_ids(session, it.id)
    return {
        "id": it.id, "listId": it.list_id, "name": it.name, "description": it.description,
        "deadline": it.deadline, "status": it.status, "createdAt": it.created_at,
        "dependencies": deps_ids
    }

@app.get("/lists/{list_id}/items")
def get_items_route(list_id: int, session: Session = Depends(get_session)):
    rows = get_items_by_list(session, list_id)
    out = []
    for it in rows:
        deps_ids = get_dependency_ids(session, it.id)
        out.append({
            "id": it.id, "listId": it.list_id, "name": it.name, "description": it.description,
            "deadline": it.deadline, "status": it.status, "createdAt": it.created_at,
            "dependencies": deps_ids
        })
    return out

@app.delete("/items/{item_id}")
def delete_item_route(item_id: int, session: Session = Depends(get_session)):
    deleted = delete_item(session, item_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Task Not Found")
    return {"detail": "Deleted"}

@app.patch("/items/{item_id}/status")
def update_status_route(item_id: int, payload: StatusUpdate, session: Session = Depends(get_session)):
    try:
        it = update_item_status(session, item_id, payload.status)
    except RuntimeError as e:
        if str(e) == "deps_incomplete":
            raise HTTPException(status_code=409, detail="Dependencies not completed")
        raise
    if not it:
        raise HTTPException(status_code=404, detail="Task Not Found")
    deps_ids = get_dependency_ids(session, it.id)
    return {
        "id": it.id, "listId": it.list_id, "name": it.name, "description": it.description,
        "deadline": it.deadline, "status": it.status, "createdAt": it.created_at,
        "dependencies": deps_ids
    }

@app.patch("/items/{item_id}/complete")
def complete_item_route(item_id: int, session: Session = Depends(get_session)):
    try:
        it = update_item_status(session, item_id, "COMPLETED")
    except RuntimeError as e:
        if str(e) == "deps_incomplete":
            raise HTTPException(status_code=409, detail="Dependencies not completed")
        raise
    if not it:
        raise HTTPException(status_code=404, detail="Task Not Found")
    return {"id": it.id, "status": it.status}

@app.post("/items/{item_id}/dependencies")
def set_dependencies_route(item_id: int, payload: DependenciesIn, session: Session = Depends(get_session)):
    if not get_item(session, item_id):
        raise HTTPException(status_code=404, detail="Task Not Found")
    if any(d == item_id for d in payload.dependsOnIds):
        raise HTTPException(status_code=400, detail="An item cannot depend on itself")

    reset_dependencies(session, item_id)
    for dep_id in payload.dependsOnIds:
        add_dependency(session, item_id, dep_id)

    deps_ids = get_dependency_ids(session, item_id)
    return {"itemId": item_id, "dependsOn": deps_ids}

@app.get("/items/{item_id}/dependencies")
def get_dependencies_route(item_id: int, session: Session = Depends(get_session)):
    if not get_item(session, item_id):
        raise HTTPException(status_code=404, detail="Task Not Found")
    deps_ids = get_dependency_ids(session, item_id)
    return {"itemId": item_id, "dependsOn": deps_ids}
