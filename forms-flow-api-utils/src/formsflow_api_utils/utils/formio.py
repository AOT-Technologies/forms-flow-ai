"""Util class to handle form.io data or submission data related functions."""


def generate_formio_patch_request(data, path_prefix="/data"):
    """Generates form.io patch request in json-patch format."""
    patch = []

    def iterate(sub_data, current_path):
        if isinstance(sub_data, dict):
            for key, value in sub_data.items():
                # Construct the new path by appending the current key
                new_path = f"{current_path}/{key}"
                if isinstance(value, dict):
                    # If the value is a dictionary, iterate it
                    iterate(value, new_path)
                else:
                    # If the value is not a dictionary, add a patch operation
                    patch.append({
                        "op": "replace",
                        "path": new_path,
                        "value": value
                    })
        else:
            # If non dictionary data, patch it
            patch.append({
                "op": "add",
                "path": current_path,
                "value": sub_data
            })

    iterate(data, path_prefix)
    return patch
