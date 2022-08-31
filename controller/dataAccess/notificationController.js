const path = require("path");
const pool = require("../../config/database");
const { signAccessToken } = require("../../config/jwtHelper");
const jwt_decode = require("jwt-decode");

const Procedure = require("../../config/procedures");

const commentsMailer = require("../../services/email_Services");

const notification = require("../../services/pushNotification_Service");

const message = require("../../services/SMS_service");

//database connection created
const dbConn = pool.dbConn;
dbConn.connect();

//callback function to set server response
const callbackFunc = (param1, param2, callback) => {
  setTimeout(() => callback("Ok"), param1);
};

//API to send notifications
module.exports.sendNotification = async (req, res) => {
  try {
    //list to store responses from server
    let list = [];
    let user = req.body;
    //jwt token sent on header
    let headers = String(req.headers.authorization);
    let decoded = jwt_decode(headers);
    let currentTime = new Date();
    let expiryTime = new Date(decoded.exp * 1000);
    let _clientId = String(decoded.aud);
    let diff = expiryTime - currentTime;
    let _token = headers;
    //function to fetch token status

    let _status = 2;
    console.log("header", headers);
    dbConn.query(
      Procedure.ProcedureTable.getTokenStatus,
      [_token],
      async function (error, results) {
        if (error) {
          throw error;
        }

        _status = results[0][0].is_Active;
        //check if jwt token is active or not
        if (diff > 0 && _status === 1) {
          console.log("token approved");
          let type = user.type;
          let _body = user.body;
          let _groupId = user.groupid;
          if (_groupId != 0) {
            dbConn.query(
              Procedure.ProcedureTable.getEntityByGroupId,
              [_groupId],
              async function (error, results) {
                if (error) {
                  throw error;
                }
                if (results[0].length > 0) {
                  console.log("got entities", results[0]);
                  for await (let entity of results[0]) {
                    let _entity = entity.entity_id;
                  console.log('entity list',_entity);
                    //check if entity is part of the token client
                    dbConn.query(
                      Procedure.ProcedureTable.checkEntityId,
                      [_entity],
                      async function (error, results) {
                        console.log("check", results[0][0]);
                        if (error) {
                          throw error;
                        }
                        if (results[0].length > 0) {
                          if (String(results[0][0].client_id) === _clientId) {
                            dbConn.query(
                              Procedure.ProcedureTable.sendNotificationDetails,
                              [_entity, null, null],
                              async function (error, results) {
                                if (error) {
                                  throw error;
                                }
                                if (results[0].length > 0) {
                                  console.log("data", results[0][0]);
                                  let name = results[0][0].entity_Name;
                                  let mailId = results[0][0].email;
                                  for (let notification of type) {
                                    if (notification === "email") {
                                      if (results[0][0].email != "") {
                                        var receiver = {
                                          name: name,
                                          user: mailId,
                                          body: _body,
                                        };
                                        //function to send email
                                        console.log("receiver", receiver);
                                        await commentsMailer.newComment(
                                          receiver
                                        );

                                        let _type = notification;

                                        //function to save notification sent details in database and return notification id to user
                                        dbConn.query(
                                          Procedure.ProcedureTable
                                            .saveNotification,
                                          [_entity, _body, _type],
                                          function (error, results) {
                                            if (error) throw error;
                                            let obj = {
                                              info: _entity,
                                              result: results[0][0],
                                            };
                                            list.push(obj);
                                          }
                                        );
                                      } else {
                                        let obj = {
                                          info: _entity,
                                          message:
                                            "Entity Email not found in database",
                                        };
                                        list.push(obj);
                                        return;
                                      }
                                    }
                                    //check if notification type requested is sms
                                    else if (notification === "sms") {
                                      if (results[0][0].phoneNumber != "") {
                                        //function to send sms to phone number
                                        //await message.sendTextMessages(_body,results[0][0].phoneNumber);

                                        let _type = notification;
                                        //function to save notification sent details in database and return notification id to user
                                        dbConn.query(
                                          Procedure.ProcedureTable
                                            .saveNotification,
                                          [_entity, _body, _type],
                                          function (error, results) {
                                            if (error) throw error;
                                            let obj = {
                                              info: _entity,
                                              result: results[0][0],
                                              message: "Notication sent",
                                            };
                                            list.push(obj);
                                          }
                                        );
                                      } else {
                                        let obj = {
                                          info: _entity,
                                          message:
                                            "Entity phoneNo not found in database",
                                        };
                                        list.push(obj);
                                        return;
                                      }
                                    }
                                    //check if notification type requested is push
                                    else if (notification === "push") {
                                      if (results[0][0].deviceId != "") {
                                        console.log("push notification send");
                                        //function to send push notification to device Id
                                        await notification.pushNotification();

                                        let _type = notification;
                                        //function to save notification sent details in database and return notification id to user
                                        dbConn.query(
                                          Procedure.ProcedureTable
                                            .saveNotification,
                                          [_entity, _body, _type],
                                          function (error, results) {
                                            if (error) throw error;
                                            let obj = {
                                              info: _entity,
                                              result: results[0][0],
                                            };
                                            list.push(obj);
                                          }
                                        );
                                      } else {
                                        let obj = {
                                          info: _entity,
                                          message:
                                            "Entity DeviceId not found in database",
                                        };
                                        list.push(obj);
                                        return;
                                      }
                                    }
                                    //check if notification type requested is all
                                    else if (notification === "all") {
                                      if (results[0].length > 0) {
                                        if (results[0][0].email != "") {
                                          var receiver = {
                                            name: results[0][0].entity_Name,
                                            user: results[0][0].email,
                                            body: _body,
                                          };
                                          //function to send email
                                          await commentsMailer.newComment(
                                            receiver
                                          );

                                          let _type = notification;
                                          //function to save notification sent details in database and return notification id to user
                                          dbConn.query(
                                            Procedure.ProcedureTable
                                              .saveNotification,
                                            [_entity, _body, _type],
                                            function (error, results) {
                                              if (error) throw error;
                                              let obj = {
                                                info: _entity,
                                                result: results[0][0],
                                              };
                                              list.push(obj);
                                            }
                                          );
                                        } else {
                                          let obj = {
                                            info: _entity,
                                            message:
                                              "Entity email not found in database",
                                          };
                                          list.push(obj);
                                          return;
                                        }

                                        if (results[0][0].phoneNumber != "") {
                                          //function to send sms
                                          //await message.sendTextMessages(_body,results[0][0].phoneNumber);
                                        } else {
                                          let obj = {
                                            info: entity,
                                            message:
                                              "Entity phone No not found in database",
                                          };
                                          list.push(obj);
                                          return;
                                        }

                                        if (results[0][0].deviceId != "") {
                                          //function to send push notification
                                          console.log("push notification send");
                                          //  await notification.pushNotification(_body);
                                        } else {
                                          let obj = {
                                            info: entity,
                                            message:
                                              "Entity deviceId not found in database",
                                          };
                                          list.push(obj);
                                          return;
                                        }
                                      } else {
                                        let obj = {
                                          info: entity,
                                          message:
                                            "Entity not found in database",
                                        };
                                        list.push(obj);
                                        return;
                                      }
                                    } else {
                                      let obj = {
                                        info: entity,
                                        message:
                                          "wrong type of notification selected",
                                      };
                                      list.push(obj);
                                      return;
                                    }
                                  }
                                } else {
                                  let obj = {
                                    info: entity,
                                    message: "Entity not found",
                                  };
                                  list.push(obj);
                                  return;
                                }
                              }
                            );
                          } else {
                            let obj = {
                              info: entity,
                              message: "Entity not authorised to the client",
                            };
                            list.push(obj);
                            return;
                          }
                        } else {
                          let obj = {
                            info: entity,
                            message: "Entity not found",
                          };
                          list.push(obj);
                          return;
                        }
                      }
                    );
                  } //end of entity for loop
                } else {
                  let obj = {
                    info: _groupId,
                    message: "no entity found in this group",
                  };
                  list.push(obj);
                  return;
                }
              }
            ); //end of geting entity id's
          } else {
            //loop to iterate over multiple users
            for await (let item of user.info) {
              let info = item;
              let _phoneNumber = 0;
              let _entityId = "";
              let _email = "";
              //format to check email
              const regexExp =
                /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/gi;
              //format to check uuid
              const pattern =
                /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
              console.log("information", info);

              //loop to iterate over single user information
              for (let information of info) {
                console.log("info", information);
                let email_test = regexExp.test(information);
                let uuidTest = pattern.test(information);

                if (uuidTest) {
                  _entityId = information;
                  email_test = false;
                  uuidTest = false;
                } else if (email_test) {
                  console.log("inside phone", email_test);
                  _email = information;
                  email_test = false;
                  uuidTest = false;
                } else {
                  _phoneNumber = information;
                  email_test = false;
                  uuidTest = false;
                }
              }

              // function to check user information in database and return its information
              dbConn.query(
                Procedure.ProcedureTable.sendNotificationDetails,
                [_entityId, _email, _phoneNumber],
                async function (error, results) {
                  if (error) {
                    throw error;
                  }
                  console.log("data", results[0][0]);
                  let name = results[0][0].entity_Name;
                  let mailId = results[0][0].email;

                  //check if entity is part of the token client
                  dbConn.query(
                    Procedure.ProcedureTable.checkEntityId,
                    [results[0][0].entity_id],
                    async function (error, results) {
                      console.log("check", results[0][0].client_id);
                      if (error) {
                        throw error;
                      }
                      if (results[0].length > 0) {
                        if (String(results[0][0].client_id) === _clientId) {
                          for (let notification of type) {
                            //check if notification type requested is email
                            if (notification === "email") {
                              if (results[0][0].email != "") {
                                var receiver = {
                                  name: name,
                                  user: mailId,
                                  body: _body,
                                };
                                //function to send email
                                console.log("receiver", receiver);
                                await commentsMailer.newComment(receiver);

                                let _type = notification;

                                //function to save notification sent details in database and return notification id to user
                                dbConn.query(
                                  Procedure.ProcedureTable.saveNotification,
                                  [_entityId, _body, _type],
                                  function (error, results) {
                                    if (error) throw error;
                                    let obj = {
                                      info: info,
                                      result: results[0][0],
                                    };
                                    list.push(obj);
                                  }
                                );
                              } else {
                                let obj = {
                                  info: info,
                                  message: "Entity Email not found in database",
                                };
                                list.push(obj);
                                return;
                              }
                            }
                            //check if notification type requested is sma
                            else if (notification === "sms") {
                              if (results[0][0].phoneNumber != "") {
                                //function to send sms to phone number
                                //await message.sendTextMessages(_body,results[0][0].phoneNumber);

                                let _type = notification;
                                //function to save notification sent details in database and return notification id to user
                                dbConn.query(
                                  Procedure.ProcedureTable.saveNotification,
                                  [_entityId, _body, _type],
                                  function (error, results) {
                                    if (error) throw error;
                                    let obj = {
                                      info: info,
                                      result: results[0][0],
                                      message: "Notication sent",
                                    };
                                    list.push(obj);
                                  }
                                );
                              } else {
                                let obj = {
                                  info: info,
                                  message:
                                    "Entity phoneNo not found in database",
                                };
                                list.push(obj);
                                return;
                              }
                            }
                            //check if notification type requested is push
                            else if (notification === "push") {
                              if (results[0][0].deviceId != "") {
                                console.log("push notification send");
                                //function to send push notification to device Id
                                await notification.pushNotification();

                                let _type = notification;
                                //function to save notification sent details in database and return notification id to user
                                dbConn.query(
                                  Procedure.ProcedureTable.saveNotification,
                                  [_entityId, _body, _type],
                                  function (error, results) {
                                    if (error) throw error;
                                    let obj = {
                                      info: info,
                                      result: results[0][0],
                                    };
                                    list.push(obj);
                                  }
                                );
                              } else {
                                let obj = {
                                  info: info,
                                  message:
                                    "Entity DeviceId not found in database",
                                };
                                list.push(obj);
                                return;
                              }
                            }
                            //check if notification type requested is all
                            else if (notification === "all") {
                              if (results[0].length > 0) {
                                if (results[0][0].email != "") {
                                  var receiver = {
                                    name: results[0][0].entity_Name,
                                    user: results[0][0].email,
                                    body: _body,
                                  };
                                  //function to send email
                                  await commentsMailer.newComment(receiver);

                                  let _type = notification;
                                  //function to save notification sent details in database and return notification id to user
                                  dbConn.query(
                                    Procedure.ProcedureTable.saveNotification,
                                    [_entityId, _body, _type],
                                    function (error, results) {
                                      if (error) throw error;
                                      let obj = {
                                        info: info,
                                        result: results[0][0],
                                      };
                                      list.push(obj);
                                    }
                                  );
                                } else {
                                  let obj = {
                                    info: info,
                                    message:
                                      "Entity email not found in database",
                                  };
                                  list.push(obj);
                                  return;
                                }

                                if (results[0][0].phoneNumber != "") {
                                  //function to send sms
                                  //await message.sendTextMessages(_body,results[0][0].phoneNumber);
                                } else {
                                  let obj = {
                                    info: info,
                                    message:
                                      "Entity phone No not found in database",
                                  };
                                  list.push(obj);
                                  return;
                                }

                                if (results[0][0].deviceId != "") {
                                  //function to send push notification
                                  console.log("push notification send");
                                  //  await notification.pushNotification(_body);
                                } else {
                                  let obj = {
                                    info: info,
                                    message:
                                      "Entity deviceId not found in database",
                                  };
                                  list.push(obj);
                                  return;
                                }
                              } else {
                                let obj = {
                                  info: info,
                                  message: "Entity not found in database",
                                };
                                list.push(obj);
                                return;
                              }
                            } else {
                              let obj = {
                                info: info,
                                message: "wrong type of notification selected",
                              };
                              list.push(obj);
                              return;
                            }
                          }
                        } else {
                          let obj = {
                            info: info,
                            message:
                              "Client not authorised to information inserted",
                          };
                          list.push(obj);
                          return;
                        }
                      } else {
                        let obj = {
                          info: info,
                          message:
                            "Client not authorised to information inserted",
                        };
                        list.push(obj);
                        return;
                      }
                    }
                  );
                } //end of notification details
              );
            } //end of main for loop
          }
        } //end of token status check
        else {
          res.status(401).send({
            message: "Token expired",
          });
        }

        callbackFunc(2000 * user.info.length, list, (result) => {
          return res.status(200).send({
            status: list,
          });
        });
      }
    );
  } catch (error) {
    console.log(error);
  }
};
