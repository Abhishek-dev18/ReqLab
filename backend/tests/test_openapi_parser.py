from app.services.openapi_parser import extract_endpoints, parse_openapi_spec

SAMPLE_OPENAPI = """
openapi: 3.0.3
info:
  title: Pet Store
  version: 1.0.0
servers:
  - url: https://api.example.com/v1
paths:
  /pets:
    get:
      tags:
        - Pets
      summary: List pets
      responses:
        '200':
          description: OK
    post:
      tags:
        - Pets
      summary: Create pet
      requestBody:
        content:
          application/json:
            schema:
              type: object
      responses:
        '201':
          description: Created
  /pets/{id}:
    get:
      tags:
        - Pets
      summary: Get pet
      parameters:
        - in: path
          name: id
          schema:
            type: string
      responses:
        '200':
          description: OK
"""


def test_parse_yaml_openapi():
    spec, fmt = parse_openapi_spec(SAMPLE_OPENAPI)
    assert fmt == "yaml"
    assert spec["info"]["title"] == "Pet Store"


def test_extract_endpoints():
    spec, _ = parse_openapi_spec(SAMPLE_OPENAPI)
    endpoints = extract_endpoints(spec)
    assert len(endpoints) == 3
    assert endpoints[0]["folder"] == "Pets"
    assert "pets" in endpoints[0]["url"]
