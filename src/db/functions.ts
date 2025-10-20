import { pool } from ".";

async function databaseInsert<T>(
    table: string,
    data: Record<keyof T, T[keyof T]>
): Promise<T | null> {
    const conn = await pool.getConnection();

    try {
        const keys = Object.keys(data);
        const values = Object.values(data);

        // Sanitize identifiers
        const isSafeIdentifier = (id: string) => /^[a-zA-Z0-9_]+$/.test(id);
        if (!isSafeIdentifier(table) || !keys.every(isSafeIdentifier))
            throw new Error("Unsafe identifier in query");

        const placeholders = keys.map(() => "?").join(", ");
        const sql = `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${placeholders})`;

        const result = await conn.query(sql, values);
        return result as T;
    } finally {
        conn.release();
    }
}

async function databaseUpdate<T>(
    table: string,
    data: Partial<T>,
    where: Partial<T>
): Promise<boolean> {
    const conn = await pool.getConnection();

    try {
        const dataKeys = Object.keys(data);
        const dataValues = Object.values(data);
        const whereKeys = Object.keys(where);
        const whereValues = Object.values(where);

        const isSafeIdentifier = (id: string) => /^[a-zA-Z0-9_]+$/.test(id);
        if (!isSafeIdentifier(table) ||
            !dataKeys.every(isSafeIdentifier) ||
            !whereKeys.every(isSafeIdentifier))
            throw new Error("Unsafe identifier in query");

        const setClause = dataKeys.map(k => `${k} = ?`).join(", ");
        const whereClause = whereKeys.map(k => `${k} = ?`).join(" AND ");

        const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
        const result = await conn.query(sql, [...dataValues, ...whereValues]);

        return (result as any).affectedRows > 0;
    } finally {
        conn.release();
    }
}

async function databaseDelete<T>(
    table: string,
    where: Record<keyof T, T[keyof T]>
): Promise<boolean> {
    const conn = await pool.getConnection();

    try {
        const whereKeys = Object.keys(where);
        const whereValues = Object.values(where);

        const isSafeIdentifier = (id: string) => /^[a-zA-Z0-9_]+$/.test(id);
        if (!isSafeIdentifier(table) || !whereKeys.every(isSafeIdentifier))
            throw new Error("Unsafe identifier in query");

        const whereClause = whereKeys.map(k => `${k} = ?`).join(" AND ");
        const sql = `DELETE FROM ${table} WHERE ${whereClause}`;

        const result = await conn.query(sql, whereValues);
        return (result as any).affectedRows > 0;
    } finally {
        conn.release();
    }
}

export {
    databaseInsert, databaseUpdate, databaseDelete
}