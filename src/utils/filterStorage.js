const KEY = "selected-filters"

export const getFilters = () => JSON.parse(sessionStorage.getItem(KEY) || "[]")
export const saveFilters = (filters) => sessionStorage.setItem(KEY, JSON.stringify(filters))
export const clearFilters = () => sessionStorage.removeItem(KEY)