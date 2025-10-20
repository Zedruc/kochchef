interface DB_Recipe {
    readonly recipe_id: number;
    readonly meal_id: number;
    readonly author_id: number;
    name: string;
    instructions: string;
    image: string;
    readonly created_at: string;
}

interface DB_RecipeInsert {
    name: string;
    instructions: string;
    image: string;
}

const DB_RECIPE_VALID_INSERT_KEYS: (keyof DB_RecipeInsert)[] = [
    "name",
    "instructions",
    "image"
]

export {
    DB_Recipe,
    DB_RecipeInsert,
    DB_RECIPE_VALID_INSERT_KEYS
}