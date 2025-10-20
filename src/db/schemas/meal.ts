// meal types
/////////////

interface DB_Meal {
    readonly meal_id: number;
    name: string;
    description: string;
}

interface DB_MealInsert {
    name: string;
    description: string;
}

const DB_MEAL_VALID_INSERT_KEYS = [
    "name",
    "description"
]

export {
    DB_Meal, DB_MealInsert, DB_MEAL_VALID_INSERT_KEYS
};
