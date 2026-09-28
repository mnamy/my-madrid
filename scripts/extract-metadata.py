import json
from datetime import datetime
import osxphotos


# ---------------------------------------------------------
# SETTINGS
# ---------------------------------------------------------

START_DATE = datetime(2025, 1, 1)
END_DATE = datetime(2025, 6, 1)

MADRID_BOUNDS = {
    "min_lat": 40.30,
    "max_lat": 40.55,
    "min_lon": -3.85,
    "max_lon": -3.55,
}


# ---------------------------------------------------------
# HELPER
# ---------------------------------------------------------

def safe_list(obj, attribute):
    if obj is None:
        return []

    try:
        value = getattr(obj, attribute, [])
        return value or []
    except Exception:
        return []


def safe_value(obj, attribute):
    if obj is None:
        return None

    try:
        return getattr(obj, attribute, None)
    except Exception:
        return None


# ---------------------------------------------------------
# LOAD APPLE PHOTOS
# ---------------------------------------------------------

print("Loading Photos library...")

photosdb = osxphotos.PhotosDB()

photos = photosdb.photos(
    images=True,
    movies=False,
    from_date=START_DATE,
    to_date=END_DATE,
)

print(f"Found {len(photos)} photos in date range.")


# ---------------------------------------------------------
# BUILD MADRID DATASET
# ---------------------------------------------------------

madrid_photos = []

for photo in photos:

    latitude = photo.latitude
    longitude = photo.longitude

    if latitude is None or longitude is None:
        continue

    in_madrid = (
        MADRID_BOUNDS["min_lat"]
        <= latitude
        <= MADRID_BOUNDS["max_lat"]

        and

        MADRID_BOUNDS["min_lon"]
        <= longitude
        <= MADRID_BOUNDS["max_lon"]
    )

    if not in_madrid:
        continue


    # -----------------------------------------------------
    # APPLE PHOTOS SEARCH METADATA
    # -----------------------------------------------------

    search_info = photo.search_info


    # -----------------------------------------------------
    # APPLE PLACE DATA
    # -----------------------------------------------------

    place_name = None

    if photo.place:
        try:
            place_name = photo.place.name
        except Exception:
            pass


    # -----------------------------------------------------
    # RECORD
    # -----------------------------------------------------

    record = {

        # Identity
        "uuid": photo.uuid,
        "filename": photo.original_filename,

        # Time
        "date": (
            photo.date.isoformat()
            if photo.date
            else None
        ),

        # GPS
        "latitude": latitude,
        "longitude": longitude,

        # Apple's reverse-geocoded location
        "place": place_name,

        # Apple's search/geographic metadata
        "apple_neighborhoods":
            safe_list(
                search_info,
                "neighborhoods"
            ),

        "apple_place_names":
            safe_list(
                search_info,
                "place_names"
            ),

        "apple_streets":
            safe_list(
                search_info,
                "streets"
            ),

        "apple_localities":
            safe_list(
                search_info,
                "locality_names"
            ),

        "apple_city":
            safe_value(
                search_info,
                "city"
            ),

        "apple_areas_of_interest":
            safe_list(
                search_info,
                "areas_of_interest"
            ),

        # Apple's image understanding
        "apple_labels":
            safe_list(
                search_info,
                "labels"
            ),

        "apple_activities":
            safe_list(
                search_info,
                "activities"
            ),

        "apple_venues":
            safe_list(
                search_info,
                "venues"
            ),

        "apple_venue_types":
            safe_list(
                search_info,
                "venue_types"
            ),

        # Existing Photos metadata
        "favorite": photo.favorite,
        "keywords": photo.keywords,
        "albums": photo.albums,

        # Local image file, if currently downloaded
        "path": photo.path,
    }


    madrid_photos.append(
        record
    )


# ---------------------------------------------------------
# SORT
# ---------------------------------------------------------

madrid_photos.sort(
    key=lambda photo:
        photo["date"] or ""
)


# ---------------------------------------------------------
# SAVE
# ---------------------------------------------------------

OUTPUT_FILE = (
    "madrid-photo-metadata-v2.json"
)

with open(
    OUTPUT_FILE,
    "w",
    encoding="utf-8",
) as file:

    json.dump(
        madrid_photos,
        file,
        indent=2,
        ensure_ascii=False,
    )


# ---------------------------------------------------------
# SUMMARY
# ---------------------------------------------------------

print()
print(
    f"Saved {len(madrid_photos)} "
    f"Madrid photos to {OUTPUT_FILE}"
)

print()


# Show first photos that actually have
# neighborhood information.

photos_with_neighborhoods = [
    photo
    for photo in madrid_photos
    if photo["apple_neighborhoods"]
]

print(
    f"{len(photos_with_neighborhoods)} photos "
    "have Apple neighborhood metadata."
)

print()

for photo in photos_with_neighborhoods[:20]:

    print(
        photo["date"],
        "|",
        photo["filename"],
        "| neighborhoods:",
        photo["apple_neighborhoods"],
        "| place:",
        photo["place"],
    )