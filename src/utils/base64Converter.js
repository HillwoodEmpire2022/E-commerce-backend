import path from "path"
import DATAURI from "datauri/parser.js"

const dataUri = new DATAURI()

export const base64FileStringGenerator = (file) => {
    return dataUri.format(path.extname(file.originalname).toString(), file.buffer)
}
