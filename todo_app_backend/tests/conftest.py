import pytest
from fastapi.testclient import TestClient
from todo_app_backend.main import app

def client():
    with TestClient(app) as c:
        yield c
        
        