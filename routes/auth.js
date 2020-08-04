var express=require("express");
var router=express.Router();
var passport=require("passport");
var umodel=require("../models/user");
var comment=require("../models/comment");
var campground=require("../models/campground");
router.get("/",function(req,res){
    res.render("landing");
});


router.get("/user/:user_id",function(req,res){
    umodel.findById(req.params.user_id).populate("campgrounds").exec(function(err,founduser){
        if(err){
            console.log(err);
        }else{
            res.render("profile/user",{umodel:founduser});
        }
    });
});
//update user profile
router.get("/user/:user_id/edit",function(req,res){
    umodel.findById(req.params.user_id,function(err,founduser){
        res.render("profile/edit",{umodel:founduser});
    })
});
router.put("/user/:user_id",function(req,res){
    umodel.findByIdAndUpdate(req.params.user_id,req.body.umodel,function(err,updateduser){
        if(err){
            res.redirect("/campgrounds");
        }
        else{
            campground.find().where("author.id").equals(req.params.user_id).exec(function(err,campgrounds){
                campgrounds.forEach(function(campgrounds){
                    campgrounds.author.username=req.body.umodel["username"];
                    campgrounds.save();    
                });
            });
            comment.find().where("author.id").equals(req.params.user_id).exec(function(err,comments){
                comments.forEach(function(comments){
                    comments.author.username=req.body.umodel["username"];
                    comments.save();
                });
            });
            res.redirect("/user/"+req.params.user_id);
        }
    });
})

router.get("/register",function(req,res){
    res.render("register");
});
//handle sign up logic
router.post("/register",function(req,res){
    var newuser=new umodel({
        username:req.body.username,
        fullname:req.body.fullname,
        display:req.body.display,
        email:req.body.email,
        number:req.body.number,
        dob:req.body.dob,
        bio:req.body.bio,
        gender:req.body.gender
    });
    umodel.register(newuser,req.body.password,function(err,user){
        if(err){
            req.flash("error",err.message);
            res.redirect("/register");
        }
        else{
            passport.authenticate("local")(req,res,function(){
                req.flash("success","welcome to yelpcamp "+user.username);
                res.redirect("/campgrounds");
            });
        }
    });
});

//finding all members
router.get("/members",function(req,res)
{
    if(req.query.search)
    {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        umodel.find({username:regex},function(err,umodels)
        {
            if(err)
            { 
                console.log(err)
            }
            else
            {
                var count=0;
                umodels.forEach(function(c)
                {
                    count=count+1;
                });
                var active=count+" members found";
                res.render("profile/members",{umodels:umodels,active:active});
            }
        });
    }
    else
    {
        umodel.find({},function(err,umodels){
            if(err){
                console.log(err);
            }
            else{
                var count=0;
                umodels.forEach(function(c)
                {
                    count=count+1;
                });
                var active=count+" active members";
                res.render("profile/members",{umodels:umodels,active:active});
            }
        });
    }
});


//login routes
router.get("/login",function(req,res){
    res.render("login");
});

router.post("/login",passport.authenticate("local", 
    {
        successRedirect:"/campgrounds",
        failureRedirect:"/login"
    }),function(req,res){
});

//logout routes
router.get("/logout",function(req,res){
    req.logout();
    req.flash("success","Logged you out");
    res.redirect("/campgrounds");
})

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

module.exports=router;