const client = require('twilio')('AC8c6d4b9c6f9fa08663aa19a9cea0ed25', '0501777ac3239162aefc4a30b0b99889');


module.exports.sendTextMessages=function(msg,reciever){
    console.log("message",msg);
    client.messages.create({
        body: msg,
        to: reciever,
        from: '+19803407111'
    }).then(message =>console.log(message))

    .catch(error => console.log(error))

}