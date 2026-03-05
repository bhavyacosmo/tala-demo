require('dotenv').config();
const express = require('express');
const cors = require('cors');
const https = require('https');
const PaytmChecksum = require('paytmchecksum');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the current directory
app.use(express.static(__dirname));

const PORT = process.env.PORT || 3000;

// Paytm Configuration
const PAYTM_MID = process.env.PAYTM_MID || "NvwNCG76079722724032";
const PAYTM_MERCHANT_KEY = process.env.PAYTM_MERCHANT_KEY || "x#Fi@Q7FecmG%3eP";
const PAYTM_WEBSITE = process.env.PAYTM_WEBSITE || "WEBSTAGING";

console.log("MID length:", PAYTM_MID.length);
console.log("KEY length:", PAYTM_MERCHANT_KEY.length);


// For Staging
const PAYTM_ENV = 'securegw-stage.paytm.in';
// For Production
// const PAYTM_ENV = 'securegw.paytm.in';

app.post('/paytm/initiate', async (req, res) => {
    try {
        const { amount, customerId, customerEmail, customerPhone } = req.body;

        if (!amount || !customerId) {
            return res.status(400).json({ error: "Missing required fields (amount, customerId)" });
        }

        const orderId = 'ORDER_' + new Date().getTime();

        const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

        paytmParams.body = {
            "requestType": "Payment",
            "mid": PAYTM_MID,
            "websiteName": PAYTM_WEBSITE,
            "orderId": orderId,
            "callbackUrl": `${BASE_URL}/paytm/callback`,

            "txnAmount": {
                "value": parseFloat(amount).toFixed(2),
                "currency": "INR",
            },
            "userInfo": {
                "custId": customerId.toString().substring(0, 50),
            },
        };


        const checksum = await PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), PAYTM_MERCHANT_KEY);
        paytmParams.head = {
            "signature": checksum
        };

        const post_data = JSON.stringify(paytmParams);
        console.log("Paytm Request Body:", post_data);


        const options = {
            hostname: PAYTM_ENV,
            port: 443,
            path: `/theia/api/v1/initiateTransaction?mid=${PAYTM_MID}&orderId=${orderId}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': post_data.length
            }
        };

        let response = "";
        const post_req = https.request(options, function (post_res) {
            post_res.on('data', function (chunk) {
                response += chunk;
            });

            post_res.on('end', function () {
                console.log('Response: ', response);
                const result = JSON.parse(response);
                if (result.body && result.body.txnToken) {
                    res.json({
                        success: true,
                        txnToken: result.body.txnToken,
                        orderId: orderId,
                        amount: amount,
                        mid: PAYTM_MID,
                        environment: PAYTM_ENV
                    });
                } else {
                    res.status(500).json({ error: "Failed to generate txnToken", details: result });
                }
            });
        });

        post_req.on('error', (error) => {
            console.error("HTTPS request error:", error);
            res.status(500).json({ error: "HTTPS request failed", details: error.message });
        });

        post_req.write(post_data);
        post_req.end();

    } catch (error) {
        console.error("Error initiating payment:", error);
        res.status(500).json({ error: "Server error", message: error.message });
    }
});

// Callback URL Handler (simplified)
app.post('/paytm/callback', (req, res) => {
    console.log("Paytm Callback Payload:", req.body);
    // Here you would normally verify the checksum of the response
    // and update your database with the transaction status.

    // For now, just redirect back to the home page with the status
    if (req.body.STATUS === 'TXN_SUCCESS') {
        res.redirect('/?status=success&orderId=' + req.body.ORDERID);
    } else {
        res.redirect('/?status=failed&orderId=' + req.body.ORDERID);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
