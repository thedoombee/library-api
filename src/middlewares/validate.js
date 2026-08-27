const { ServerError } = require("../errors");
const { ZodError } = require('zod');

function validate(schema) {
  return (req, res, next) => {
    try {
      const result = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      req.body = result.body ?? req.body;
      req.query = result.query ?? req.query;
      req.params = result.params ?? req.params;
      next();
    } catch (error) {
      if (error instanceof ZodError){
        const errorMsg = error.issues.map((issue) => ({
          message: `${issue.path.join(".")} is ${issue.message}`
        }))
        res.status(400).json({
          status: false,
          error: "Validation failed ",
          details: errorMsg
        })
      } else {
      throw new ServerError("Validate Unexpectederror");
    } 
      
    }
  };
}

module.exports = validate;
