const fs = require('fs');

const index = ctx => {
	ctx.response.type = 'html';
	ctx.response.body = fs.createReadStream('../index/templates/index.html');
};

module.exports = index;

