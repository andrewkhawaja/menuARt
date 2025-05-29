from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore, storage
import os
import uuid
import json
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

# Import LangChain components
from langchain_openai import OpenAI
# from langchain_community.llms import OllamaLLM
# from langchain.chains import ConversationChain # Deprecated
from langchain.memory import ConversationBufferMemory
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.messages import HumanMessage, AIMessage

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Firebase
try:
    # Print the current working directory and check if the file exists
    print(f"Current working directory: {os.getcwd()}")
    key_path = 'serviceAccountKey.json'
    print(f"Looking for service account key at: {os.path.abspath(key_path)}")
    print(f"File exists: {os.path.exists(key_path)}")
    
    # Read and print the first few characters of the key file (safely)
    if os.path.exists(key_path):
        with open(key_path, 'r') as f:
            key_content = f.read()
            print(f"Key file starts with: {key_content[:50]}...")
    
    # Initialize Firebase with your service account key file
    cred = credentials.Certificate(key_path)
    firebase_admin.initialize_app(cred, {
        'storageBucket': 'ar-food-menu.appspot.com'
    })
    
    # Get Firestore and Storage clients
    db = firestore.client()
    bucket = storage.bucket()
    
    print("Firebase initialized successfully")
except Exception as e:
    print(f"Error initializing Firebase: {str(e)}")
    print(f"Error type: {type(e)}")
    import traceback
    print(f"Full traceback: {traceback.format_exc()}")
    # For demo purposes, we'll continue even if Firebase initialization fails
    db = None
    bucket = None

# Configure OpenAI API key
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    print("Error: OPENAI_API_KEY environment variable not set.")
    # Depending on requirements, you might want to raise an error or disable AI features

# Initialize LangChain LLM
llm = None
if openai_api_key:
    llm = OpenAI(openai_api_key=openai_api_key, temperature=0.7)
    print("OpenAI LLM initialized.")
else:
    print("OpenAI API key not set. LLM will not be initialized.")

# Define a prompt template
template = """You are an AI food recommender chatbot for a restaurant.
Your goal is to help the customer choose a food item from the provided menu.
You should be friendly, engaging, and helpful.

Current conversation:
{history}
Customer: {input}
AI:
"""
PROMPT = PromptTemplate(input_variables=["history", "input"], template=template)

# In-memory storage for conversation history (for demonstration purposes)
# In a real application, you might use a database or other persistent storage
store = {}

def get_session_history(session_id: str) -> ConversationBufferMemory:
    if session_id not in store:
        store[session_id] = ConversationBufferMemory()
    return store[session_id]

# Create the runnable chain
conversation_chain = None # Initialize as None
if llm:
    # Define the core runnable (prompt + llm)
    runnable = PROMPT | llm

    # Wrap the runnable with message history capability
    conversation_chain = RunnableWithMessageHistory(
        runnable,
        get_session_history,
        input_messages_key="input",
        history_messages_key="history",
    )
    print("RunnableWithMessageHistory initialized.")
else:
     print("RunnableWithMessageHistory not initialized due to missing LLM.")

# Create uploads directory if it doesn't exist
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER # Add UPLOAD_FOLDER to app.config

# Configure allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'glb', 'gltf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return jsonify({"message": "AR Food Menu API is running"})

@app.route('/api/menu', methods=['GET'])
def get_menu():
    try:
        if db:
            # Get all menu items from Firestore
            menu_ref = db.collection('menu')
            docs = menu_ref.stream()
            menu_items = [doc.to_dict() for doc in docs]
            return jsonify(menu_items)
        else:
            # Fallback to local storage if Firebase is not available
            print("Firebase not available for fetching menu items. Returning empty array.")
            return jsonify([]) # Return an empty array when db is not available
    except Exception as e:
        print(f"Error fetching menu items: {str(e)}")
        import traceback
        print(f"Full traceback: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/menu', methods=['POST'])
def add_menu_item():
    try:
        # Get form data
        data = request.form.to_dict()
        
        # Generate a unique ID if not provided
        if 'id' not in data or not data['id']:
            data['id'] = str(uuid.uuid4())
        
        # Handle file uploads
        model_file = request.files.get('modelFile')
        image_file = request.files.get('imageFile')
        
        # Process model file
        if model_file and allowed_file(model_file.filename):
            model_filename = secure_filename(f"{data['id']}_{model_file.filename}")
            model_path = os.path.join(UPLOAD_FOLDER, model_filename)
            model_file.save(model_path)
            # Use local URL for the model file, including backend origin
            data['modelUrl'] = f"http://localhost:5000/uploads/{model_filename}"
        
        # Process image file (if provided)
        if image_file and allowed_file(image_file.filename):
            image_filename = secure_filename(f"{data['id']}_{image_file.filename}")
            image_path = os.path.join(UPLOAD_FOLDER, image_filename)
            image_file.save(image_path)
            # Use local URL for the image file, including backend origin
            data['imageUrl'] = f"http://localhost:5000/uploads/{image_filename}"
        
        # Save to Firestore if available, otherwise log a message (local storage handled by frontend fallback)
        if db:
            menu_ref = db.collection('menu').document(data['id'])
            menu_ref.set(data)
        else:
            print("Firebase not initialized. Item will not be saved to Firestore.")
            # Frontend should handle local storage fallback for getting items
        
        return jsonify({"message": "Menu item added successfully", "item": data})
    except Exception as e:
        print(f"Error adding menu item: {str(e)}")
        import traceback
        print(f"Full traceback: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/menu/<item_id>', methods=['PUT'])
def update_menu_item(item_id):
    try:
        # Get form data
        data = request.form.to_dict()
        data['id'] = item_id
        
        # Handle file uploads
        model_file = request.files.get('modelFile')
        image_file = request.files.get('imageFile')
        
        # Process model file if provided
        if model_file and allowed_file(model_file.filename):
            model_filename = secure_filename(f"{item_id}_{model_file.filename}")
            model_path = os.path.join(UPLOAD_FOLDER, model_filename)
            model_file.save(model_path)
            # Use local URL for the model file, including backend origin
            data['modelUrl'] = f"http://localhost:5000/uploads/{model_filename}"
        
        # Process image file if provided
        if image_file and allowed_file(image_file.filename):
            image_filename = secure_filename(f"{item_id}_{image_file.filename}")
            image_path = os.path.join(UPLOAD_FOLDER, image_filename)
            image_file.save(image_path)
            # Use local URL for the image file, including backend origin
            data['imageUrl'] = f"http://localhost:5000/uploads/{image_filename}"
        
        # Update in Firestore if available
        if db:
            menu_ref = db.collection('menu').document(item_id)
            menu_ref.update(data)
        
        return jsonify({"message": "Menu item updated successfully", "item": data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/menu/<item_id>', methods=['DELETE'])
def delete_menu_item(item_id):
    try:
        # Delete from Firestore if available
        if db:
            menu_ref = db.collection('menu').document(item_id)
            menu_ref.delete()
        
        return jsonify({"message": "Menu item deleted successfully", "id": item_id})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/upload', methods=['POST'])
def upload_file():
    try:
        # Check if the post request has the file part
        if 'file' not in request.files:
            return jsonify({"error": "No file part"}), 400
        
        file = request.files['file']
        
        # If user does not select file, browser also
        # submit an empty part without filename
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            file.save(file_path)
            
            # Use local URL for the uploaded file
            return jsonify({
                "message": "File uploaded successfully",
                "filename": filename,
                "url": f"/uploads/{filename}"
            })
        else:
            return jsonify({"error": "File type not allowed"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/recommend', methods=['POST'])
def recommend():
    try:
        if not conversation_chain:
            return jsonify({"error": "AI recommendations are not available."}), 503

        data = request.get_json()
        user_message = data.get('message')
        # Using a fixed session ID for this example. In a real app, use a user-specific ID.
        session_id = "fixed-session-id"

        if not user_message:
            return jsonify({"error": "No message provided."}), 400

        # Fetch the current menu data (same logic as before)
        menu_items = []
        try:
            if db:
                menu_ref = db.collection('menu')
                docs = menu_ref.stream()
                menu_items = [doc.to_dict() for doc in docs]
            else:
                print("Firebase not available for fetching menu items. Cannot fetch menu items for AI.")
                pass
        except Exception as menu_fetch_error:
            print(f"Error fetching menu items for AI: {str(menu_fetch_error)}")

        # Prepare menu data for the AI (same logic as before)
        menu_context = ""
        if menu_items:
            for item in menu_items:
                menu_context += f"- Name: {item.get('name', 'N/A')}, Category: {item.get('category', 'N/A')}, Subcategory: {item.get('subcategory', 'N/A')}, Description: {item.get('description', 'N/A')}, Price: {item.get('price', 'N/A')}\n"
        else:
            menu_context += "No menu items available.\n"

        # Construct the input for the runnable, including menu_context in the prompt
        # The RunnableWithMessageHistory handles the history based on the session_id
        full_prompt_input = {"history": "", "input": user_message, "menu_context": menu_context}

        # Invoke the runnable with message history
        # The session_id is passed via the config
        response = conversation_chain.invoke(
            full_prompt_input,
            config={
                "configurable": {
                    "session_id": session_id
                }
            }
        )

        # The response is the AIMessage object, extract the content
        ai_response_text = response.content

        ai_response = {
            "response": ai_response_text
        }

        return jsonify(ai_response)
    except Exception as e:
        print(f"Error in recommendations endpoint: {str(e)}")
        import traceback
        print(f"Full traceback: {traceback.format_exc()}")
        return jsonify({"error": "An error occurred while processing your request."}), 500

@app.route('/api/categories', methods=['GET'])
def get_categories():
    try:
        if db:
            categories_ref = db.collection('categories')
            docs = categories_ref.stream()
            # Assuming categories are stored as documents with a 'name' field
            categories = [doc.to_dict() for doc in docs]
            # Extract just the category names
            category_names = [cat.get('name') for cat in categories if cat.get('name')]
            return jsonify(category_names)
        else:
            print("Firebase not available for fetching categories. Returning empty array.")
            return jsonify([])
    except Exception as e:
        print(f"Error fetching categories: {str(e)}")
        import traceback
        print(f"Full traceback: {traceback.format_exc()}")
        return jsonify({"error": "An error occurred while fetching categories."}), 500

@app.route('/api/subcategories', methods=['GET'])
def get_subcategories():
    try:
        if db:
            subcategories_ref = db.collection('subcategories')
            docs = subcategories_ref.stream()
            # Assuming subcategories are stored as documents with 'category' and 'name' fields
            subcategories_list = [doc.to_dict() for doc in docs]
            # Organize subcategories by category
            subcategories_dict = {}
            for subcat in subcategories_list:
                category = subcat.get('category')
                name = subcat.get('name')
                if category and name:
                    if category not in subcategories_dict:
                        subcategories_dict[category] = []
                    subcategories_dict[category].append(name)
            return jsonify(subcategories_dict)
        else:
            print("Firebase not available for fetching subcategories. Returning empty object.")
            return jsonify({})
    except Exception as e:
        print(f"Error fetching subcategories: {str(e)}")
        import traceback
        print(f"Full traceback: {traceback.format_exc()}")
        return jsonify({"error": "An error occurred while fetching subcategories."}), 500

@app.route('/api/categories', methods=['POST'])
def add_category():
    try:
        if not db:
            return jsonify({"error": "Database not available."}), 503

        data = request.get_json()
        category_name = data.get('name')

        if not category_name:
            return jsonify({"error": "Category name is required."}), 400

        # Add the new category to the 'categories' collection
        # Using the category name as the document ID for uniqueness
        category_ref = db.collection('categories').document(category_name)
        category_ref.set({'name': category_name})

        # Also initialize an empty list for this category in the subcategories collection structure (optional but helpful for structure)
        # This assumes a document in 'subcategories' collection keyed by category name, storing a list of subcategory names
        subcategories_doc_ref = db.collection('subcategories').document(category_name)
        # Use merge=True to avoid overwriting other categories if the document exists
        subcategories_doc_ref.set({'names': []}, merge=True)

        return jsonify({"message": "Category added successfully", "category": category_name}), 201
    except Exception as e:
        print(f"Error adding category: {str(e)}")
        import traceback
        print(f"Full traceback: {traceback.format_exc()}")
        return jsonify({"error": "An error occurred while adding the category."}), 500

@app.route('/api/categories/<category_name>', methods=['DELETE'])
def delete_category(category_name):
    try:
        if not db:
            return jsonify({"error": "Database not available."}), 503

        # Delete the category document from the 'categories' collection
        category_ref = db.collection('categories').document(category_name)
        category_ref.delete()

        # Also delete the corresponding subcategories document (if it exists)
        subcategories_doc_ref = db.collection('subcategories').document(category_name)
        subcategories_doc_ref.delete()

        # Note: This does NOT automatically update menu items that used this category.
        # A more robust solution might involve updating or flagging those menu items.

        return jsonify({"message": "Category deleted successfully", "category": category_name})
    except Exception as e:
        print(f"Error deleting category: {str(e)}")
        import traceback
        print(f"Full traceback: {traceback.format_exc()}")
        return jsonify({"error": "An error occurred while deleting the category."}), 500

@app.route('/api/subcategories', methods=['POST'])
def add_subcategory():
    try:
        if not db:
            return jsonify({"error": "Database not available."}), 503

        data = request.get_json()
        category_name = data.get('category')
        subcategory_name = data.get('name')

        if not category_name or not subcategory_name:
            return jsonify({"error": "Category name and subcategory name are required."}), 400

        # Get the document for the category from the 'subcategories' collection
        subcategories_doc_ref = db.collection('subcategories').document(category_name)
        subcategories_doc = subcategories_doc_ref.get()

        if subcategories_doc.exists:
            # If the document exists, update the 'names' array
            current_subcategories = subcategories_doc.to_dict().get('names', [])
            if subcategory_name not in current_subcategories:
                current_subcategories.append(subcategory_name)
                subcategories_doc_ref.update({'names': current_subcategories})
                return jsonify({"message": "Subcategory added successfully", "category": category_name, "subcategory": subcategory_name}), 201
            else:
                return jsonify({"message": "Subcategory already exists", "category": category_name, "subcategory": subcategory_name}), 200
        else:
            # If the category document does not exist in the subcategories collection, create it with the new subcategory
            subcategories_doc_ref.set({'names': [subcategory_name]})
            return jsonify({"message": "Subcategory added successfully and new category entry created", "category": category_name, "subcategory": subcategory_name}), 201

    except Exception as e:
        print(f"Error adding subcategory: {str(e)}")
        import traceback
        print(f"Full traceback: {traceback.format_exc()}")
        return jsonify({"error": "An error occurred while adding the subcategory."}), 500

@app.route('/api/subcategories/<category_name>/<subcategory_name>', methods=['DELETE'])
def delete_subcategory(category_name, subcategory_name):
    try:
        if not db:
            return jsonify({"error": "Database not available."}), 503

        # Get the document for the category from the 'subcategories' collection
        subcategories_doc_ref = db.collection('subcategories').document(category_name)
        subcategories_doc = subcategories_doc_ref.get()

        if subcategories_doc.exists:
            current_subcategories = subcategories_doc.to_dict().get('names', [])
            if subcategory_name in current_subcategories:
                # Remove the subcategory from the list
                updated_subcategories = [sub for sub in current_subcategories if sub != subcategory_name]
                subcategories_doc_ref.update({'names': updated_subcategories})
                return jsonify({"message": "Subcategory deleted successfully", "category": category_name, "subcategory": subcategory_name})
            else:
                return jsonify({"message": "Subcategory not found"}), 404
        else:
            return jsonify({"message": "Category for subcategory not found"}), 404

    except Exception as e:
        print(f"Error deleting subcategory: {str(e)}")
        import traceback
        print(f"Full traceback: {traceback.format_exc()}")
        return jsonify({"error": "An error occurred while deleting the subcategory."}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
