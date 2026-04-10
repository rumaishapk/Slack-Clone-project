 



 export const protectRoute = (req,res,next) => {
    if(req.auth().isAuthanticated){
        return res.status(401).json({message: "Unauthorized - you must be logged in" })
    }
    next() 
 } 