var express=require("express");
var app=express();
var bodyParser=require("body-parser");
var mongoose=require("mongoose");
var flash=require("connect-flash");
var passport=require("passport");
var localstrategy=require("passport-local");
var methodoverride=require("method-override");
var umodel=require("./models/user");
mongoose.connect("mongodb://localhost/yelpcamp_v14_1",{ useNewUrlParser: true, useUnifiedTopology: true});
var campground=require("./models/campground");
var comment=require("./models/comment");
var seedDB=require("./seeds");

//seedDB();
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static(__dirname+"/public"));
app.use(methodoverride("_method"));
app.use(flash());

//requiring routes
var commentroutes=require("./routes/comments");
var campgroundsroutes=require("./routes/campgrounds");
var authroutes=require("./routes/auth");

//passport configuation
app.use(require("express-session")({
    secret:"Horcruxes",
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localstrategy(umodel.authenticate()));
passport.serializeUser(umodel.serializeUser());
passport.deserializeUser(umodel.deserializeUser());
app.use(function(req,res,next){
    res.locals.error=req.flash("error");
    res.locals.success=req.flash("success");
    res.locals.currentuser=req.user;
    next();
});

//using required routes
app.use(authroutes);
app.use("/campgrounds",campgroundsroutes);
app.use("/campgrounds/:id/comments",commentroutes);
app.listen (2000,function(){
    console.log("yelpcamp server has started");
});