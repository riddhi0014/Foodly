import {Request,Response,NextFunction} from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  image: string;
  role: string;
  restaurantId?: string;
}


export interface AuthenticatedRequest extends Request {   //So we extend Express's Request type.Otherwise TypeScript would complain:  Property 'user' does not exist on type Request. 
   user?: IUser | null;
 }


export const isAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => 
{
 try{

   const authHeader = req.headers.authorization;  //Like-> Authorization: Bearer <token>

   if(!authHeader || !authHeader.startsWith('Bearer '))
   {
     res.status(401).json({message:"Please login. No auth header"});
     return ;
   }

   const token=authHeader.split(' ')[1];  //actual jwt token extracted from the header i.e <token>

   if(!token)
   {
     res.status(401).json({message:"Please login. No token"});
     return ;
   }

   const decodedValue  = jwt.verify(token, process.env.JWT_SEC as string) as JwtPayload;

   if(!decodedValue || !decodedValue.user)
   {
     res.status(401).json({message:"Please login.Invalid token"});
     return ;
   }

   req.user = decodedValue.user as IUser;
   next();

 }
 catch(error)
 { console.error(error);
   res.status(401).json({message:"Invalid or expired token"});
 }
}


export const isSeller= async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>=>{
  const user=req.user;

  if (!user) {
     res.status(401).json({
        message: "Unauthorized"
    });
    return;
}

if (user.role !== "seller") {  // 403 forbidden- user is authorized but not permitted to access the resource.
     res.status(403).json({
        message: "Access denied"
    });
    return;
}

next();
}