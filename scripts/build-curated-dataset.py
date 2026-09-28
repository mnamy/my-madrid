import json


INPUT_FILE = "madrid-curation-results.json"

CURATED_OUTPUT = "curated-memories.json"
SPLIT_OUTPUT = "memories-to-split.json"
UUID_OUTPUT = "selected-photo-uuids.txt"


# ============================================================
# LOAD CURATION RESULTS
# ============================================================

with open(
    INPUT_FILE,
    "r",
    encoding="utf-8",
) as file:
    memories = json.load(file)


# ============================================================
# COUNTS
# ============================================================

kept = [
    memory
    for memory in memories
    if memory.get("decision") == "keep"
]

hidden = [
    memory
    for memory in memories
    if memory.get("decision") == "hide"
]

to_split = [
    memory
    for memory in memories
    if memory.get("decision") == "split"
]

undecided = [
    memory
    for memory in memories
    if not memory.get("decision")
]


# ============================================================
# BUILD CLEAN PUBLIC-FACING DATASET
# ============================================================

curated_memories = []

selected_uuids = []


for memory in kept:

    selected_photos = (
        memory.get(
            "selected_preview_photos",
            []
        )
        or []
    )


    cleaned_photos = []

    for photo in selected_photos:

        uuid = photo["uuid"]

        selected_uuids.append(uuid)

        cleaned_photos.append({
            "uuid": uuid,
            "filename": photo.get(
                "filename"
            ),
            "date": photo.get(
                "date"
            ),
            "favorite": photo.get(
                "favorite",
                False,
            ),
        })


    curated_memories.append({

        "id":
            memory["id"],

        "start":
            memory["start"],

        "end":
            memory["end"],

        "duration_minutes":
            memory["duration_minutes"],

        "latitude":
            memory["latitude"],

        "longitude":
            memory["longitude"],

        "original_photo_count":
            memory["photo_count"],

        "apple_neighborhoods":
            memory.get(
                "apple_neighborhoods",
                [],
            ),

        "places":
            memory.get(
                "places",
                [],
            ),

        "notes":
            memory.get(
                "notes",
                "",
            ),

        "photos":
            cleaned_photos,
    })


# Remove duplicate UUIDs while
# preserving chronological order.

selected_uuids = list(
    dict.fromkeys(
        selected_uuids
    )
)


# ============================================================
# SAVE CURATED MEMORIES
# ============================================================

with open(
    CURATED_OUTPUT,
    "w",
    encoding="utf-8",
) as file:

    json.dump(
        curated_memories,
        file,
        indent=2,
        ensure_ascii=False,
    )


# ============================================================
# SAVE MEMORIES FLAGGED TO SPLIT
# ============================================================

with open(
    SPLIT_OUTPUT,
    "w",
    encoding="utf-8",
) as file:

    json.dump(
        to_split,
        file,
        indent=2,
        ensure_ascii=False,
    )


# ============================================================
# SAVE SELECTED PHOTO UUIDS
# ============================================================

with open(
    UUID_OUTPUT,
    "w",
    encoding="utf-8",
) as file:

    for uuid in selected_uuids:
        file.write(
            uuid + "\n"
        )


# ============================================================
# SUMMARY
# ============================================================

print()
print("CURATED DATASET COMPLETE")
print("--------------------------------")

print(
    f"Total memories: {len(memories)}"
)

print(
    f"Keep: {len(kept)}"
)

print(
    f"Hide: {len(hidden)}"
)

print(
    f"Split later: {len(to_split)}"
)

print(
    f"Undecided: {len(undecided)}"
)

print()

print(
    f"Final curated memories: "
    f"{len(curated_memories)}"
)

print(
    f"Selected photos: "
    f"{len(selected_uuids)}"
)

print()

print(
    f"Saved: {CURATED_OUTPUT}"
)

print(
    f"Saved: {SPLIT_OUTPUT}"
)

print(
    f"Saved: {UUID_OUTPUT}"
)