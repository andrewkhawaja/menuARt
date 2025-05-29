import requests
import json
import os

# Base URL for the API
BASE_URL = "http://localhost:5000"

def test_get_menu():
    """Test the GET /api/menu endpoint"""
    response = requests.get(f"{BASE_URL}/api/menu")
    print("GET /api/menu Response:", response.status_code)
    print(json.dumps(response.json(), indent=2))
    return response.json()

def test_add_menu_item(name, description, price, category, subcategory, model_file=None):
    """Test the POST /api/menu endpoint"""
    data = {
        "name": name,
        "description": description,
        "price": price,
        "image": "🍔",
        "category": category,
        "subcategory": subcategory
    }
    
    files = {}
    if model_file and os.path.exists(model_file):
        files["modelFile"] = (os.path.basename(model_file), open(model_file, "rb"), "application/octet-stream")
    
    response = requests.post(f"{BASE_URL}/api/menu", data=data, files=files)
    print(f"POST /api/menu Response: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
    
    if "modelFile" in files and files["modelFile"][1]:
        files["modelFile"][1].close()
    
    return response.json()

def test_update_menu_item(item_id, name, description, price, category, subcategory, model_file=None):
    """Test the PUT /api/menu/<item_id> endpoint"""
    data = {
        "name": name,
        "description": description,
        "price": price,
        "image": "🍔",
        "category": category,
        "subcategory": subcategory
    }
    
    files = {}
    if model_file and os.path.exists(model_file):
        files["modelFile"] = (os.path.basename(model_file), open(model_file, "rb"), "application/octet-stream")
    
    response = requests.put(f"{BASE_URL}/api/menu/{item_id}", data=data, files=files)
    print(f"PUT /api/menu/{item_id} Response: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
    
    if "modelFile" in files and files["modelFile"][1]:
        files["modelFile"][1].close()
    
    return response.json()

def test_delete_menu_item(item_id):
    """Test the DELETE /api/menu/<item_id> endpoint"""
    response = requests.delete(f"{BASE_URL}/api/menu/{item_id}")
    print(f"DELETE /api/menu/{item_id} Response: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
    return response.json()

def test_upload_file(file_path):
    """Test the POST /api/upload endpoint"""
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return None
    
    files = {"file": (os.path.basename(file_path), open(file_path, "rb"), "application/octet-stream")}
    response = requests.post(f"{BASE_URL}/api/upload", files=files)
    print(f"POST /api/upload Response: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
    
    files["file"][1].close()
    
    return response.json()

if __name__ == "__main__":
    print("Testing AR Food Menu API...")
    
    # Test GET /api/menu
    menu_items = test_get_menu()
    
    # Test POST /api/menu
    burger_model_path = "../public/models/food/Burger.glb"
    new_item = test_add_menu_item(
        "Test Burger", 
        "A delicious test burger with all the fixings", 
        "$12.99", 
        "Main Course", 
        "Burgers",
        burger_model_path
    )
    
    # Get the ID of the newly added item
    if "item" in new_item and "id" in new_item["item"]:
        item_id = new_item["item"]["id"]
        
        # Test PUT /api/menu/<item_id>
        test_update_menu_item(
            item_id,
            "Updated Test Burger",
            "An even more delicious test burger with extra toppings",
            "$14.99",
            "Main Course",
            "Burgers"
        )
        
        # Test DELETE /api/menu/<item_id>
        test_delete_menu_item(item_id)
    
    # Test file upload
    test_upload_file(burger_model_path)
    
    print("API testing complete!")
