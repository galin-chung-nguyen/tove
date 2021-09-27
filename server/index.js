const express = require('express');
const cookieParser = require('cookie-parser')
const path = require('path');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

const isDev = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || 5000;

// Multi-process to utilize all CPU cores.
if (!isDev && cluster.isMaster) {
    console.error(`Node cluster master ${process.pid} is running`);

    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.error(`Node cluster worker ${worker.process.pid} exited: code ${code}, signal ${signal}`);
    });

} else {
    const mongooseDb = require('./database/dbConnection');
    const blockchainAPI = require('./database/blockchainApi');

    //mongooseDb.connect((db) => {
    //console.log(db)
    blockchainAPI.init().then((contract) => {
        const router = require('./routes/api')(contract);

        const app = express();

        app.use(express.urlencoded({ extended: true }));
        app.use(express.json());
        app.use(cookieParser(process.env.COOKIE_PARSER_SECRET));

        // Priority serve any static files.
        app.use(express.static(path.resolve(__dirname, '../react-ui/build')));

        app.use('/api/v1', router);

        app.get("*", (req, res) => {
            res.sendFile(
                path.join(__dirname, "../react-ui/build/index.html")
            );
        });

        app.listen(PORT, function () {
            console.error(`Node ${isDev ? 'dev server' : 'cluster worker ' + process.pid}: listening on port ${PORT}`);
        });
    });
}
