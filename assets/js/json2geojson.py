import json
import os
import argparse

def transform_json_to_geojson(input_path, output_path):
    """
    Reads a JSON file and converts it to a GeoJSON FeatureCollection.
    """
    # 1. Load the source data
    try:
        with open(input_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"Error: The file '{input_path}' was not found.")
        return
    except json.JSONDecodeError:
        print(f"Error: '{input_path}' is not a valid JSON file.")
        return

    # 2. Ensure data is a list (if the JSON contains multiple site objects)
    if not isinstance(data, list):
        data = [data]

    features = []

    for item in data:
        # Extract geometry and handle potential missing data
        geometry = item.get("at_geometry")
        
        if not geometry:
            print(f"Warning: Skipping site '{item.get('site_id', 'Unknown')}' - no geometry found.")
            continue
            
        # Create properties by copying the item and removing the geometry field
        properties = item.copy()
        if "at_geometry" in properties:
            del properties["at_geometry"]

        # Build the GeoJSON Feature structure
        feature = {
            "type": "Feature",
            "geometry": geometry,
            "properties": properties
        }
        features.append(feature)

    # 3. Build the FeatureCollection
    geojson = {
        "type": "FeatureCollection",
        "features": features
    }

    # 4. Save to the output location
    try:
        # Create the output directory if it doesn't exist
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(geojson, f, indent=2)
        print(f"Success! GeoJSON successfully saved to: {output_path}")
        
    except Exception as e:
        print(f"An error occurred while saving the file: {e}")

if __name__ == "__main__":
    # Setup Argument Parser
    parser = argparse.ArgumentParser(description="Convert a specific JSON structure to GeoJSON.")
    
    # Add arguments for input and output
    parser.add_argument("-i", "--input", help="Path to the input JSON file", required=True)
    parser.add_argument("-o", "--output", help="Path where the GeoJSON should be saved", required=True)

    args = parser.parse_args()

    # Execute the transformation
    transform_json_to_geojson(args.input, args.output)