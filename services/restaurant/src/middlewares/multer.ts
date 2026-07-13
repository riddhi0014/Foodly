import multer from "multer";

const storage = multer.memoryStorage();

const uploadFile = multer({ storage }).single("file"); 

export default uploadFile;

//What does multer do?
//Multer is a middleware for handling multipart/form-data, which is primarily used for uploading files in Node.js applications. It simplifies the process of receiving files from client requests and provides various options for storing and managing those files.

/*Just like: 
express.json() parses JSON
express.urlencoded() parses form data

you need another middleware to parse uploaded files.

That's exactly what Multer does.*/

