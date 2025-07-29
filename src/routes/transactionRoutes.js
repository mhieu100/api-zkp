const { readData, writeData } = require('../../database');
const express = require('express');
const { requireLogin } = require('../middleware');
const router = express.Router();

router.get('/my', requireLogin, async (req, res) => {
    try {
        const userId = req.session.UID;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const transactions = await readData('transactions.json');
        const userTransactions = transactions.filter(transaction =>
            transaction.fromUserId === userId ||
            transaction.toUserId === userId
        );

        // Sort transactions by date (newest first)
        userTransactions.sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        );

        return res.status(200).json({
            success: true,
            message: 'Transactions fetched successfully',
            data: userTransactions
        });

    } catch (error) {
        console.error('Error fetching transactions:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;