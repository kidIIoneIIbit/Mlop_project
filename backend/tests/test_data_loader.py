from services.data_loader import load_breeds, load_foods


def test_load_breeds_returns_list():
    breeds = load_breeds()
    assert isinstance(breeds, list)
    assert len(breeds) > 0


def test_load_breeds_has_keys():
    breeds = load_breeds()
    b = breeds[0]

    assert "id" in b
    assert "name" in b
    assert "species" in b


def test_load_foods_returns_list():
    foods = load_foods()
    assert isinstance(foods, list)
    assert len(foods) > 0


def test_load_foods_has_keys():
    foods = load_foods()
    f = foods[0]

    assert "id" in f
    assert "name" in f
    assert "species" in f