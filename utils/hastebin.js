const https = require('https');

module.exports.save = (text) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'hasteb.in',
            port: 443,
            path: '/documents',
            method: 'post',
            headers: {
                'Content-Length': text.length
            }
        };
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (d) => {
                data += d;
            });
            res.on('end', (d) => {
                try {
                    resolve(JSON.parse(data).key);
                }
                catch (e) {
                    resolve(null);
                }
            });
        });
        req.on('error', (e) => {
            resolve(null);
        });
        req.write(text);
        req.end();
    });
}