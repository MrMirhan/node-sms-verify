[![NPM](https://nodei.co/npm/sms-verify.png?downloads=true&downloadRank=true)](https://nodei.co/npm/sms-verify/)
# Install
For install sms-verify package use:

```shell
$ npm i sms-verify
```

Note: add --save if you are using npm < 5.0.0

# Usage
0. Require Module

```javascript
const SmsVerify = require('sms-verify');
const smsVerify = new SmsVerify({
    apiKey: 'APIKEY' // https://sms-activate.ru/ API Key
});
```
1. Error Handling

```javascript
smsVerify.on('error', (errorCode, ext) => {
    let response = 'Error Response Undefined';
    if(errorCode == "BAD_KEY") response = "Wrong API Key!";
    if(errorCode == "ERROR_SQL") response = "SQL ERROR Try Again Later.";
    if(errorCode == "NO_NUMBERS ") response = "All Numbers Unavailible.";
    if(errorCode == "NO_BALANCE ") response = "Balance is not enough.";
    if(errorCode == "BAD_ACTION ") response = "Wrong Action!";
    if(errorCode == "BAD_SERVICE ") response = "Wrong Service!";
    if(errorCode == "WRONG_SERVICE ") response = "Wrong Service!";
    if(errorCode == "BANNED") response = "This Account is Banned Since " + ext + "!";
    if(errorCode == "NOT_AVAILABLE ") response = "This Service is Not Availible for This Country!";
    if(errorCode == "BAD_STATUS") response = "Incorrect Status Given!";
    if(errorCode == "NO_ACTIVATION  ") response = "Given Activation ID Does Not Exist!";
    return console.log('Error:', errorCode, '\nResponse:', response)    
})
```
2. Check Balance
```javascript
smsVerify.on('balance', balance => {
    return console.log('Your Balance:', balance)    
})

smsVerify.myBalance();
```

3. Country List
```javascript
smsVerify.on('countryList', async list => {
    await list.forEach(country => {
        console.log(country.code, country.name);
    })
})

smsVerify.getCountryList();
```

4. Check Availible Services by Country Code

```javascript
smsVerify.on('availibleServices', async serviceList => {
    await serviceList.forEach(service => {
        console.log("Service Code:", service.code, "|", "Availible Number:", service.availible, "|", "Cost", service.cost, 'Rb');
    })
})

smsVerify.getAvailibleServices(54); // 54 is Country Code check from 3th Section
```

5. Ordering Number

```javascript
smsVerify.on('numberOrder', async details => {
    smsVerify.myBalance();
    console.log('Order Activation ID:', details.id, '|', 'Ordered Number:', details.number)
    await smsVerify.getCode(details.id); // Checking status and if API returns verify code this will shows. (Checks every 6 secs.)
})

smsVerify.orderNumber('go', 54); // 54 is Country Code check from 3th Section and "go" is Service Code check from 4th section.
// If code doesnt't comes in 20 mins cancel it and re order it.
```

6. Checking Status by Order Id

```javascript
smsVerify.on('statusResponse', response => {
    if(response.includes("STATUS_OK")){
        let code = response.split(':')[1];
        console.log('Activation Code is:', code)
    } else if (response == "STATUS_CANCEL") {
        console.log('Activation Cancelled')
    } else if (response == "STATUS_CANCEL") {
        console.log('Code Still Waiting.')
    }
})

smsVerify.checkStatus(396767373); // 396767373 is order (activation) id you should change this by yourself.
```

7. Getting Verification Code

```javascript
smsVerify.on('codeResponse', response => {
    if (response == 'STATUS_CANCEL') {
        console.log('Activation Cancelled')
        smsVerify.myBalance();
    } else {
        let code = response.split(':')[1];
        console.log('Activation Code is:', code)
        smsVerify.myBalance();
    }
})

smsVerify.getCode(396767373); // 396767373 is order (activation) id you should change this by yourself.
```

8. Changing Order Status

```javascript
smsVerify.on('statusChange', response => {
    if(response == "ACCESS_READY") response = 'Status Successfully Changed To: Sms Sent';
    if(response == "ACCESS_ACTIVATION") response = 'Status Successfully Changed To: Fully Activated';
    if(response == "ACCESS_CANCEL") response = 'Status Successfully Changed To: Cancelled';
    return console.log(response) 
})

smsVerify.changeStatus(6, 396790656) // 396767373 is order (activation) id you should change this by yourself.
                                     // 1: When you sent the SMS / 6: When verification code is correct and finishs order / 8: Canceling order.
```
