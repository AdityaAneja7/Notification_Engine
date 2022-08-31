//list of mysql procedures

module.exports.ProcedureTable = {
  getClientName: "call SP_Get_Client_Name(?)",
  createSecretKey: "call SP_Create_Secret_Key(?,?)",
  getSecretKey: "call SP_Get_Secret_Key(?)",
  saveToken: "call SP_Save_Token(?,?,?)",
  getTokenStatus: "call SP_Get_Token_Status(?)",
  createUserEntity: "call SP_Create_User_Entity(?,?,?,?,?,?)",
  updateTokenStatus: "call SP_Update_Token_Status(?)",
  searchUserEntity: "call SP_Get_User_Entity(?)",
  updateUserEntity: "call SP_Update_User_Entity(?,?,?,?,?)",
  deleteUserEntity: "call SP_Delete_User_Entity(?)",
  checkEntityId: "call SP_Get_Entity_Id(?)",
  sendNotificationDetails: "call SP_detils_byId(?,?,?)",
  saveNotification: "call SP_Create_Notification(?,?,?)",
  getGroupName: "call SP_Get_Group_Name(?)",
  createGroup: "call SP_Create_Group(?)",
  allotGroup: "call SP_Group_Allotment(?,?)",
  groupCheck: "call SP_Group_Check(?,?)",
  getEntityByGroupId: "call SP_Get_Entity_By_Groupid(?)",
};
