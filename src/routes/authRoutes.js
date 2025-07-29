const { readData, writeData } = require('../../database');

const express = require('express');
const { requireLogin } = require('../middleware');
const router = express.Router();

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        const users = await readData('users.json');

        const user = users.find(u =>
            u.username === username &&
            u.password === password
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        const UID = user.id;
        req.session.UID = UID;
        res.json({
            success: true,
            message: 'Login successful',
            redirect: "/"
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

router.get('/user', requireLogin, async (req, res) => {
    try {
        if (!req.session.UID) {
            return res.status(401).json({
                success: false,
                message: 'User is not logged in'
            });
        }
        const users = await readData('users.json');
        const user = users.find(u => u.id === req.session.UID);
        const { password, ...userData } = user;
        res.status(200).json({
            success: true,
            message: 'User is logged in',
            user: userData

        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

router.get('/check', (req, res) => {
    if (req.session.UID) {
        return res.json({
            success: true,
            message: 'User is logged in',
            UID: req.session.UID
        });
    } else {
        return res.status(401).json({
            success: false,
            message: 'User is not logged in'
        });
    }
});

router.post('/logout', (req, res) => {
    try {
        req.session.destroy(err => {
            if (err) {
                console.error('Logout error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Internal server error'
                });
            }
            res.json({
                success: true,
                message: 'Logged out successfully',
                redirect: '/login'
            });
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
})

router.post('/register', async (req, res) => {
    try {
        const { username, password, walletAddress } = req.body;

        // Validate required fields
        if (!username || !password || !walletAddress) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required: username, password and wallet address'
            });
        }

        const users = await readData('users.json');

        // Check if username already exists
        if (users.some(user => user.username === username)) {
            return res.status(409).json({
                success: false,
                message: 'Username already exists'
            });
        }

        // Create new user object
        const newUser = {
            id: Math.random().toString(36).substring(2, 15),
            username,
            password,
            email: username + "@gmail.com",
            walletAddress,
            balance: 0,
        };

        // Add new user to users array
        users.push(newUser);

        // Save updated users array
        await writeData('users.json', users);
        req.session.UID = newUser.id;
        res.status(201).json({
            success: true,
            message: 'Registration successful',
            redirect: '/'
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;