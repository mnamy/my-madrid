import json
from collections import Counter, defaultdict
from datetime import datetime


CURATED_FILE = "curated-memories.json"
CONFIG_FILE = (
    "madrid-map/public/"
    "neighborhood-config.json"
)
OUTPUT_FILE = (
    "madrid-map/public/"
    "neighborhood-stats.json"
)


# ============================================================
# LOAD DATA
# ============================================================

with open(
    CURATED_FILE,
    "r",
    encoding="utf-8",
) as file:
    memories = json.load(file)


with open(
    CONFIG_FILE,
    "r",
    encoding="utf-8",
) as file:
    neighborhoods = json.load(file)


# ============================================================
# HELPERS
# ============================================================

MONTH_NAMES = {
    1: "January",
    2: "February",
    3: "March",
    4: "April",
    5: "May",
    6: "June",
    7: "July",
    8: "August",
    9: "September",
    10: "October",
    11: "November",
    12: "December",
}


def time_of_day(hour):
    if 5 <= hour < 12:
        return "morning"

    if 12 <= hour < 18:
        return "afternoon"

    if 18 <= hour < 22:
        return "evening"

    return "lateNight"


def get_apple_label_counts(memory):
    """
    Converts:
    [
        {"value": "Centro", "count": 4},
        {"value": "Universidad", "count": 3}
    ]

    into:
    {
        "Centro": 4,
        "Universidad": 3
    }
    """

    counts = {}

    for item in memory.get(
        "apple_neighborhoods",
        [],
    ):
        if isinstance(item, dict):
            label = item.get("value")
            count = item.get("count", 1)
        else:
            label = item
            count = 1

        if label:
            counts[label] = (
                counts.get(label, 0)
                + count
            )

    return counts


def assign_neighborhood(memory):
    """
    Assign one curated memory to one
    featured neighborhood.

    Specific neighborhood labels take
    priority when Apple gives us overlapping
    geographic labels.
    """

    apple_counts = (
        get_apple_label_counts(memory)
    )

    # --------------------------------------------------------
    # SPECIFIC OVERRIDES
    # --------------------------------------------------------

    # Apple sometimes returns both Palacio
    # and La Latina for the same memory.
    # For our human-facing map, La Latina
    # should win when it is explicitly present.

    if "La Latina" in apple_counts:
        return next(
            neighborhood
            for neighborhood in neighborhoods
            if neighborhood["id"] == "la-latina"
        )


    # --------------------------------------------------------
    # NORMAL ASSIGNMENT
    # --------------------------------------------------------

    candidates = []

    for index, neighborhood in enumerate(
        neighborhoods
    ):
        score = sum(
            apple_counts.get(label, 0)
            for label
            in neighborhood["sourceLabels"]
        )

        if score > 0:
            candidates.append(
                (
                    score,
                    -index,
                    neighborhood,
                )
            )

    if not candidates:
        return None

    candidates.sort(
        reverse=True,
        key=lambda item: (
            item[0],
            item[1],
        ),
    )

    return candidates[0][2]


# ============================================================
# ASSIGN MEMORIES
# ============================================================

assigned = defaultdict(list)
unassigned = []


for memory in memories:
    neighborhood = assign_neighborhood(
        memory
    )

    if neighborhood:
        assigned[
            neighborhood["id"]
        ].append(memory)
    else:
        unassigned.append(memory)


# ============================================================
# BUILD STATS
# ============================================================

output = []


for neighborhood in neighborhoods:

    neighborhood_memories = assigned.get(
        neighborhood["id"],
        [],
    )

    if not neighborhood_memories:
        continue

    neighborhood_memories.sort(
        key=lambda memory:
            memory["start"]
    )

    dates = [
        datetime.fromisoformat(
            memory["start"]
        )
        for memory
        in neighborhood_memories
    ]

    # --------------------------------------------------------
    # DISTINCT DAYS + MONTHS
    # --------------------------------------------------------

    days = {
        date.date().isoformat()
        for date in dates
    }

    months = {
        date.month
        for date in dates
    }

    # --------------------------------------------------------
    # MONTH COUNTS
    # --------------------------------------------------------

    month_counts = Counter(
        MONTH_NAMES[date.month]
        for date in dates
    )

    most_active_month = (
        month_counts.most_common(1)[0][0]
        if month_counts
        else None
    )

    # --------------------------------------------------------
    # TIME OF DAY
    # --------------------------------------------------------

    time_counts = Counter(
        time_of_day(date.hour)
        for date in dates
    )

    # --------------------------------------------------------
    # WEEKDAY / WEEKEND
    # --------------------------------------------------------

    weekday_count = sum(
        1
        for date in dates
        if date.weekday() < 5
    )

    weekend_count = (
        len(dates)
        - weekday_count
    )

    # --------------------------------------------------------
    # SELECTED PHOTOS
    # --------------------------------------------------------

    selected_photo_count = sum(
        len(memory.get("photos", []))
        for memory
        in neighborhood_memories
    )

    # --------------------------------------------------------
    # MAP CENTER
    # --------------------------------------------------------

    latitude = sum(
        memory["latitude"]
        for memory
        in neighborhood_memories
    ) / len(neighborhood_memories)

    longitude = sum(
        memory["longitude"]
        for memory
        in neighborhood_memories
    ) / len(neighborhood_memories)

    # --------------------------------------------------------
    # OUTPUT RECORD
    # --------------------------------------------------------

    output.append({

        "id":
            neighborhood["id"],

        "name":
            neighborhood["name"],

        "icon":
            neighborhood["icon"],

        "sourceLabels":
            neighborhood[
                "sourceLabels"
            ],

        "memoryCount":
            len(
                neighborhood_memories
            ),

        "daysVisited":
            len(days),

        "monthsVisited":
            len(months),

        "selectedPhotoCount":
            selected_photo_count,

        "firstMemory":
            dates[0].isoformat(),

        "lastMemory":
            dates[-1].isoformat(),

        "mostActiveMonth":
            most_active_month,

        "monthCounts": {
            month: month_counts.get(
                month,
                0,
            )
            for month in [
                "January",
                "February",
                "March",
                "April",
                "May",
            ]
        },

        "timeOfDay": {
            "morning":
                time_counts.get(
                    "morning",
                    0,
                ),

            "afternoon":
                time_counts.get(
                    "afternoon",
                    0,
                ),

            "evening":
                time_counts.get(
                    "evening",
                    0,
                ),

            "lateNight":
                time_counts.get(
                    "lateNight",
                    0,
                ),
        },

        "weekdayCount":
            weekday_count,

        "weekendCount":
            weekend_count,

        "center": {
            "latitude":
                latitude,

            "longitude":
                longitude,
        },

        "memoryIds": [
            memory["id"]
            for memory
            in neighborhood_memories
        ],
    })


# ============================================================
# SAVE
# ============================================================

with open(
    OUTPUT_FILE,
    "w",
    encoding="utf-8",
) as file:

    json.dump(
        output,
        file,
        indent=2,
        ensure_ascii=False,
    )


# ============================================================
# TERMINAL SUMMARY
# ============================================================

print()
print(
    "NEIGHBORHOOD STATS COMPLETE"
)
print(
    "--------------------------------"
)

assigned_total = 0

for neighborhood in output:

    assigned_total += (
        neighborhood["memoryCount"]
    )

    print(
        f"{neighborhood['name']:<24}"
        f"{neighborhood['memoryCount']:>3} "
        f"memories | "
        f"{neighborhood['daysVisited']:>2} "
        f"days | "
        f"{neighborhood['monthsVisited']} "
        f"months | "
        f"{neighborhood['mostActiveMonth']}"
    )

print()
print(
    f"Featured neighborhood memories: "
    f"{assigned_total}"
)

print(
    f"Other Madrid memories: "
    f"{len(unassigned)}"
)

print(
    f"Total curated memories: "
    f"{len(memories)}"
)

print()

print(
    f"Saved: {OUTPUT_FILE}"
)
