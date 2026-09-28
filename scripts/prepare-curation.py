import json


INPUT_FILE = "madrid-memory-clusters.json"

UUID_OUTPUT = "curation-uuids.txt"
MANIFEST_OUTPUT = "curation-manifest.json"

MAX_PREVIEWS = 6


# ---------------------------------------------------------
# LOAD MEMORIES
# ---------------------------------------------------------

with open(
    INPUT_FILE,
    "r",
    encoding="utf-8",
) as file:
    memories = json.load(file)


def choose_preview_photos(photos, max_count=6):
    """
    Choose a small set of photos that represents the memory.

    Priority:
    1. favorites
    2. evenly spaced photos from the rest of the memory
    """

    if len(photos) <= max_count:
        return photos


    selected = []
    selected_uuids = set()


    # -----------------------------------------------------
    # FAVORITES FIRST
    # -----------------------------------------------------

    favorites = [
        photo
        for photo in photos
        if photo.get("favorite")
    ]


    # If there are tons of favorites, sample them evenly.
    if len(favorites) > max_count:

        indexes = [
            round(
                i
                * (len(favorites) - 1)
                / (max_count - 1)
            )
            for i in range(max_count)
        ]

        favorites = [
            favorites[index]
            for index in indexes
        ]


    for photo in favorites:

        if len(selected) >= max_count:
            break

        selected.append(photo)
        selected_uuids.add(
            photo["uuid"]
        )


    # -----------------------------------------------------
    # FILL REMAINING SPOTS EVENLY
    # -----------------------------------------------------

    remaining_slots = (
        max_count - len(selected)
    )


    if remaining_slots > 0:

        available = [
            photo
            for photo in photos
            if photo["uuid"]
            not in selected_uuids
        ]


        if available:

            if remaining_slots == 1:

                indexes = [
                    len(available) // 2
                ]

            else:

                indexes = [
                    round(
                        i
                        * (len(available) - 1)
                        / (remaining_slots - 1)
                    )
                    for i
                    in range(remaining_slots)
                ]


            for index in indexes:

                photo = available[index]

                if (
                    photo["uuid"]
                    in selected_uuids
                ):
                    continue

                selected.append(photo)

                selected_uuids.add(
                    photo["uuid"]
                )


    # Put them back in chronological order.

    selected.sort(
        key=lambda photo:
            photo["date"]
    )


    return selected


# ---------------------------------------------------------
# BUILD CURATION MANIFEST
# ---------------------------------------------------------

manifest = []

all_uuids = []


for memory in memories:

    previews = choose_preview_photos(
        memory["photos"],
        MAX_PREVIEWS,
    )


    for photo in previews:

        all_uuids.append(
            photo["uuid"]
        )


    manifest.append({

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

        "photo_count":
            memory["photo_count"],

        "favorite_count":
            memory["favorite_count"],

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

        "preview_photos": [
            {
                "uuid":
                    photo["uuid"],

                "filename":
                    photo["filename"],

                "date":
                    photo["date"],

                "favorite":
                    photo.get(
                        "favorite",
                        False,
                    ),
            }

            for photo in previews
        ],

        # We'll fill these in from the UI later.

        "decision":
            None,

        "notes":
            "",

    })


# ---------------------------------------------------------
# SAVE UUID FILE
# ---------------------------------------------------------

unique_uuids = list(
    dict.fromkeys(
        all_uuids
    )
)


with open(
    UUID_OUTPUT,
    "w",
    encoding="utf-8",
) as file:

    for uuid in unique_uuids:

        file.write(
            uuid + "\n"
        )


# ---------------------------------------------------------
# SAVE MANIFEST
# ---------------------------------------------------------

with open(
    MANIFEST_OUTPUT,
    "w",
    encoding="utf-8",
) as file:

    json.dump(
        manifest,
        file,
        indent=2,
        ensure_ascii=False,
    )


# ---------------------------------------------------------
# SUMMARY
# ---------------------------------------------------------

print()
print("CURATION PREP COMPLETE")
print("--------------------------------")

print(
    f"Memories: {len(manifest)}"
)

print(
    f"Preview photos to export: "
    f"{len(unique_uuids)}"
)

print()

print(
    f"Saved UUID list to "
    f"{UUID_OUTPUT}"
)

print(
    f"Saved manifest to "
    f"{MANIFEST_OUTPUT}"
)