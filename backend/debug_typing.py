import typing
import sys

print(f"Python version: {sys.version}")
try:
    print("Testing typing.Union...")
    u = typing.Union[int, str]
    print(f"Union created: {u}")
    # Some libraries might try to access __origin__ or other attributes
    print(f"Union __origin__: {getattr(u, '__origin__', 'N/A')}")
except Exception as e:
    print(f"Error with typing.Union: {e}")

try:
    print("\nTesting typing_inspection...")
    import typing_inspection
    print("typing_inspection imported successfully")
    # Test common introspection
    from typing_inspection import introspection
    print("introspection imported successfully")
except Exception as e:
    print(f"Error with typing_inspection: {e}")
    import traceback
    traceback.print_exc()

try:
    print("\nTesting pydantic...")
    from pydantic import BaseModel
    class Test(BaseModel):
        x: int | str
    print("Pydantic model created successfully")
except Exception as e:
    print(f"Error with pydantic: {e}")
    import traceback
    traceback.print_exc()
