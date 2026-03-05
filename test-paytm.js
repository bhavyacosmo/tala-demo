const https = require('https');
const PaytmChecksum = require('paytmchecksum');
require('dotenv').config();

const PAYTM_MID = process.env.PAYTM_MID || "NvwNCG76079722724032";
const PAYTM_MERCHANT_KEY = process.env.PAYTM_MERCHANT_KEY || "x#Fi@Q7FecmG%3eP";
const PAYTM_WEBSITE = process.env.PAYTM_WEBSITE || "WEBSTAGING";
const PAYTM_ENV = 'securegw-stage.paytm.in';

async function testPaytm() {
    const orderId = 'TESTORDER' + Date.now();

    const paytmParams = {
        body: {
            "requestType": "Payment",
            "mid": PAYTM_MID,
            "websiteName": PAYTM_WEBSITE,
            "orderId": orderId,
            "callbackUrl": "https://merchant.com/callback",
            "txnAmount": {
                "value": "1.00",
                "currency": "INR",
            },
            "userInfo": {
                "custId": "CUST_001",
            },
            "channelId": "WEB"
        }
    };


    const checksum = await PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), PAYTM_MERCHANT_KEY);
    paytmParams.head = { "signature": checksum };

    const post_data = JSON.stringify(paytmParams);

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

    console.log("Sending request to Paytm...");
    const req = https.request(options, (res) => {
        let response = '';
        res.on('data', (d) => response += d);
        res.on('end', () => {
            console.log("Response from Paytm:", response);
        });
    });

    req.on('error', (e) => console.error(e));
    req.write(post_data);
    req.end();
}

testPaytm();
