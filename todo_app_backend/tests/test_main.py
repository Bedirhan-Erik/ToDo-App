


def test_create_list(client):
    response=client.post("/lists", json={"name":"Test List"})
    assert response.status_code==200
    data= response.json()
    assert data ["name"]== "Test List"
    
def test_get_lists(client):
    client.post("/lists", json={"name":"List for Get"})
    response= client.get("/lists")
    assert response.status_code==200
    data=response.json()
    assert isinstance(data,list)
    
def test_create_item_in_list(client):

    list_response = client.post("/lists", json={"name": "List with Item"})
    list_id = list_response.json()["id"]

    item_response = client.post(f"/lists/{list_id}/items", json={
        "name": "Test Task",
        "description": "Testing item creation",
        "deadline": "11-08-2025",
        "status": "PENDING"
    })
    assert item_response.status_code == 200
    item_data = item_response.json()
    assert item_data["name"] == "Test Task"
    assert item_data["status"] == "PENDING"
    