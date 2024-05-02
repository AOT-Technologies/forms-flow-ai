"""This exposes the Keycloak User service."""

from typing import Dict, List


class UserService:
    """This class manages keycloak user service."""

    @staticmethod
    def _as_dict(user):
        """Returns response dict for user."""
        return {
            "id": user.get("id"),
            "email": user.get("email"),
            "firstName": user.get("firstName"),
            "lastName": user.get("lastName"),
            "role": user.get("role"),
            "username": user.get("username"),
        }

    @staticmethod
    def search(params, user_list):
        """Search user list and return users matching the search criteria."""

        def iter_fun(user):
            search_flag = True
            if params.get("firstName"):
                search_flag = (
                    params.get("firstName") in user["firstName"]
                    if user.get("firstName")
                    else False
                )
            if params.get("lastName"):
                search_flag = (
                    params.get("lastName") in user["lastName"]
                    if user.get("lastName")
                    else False
                )
            if params.get("email"):
                search_flag = (
                    params.get("email") in user["email"] if user.get("email") else False
                )
            return search_flag

        return list(filter(iter_fun, user_list))

    def get_users(self, query_params, users_list):
        """Get keycloak users."""
        response: List[Dict] = []
        if (
            query_params.get("firstName")
            or query_params.get("lastName")
            or query_params.get("email")
        ):
            users_list = UserService.search(query_params, users_list)
        for user in users_list:
            response.append(UserService._as_dict(user))
        return response

    def user_search(self, search, user_list):
        """
        Replicates Keycloak users search functionality.

        Searches for a given string within usernames,
        first names, last names, or email addresses.

        Parameters:
        - search (str): The string to search for within user attributes.
        - user_list (list): A list of users to search within.

        Returns:
        - list: A filtered list of users matching the search criteria.
        """
        search_fields = ["username", "firstName", "lastName", "email"]
        result = [
            item
            for item in user_list
            if any(search in item.get(key, "") for key in search_fields)
        ]
        return result

    def paginate(self, data, page_number, page_size):
        """Paginate the provided data."""
        start_index = (page_number - 1) * page_size
        end_index = start_index + page_size
        return data[start_index:end_index]
