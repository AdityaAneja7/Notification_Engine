const path = require("path");
const pool = require("../../config/database");
const { signAccessToken } = require("../../config/jwtHelper");
const jwt_decode = require("jwt-decode");

const Procedure = require("../../config/procedures");
const uuidFunction =require("../../utils/uuidFunction");

//database connection created
const dbConn = pool.dbConn;
dbConn.connect();



// Api to post secret key for unique user
module.exports.secretKey = function (req, res) {
  try {
    let user = req.body;
    console.log("abcd", req.body.name);
    //if user added is null
    if (!user) {
      return res
        .status(400)
        .send({ error: true, message: "Please provide user" });
    }
    //check if user already exist in database
    dbConn.query(
      Procedure.ProcedureTable.getClientName,
      [user.name],
      async function (error, results, fields) {
        if (error) {
          throw error;
        }

        //if user already exists throw an error
        if (results[0].length > 0) {
          return res.status(409).send({
            error: true,
            message: " User name already exists!!",
          });
        }
        //if user doesnot exists then it will create a secret key for that user
        else {
          let key =uuidFunction.uuidFunction();
          user.secret_key = key;
          console.log('sekeret key:',user.secret_key);
          // Value to be inserted
          let _clientName = String(user.name);
          let _secretKey = String(user.secret_key);
          dbConn.query(
            Procedure.ProcedureTable.createSecretKey,
            [_clientName, _secretKey],
            function (error, results, fields) {
              if (error) throw error;
              return res.status(200).send({
                secretKey: _secretKey,
              });
            }
          );
        }
      }
    );
  } catch (error) {
    next(error);
  }
};

//API to Authenticate secret Key
module.exports.SecretKeyVerification = function (req, res, next) {
  try {
    console.log(req.params);
    let user_SecretKey = req.params.sk;

    if (!user_SecretKey) {
      return res
        .status(400)
        .send({ error: true, message: "Please provide User Secret key" });
    }
    let _secretKey = user_SecretKey;
    dbConn.query(
      Procedure.ProcedureTable.getSecretKey,
      [_secretKey],
      async function (error, results, fields) {
        console.log(results);
        if (error) {
          throw error;
        }

        //if secret key found in database
        if (results[0].length > 0) {
          let id = String(results[0][0].id);
          console.log("id", results[0][0].id);
          const accessToken = await signAccessToken(id);
          console.log({ accessToken });
          let decoded = jwt_decode(accessToken);
          console.log(decoded);
          let _expiresAt = new Date(decoded.exp * 1000);
          let _clientId = String(decoded.aud);
          let _token = accessToken;

          //save jwt token in the database for that user id

          dbConn.query(
            Procedure.ProcedureTable.saveToken,
            [_token, _clientId, _expiresAt],
            async function (error, results, fields) {
              console.log(results);
              if (error) {
                throw error;
              }
              return res.status(200).send({
                accessToken: accessToken ,
              });
            }
          );
        }

        //if secret key not found in database
        else {
          return res.status(400).send({
            error: true,
            data: results,
            message: "user not found",
          });
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

module.exports.createGroup = function (req, res) {
  try {
    let user = req.body;
    console.log("group Body", req.body.name);
    //if user added is null
    if (!user) {
      return res
        .status(400)
        .send({ error: true, message: "Please provide a group name" });
    }
    //check if user already exist in database
    dbConn.query(
      Procedure.ProcedureTable.getGroupName,
      [user.name],
      async function (error, results, fields) {
        if (error) {
          throw error;
        }

        //if group already exists throw an error
        if (results[0].length > 0) {
          return res.status(409).send({
            message: " Group name name already exists!!",
          });
        }

        //if group doesnot exists then it will create a new group
        else {
          dbConn.query(
            Procedure.ProcedureTable.createGroup,
            [user.name],
            function (error, results, fields) {
              if (error) throw error;
              return res.status(200).send({
                status: results[0][0],
              });
            }
          );
        }
      }
    );
  } catch (error) {
    next(error);
  }
};

//API to allot group to a entity
module.exports.allotGroup = function (req, res) {
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
      async function (error, results) {
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
          console.log("group Body", req.body);
          var _groupId = user.groupId;
          var _entityId = user.entityId;

          //if user added is null
          if (!user) {
            return res
              .status(400)
              .send({ error: true, message: "Please provide a group name" });
          } else {
            //check if entity is part of the client
            dbConn.query(
              Procedure.ProcedureTable.checkEntityId,
              [_entityId],
              async function (error, results) {
                console.log("res", results[0]);
                if (results[0].length > 0) {
                  console.log("check", results[0][0].client_id);
                  if (error) {
                    throw error;
                  }
                  //if entity is part of that client
                  if (_clientId === String(results[0][0].client_id)) {
                    //check if entity already part of the inputed group or not
                    dbConn.query(
                      Procedure.ProcedureTable.groupCheck,
                      [_groupId, _entityId],
                      function (error, results) {
                        if (error) throw error;
                        //if already exist in the group
                        if (results[0].length > 0) {
                          return res.status(400).send({
                            error: true,
                            message: "Entity already part of the given group",
                          });
                        }
                        //if not part of the inputed group
                        else {
                          dbConn.query(
                            Procedure.ProcedureTable.allotGroup,
                            [_groupId, _entityId],
                            function (error, results) {
                              if (error) throw error;
                              return res.status(200).send({
                                status: "Group allloted to the given entity",
                              });
                            }
                          );
                        }
                      }
                    );
                  } else {
                    return res.status(400).send({
                      error: true,
                      message: "Entity not authorised to the client",
                    });
                  }
                } else {
                  return res.status(400).send({
                    error: true,
                    message: "Entity not authorised to the client",
                  });
                }
              }
            );
          }
        }
      }
    );
  } catch (error) {
    next(error);
  }
};
