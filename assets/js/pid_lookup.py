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

    # 1. Build the Lookup Map
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
        # Expecting an array based on your requirement
        image_ids = site.get("u2_images_showing_the_site")
        
        found_pids = []
        if isinstance(image_ids, list):
            for img_id in image_ids:
                if img_id in pid_map:
                    found_pids.append(pid_map[img_id])
        
        # Remove duplicates
        unique_pids = list(set(found_pids))
        site["image_pids"] = unique_pids

        # 3. Increment counter only if the resulting array is not empty
        if unique_pids:
            insertion_count += 1

    # 4. Save the result
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(site_list, f, indent=2)

    print(f"Success: Inserted non-empty PID arrays into {insertion_count} site objects.")
    print(f"Output saved to: {output_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("-s", "--sites", required=True)
    parser.add_argument("-l", "--lookup", required=True)
    parser.add_argument("-o", "--output", required=True)
    args = parser.parse_args()
    link_pids(args.sites, args.lookup, args.output)