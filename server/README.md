# Usage

## Running a development server:

To run the dev server you just run:

```
$> npm run dev
```

This will launch `nodemon`, which will monitor the ts source files and execute `ts-node`
to run the server. Any changes to the typescript source will relaunch the server.

Overhead from `nodemon` and `ts-node` will cause longer startup times and reduced performance.

## Building the server

Building the source typescript is done with the following command:

```
$> npm run build
```

This outputs the server code to `dist/`.
