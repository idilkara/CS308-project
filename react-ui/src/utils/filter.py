from datetime import datetime

def filter_items(data, filters):

    '''
    Filters the provided dataset based on user-defined criteria.

    :param data: A list of dictionaries representing product data.
                 Each dictionary contains fields such as:
                 {
                     "description": str,
                     "distributor_information": str,
                     "model": str,
                     "name": str,
                     "price": str,
                     ...
                 }

    :param filters: A list of dictionaries defining filtering criteria.
                    Each dictionary follows the format:
                    {
                        "filter_type": [filter_value1, filter_value2, ...]
                    }
                    - Keys represent the field names in `data` to filter by.
                    - Values are lists of acceptable values for that field.

    :return: A filtered list of dictionaries containing only the matching items.
    '''

    # Initialize a list to store items that will be returned
    items_to_return = []

    # Loop over evert item in data
    for item in data:

        # Set a flag
        passes_all_filters = True

        # Loop over each filter
        for filter_type, filter_values in filters.items():

            # If item does not pass the filter, leave the loop
            if item[filter_type] not in filter_values:
                passes_all_filters = False
                break

        # If it passes the filter, add it to the list
        if passes_all_filters:
            items_to_return.append(item)



def sort_items(data, sort_method = 'alpha-ascend'):

    '''
    Sorts the provided dataset based on user-defined criteria.
    :param data: A list of dictionaries representing product data.
                 Each dictionary contains fields such as:
                 {
                     "description": str,
                     "distributor_information": str,
                     "model": str,
                     "name": str,
                     "price": str,
                     ...
                 }
    :param sort_method: A string defining the sort method to use.
    :return: A sorted list of dictionaries.
    '''

    if sort_method == 'alpha-ascend':
        sorted_data = sorted(data, key=lambda x: x['name'].lower())

    elif sort_method == 'alpha-descend':
        sorted_data = sorted(data, key=lambda x: x['name'].lower(), reverse=True)

    elif sort_method == 'date-ascend':
        sorted_data = sorted(data, key=lambda x: datetime.strptime(x['date'], '%Y-%m-%d'))

    elif sort_method == 'date-descend':
        sorted_data = sorted(data, key=lambda x: datetime.strptime(x['date'], '%Y-%m-%d'), reverse=True)
