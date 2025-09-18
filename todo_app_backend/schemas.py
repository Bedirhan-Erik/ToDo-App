from typing import Optional, Literal, List
from pydantic import BaseModel, ConfigDict
from datetime import date

Status = Literal["PENDING", "IN_PROGRESS", "COMPLETED"]

class ToDoListCreate(BaseModel):
    name: str

class ToDoList(BaseModel):
    id: int
    name: str
    createdAt: str
    model_config= ConfigDict(from_attributes=True)

class ToDoItemCreate(BaseModel):
    name: str
    status: Optional [Status]="PENDING"
    description: Optional[str] = None
    deadline: Optional[date] = None
    dependencies: List[int]=[]

class ToDoItem(BaseModel):
    id: int
    listId: int
    name: str
    description: Optional[str] = None
    deadline: Optional[date] = None
    status: Status
    createdAt: str
    dependencies: List[int] = []
    model_config = ConfigDict(from_attributes=True)
    
class StatusUpdate(BaseModel):
    status: Status    
    
class DependenciesIn(BaseModel):
    dependsOnIds: List[int]

class Dependency(BaseModel):
    id: int
    item_id: int
    depends_on_id: int
    class ConfigDict:
        orm_mode = True
