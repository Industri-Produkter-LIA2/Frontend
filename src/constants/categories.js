export async function getCategories() {
    return [
        'Kompressorer',
        'Slangar',
        'Hydraulik',
        'Tätningar',
        'Kilremmar',
        'Pneumatik',
        'Cylindrar',
    ]; 
} // Hardcoded for now, eventually we want to expand to fetch this from the backend, so that we can dynamically add categories via for example a "Add category" button