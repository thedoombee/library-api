const { ValidationError , ServerError } = require("../errors");
const {z,ZodError} = require('zod');

function validate(schema) {
  return (req, res, next) => {
    try {
      const result = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      req.body = result.data.body ?? req.body;
      req.query = result.data.query ?? req.query;
      req.params = result.data.params ?? req.params;
      next();
    } catch (error) {
      if (err instanceof ZodError){
        const errorMsg = err.errors.map((issue)=> ({
          message: `${issue.path.join(".")} is ${issue.message}`
        }))
        res.status(400).json({
          status: false,
          error: "Validation failed ",
          details: errorMsg
        })
      } else {
      throw new ServerError();
    } 
      
    }
  };
}

module.exports = validate;
