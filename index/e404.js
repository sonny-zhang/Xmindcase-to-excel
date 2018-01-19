const fs = require('fs');

const e404 = ctx => {
	ctx.response.type = 'html';
	ctx.response.body = fs.createReadStream('../index/templates/404.html');
};

module.exports = e404;

