import json
import pickle
import numpy as np

__locations = None
__data_columns = None
__model = None

def get_estimated_price(location, sqft, bhk, bath):
    try:
        loc_index = __data_columns.index(location.lower())
    except:
        loc_index = -1

    x = np.zeros(len(__data_columns))
    x[0] = sqft
    x[1] = bath
    x[2] = bhk
    if loc_index >= 0:
        x[loc_index] = 1

    return round(__model.predict([x])[0], 2)

def get_location_names():
    return __locations

def load_saved_artifacts():
    print("loading saved artifacts...start")
    global __data_columns, __locations, __model

    import os
    print("Current working directory:", os.getcwd())
    json_path = os.path.abspath("./artifacts/columns.json")
    print("Absolute path to columns.json:", json_path)

    try:
        with open(json_path, "r", encoding="utf-8") as f:
            content = f.read().strip()
            print("Raw file content:", content)  # <-- Add this line here
            data = json.loads(content)
            __data_columns = data.get('data_columns', [])
            __data_columns = [col.lower() for col in __data_columns if isinstance(col, str)]
            __locations = __data_columns[3:] if len(__data_columns) > 3 else []
            print("Loaded data_columns:", __data_columns)
            print("Extracted locations:", __locations)
    except Exception as e:
        print("Error loading artifacts:", e)
        __data_columns = []
        __locations = []

    try:        
        with open("./artifacts/bangalore_home_prices_model.pickle", "rb") as f:
            __model = pickle.load(f)
    except Exception as e:
        print("Error loading model:", e)
        __model = None

    print("loading saved artifacts...done")

load_saved_artifacts() 

if __name__ == "__main__":
    load_saved_artifacts()
    print(get_location_names())
    print(get_estimated_price("1st Phase JP Nagar", 1000, 3, 3))
    print(get_estimated_price("1st Phase JP Nagar", 1000, 2, 2))
    print(get_estimated_price("Kalhalli", 1000, 2, 2))
    print(get_estimated_price("Ejipura", 1000, 2, 2))