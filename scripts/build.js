/*
 * Server build script for alt:V multiplayer
*/

// File manager
import * as glob from "glob";
import jetpack from "fs-jetpack";

// Console colouring
import * as colorette from "colorette";

// TypeScript compiler
import esbuild from "esbuild";
import esbuildPluginTsc from "esbuild-plugin-tsc";

// alt:V Configuration parser
import toml from "toml";

// Builder configuration
const config = {
    sourceDirectory: jetpack.path("src"),
    targetDirectory: jetpack.path("dist")
};

// Utilities
function readServerConfig() {
    const configPath = jetpack.path(config.sourceDirectory, "server.toml");
    const fileExists = jetpack.exists(configPath);

    if (!fileExists) {
        console.error(colorette.red("[Error]"), colorette.green("alt:V"), "server configuration file does not exist (", colorette.gray("server.toml"), ")");
        return;
    }

    const fileContent = jetpack.read(configPath);

    let configParsed;

    try {
        configParsed = toml.parse(fileContent);
    }
    catch (error) {
        console.error(colorette.red("[Error]"), "Failed to parse", colorette.green("alt:V"), "server configuration file (", colorette.cyanBright("TOML"), "):", error);
    }

    return configParsed;
};

// Runtime methods
function copyStaticFiles() {
    const filesToCopy = [
        { in: jetpack.path(config.sourceDirectory, "server-files"), out: config.targetDirectory, overwrite: false },
        { in: jetpack.path(config.sourceDirectory, "server.toml"), out: jetpack.path(config.targetDirectory, "server.toml"), overwrite: true }
    ];

    for (let i = 0; i < filesToCopy.length; i++) {
        const copyData = filesToCopy[i];
        const fileExists = jetpack.exists(copyData.in);

        if (!fileExists) {
            console.error(colorette.red("[Error]"), "Failed to copy", colorette.gray(copyData.in), "because in-file doees not exist");
            continue;
        }

        jetpack.copy(copyData.in, copyData.out, { overwrite: () => {
            return copyData.overwrite;
        }});
    }
};

function compileResources() {
    const serverConfig = readServerConfig();

    if (!serverConfig)
        return;

    const productionMode = serverConfig.debug ? false : true;

    jetpack.remove(jetpack.path(config.targetDirectory, "resources"));

    for (let i = 0; i < serverConfig.resources.length; i++) {
        const resourceName = serverConfig.resources[i];
        
        const startTime = Date.now();
        const resourcePath = jetpack.path(config.sourceDirectory, "resources", resourceName);
        
        const filesToCompile = glob.sync(`${resourcePath}/**/*.ts`);
        const filesToCopy = glob.sync(`${resourcePath}/**/*.!(ts)`);

        filesToCopy.forEach(filePath => {
            filePath = jetpack.path(filePath);
            jetpack.copy(filePath, filePath.replace(config.sourceDirectory, config.targetDirectory), { overwrite: true });
        });

        filesToCompile.forEach(filePath => {
            filePath = jetpack.path(filePath);

            esbuild.build({
                entryPoints: [filePath],
                outfile: filePath.replace(config.sourceDirectory, config.targetDirectory).replace(".ts", ".js"),
                bundle: false,
                minify: productionMode,
                plugins: [esbuildPluginTsc()]
            });
        });

        console.log(colorette.yellowBright(`[${resourceName}]`), colorette.greenBright("Built"), "resource in", colorette.gray(Date.now() - startTime), colorette.yellowBright("ms"));
    }
};

// Execution
copyStaticFiles();
compileResources();