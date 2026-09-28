import json
import math
from collections import Counter
from datetime import datetime
from zoneinfo import ZoneInfo


# ==========================================================================
# SETTINGS
# ==========================================================================

INPUT_FILE = "madrid-photo-metadata-v2.json"
OUTPUT_FILE = "madrid-memory-clusters.json"

MADRID_TIMEZONE = ZoneInfo("Europe/Madrid")


# A new memory starts if the next photo is farther away than this.
MAX_DISTANCE_METERS = 150


# A new memory starts if more than this much time passes
# between consecutive photos.
MAX_TIME_GAP_MINUTES = 60


# Prevent one memory from stretching across an entire day
# even if photos keep happening in roughly the same place.
MAX_MEMORY_DURATION_MINUTES = 180


# ==========================================================================
# HELPERS
# ==========================================================================

def parse_date(date_string):
    """
    Convert Apple's ISO timestamp into Madrid local time.

    This is especially useful because some imported photos may
    be stored as +00:00 while your iPhone photos use +01:00/+02:00.
    """

    date = datetime.fromisoformat(date_string)

    if date.tzinfo is None:
        date = date.replace(
            tzinfo=MADRID_TIMEZONE
        )

    return date.astimezone(
        MADRID_TIMEZONE
    )


def distance_meters(
    lat1,
    lon1,
    lat2,
    lon2,
):
    """
    Haversine distance between two GPS coordinates.
    """

    earth_radius = 6371000

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)

    delta_phi = math.radians(
        lat2 - lat1
    )

    delta_lambda = math.radians(
        lon2 - lon1
    )

    a = (
        math.sin(delta_phi / 2) ** 2
        +
        math.cos(phi1)
        *
        math.cos(phi2)
        *
        math.sin(delta_lambda / 2) ** 2
    )

    c = 2 * math.atan2(
        math.sqrt(a),
        math.sqrt(1 - a),
    )

    return earth_radius * c


def get_centroid(photos):
    """
    Get the average GPS coordinate for a memory.
    """

    latitude = sum(
        photo["latitude"]
        for photo in photos
    ) / len(photos)

    longitude = sum(
        photo["longitude"]
        for photo in photos
    ) / len(photos)

    return latitude, longitude


def most_common_values(
    photos,
    field,
    limit=5,
):
    """
    Combine things like Apple neighborhood labels
    across every photo in a memory.
    """

    values = []

    for photo in photos:

        value = photo.get(field)

        if not value:
            continue

        if isinstance(value, list):
            values.extend(value)

        else:
            values.append(value)


    counts = Counter(values)

    return [
        {
            "value": value,
            "count": count,
        }
        for value, count
        in counts.most_common(limit)
    ]


def choose_representative_photo(
    photos
):
    """
    Pick a temporary representative image.

    Favorites win.

    Otherwise choose the middle photo rather
    than always choosing the first image.
    """

    favorites = [
        photo
        for photo in photos
        if photo.get("favorite")
    ]


    if favorites:

        return favorites[
            len(favorites) // 2
        ]


    return photos[
        len(photos) // 2
    ]


# ==========================================================================
# LOAD RAW PHOTO DATA
# ==========================================================================

print()
print("Loading Madrid photos...")


with open(
    INPUT_FILE,
    "r",
    encoding="utf-8",
) as file:

    photos = json.load(file)


# Sort chronologically.

photos.sort(
    key=lambda photo:
        parse_date(
            photo["date"]
        )
)


print(
    f"Loaded {len(photos)} photos."
)


# ==========================================================================
# BUILD MEMORY CLUSTERS
# ==========================================================================

raw_clusters = []

current_cluster = []


for photo in photos:

    photo_time = parse_date(
        photo["date"]
    )


    # First photo starts first memory.

    if not current_cluster:

        current_cluster = [
            photo
        ]

        continue


    previous_photo = (
        current_cluster[-1]
    )

    previous_time = parse_date(
        previous_photo["date"]
    )


    cluster_start_time = parse_date(
        current_cluster[0]["date"]
    )


    # ------------------------------------------------------
    # TIME SINCE PREVIOUS PHOTO
    # ------------------------------------------------------

    time_gap_minutes = (
        photo_time
        -
        previous_time
    ).total_seconds() / 60


    # ------------------------------------------------------
    # TOTAL MEMORY DURATION
    # ------------------------------------------------------

    memory_duration_minutes = (
        photo_time
        -
        cluster_start_time
    ).total_seconds() / 60


    # ------------------------------------------------------
    # DISTANCE FROM CURRENT MEMORY CENTER
    # ------------------------------------------------------

    centroid_latitude, centroid_longitude = (
        get_centroid(
            current_cluster
        )
    )


    distance_from_memory = (
        distance_meters(
            photo["latitude"],
            photo["longitude"],
            centroid_latitude,
            centroid_longitude,
        )
    )


    # ------------------------------------------------------
    # SHOULD THIS PHOTO JOIN THE MEMORY?
    # ------------------------------------------------------

    close_in_time = (
        time_gap_minutes
        <= MAX_TIME_GAP_MINUTES
    )


    close_in_space = (
        distance_from_memory
        <= MAX_DISTANCE_METERS
    )


    within_max_duration = (
        memory_duration_minutes
        <= MAX_MEMORY_DURATION_MINUTES
    )


    if (
        close_in_time
        and
        close_in_space
        and
        within_max_duration
    ):

        current_cluster.append(
            photo
        )

    else:

        raw_clusters.append(
            current_cluster
        )

        current_cluster = [
            photo
        ]


# Save final unfinished cluster.

if current_cluster:

    raw_clusters.append(
        current_cluster
    )


# ==========================================================================
# TURN RAW CLUSTERS INTO MEMORY OBJECTS
# ==========================================================================

memories = []


for index, cluster in enumerate(
    raw_clusters,
    start=1,
):

    start_time = parse_date(
        cluster[0]["date"]
    )

    end_time = parse_date(
        cluster[-1]["date"]
    )


    duration_minutes = round(
        (
            end_time
            -
            start_time
        ).total_seconds()
        / 60,
        1,
    )


    centroid_latitude, centroid_longitude = (
        get_centroid(
            cluster
        )
    )


    representative = (
        choose_representative_photo(
            cluster
        )
    )


    memory = {

        # --------------------------------------------------
        # IDENTITY
        # --------------------------------------------------

        "id":
            f"memory-{index:04d}",


        # --------------------------------------------------
        # TIME
        # --------------------------------------------------

        "start":
            start_time.isoformat(),

        "end":
            end_time.isoformat(),

        "duration_minutes":
            duration_minutes,


        # --------------------------------------------------
        # MAP LOCATION
        # --------------------------------------------------

        "latitude":
            centroid_latitude,

        "longitude":
            centroid_longitude,


        # --------------------------------------------------
        # SUMMARY
        # --------------------------------------------------

        "photo_count":
            len(cluster),

        "favorite_count":
            sum(
                1
                for photo in cluster
                if photo.get(
                    "favorite"
                )
            ),


        # --------------------------------------------------
        # TEMP REPRESENTATIVE IMAGE
        # --------------------------------------------------

        "representative_photo": {
            "uuid":
                representative["uuid"],

            "filename":
                representative["filename"],
        },


        # --------------------------------------------------
        # APPLE LOCATION INFORMATION
        # --------------------------------------------------

        "apple_neighborhoods":
            most_common_values(
                cluster,
                "apple_neighborhoods",
            ),

        "places":
            most_common_values(
                cluster,
                "place",
            ),


        # --------------------------------------------------
        # INDIVIDUAL PHOTOS
        # --------------------------------------------------

        "photos": [
            {
                "uuid":
                    photo["uuid"],

                "filename":
                    photo["filename"],

                "date":
                    parse_date(
                        photo["date"]
                    ).isoformat(),

                "latitude":
                    photo["latitude"],

                "longitude":
                    photo["longitude"],

                "place":
                    photo.get(
                        "place"
                    ),

                "apple_neighborhoods":
                    photo.get(
                        "apple_neighborhoods",
                        [],
                    ),

                "favorite":
                    photo.get(
                        "favorite",
                        False,
                    ),

                "path":
                    photo.get(
                        "path"
                    ),
            }

            for photo in cluster
        ],
    }


    memories.append(
        memory
    )


# ==========================================================================
# SAVE
# ==========================================================================

with open(
    OUTPUT_FILE,
    "w",
    encoding="utf-8",
) as file:

    json.dump(
        memories,
        file,
        indent=2,
        ensure_ascii=False,
    )


# ==========================================================================
# SUMMARY
# ==========================================================================

sizes = [
    memory["photo_count"]
    for memory in memories
]


single_photo_memories = sum(
    size == 1
    for size in sizes
)

small_memories = sum(
    2 <= size <= 5
    for size in sizes
)

medium_memories = sum(
    6 <= size <= 20
    for size in sizes
)

large_memories = sum(
    21 <= size <= 50
    for size in sizes
)

very_large_memories = sum(
    size >= 51
    for size in sizes
)


print()
print(
    "MEMORY CLUSTERING COMPLETE"
)
print(
    "--------------------------------"
)

print(
    f"Raw photos: {len(photos)}"
)

print(
    f"Memory clusters: {len(memories)}"
)

print()

print(
    f"1 photo: {single_photo_memories}"
)

print(
    f"2–5 photos: {small_memories}"
)

print(
    f"6–20 photos: {medium_memories}"
)

print(
    f"21–50 photos: {large_memories}"
)

print(
    f"51+ photos: {very_large_memories}"
)

print()

print(
    f"Largest memory: "
    f"{max(sizes)} photos"
)

print()

print(
    f"Saved to {OUTPUT_FILE}"
)