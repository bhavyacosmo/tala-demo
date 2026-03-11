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
const PAYTM_ENV = 'securestage.paytmpayments.com';
// For Production
// const PAYTM_ENV = 'secure.paytmpayments.com';

/**
 * Helper to send data to Google Sheet Webhook
 */
async function sendToGoogleSheet(payload) {
    const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
    if (!webhookUrl) {
        console.log("⚠️ Google Sheet Webhook URL not set. Skipping log.");
        return;
    }

    try {
        const url = new URL(webhookUrl);
        const options = {
            hostname: url.hostname,
            path: url.pathname + url.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const post_req = https.request(options, (res) => {
            res.on('data', () => { }); // Consume data
        });

        post_req.on('error', (e) => console.error("Google Sheet error:", e));
        post_req.write(JSON.stringify(payload));
        post_req.end();
        console.log("➡️ Data signaled to Google Sheet:", payload.action);
    } catch (err) {
        console.error("Failed to signal Google Sheet:", err.message);
    }
}

app.post('/paytm/initiate', async (req, res) => {
    try {
        const { amount, customerId, customerEmail, customerPhone } = req.body;
        console.log("--- INITIATING PAYMENT ---");
        console.log("Amount:", amount);
        console.log("Customer:", { customerId, customerEmail, customerPhone });

        if (!amount || isNaN(amount) || amount <= 0) {
            console.error("Invalid amount received:", amount);
            return res.status(400).json({ error: "Invalid amount" });
        }

        const orderId = 'ORD' + new Date().getTime();

        // Use BASE_URL from .env if available, otherwise detect dynamically
        let callbackUrl;
        if (process.env.BASE_URL) {
            // Trim trailing slash if present and add the route
            const base = process.env.BASE_URL.replace(/\/$/, '');
            callbackUrl = `${base}/paytm/callback`;
        } else {
            const protocol = req.get('x-forwarded-proto') || req.protocol;
            const host = req.get('host');
            callbackUrl = `${protocol}://${host}/paytm/callback`;
        }

        console.log("Calculated Callback URL:", callbackUrl);

        const paytmParams = {};
        paytmParams.body = {
            "requestType": "Payment",
            "mid": PAYTM_MID,
            "websiteName": PAYTM_WEBSITE,
            "orderId": orderId,
            "callbackUrl": callbackUrl,
            "txnAmount": {
                "value": amount.toString() + ".00",
                "currency": "INR",
            },
            "userInfo": {
                "custId": customerId.toString().replace(/[^a-zA-Z0-9]/g, '').substring(0, 50),
                "mobile": customerPhone ? customerPhone.replace(/[^0-9]/g, '').slice(-10) : undefined,
                "email": customerEmail || undefined
            },
            "channelId": "WEB"
        };


        const checksum = await PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), PAYTM_MERCHANT_KEY);
        paytmParams.head = {
            "signature": checksum
        };

        const post_data = JSON.stringify(paytmParams);
        console.log("Request to Paytm:", post_data);


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
                console.log('PAYTM RAW RESPONSE: ', response);
                try {
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

                        // --- LOG TO GOOGLE SHEET (NEW LEAD) ---
                        sendToGoogleSheet({
                            action: "APPEND",
                            orderId: orderId,
                            name: req.body.customerName || "Unknown",
                            phone: customerPhone,
                            email: customerEmail,
                            officialEmail: req.body.officialEmail || "",
                            school: req.body.school || "",
                            city: req.body.city || "",
                            subjects: req.body.subjects || "",
                            amount: amount
                        });
                    } else {
                        console.error("Paytm Initiation Failed:", result);
                        res.status(500).json({ error: "Failed to generate txnToken", details: result });
                    }
                } catch (parseErr) {
                    console.error("Failed to parse Paytm response:", response);
                    res.status(500).json({ error: "Invalid response from Paytm" });
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
        console.error("Internal Server Error:", error);
        res.status(500).json({ error: "Server error", message: error.message });
    }
});

// Callback URL Handler - Handles both POST (from Paytm) and GET (manual navigations)
app.all('/paytm/callback', (req, res) => {
    console.log("--- PAYTM CALLBACK RECEIVED ---");
    console.log("Method:", req.method);
    console.log("Body:", req.body);
    console.log("Query:", req.query);

    // Determine the redirect base (the homepage of the redesign app)
    const redirectBase = process.env.BASE_URL || '../';
    console.log("Redirecting to base:", redirectBase);

    // If it's a GET request or missing status, it's likely a cancellation or manual back
    if (req.method === 'GET' || !req.body || Object.keys(req.body).length === 0) {
        console.log("Manual navigation or cancellation detected via GET");
        return res.redirect(`${redirectBase}?status=cancelled`);
    }

    const { STATUS, ORDERID, RESPMSG, TXNID } = req.body;

    if (STATUS === 'TXN_SUCCESS') {
        const finalUrl = `${redirectBase}?status=success&orderId=${ORDERID}`;
        console.log("Redirecting to:", finalUrl);

        // --- UPDATE GOOGLE SHEET (SUCCESS) ---
        sendToGoogleSheet({
            action: "UPDATE",
            orderId: ORDERID,
            status: "SUCCESS",
            txnId: TXNID
        });

        res.redirect(finalUrl);
    } else {
        console.log("Transaction Failed/Cancelled:", RESPMSG);
        const finalUrl = `${redirectBase}?status=failed&orderId=${ORDERID || 'unknown'}&msg=${encodeURIComponent(RESPMSG || '')}`;
        console.log("Redirecting to:", finalUrl);

        // --- UPDATE GOOGLE SHEET (FAILED/CANCEL) ---
        if (ORDERID) {
            sendToGoogleSheet({
                action: "UPDATE",
                orderId: ORDERID,
                status: STATUS === 'TXN_FAILURE' ? "FAILED" : "CANCELLED",
                txnId: TXNID || ""
            });
        }

        res.redirect(finalUrl);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
