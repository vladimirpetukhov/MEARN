const port = process.env.PORT || 3001;
const rtsIndex=require('./routes/index.router');
const app = require('express')();
require('./config/express')(app);
require('./config/config');
require('./config/database');
app.use('/api',rtsIndex);
	app.listen(port, async (req, res) => {
		console.log(`Server started on port: ${port}`);
	});