namespace NodeJS {
    interface ProcessEnv {
        MARIADB_HOST: string;
        MARIADB_PORT: string;
        MARIADB_USER: string;
        MARIADB_PASSWORD: string;
        MARIADB_DATABASE: string;

        COOKIE_SECRET: string;
    }
}