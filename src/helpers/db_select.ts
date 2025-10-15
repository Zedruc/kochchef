import { pool } from "./db";

async function databaseSelect<T>(
    toSelect: string[],
    table: string,
    whereKeys: string[],
    whereValues: any[]
): Promise<T[] | null> {
    if (whereKeys.length !== whereValues.length) return null;

    // validate to protect against sql injection
    const isSafeIdentifier = (id: string) => /^[a-zA-Z0-9_\*]+$/.test(id);
    if (!isSafeIdentifier(table)
        ||  !(toSelect.every(isSafeIdentifier))
        || !(whereKeys.every(isSafeIdentifier))
        || !(whereValues.every(isSafeIdentifier))) {
        throw new Error("Unsafe identifier in query");
    }

    const selectClause = toSelect.join(", ");

    const whereClause = whereKeys.map(key => `${key} = ?`).join(" AND ");

    const sql = `SELECT ${selectClause} FROM ${table} WHERE ${whereClause}`;

    const conn = await pool.getConnection();

    try {
        const rows = await conn.query(sql, whereValues);
        return rows as T[];
    } finally {
        conn.release();
    }
}

export {
    databaseSelect
}