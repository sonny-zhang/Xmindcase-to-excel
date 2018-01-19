const fs = require('fs');

const about = ctx => {
	ctx.response.type = 'html';
	ctx.response.body = fs.createReadStream('../about/templates/about.html');
};

module.exports = about;