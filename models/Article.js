var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ArticleSchema = new Schema({
    title: {
        type:String,
        required: true,
        unique:true
    },
    link: {
        type: String,
        required:true
    },
    note: {
        type: Schema.Types.ObjectId,
        ref: 'Note'
    },
    summary: {
        type: String,
        required:true
    },
    dateCreated: {
        type: Date,
        default:Date.now
    },
    isSaved: {
        type:Boolean,
        default:false

    }
});

var Article = mongoose.model('Article',ArticleSchema);
module.exports = Article;