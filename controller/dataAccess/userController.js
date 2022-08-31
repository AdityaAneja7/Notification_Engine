const path = require("path");
const pool = require("../../config/database");
const { signAccessToken } = require("../../config/jwtHelper");
const jwt_decode = require("jwt-decode");

const Procedure = require("../../config/procedures");

const commentsMailer = require("../../services/email_Services");

const notification = require("../../services/pushNotification_Service");

//database connection created
const dbConn = pool.dbConn;
dbConn.connect();

//API to create user entity

module.exports.createUser = async (req, res) => {
  try {
    //jwt token sent on header
    let headers = String(req.headers.authorization);
    let decoded = jwt_decode(headers);
    let currentTime = new Date();
    let expiryTime = new Date(decoded.exp * 1000);
    let _clientId = decoded.aud;
    let diff = expiryTime - currentTime;
    let _token = headers;

    let _status = 2;
    //function to fetch token status

    dbConn.query(
      Procedure.ProcedureTable.getTokenStatus,
      [_token],
      async function (error, results, fields) {
        console.log(results);
        if (error) {
          throw error;
        }

        _status = results[0][0].is_Active;
        console.log("status", _status);
        console.log("diff", diff);

        //check if jwt token is active or not
        if (diff > 0 && _status === 1) {
          console.log("approved");
          let user = req.body;
          console.log(user);

          let _entityName = user.name;
          let _email = user.email;
          let _phoneNumber = user.phoneNumber;
          let _deviceId = user.deviceId;

          // if token is active then function called to create an entity in the database
          dbConn.query(
            Procedure.ProcedureTable.createUserEntity,
            [_entityName, _clientId, _email, _phoneNumber, _deviceId,null],
            async function (error, results, fields) {
              console.log(results);
              if (error) {
                throw error;
              }
              return res.status(200).send({
                EntityId: results[0][0].EntityId,
              });
            }
          );
        }
        //if token expired
        else {
          console.log("Not approved");

          //function to change status of token in database to inactive
          dbConn.query(
            Procedure.ProcedureTable.updateTokenStatus,
            [_token],
            async function (error, results, fields) {
              console.log(results[0]);
              if (error) {
                throw error;
              }

              return res.status(409).send({
                error: true,
                message: "Client not Authorised",
              });
            }
          );
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

//API to search user created entity
module.exports.searchUser = async (req, res) => {
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
          let user = req.params;
          console.log(user);

          let _entityId = user.id;
          console.log("user", _entityId);
          //check if entity is part of the token client
          dbConn.query(
            Procedure.ProcedureTable.checkEntityId,
            [_entityId],
            async function (error, results, fields) {
              if (error) {
                throw error;
              }
              if(results[0].length>0){
              if (_clientId === String(results[0][0].client_id)) {
                // if token is active then function called to get entity from the database using its id
                dbConn.query(
                  Procedure.ProcedureTable.searchUserEntity,
                  [_entityId],
                  async function (error, results, fields) {
                    console.log(results);
                    if (error) {
                      throw error;
                    }
                    if(results[0].length>0){

                    return res.status(200).send({
                      Entity: results[0],
                    });
                  }else{
                    return res.status(404).send({
                      error: true,
                      message: "Entity not found",
                    });

                  }
                  }
                );
              } else {
                return res.status(401).send({
                  error: true,
                  message: "Client not Authorised to this Entity",
                });
              }
            }else{
              return res.status(401).send({
                error: true,
                message: "Client not Authorised to this Entity",
              });

            }
            }
          );
        }

        //if token expired
        else {
          console.log("Not approved");
          //function to change status of token in database to inactive
          dbConn.query(
            Procedure.ProcedureTable.updateTokenStatus,
            [_token],
            async function (error, results, fields) {
              console.log(results[0]);
              if (error) {
                throw error;
              }

              return res.status(401).send({
                error: true,
                message: "Client not Authorised",
              });
            }
          );
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

//API to update user Entity
module.exports.updateUser = async (req, res) => {
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

          let _entityId = user.Id;

          let _entityName = user.name;
          let _email = user.email;
          let _phoneNumber = user.phoneNumber;
          let _deviceId = user.deviceId;
          //check if entity is part of the token client
          dbConn.query(
            Procedure.ProcedureTable.checkEntityId,
            [_entityId],
            async function (error, results, fields) {
              if (error) {
                throw error;
              }
              if(results[0].length>0){
              if (_clientId === String(results[0][0].client_id)) {
                // if token is active then function called to update entity details in the database using its id
                dbConn.query(
                  Procedure.ProcedureTable.updateUserEntity,
                  [_entityId, _entityName, _email, _phoneNumber, _deviceId],
                  async function (error, results, fields) {
                    console.log(results);
                    if (error) {
                      throw error;
                    }

                    return res.status(200).send({
                      UpdatedEntity: results[0],
                    });
                  }
                );
              } else {
                return res.status(401).send({
                  error: true,
                  message: "Client not Authorised to this Entity",
                });
              }
            }else{
              return res.status(401).send({
                error: true,
                message: "Client not Authorised to this Entity",
              });

            }
            }
          );
        }

        //if token expired
        else {
          console.log("Not approved");
          //function to change status of token in database to inactive
          dbConn.query(
            Procedure.ProcedureTable.updateTokenStatus,
            [_token],
            async function (error, results, fields) {
              console.log(results[0]);
              if (error) {
                throw error;
              }

              return res.status(401).send({
                error: true,
                message: "Client not Authorised",
              });
            }
          );
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

//API to delete user Entity from the database
module.exports.deleteEntity = async (req, res) => {
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
          let user = req.params;
          console.log("user", user);

          let _entityId = user.Id;
          // if token is active then function called to delete entity from the database using its id
          //check if entity is part of the token client
          dbConn.query(
            Procedure.ProcedureTable.checkEntityId,
            [_entityId],
            async function (error, results, fields) {
          
              if (error) {
                throw error;
              }
              if(results[0].length>0){
              if (_clientId === String(results[0][0].client_id)) {
                dbConn.query(
                  Procedure.ProcedureTable.deleteUserEntity,
                  [_entityId],
                  async function (error, results, fields) {
                    console.log(results);
                    if (error) {
                      throw error;
                    }

                    return res.status(200).send({
                      data: _entityId,
                      message: "Entity Deleted Successfully ",
                    });
                  }
                );
              } else {
                return res.status(401).send({
                  error: true,
                  message: "Client not Authorised to this Entity",
                });
              }
            }else{
              return res.status(401).send({
                error: true,
                message: "Client not Authorised to this Entity",
              });

            }
            }
          );
        }
        //if token expired
        else {
          console.log("Not approved");
          //function to change status of token in database to inactive
          dbConn.query(
            Procedure.ProcedureTable.updateTokenStatus,
            [_token],
            async function (error, results, fields) {
              console.log(results[0]);
              if (error) {
                throw error;
              }
              return res.status(401).send({
                error: true,
                message: "Client not Authorised",
              });
            }
          );
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

//function to Send an Email
// commentsMailer.newComment(comment);

//function to send notification
// notification.pushNotification();
