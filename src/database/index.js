const mongoose = require('mongoose')

mongoose.set("strictQuery", true);

mongoose.connect(process.env.DATA_BASE,{
    useNewUrlParser:true,
    useUnifiedtopology:true
});
mongoose.Promise = global.Promise

module.exports = mongoose 