// Generate custom data about web components in this project for the VS Code
// HTML Language Service.
// https://github.com/Microsoft/vscode-html-languageservice/blob/master/docs/customData.md

'use strict';

const babelParser = require('@babel/parser');
const fs = require('fs');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const stat = promisify(fs.stat);
const writeFile = promisify(fs.writeFile);

function camelToKebabCase(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

async function readdirRecursive(dir) {
    const files = (await readdir(dir)).map((file) => dir + '/' + file);
    const recursiveFiles = [];
    for (const file of files) {
        if ((await stat(file)).isDirectory()) {
            recursiveFiles.push(...(await readdirRecursive(file)));
        } else {
            recursiveFiles.push(file);
        }
    }

    return recursiveFiles;
}

function isPolymerElement(superClass) {
    return (
        (superClass.type === 'Identifier' &&
            superClass.name === 'PolymerElement') ||
        (superClass.type === 'CallExpression' &&
            superClass.callee.name.toLowerCase().includes('mixin') &&
            superClass.arguments.length === 1 &&
            isPolymerElement(superClass.arguments[0]))
    );
}

function isStaticGetter(statement, name) {
    return (
        statement.type === 'ClassMethod' &&
        statement.kind === 'get' &&
        statement.key.name === name
    );
}

async function getWebComponentsInFile(file) {
    const code = await readFile(file, 'utf8');
    const ast = babelParser.parse(code, {
        sourceType: 'module',
        sourceFilename: file,
    });
    const body = ast.program.body;

    const classes = body.filter(
        (statement) =>
            statement.type === 'ClassDeclaration' &&
            statement.superClass &&
            isPolymerElement(statement.superClass),
    );
    const webComponents = classes.map((statement) => {
        const body = statement.body.body;
        const is = body.find((statement) => isStaticGetter(statement, 'is'));
        const name = is.body.body.find(
            (statement) => statement.type === 'ReturnStatement',
        ).argument.value;
        const properties = body.find((statement) =>
            isStaticGetter(statement, 'properties'),
        );
        const attributes = properties
            ? properties.body.body
                  .find((statement) => statement.type === 'ReturnStatement')
                  .argument.properties.map((property) => {
                      const name = camelToKebabCase(property.key.name);
                      return {
                          name,
                          description: '',
                      };
                  })
            : [];

        return {
            name,
            description: '',
            attributes,
        };
    });

    return webComponents;
}

async function main() {
    const files = await readdirRecursive('src/site');
    const jsFiles = files.filter((file) => file.endsWith('.js'));
    const webComponents = {
        version: 1,
        tags: [],
    };
    for (const file of jsFiles) {
        console.log('Reading Web Components in file', file);
        webComponents.tags.push(...(await getWebComponentsInFile(file)));
    }

    await writeFile(
        '.vscode/web-components.json',
        JSON.stringify(webComponents, null, 4),
        'utf8',
    );
}

main().catch(console.error);
