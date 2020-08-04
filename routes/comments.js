var express=require("express");
var router=express.Router({mergeParams:true});
var campground=require("../models/campground")
var comment=require("../models/comment");

router.get("/new",isLoggedIn,function(req,res){
    campground.findById(req.params.id,function(err,campground){
    if(err){
        console.log(err);
    }
    else{
        res.render("comments/new",{campground:campground});
    }
});

});

router.post("/",isLoggedIn,function(req,res){
    campground.findById(req.params.id,function(err,campground){
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        }else{
            comment.create(req.body.comment,function(err,comment){
                if(err){
                    req.flash("error","something went wrong!!");
                    console.log(err); 
                }else{
                    //add a username and id to the comment
                    comment.author.id=req.user.id;
                    comment.author.username=req.user.username;
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    req.flash("succeess","new comment added");
                    res.redirect("/campgrounds/"+campground._id); 
                }
            })
        }
    })
});

//comment edit
router.get("/:comment_id/edit",checkcommentownership,function(req,res){
    comment.findById(req.params.comment_id,function(err,foundcomment){
        if(err){
            res.redirect("back");
        }
        else{
        res.render("comments/edit",{comment_id:foundcomment,campground:req.params.id});
        }
    });
});

//comment update
router.put("/:comment_id",checkcommentownership,function(req,res){
    comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,updatedcomment){
        if(err){
            res.redirect("back");
        }
        else{
            req.flash("success","comment updated");
            res.redirect("/campgrounds/"+req.params.id);
        }
    });
});

//comments destroy
router.delete("/:comment_id",checkcommentownership,function(req,res){
    comment.findByIdAndRemove(req.params.comment_id,function(err){
        if(err){
            res.redirect("back");
        }
        else{
            req.flash("error","comment deleted");
            res.redirect("back");
        }
    })
})

function checkcommentownership(req,res,next){
    if(req.isAuthenticated()){
        comment.findById(req.params.comment_id,function(err,foundcomment){
            if(err){
                req.flash("error","campground not found");
                res.redirect("back");
            }
            else{
                //does user own the campground
                if(foundcomment.author.id.equals(req.user._id)){
                    req.flash("success","campground updated");
                    next();
                }else{
                    req.flash("error","you don't have permission to do that");
                    res.redirect("back");
                }    
            }
        });
    }else{
        req.flash("error","you need to be logged in to do that");
        res.redirect("back");
    }
}

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error","you need to be logged in to do that");
    res.redirect("/login");
}


module.exports=router;