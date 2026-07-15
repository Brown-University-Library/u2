import json
import argparse
import os

def link_pids(site_json_path, lookup_json_path, output_path):
    try:
        with open(site_json_path, 'r', encoding='utf-8') as f:
            sites = json.load(f)
        with open(lookup_json_path, 'r', encoding='utf-8') as f:
            lookup_data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error: {e}")
        return

    # 1. Build the Lookup Map (local_id -> PID)
    pid_map = {}
    repo_docs = lookup_data.get("response", {}).get("docs", [])
    for doc in repo_docs:
        pid = doc.get("pid")
        local_ids = doc.get("mods_id_local_ssim", [])
        if pid and isinstance(local_ids, list):
            for lid in local_ids:
                pid_map[lid] = pid

    # 2. Iterate and Match
    site_list = sites if isinstance(sites, list) else sites.get("u2ers_sites", [])
    insertion_count = 0

    for site in site_list:
        site_id = site.get("site_id")
        if not site_id:
            continue

        image_ids = site.get("u2_images_showing_the_site")
        
        # Ensure image_ids is treated as an array
        if isinstance(image_ids, str):
            image_ids = [image_ids]
        elif not isinstance(image_ids, list):
            image_ids = []

        # Map each individual image_id to its specific matching PID
        # Retains 1-to-1 relationships in a structured dictionary format
        resolved_mappings = {}
        for img_id in image_ids:
            if img_id in pid_map:
                resolved_mappings[img_id] = pid_map[img_id]
        
        # Save the structured mapping dictionary to the site object
        site["image_pids"] = resolved_mappings

        # Increment count if we actually resolved at least one mapping
        if resolved_mappings:
            insertion_count += 1

    # 3. Save the result
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(site_list, f, indent=2)

    print(f"Success: Linked specific PIDs for {insertion_count} site objects containing valid images.")
    print(f"Output saved to: {output_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("-s", "--sites", required=True)
    parser.add_argument("-l", "--lookup", required=True)
    parser.add_argument("-o", "--output", required=True)
    args = parser.parse_args()
    link_pids(args.sites, args.lookup, args.output)