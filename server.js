const http = require('http');
const fs = require('fs');

// Create a simple server
const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
        // Serve the HTML form
        fs.readFile('./register.html', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    } else if (req.method === 'POST' && req.url === '/register') {
        // Handle the form data
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const userData = JSON.parse(body);
            const { name, email, password } = userData;

            // Validate that all fields are provided
            if (!name || !email || !password) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ msg: 'All fields are required!' }));
            }

            // Read existing users from users.txt
            fs.readFile('./users.txt', 'utf-8', (err, data) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ msg: 'Failed to read user data' }));
                }

                // Check if the user already exists
                const users = data.split('\n').filter(line => line); // Split lines and filter out empty lines
                const userExists = users.some(line => line.includes(`Email: ${email}`));

                if (userExists) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ msg: 'User already exists' }));
                }

                // Save the user data to a text file (users.txt)
                const userEntry = `Name: ${name}, Email: ${email}, Password: ${password}\n`;
                fs.appendFile('./users.txt', userEntry, (err) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        return res.end(JSON.stringify({ msg: 'Failed to register user' }));
                    }

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ msg: 'User registered successfully' }));
                });
            });
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

// Start the server
server.listen(5678, () => {
    console.log('Server is running on http://localhost:5678');
});
