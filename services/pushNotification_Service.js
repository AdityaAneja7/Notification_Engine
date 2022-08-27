const path = require("path");
const FCM = require("fcm-node");
const SERVER_KEY =
  "AAAAtY-0bNw:APA91bGXKmpJ3cnjQL8sNICob_qEnuiSj-C18spDubGQeDpwPQKLaHxiGc-wOUAz98W8aF7OXzrbNBQ0EF9ZPb5lXybfw7Arcj-ZOwNaR_pp3kBK6WB2Bp79NboB9Lq2t9Vjep7U42IA";

//function to push notifications
module.exports.pushNotification = async (req) => {
  console.log(req);
  try {
    let fcm = new FCM(SERVER_KEY);

    let message = {
      to: "/topics/" + req,
      notification: {
        title: req,
        body: req,
        sound: "default",
        click_action: "FCM_PLUGIN_Activity",
        icon: "fcm_push_icon",
      },
      data: req,
    };

    console.log("line 41 message", message);
    fcm.send(message, (err, response) => {
      if (err) {
        console.log(err);
      } else {
       console.log(response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};
