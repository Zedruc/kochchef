import chalk from "chalk";

interface ICliArgs {
    port: number;
    production: boolean;
}

const cliArgTypeMap = {
    port: "number",
    production: "boolean"
}

const cliArgsCache: Partial<ICliArgs> = {}

export function getCliArg<T>(name: keyof ICliArgs): T | null {
    if(cliArgsCache.hasOwnProperty(name)) return cliArgsCache[name] as T;
    
    if(cliArgTypeMap[name] === "boolean") {
        cliArgsCache[name] = process.argv.includes(`--${name}`) as any;        
    }

    if(cliArgTypeMap[name] === "number") {
        cliArgsCache[name] = +process.argv[process.argv.indexOf(`-${name}`) + 1] as any;        
    }

    if(cliArgTypeMap[name] === "string") {
        cliArgsCache[name] = process.argv[process.argv.indexOf(`-${name}`) + 1] as any;        
    }

    return cliArgsCache[name] as T;
}

// run cli arg check here
const validCliArgs = ["port", "production"];

for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if(!arg.startsWith("-")) continue;
    if(!validCliArgs.includes(arg.replaceAll("-", ""))) {
        console.log(chalk.bold.red("Error:"), `Unknown argument ${arg}.`);
    }
}