export interface Collection {
    id: string;
    user_id: string;
    name: string;
    description?: string;
    created_at: string;
    updated_at: string;
    // Optional for UI: count of items, preview images
    item_count?: number;
    preview_images?: string[];
}

export interface CollectionItem {
    collection_id: string;
    outfit_id: string;
    added_at: string;
}
