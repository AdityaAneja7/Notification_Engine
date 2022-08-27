const path = require("path");
const pool = require("../../config/database");
const { signAccessToken } = require("../../config/jwthelper");
const jwt_decode = require("jwt-decode");

const Procedure = require("../../config/procedures");

//database connection created
const dbConn = pool.dbConn;
dbConn.connect();

// Function to Generate Secret Key
function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    let r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

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
          return res.send({
            error: true,
            data: results[0],
            message: " User name already exists!!",
          });
        }
        //if user doesnot exists then it will create a secret key for that user
        else {
          user.secret_key = uuid();
          // Value to be inserted
          let _clientName = String(user.name);
          let _secretKey = String(user.secret_key);
          dbConn.query(
            Procedure.ProcedureTable.createSecretKey,
            [_clientName, _secretKey],
            function (error, results, fields) {
              if (error) throw error;
              return res.send({
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
              return res.send({
                data: { accessToken },
              });
            }
          );
        }

        //if secret key not found in database
        else {
          return res.send({
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
    console.log("abcd", req.body.name);
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
          return res.send({
            message: " User name already exists!!",
          });
        }

        //if group doesnot exists then it will create a new group
        else {
          dbConn.query(
            Procedure.ProcedureTable.createGroup,
            [user.name],
            function (error, results, fields) {
              if (error) throw error;
              return res.send({
                groupId:results[0][0],
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

