const https = require('https');
const PaytmChecksum = require('paytmchecksum');

const PAYTM_MID = "NvwNCG76079722724032";
const PAYTM_MERCHANT_KEY = "x#Fi@Q7FecmG%3eP";
const PAYTM_WEBSITE = "WEBSTAGING";
const PAYTM_ENV = 'securestage.paytmpayments.com';

async function debug() {
    const orderId = 'ORD' + Date.now();
    const amount = 999;
    const customerId = "CUST1234567890";
    const email = "test@example.com";
    const phone = "+91 9876543210";
    const processedPhone = phone.replace(/[^0-9]/g, '').substring(0, 10);
    console.log("PROCESSED PHONE:", processedPhone);

    const paytmParams = {
        body: {
            "requestType": "Payment",
            "mid": PAYTM_MID,
            "websiteName": PAYTM_WEBSITE,
            "orderId": orderId,
            "callbackUrl": "https://talaeducation.com/paytm-callback",
            "txnAmount": {
                "value": amount.toString() + ".00",
                "currency": "INR",
            },
            "userInfo": {
                "custId": customerId,
                "mobile": processedPhone,
                "email": email
            },
            "channelId": "WEB"
        }
    };

    try {
        const checksum = await PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), PAYTM_MERCHANT_KEY);
        paytmParams.head = { "signature": checksum };
        const post_data = JSON.stringify(paytmParams);

        console.log("Requesting with body:", post_data);

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

        const req = https.request(options, (res) => {
            let response = '';
            res.on('data', (d) => response += d);
            res.on('end', () => {
                console.log("PAYTM RESPONSE:", response);
            });
        });
        req.on('error', (e) => console.error("REQUEST ERROR:", e));
        req.write(post_data);
        req.end();
    } catch (err) {
        console.error("CHECKSUM ERROR:", err);
    }
}
debug();
