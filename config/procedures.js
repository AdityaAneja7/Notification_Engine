



module.exports.ProcedureTable={
    "getClientName": "call mindit_notification_engine.SP_Get_Client_Name(?)",
    "createSecretKey": "call mindit_notification_engine.SP_Create_Secret_Key(?,?)",
    "getSecretKey":  "call mindit_notification_engine.SP_Get_Secret_Key(?)",
    "saveToken":  "call mindit_notification_engine.SP_Save_Token(?,?,?)",
    "getTokenStatus":  "call mindit_notification_engine.SP_Get_Token_Status(?)",
    "createUserEntity": "call mindit_notification_engine.SP_Create_User_Entity(?,?,?,?,?)",
    "updateTokenStatus": "call mindit_notification_engine.SP_Update_Token_Status(?)",
    "searchUserEntity": "call mindit_notification_engine.SP_Get_User_Entity(?)",
    "updateUserEntity": "call mindit_notification_engine.SP_Update_User_Entity(?,?,?,?,?)",
    "deleteUserEntity": "call mindit_notification_engine.SP_Delete_User_Entity(?)",
    "checkEntityId": "call mindit_notification_engine.SP_Get_Entity_Id(?)",
    "sendNotificationDetails": "call mindit_notification_engine.SP_detils_byId(?,?,?)",
    "saveNotification": "call mindit_notification_engine.SP_Create_Notification(?,?,?)",
    "getGroupName": "call mindit_notification_engine.SP_Get_Group_Name(?)",
    "createGroup":"call mindit_notification_engine.SP_Create_Group(?)"
  }