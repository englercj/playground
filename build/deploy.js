const fs = require('fs');
const os = require('os');
const path = require('path');
const ssh = require('ssh2');
const waterfall = require('async/waterfall');
const parallel = require('async/parallel');

const server = '138.68.26.148';
const privateKeyPath = path.join(os.homedir(), '.ssh/pixi_playground_deploy_rsa');
const sshConnectConfig = {
    host: server,
    port: 22,
    username: 'deploy',
    privateKey: fs.readFileSync(privateKeyPath),
};

const remoteAppPath = '/home/deploy';
const remoteAppName = 'playground';
const remoteHtmlPath = '/var/www/pixiplayground.com';
const remoteHtmlName = 'html';

const buildDir = __dirname;
const clientDir = path.join(__dirname, '..', 'client');
const serverDir = path.join(__dirname, '..', 'server');

const archiveFormat = 'zip';
const clientFile = path.join(buildDir, 'client.zip');
const serverFile = path.join(buildDir, 'server.zip');
const serverEnvFile = path.join(buildDir, 'server.env');

if (process.argv.length !== 3)
    exitAndShowHelp();

const app = process.argv[2];

if (app === 'client')
    deployClient();
else if (app === 'server')
    deployServer();
else
    exitAndShowHelp();

function exitAndShowHelp()
{
    console.error('Usage: node deploy.js <client|server>');
    process.exit(1);
}

function deployClient()
{
    if (!fs.existsSync(clientFile))
        throw new Error(`No client package exists at: ${clientFile}`);''

    const clientFileName = path.basename(clientFile);
    const conn = new ssh.Client();

    conn.on('ready', () =>
    {
        waterfall([
            // (next) =>
            // {
            //     conn.exec(`rm ${remoteHtmlPath}/${clientFileName}`, (err, stream) =>
            //     {
            //         next(err);
            //     });
            // },
            function (next)
            {
                conn.sftp(next);
            },
            function (sftp, next)
            {
                sftp.fastPut(clientFile, `${remoteHtmlPath}/${clientFileName}`, next);
            },
            function (next)
            {
                conn.exec(`
                    cd ${remoteHtmlPath} &&
                    unzip ${clientFileName} -d _new_${remoteHtmlName} &&
                    mv -v ${remoteHtmlName} _old_${remoteHtmlName} &&
                    mv -v _new_${remoteHtmlName} ${remoteHtmlName} &&
                    rm -rv _old_${remoteHtmlName} &&
                    rm -v ${clientFileName}
                `, function (err, stream)
                {
                    if (err)
                        return next(err);

                    stream.on('close', function (code, signal)
                    {
                        next();
                    })
                    .on('data', function (data)
                    {
                        process.stdout.write(data.toString('utf8'));
                    })
                    .stderr.on('data', function (data)
                    {
                        process.stderr.write(data.toString('utf8'));
                    });
                });
            },
        ], function (err)
        {
            conn.end();

            if (err)
                console.error(err);
        });
    })
    .on('error', function (err)
    {
        console.error(err);
    })
    .connect(sshConnectConfig);
}

function deployServer()
{
    if (!fs.existsSync(serverFile) || !fs.existsSync(serverEnvFile))
        throw new Error(`No server package exists at: ${serverFile}`);''

    const serverFileName = path.basename(serverFile);
    const conn = new ssh.Client();

    conn.on('ready', () =>
    {
        waterfall([
            // (next) =>
            // {
            //     conn.exec(`rm ${remoteAppPath}/${serverFileName}`, (err, stream) =>
            //     {
            //         next(err);
            //     });
            // },
            function (next)
            {
                conn.sftp(next);
            },
            function (sftp, next)
            {
                parallel([
                    function (next)
                    {
                        sftp.fastPut(serverFile, `${remoteAppPath}/${serverFileName}`, next);
                    },
                    function (next)
                    {
                        sftp.fastPut(serverEnvFile, `${remoteAppPath}/.env`, next);
                    },
                ], (err) =>
                {
                    next(err);
                });
            },
            function (next)
            {
                conn.exec(`
                    cd ${remoteAppPath} &&
                    unzip ${serverFileName} -d _new_${remoteAppName} &&
                    mv -v ${remoteAppName} _old_${remoteAppName} &&
                    mv -v _new_${remoteAppName} ${remoteAppName} &&
                    mv -v .env ${remoteAppName}/.env &&
                    cd ${remoteAppName} &&
                    echo "Running npm install..." &&
                    npm install --production &&
                    echo "Stopping service..." &&
                    pm2 stop ecosystem.config.js --env production &&
                    echo "Running DB migration..." &&
                    NODE_ENV=production node migrate.js | ./node_modules/.bin/bunyan &&
                    echo "Starting service..." &&
                    pm2 start ecosystem.config.js --env production &&
                    echo "Performing cleanup..." &&
                    cd .. &&
                    rm -r _old_${remoteAppName} &&
                    echo "removed directory _old_${remoteAppName}" &&
                    rm -v ${serverFileName}
                `, function (err, stream)
                {
                    if (err)
                        return next(err);

                    stream.on('close', function (code, signal)
                    {
                        next();
                    })
                    .on('data', function (data)
                    {
                        process.stdout.write(data.toString('utf8'));
                    })
                    .stderr.on('data', function (data)
                    {
                        process.stderr.write(data.toString('utf8'));
                    });
                });
            },
        ], function (err)
        {
            conn.end();
        });
    })
    .connect(sshConnectConfig);
}
