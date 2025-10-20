import { DB_Recipe, DB_RecipeInsert } from "@/db/schemas/recipe";
import { databaseSelect, findOne } from "@/helpers/db_select";
import { Router, Request } from "express";

const router = Router();

async function recipeExists(name: string) {
    let recipe = findOne<DB_Recipe>({name: name}, ["name"], "recipe");
    return !!recipe;
}

router.post("/create", (req, res) => {
    const values: DB_RecipeInsert = req.body;
});

export = router;