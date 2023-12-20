// functions/verify-password.js

exports.handler = async function (event, context) {
  const { password } = JSON.parse(event.body);
  const correctPassword = "pils2000";

  if (password === correctPassword) {
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } else {
    return {
      statusCode: 200,
      body: JSON.stringify({ success: false }),
    };
  }
};
