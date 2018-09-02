const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const buildDir = __dirname;
const clientDir = path.join(__dirname, '..', 'client');
const serverDir = path.join(__dirname, '..', 'server');

const archiveFormat = 'zip';
const clientFile = path.join(buildDir, 'client.zip');
const serverFile = path.join(buildDir, 'server.zip');

if (process.argv.length !== 3)
    exitAndShowHelp();

const app = process.argv[2];

if (app === 'client')
    packageClient();
else if (app === 'server')
    packageServer();
else
    exitAndShowHelp();

function exitAndShowHelp()
{
    console.error('Usage: node package.js <client|server>');
    process.exit(1);
}

function createArchive(file, format)
{
    // Remove old file if it exists
    try { fs.unlinkSync(file); }
    catch (e) {}

    // create a file to stream archive data to.
    const outputFile = fs.createWriteStream(file);
    const archive = archiver(format, { zlib: { level: 9 } });

    // listen for all archive data to be written
    outputFile.on('close', () => console.log(`${archive.pointer()} bytes written to ${file}`));

    // pipe archive data to the file
    archive.pipe(outputFile);

    return archive;
}

function packageClient()
{
    console.log('Creating client archive...');
    const archive = createArchive(clientFile, archiveFormat);

    archive.directory(path.join(clientDir, 'dist'), false);
    archive.finalize();
}

function packageServer()
{
    console.log('Creating server archive...');
    const archive = createArchive(serverFile, archiveFormat);

    archive.directory(path.join(serverDir, 'dist/server/src'), false);
    archive.file(path.join(serverDir, 'ecosystem.config.js'), { name: 'ecosystem.config.js' });
    archive.file(path.join(serverDir, 'package-lock.json'), { name: 'package-lock.json' });
    archive.file(path.join(serverDir, 'package.json'), { name: 'package.json' });
    archive.finalize();
}
