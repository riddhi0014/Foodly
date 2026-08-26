import DataURIParser from "datauri/parser.js";

import path from "path";

const getBuffer=(file:Express.Multer.File)=>{
    const parser = new DataURIParser();
    const ext = path.extname(file.originalname).toString();
    return parser.format(ext, file.buffer);
}

export default getBuffer;


//The job of this file: To convert the uploaded image into a format that the Utils Service can understand.
//Firstly, get the image out of the buffer, then convert it into a Data URI format using the DataURIParser library. The resulting Data URI can then be sent to the Utils Service for further processing or storage.


