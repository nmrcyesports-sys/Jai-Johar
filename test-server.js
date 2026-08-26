// basic test of what the server is serving
const http = require('http');
http.get('http://localhost:3000/assets/images/img_f37bcfed61.jpg', (res) => {
  console.log("Image Status:", res.statusCode);
});
http.get('http://localhost:3000/admin.html', (res) => {
  console.log("Admin Status:", res.statusCode);
});
