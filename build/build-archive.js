// require modules
var fs = require('fs');
var archiver = require('archiver');

// make the output directory
try
{
    fs.mkdirSync('dist');
}
catch (e)
{
    if (e.code !== 'EEXIST')
        throw e;
}

// create a file to stream archive data to.
var output = fs.createWriteStream('dist/app.zip');
var archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
});

// listen for all archive data to be written
output.on('close', () =>
{
    console.log(`${archive.pointer()} bytes written to app.zip`);
});

// pipe archive data to the file
archive.pipe(output);

// append files
archive.directory('.ebextensions');
archive.directory('client/public', 'public');
archive.directory('server/lib', 'lib');
archive.file('server/package.json', { name: 'package.json' });

// finalize the archive
archive.finalize();
