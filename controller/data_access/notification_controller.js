const path = require("path");
const pool = require("../../config/database");
const { signAccessToken } = require("../../config/jwthelper");
const jwt_decode = require("jwt-decode");

const Procedure = require("../../config/procedures");

const commentsMailer = require("../../services/email_Services");

const notification = require("../../services/pushNotification_Service");


const message = require("../../services/SMS_service");

//database connection created
const dbConn = pool.dbConn;
dbConn.connect();

module.exports.sendNotification = async (req, res) => {
  try {
    //jwt token sent on header
    let headers = String(req.headers.authorization);
    let decoded = jwt_decode(headers);
    let currentTime = new Date();
    let expiryTime = new Date(decoded.exp * 1000);
    let _clientId = decoded.aud;
    let diff = expiryTime - currentTime;
    let _token = headers;
    //function to fetch token status
    let _status = 2;
    console.log('header',headers);
    dbConn.query(
      Procedure.ProcedureTable.getTokenStatus,
      [_token],
      await function (error, results, fields) {
        console.log(results);
        if (error) {
          throw error;
        }

        _status = results[0][0].is_Active;
        console.log("status", _status);
        console.log("diff", diff);
        console.log("status=", _status);

        //check if jwt token is active or not
        if (diff > 0 && _status === 1) {
          console.log("approved");
          let user = req.body;
      
          console.log(user);
          let info = user.info;
          let type = user.type;
          let _body = user.body;
          let _phoneNumber = 0;
          let _entityId = "";
          let _email = "";
          const regexExp =
            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/gi;

            const pattern = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;

          for (let i=0;i<info.length;i++) {
            console.log(typeof info[i]);
          
            let email_test=regexExp.test(info[i]);
            let uuidTest=pattern.test(info[i]);
            console.log('uuidtest',uuidTest);
            console.log('emailTest',email_test);
          
           if(uuidTest){

            _entityId=info[i];
            email_test=false;
            uuidTest=false;

           }else if(email_test){
             console.log('inside phone',email_test);
             _email=info[i];
             email_test=false;
             uuidTest=false;

           }
           else {

            _phoneNumber=info[i];
            email_test=false;
            uuidTest=false;

           }
            
          }
          console.log('Id no',_entityId);
          console.log('_email no',_email);
  console.log('phone no',_phoneNumber);
          dbConn.query(
            Procedure.ProcedureTable.sendNotificationDetails,
            [_entityId,_email,_phoneNumber],
            async function (error, results, fields) {
              console.log(results);
              if (error) {
                throw error;
              }
    console.log('checking type');
              for (let i = 0; i < type.length; i++) {
                console.log(type[i]);
                if (type[i] === "email") {
                  if (results[0][0].email != "") {
                    var receiver={
                     name:results[0][0].entity_Name,
                     user:results[0][0].email, 
                     body:_body
                    }
                  await commentsMailer.newComment(receiver);
                  let _type=type[i];
                  dbConn.query(
                    Procedure.ProcedureTable.saveNotification,
                    [_entityId,_body,_type],
                    function (error, results, fields) {
                      if (error) throw error;
                      return res.send({
                        NotificationId:results[0][0],
                      });
                    }
                  );
                  } else{
                    return res.send({
                      error: true,
                      data: results[0][0],
                      message: "Entity EmailId required",
                    });

                  }
                }
                 else if (type[i] === "sms") {
                  if (results[0][0].phoneNumber != "") {
                  //  await message.sendTextMessages(_body,results[0][0].phoneNumber);
                  let _type=type[i];
                  dbConn.query(
                    Procedure.ProcedureTable.saveNotification,
                    [_entityId,_body,_type],
                    function (error, results, fields) {
                      if (error) throw error;
                      return res.send({
                        NotificationId:results[0][0],
                      });
                    }
                  );
                 
                  } else {
                    return res.send({
                      error: true,
                      data: results[0][0],
                      message: "Entity Phone Number required",
                    });
                  }

                  } 
                  else if (type[i] === "push") {
                  if (results[0][0].deviceId != "") {
                    console.log('push notification send');
                    await notification.pushNotification();
                    let _type=type[i];
                    dbConn.query(
                      Procedure.ProcedureTable.saveNotification,
                      [_entityId,_body,_type],
                      function (error, results, fields) {
                        if (error) throw error;
                        return res.send({
                          NotificationId:results[0][0],
                        });
                      }
                    );
               
                    
                  }
                    return res.send({
                      error: true,
                      data:results[0][0],
                      message: "Entity DeviceId required",
                    });
                  }
                 else if (type[i] === "all") {
                  console.log('in all',results[0].length)
                  if (results[0].length>0) {
                   
                    if(results[0][0].email != ""){
                      var receiver={
                        name:results[0][0].entity_Name,
                        user:results[0][0].email,
                        body:_body
                       }
                     await commentsMailer.newComment(receiver);
                        let _type = type[i];
                        dbConn.query(
                          Procedure.ProcedureTable.saveNotification,
                          [_entityId,_body,_type],
                          function (error, results, fields) {
                            if (error) throw error;
                            return res.send({
                              NotificationId:results[0][0],
                            });
                          }
                        );
                    }else{
                      return res.send({
                        error: true,
                        data: results[0][0],
                        message: "Entity EmailId required",
                      });

                    }

                    if(results[0][0].phoneNumber != ""){
                  //  await message.sendTextMessages(_body,results[0][0].phoneNumber);
                   
                    }else{
                      return res.send({
                        error: true,
                        data: results[0][0],
                        message: "Entity Phone Number required",
                      });

                    }

                    if(results[0][0].deviceId != ""){
                      console.log('push notification send');
                     await notification.pushNotification(_body);
                   
                    }else{
                      return res.send({
                        error: true,
                        data:results[0][0],
                        message: "Entity DeviceId required",
                      });
                    }


                  } else {
                    return res.send({
                      error: true,
                      message: "Entity information required",
                    });
                  }
                }else{
                  return res.send({
                    error: true,
                    message: "Wrong notification type",
                  });

                }
              } 
            }
          );
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};
