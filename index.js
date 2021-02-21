const EventEmitter = require('events');
const request = require('request');


class SmsVerify extends EventEmitter {
    constructor({apiKey}) {
        super();
        this.apiKey = apiKey;
        this.url = 'https://sms-activate.ru/stubs/handler_api.php?api_key=';
        this.timeout = 300000;
    }
    
    myBalance(){
        return new Promise(async (resolve, reject) => {
            request({
                url: this.url + this.apiKey + '&action=getBalance',
                timeout: this.timeout
            }, (error, response, body) => {
                if(error) return console.error('error:', error);
                if(!body.includes("ACCESS_BALANCE")) return this.emit('error', body);
                const balance = body.replace("ACCESS_BALANCE:", "");
                this.emit('balance', balance);
            });
        });
    }

    getCountryList(){
        return new Promise(async (resolve, reject) => {
            const list = require('./countryList.json');
            this.emit('countryList', list)
        });
    }

    getAvailiblePhones(countryCode){
        return new Promise(async (resolve, reject) => {
            request({
                url: this.url + this.apiKey + '&action=getNumbersStatus&country=' + countryCode,
                timeout: this.timeout
            }, (error, response, body) => {
                if(error) return console.error('error:', error);
                body = JSON.parse(body)
                let serviceList = [];
                for(var Key in body) {
                    serviceList.push({code: Key.split('_')[0], availible: body[`${Key}`]})
                }
                this.emit('availiblePhones', serviceList);
            });
        });
    }

    getAvailibleServices(countryCode){
        return new Promise(async (resolve, reject) => {
            request({
                url: this.url + this.apiKey + '&action=getPrices&country=' + countryCode,
                timeout: this.timeout
            }, (error, response, body) => {
                if(error) return console.error('error:', error);
                body = JSON.parse(body)
                body = body['54'];
                let serviceList = [];
                for(var Key in body) {
                    serviceList.push({code: Key.split('_')[0], availible: body[`${Key}`].count, cost: body[`${Key}`].cost})
                }
                this.emit('availibleServices', serviceList);
            });
        });
    }

    checkStatus(id, req){
        request({
            url: this.url + this.apiKey + '&action=getStatus&id=' + id,
            timeout: this.timeout
        }, (error, response, body) => {
            if(error) return console.error('error:', error);

            if(body == "STATUS_WAIT_CODE" || body == "STATUS_WAIT_RETRY" || body == "STATUS_WAIT_RESEND" || body.includes("STATUS_OK") || body == "STATUS_CANCEL"){
                if(req == 1){
                    return this.emit('inSystemResponse', body)
                } else {
                    return this.emit('statusResponse', body)
                }
            } else {
                return this.emit('error', body);
            }
        });
    }

    getCode(id) {
        let interval_ = setInterval(() => {
            this.on('inSystemResponse', response => {
                
                if (response === "STATUS_CANCEL") {
                    clearInterval(interval_);
                    return this.emit('codeResponse', response)
                }

                else if (response === "STATUS_WAIT_CODE") {
                } else {
                    clearInterval(interval_);
                    return this.emit('codeResponse', response)
                }
            })
            this.checkStatus(id, 1)
        }, 1000 * 6);
    }

    orderNumber(service, country){
        return new Promise(async (resolve, reject) => {
            request({
                url: this.url + this.apiKey + '&action=getNumber&service=' + service + '&country=' + country,
                timeout: this.timeout
            }, (error, response, body) => {
                if(error) return console.error('error:', error);
                if(!body.includes("ACCESS_NUMBER")) return this.emit('error', body);
                body = body.replace("ACCESS_NUMBER:", "").split(':');
                let id = body[0];
                let number = body[1];
                this.emit('numberOrder', {id: id, number: number});
            });
        });
    }

    changeStatus(status, id){
        request({
            url: this.url + this.apiKey + '&action=setStatus&status=' + status + '&id=' + id,
            timeout: this.timeout
        }, (error, response, body) => {
            if(error) return console.error('error:', error);
            if(body == "ACCESS_CANCEL" || body == "ACCESS_ACTIVATION" || body == "ACCESS_READY"){
                this.emit('statusChange', body);
            } else {
                return this.emit('error', body);
            }
        });
    }
}

module.exports = SmsVerify;