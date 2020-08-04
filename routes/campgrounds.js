var express=require("express");
var router=express.Router();
var umodel=require("../models/user")
var campground=require("../models/campground")
var comment=require("../models/comment");

router.get("/",function(req,res)
{
    if(req.query.category && !req.query.search)
    {
        var regex = new RegExp(escapeRegex(req.query.category), 'gi');
        campground.find({category:regex},function(err,allcampgrounds)
        {
            if(err)
            { 
                console.log(err)
            }
            else
            {
                var count=0;
                allcampgrounds.forEach(function(allcampgrounds){
                count=count+1;
                })
                var category="You chose "+"\""+req.query.category+"\""+" category";
                var result="There are "+count+" campgrounds in this category";
                res.render("campgrounds/campgrounds",{campgrounds:allcampgrounds,category:category,result:result});
            }
        });
    }   
    else if(req.query.search && !req.query.category)
    {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        campground.find({name:regex},function(err,allcampgrounds)
        {
            if(err)
            { 
                console.log(err)
            }
            else
            {
                var count=0;
                allcampgrounds.forEach(function(allcampgrounds){
                count=count+1;
                });
                var category="You searched for "+"\""+req.query.search+"\"";
                var result=count+" results found";
                res.render("campgrounds/campgrounds",{campgrounds:allcampgrounds,category:category,result:result});
            }
        });
    }
    else if(req.query.search && req.query.category)
    {
        const regexc= new RegExp(escapeRegex(req.query.category), 'gi');
        const regex= new RegExp(escapeRegex(req.query.search), 'gi');
        campground.find({name:regex,category:regexc},function(err,allcampgrounds)
        {
            if(err)
            { 
                console.log(err)
            }
            else
            {
                var count=0;
                allcampgrounds.forEach(function(allcampgrounds){
                count=count+1;
                });
                var category="you searched for "+ "\""+req.query.search+"\""+" in "+"\""+req.query.category+"\""+" category";
                var result=count+" results found";
                res.render("campgrounds/campgrounds",{campgrounds:allcampgrounds,category:category,result:result});
            }
        });
    }
    else
    {console.log
        campground.find({},function(err,allcampgrounds)
        {
            if(err)
            { 
                console.log(err)
            }
            else
            {
                var count=0;
                allcampgrounds.forEach(function(allcampgrounds){
                count=count+1;
                })
                var category="";
                var result=count+" campgrounds";
                res.render("campgrounds/campgrounds",{campgrounds:allcampgrounds,category:category,result:result});
            }
        });
    }
});

router.post("/",isLoggedIn,function(req,res){
    var name=req.body.name;
    var image=req.body.image;
    var desc=req.body.description;
    var category=req.body.category;
    var price=req.body.price;
    var author={
        id:req.user._id,
        username:req.user.username
    };
    var newcampground={name:name,image:image, description:desc,author:author,category:category,price:price};

    //campgrounds.push(newCampground); crete a new campground and save to db
    umodel.findById(req.user.id,function(err,umodel){
        console.log(umodel);
        console.log(umodel._id);
        if(err){
            console.log(err);
        }else{
        campground.create(newcampground,function(err,campground){
            if(err){
                console.log(err);
            }
            else{
                umodel.campgrounds.push(campground);
                umodel.save();
                res.redirect("/campgrounds");
            }
        });
    }
        //get data from form and add to campground array
        //redirect back to campground page
    }) 
    })
    

router.get("/new",isLoggedIn,function(req,res){
    res.render("campgrounds/new");
});

//restful route "SHOW":shows more info about campground
router.get("/:id",function(req,res){
    //find the campground with provide id
    //render show template with that campground
    campground.findById(req.params.id).populate("comments").exec(function(err,foundcampground){
        if(err){
            console.log(err);
        }else{
            //console.log(foundcampground);
            res.render("campgrounds/show",{campground:foundcampground});
        } 
    });
});

//update campground routes
router.get("/:id/edit",checkcampgroundownership,function(req,res){
        campground.findById(req.params.id,function(err,foundcampground){
                    res.render("campgrounds/edit",{campground:foundcampground});
                }); 
        });
        

router.put("/:id",checkcampgroundownership,function(req,res){
    //find and update the current campground and then redirect to show page
    campground.findByIdAndUpdate(req.params.id,req.body.campground,function(err,updatedcampground){
        if(err){
            res.redirect("/campgrounds");
        }
        else{
            res.redirect("/campgrounds/"+req.params.id);
        }
    });
});

//destroy campgrounds route
router.delete("/:id",checkcampgroundownership,function(req,res){
    campground.findByIdAndRemove(req.params.id,function(err){
        if(err){
            res.redirect("/campgrounds");
        }
        else{
            res.redirect("/campgrounds");
        }
    })
});
function checkcampgroundownership(req,res,next){
    if(req.isAuthenticated()){
        campground.findById(req.params.id,function(err,foundcampground){
            if(err){
                req.flash("error","campground not found");
                res.redirect("back");
            }
            else{
                //does user own the campground
                if(foundcampground.author.id.equals(req.user._id)){
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
    req.flash("error","you need to be logged in to that");
    res.redirect("/login");
}

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#]/g, " ");
};

module.exports=router;
