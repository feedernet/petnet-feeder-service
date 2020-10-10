import math
import hashlib


def paginate_response(entities: list, current_page=1, max_page_size=10) -> dict:
    list_length = len(entities)
    offset = (current_page - 1) * max_page_size
    page_size = max_page_size
    if list_length < max_page_size:
        page_size = list_length

    page_count = 0
    if page_size:
        page_count = math.ceil(list_length / page_size)

    return {
        "size": page_size,
        "data": entities[offset : offset + page_size],
        "page": current_page,
        "totalSize": list_length,
        "totalPages": page_count,
    }


def generate_feeder_hid(uid: str) -> str:
    return hashlib.sha1(uid.encode("utf-8")).hexdigest()
