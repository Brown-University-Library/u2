import json
import argparse
import os

def clean_json_fields(input_path, output_path):
    fields_to_process = ["at_periods", "g_earth_damage_cause"]
    forbidden_tag = "NOT_AN_IMAGE"

    try:
        with open(input_path, 'r', encoding='utf-8') as f:
            raw_data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error: {e}")
        return

    # 1. Unwrap the "u2ers_sites" wrapper
    if isinstance(raw_data, dict) and "u2ers_sites" in raw_data:
        items = raw_data["u2ers_sites"]
    else:
        items = raw_data if isinstance(raw_data, list) else [raw_data]

    cleaned_items = []

    for item in items:
        # 2. Privacy Filter: Remove object if limit_view_to is NOT null
        if item.get("limit_view_to") is not None:
            continue  # Skip this site entirely

        # 3. Transform delimited strings to arrays
        for field in fields_to_process:
            raw_value = item.get(field)
            if isinstance(raw_value, str):
                item[field] = [val.strip() for val in raw_value.split('\r') if val.strip()]
            elif raw_value is None:
                item[field] = []

        # 4. Filter u2ers_site_files to remove "NOT_AN_IMAGE"
        site_files = item.get("u2ers_site_files")
        if isinstance(site_files, list):
            valid_files = []
            for file_obj in site_files:
                if "images" in file_obj and isinstance(file_obj["images"], list):
                    file_obj["images"] = [
                        img for img in file_obj["images"] 
                        if forbidden_tag not in (img.get("tags") or "")
                    ]
                    if file_obj["images"]:
                        valid_files.append(file_obj)
            item["u2ers_site_files"] = valid_files

        # Add the processed item to our final list
        cleaned_items.append(item)

    # 5. Save the valid JSON
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(cleaned_items, f, indent=2)
    
    print(f"Total processed: {len(items)}. Final count after privacy filtering: {len(cleaned_items)}.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("-i", "--input", required=True)
    parser.add_argument("-o", "--output", required=True)
    args = parser.parse_args()
    clean_json_fields(args.input, args.output)