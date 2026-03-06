# backend/tests/test_data_loader.py
from services.data_loader import load_breeds, load_foods


def test_load_breeds_returns_list():
    breeds = load_breeds()
    assert isinstance(breeds, list)
    assert len(breeds) > 0


def test_load_breeds_has_keys():
    breeds = load_breeds()
    assert all(
        ("id" in b and "species" in b and "nutritional_targets" in b)
        for b in breeds
    )


def test_load_foods_returns_list():
    foods = load_foods()
    assert isinstance(foods, list)
    assert len(foods) > 0


def test_load_foods_has_keys():
    foods = load_foods()
    assert all(
        ("id" in f and "species" in f and "nutritional_content" in f and "tags" in f)
        for f in foods
    )