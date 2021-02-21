const SmsVerify = require('./index');
const smsVerify = new SmsVerify({
    apiKey: 'APIKEY'
});

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

smsVerify.on('balance', balance => {
    return console.log('Your Balance:', balance)    
})

smsVerify.on('countryList', async list => {
    await list.forEach(country => {
        console.log(country.code, country.name);
    })
})

smsVerify.on('availibleServices', async serviceList => {
    await serviceList.forEach(service => {
        console.log("Service Code:", service.code, "|", "Availible Number:", service.availible, "|", "Cost", service.cost, 'Rb');
    })
})

smsVerify.on('numberOrder', async details => {
    smsVerify.myBalance();
    console.log('Order Activation ID:', details.id, '|', 'Ordered Number:', details.number)
    await smsVerify.getCode(details.id);
})

smsVerify.on('statusChange', response => {
    if(response == "ACCESS_READY") response = 'Status Successfully Changed To: Sms Sent';
    if(response == "ACCESS_ACTIVATION") response = 'Status Successfully Changed To: Fully Activated';
    if(response == "ACCESS_CANCEL") response = 'Status Successfully Changed To: Cancelled';
    return console.log(response) 
})

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

//smsVerify.getCountryList();

//smsVerify.myBalance();

//smsVerify.getAvailibleServices(54);

//smsVerify.orderNumber('go', 54);

//smsVerify.checkStatus(396767373);

//smsVerify.getCode(396767373);

//smsVerify.changeStatus(6, 396790656) //1: Sms Sent 6: Fully Activated 8: Cancel