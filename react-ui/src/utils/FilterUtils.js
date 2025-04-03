function filterItems(data, filters) {
    const itemsToReturn = [];

    for (const item of data) {
        let passesAllFilters = true;

        for (const [filterType, filterValues] of Object.entries(filters)) {
            const itemValue = item[filterType];

            // Eğer field 'description' ise "içeriyor mu?" kontrolü yap
            if (filterType === 'description') {
                const lowerDesc = itemValue.toLowerCase();
                const hasAnyKeyword = filterValues.some(keyword =>
                    lowerDesc.includes(keyword.toLowerCase())
                );

                if (!hasAnyKeyword) {
                    passesAllFilters = false;
                    break;
                }

            } else {
                // Diğer tüm filtreler için klasik eşleşme
                if (!filterValues.includes(itemValue)) {
                    passesAllFilters = false;
                    break;
                }
            }
        }

        if (passesAllFilters) {
            itemsToReturn.push(item);
        }
    }

    return itemsToReturn;
}

function sortItems(data, sortMethod = 'alpha-ascend') {
    const sortedData = [...data];

    switch (sortMethod) {
        case 'alpha-ascend':
            sortedData.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
            break;

        case 'alpha-descend':
            sortedData.sort((a, b) => b.name.toLowerCase().localeCompare(a.name.toLowerCase()));
            break;

        case 'date-ascend':
            sortedData.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;

        case 'date-descend':
            sortedData.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;

        default:
            break;
    }

    return sortedData;
}